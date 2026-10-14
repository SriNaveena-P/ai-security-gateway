import { StudentRecord } from '../models/StudentRecord';
import { CompanyCriteria } from '../models/CompanyCriteria';

export interface SkillGap {
  skill: string;
  required: boolean;
  studentLevel: string;
  recommendation: string;
}

export interface EligibilityResult {
  eligible: boolean;
  matchPercentage: number;
  companyName: string;
  role: string;
  salaryRange: string;
  skillGaps: SkillGap[];
  recommendations: string[];
  reasons: string[];
}

export interface CompanyMatch {
  companyName: string;
  role: string;
  matchPercentage: number;
  eligible: boolean;
  salaryRange: string;
}

/**
 * Check a student's eligibility for a specific company
 */
export const checkEligibility = async (studentId: string, companyName: string): Promise<EligibilityResult | null> => {
  const student = await StudentRecord.findOne({ studentId });
  const company = await CompanyCriteria.findOne({ companyName: new RegExp(companyName, 'i') });

  if (!student || !company || company.roles.length === 0) return null;

  const role = company.roles[0];
  const reasons: string[] = [];
  const skillGaps: SkillGap[] = [];
  const recommendations: string[] = [];
  let totalScore = 0;
  let maxScore = 0;

  // 1. GPA Check (20 points)
  maxScore += 20;
  if (student.gpa >= role.minGPA) {
    totalScore += 20;
    reasons.push(`✅ GPA ${student.gpa} meets minimum ${role.minGPA}`);
  } else {
    const partial = Math.max(0, (student.gpa / role.minGPA) * 20);
    totalScore += partial;
    reasons.push(`❌ GPA ${student.gpa} below minimum ${role.minGPA}`);
    recommendations.push(`Improve GPA from ${student.gpa} to at least ${role.minGPA}`);
  }

  // 2. Attendance Check (10 points)
  maxScore += 10;
  if (student.attendance >= role.minAttendance) {
    totalScore += 10;
    reasons.push(`✅ Attendance ${student.attendance}% meets minimum ${role.minAttendance}%`);
  } else {
    reasons.push(`❌ Attendance ${student.attendance}% below minimum ${role.minAttendance}%`);
    recommendations.push(`Improve attendance from ${student.attendance}% to ${role.minAttendance}%`);
  }

  // 3. Required Skills Check (30 points)
  maxScore += 30;
  const studentSkillNames = student.skills.map((s: any) => s.name.toLowerCase());
  let skillMatchCount = 0;
  for (const reqSkill of role.requiredSkills) {
    const studentSkill = student.skills.find((s: any) => s.name.toLowerCase() === reqSkill.toLowerCase());
    if (studentSkill) {
      skillMatchCount++;
      if ((studentSkill as any).proficiency === 'Beginner') {
        skillGaps.push({
          skill: reqSkill, required: true,
          studentLevel: 'Beginner',
          recommendation: `Upgrade ${reqSkill} from Beginner to Intermediate level`
        });
      }
    } else {
      skillGaps.push({
        skill: reqSkill, required: true,
        studentLevel: 'Not learned',
        recommendation: `Learn ${reqSkill} — this is a required skill`
      });
      recommendations.push(`Learn ${reqSkill} (required by ${company.companyName})`);
    }
  }
  if (role.requiredSkills.length > 0) {
    totalScore += (skillMatchCount / role.requiredSkills.length) * 30;
  }

  // 4. Projects Check (15 points)
  maxScore += 15;
  if (student.projects.length >= role.minProjectCount) {
    totalScore += 15;
    reasons.push(`✅ ${student.projects.length} projects meet minimum ${role.minProjectCount}`);
  } else {
    const partial = (student.projects.length / role.minProjectCount) * 15;
    totalScore += partial;
    reasons.push(`❌ ${student.projects.length} projects below minimum ${role.minProjectCount}`);
    recommendations.push(`Complete ${role.minProjectCount - student.projects.length} more project(s)`);
  }

  // 5. Coding Challenges (10 points)
  maxScore += 10;
  const totalSolved = student.codingChallenges.reduce((sum: number, c: any) => sum + c.solved, 0);
  if (totalSolved >= company.minCodingChallenges) {
    totalScore += 10;
    reasons.push(`✅ ${totalSolved} coding challenges solved (min: ${company.minCodingChallenges})`);
  } else {
    const partial = (totalSolved / company.minCodingChallenges) * 10;
    totalScore += partial;
    reasons.push(`❌ ${totalSolved} challenges solved, need ${company.minCodingChallenges}`);
    recommendations.push(`Solve ${company.minCodingChallenges - totalSolved} more coding challenges`);
  }

  // 6. Soft Skills (15 points)
  maxScore += 15;
  const softReq = company.softSkillRequirements;
  const softStudent = student.softSkills;
  let softScore = 0;
  let softTotal = 0;
  if (softReq && softStudent) {
    const checks = [
      { name: 'Communication', req: softReq.communication || 0, val: softStudent.communication || 0 },
      { name: 'Teamwork', req: softReq.teamwork || 0, val: softStudent.teamwork || 0 },
      { name: 'Leadership', req: softReq.leadership || 0, val: softStudent.leadership || 0 },
      { name: 'Problem Solving', req: softReq.problemSolving || 0, val: softStudent.problemSolving || 0 },
    ];
    for (const check of checks) {
      softTotal++;
      if (check.val >= check.req) softScore++;
      else recommendations.push(`Improve ${check.name} from ${check.val} to ${check.req}`);
    }
    totalScore += (softScore / softTotal) * 15;
  }

  const matchPercentage = Math.round((totalScore / maxScore) * 100);
  const eligible = matchPercentage >= 60 && student.gpa >= role.minGPA && student.attendance >= role.minAttendance;

  return {
    eligible,
    matchPercentage,
    companyName: company.companyName,
    role: role.title,
    salaryRange: role.salaryRange,
    skillGaps,
    recommendations,
    reasons
  };
};

/**
 * Suggest best matching companies for a student
 */
export const suggestCompanies = async (studentId: string): Promise<CompanyMatch[]> => {
  const companies = await CompanyCriteria.find({});
  const matches: CompanyMatch[] = [];

  for (const company of companies) {
    const result = await checkEligibility(studentId, company.companyName);
    if (result) {
      matches.push({
        companyName: result.companyName,
        role: result.role,
        matchPercentage: result.matchPercentage,
        eligible: result.eligible,
        salaryRange: result.salaryRange
      });
    }
  }

  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
};
