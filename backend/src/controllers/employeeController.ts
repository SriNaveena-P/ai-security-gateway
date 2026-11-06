import { Request, Response } from 'express';
import { StudentRecord } from '../models/StudentRecord';
import { SecurityAlert, AlertSeverity } from '../models/SecurityAlert';
import { AuditLog } from '../models/AuditLog';
import { Agent } from '../models/Agent';
import { User } from '../models/User';
import bcrypt from 'bcrypt';

// ──────────────────────────────────────────────
// ADMIN PASSKEY — required for all write ops
// Default passkey: NAVGUARD@2026
// Stored as bcrypt hash; change via PUT /api/employees/passkey
// ──────────────────────────────────────────────
const DEFAULT_PASSKEY = 'NAVGUARD@2026';
let passkeyHash: string = bcrypt.hashSync(DEFAULT_PASSKEY, 10);

// Failed attempt tracking for brute-force protection
const failedAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

function isLockedOut(ip: string): boolean {
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (Date.now() - record.lastAttempt > LOCKOUT_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string): number {
  const record = failedAttempts.get(ip);
  if (!record || Date.now() - record.lastAttempt > LOCKOUT_MS) {
    failedAttempts.set(ip, { count: 1, lastAttempt: Date.now() });
    return 1;
  }
  record.count++;
  record.lastAttempt = Date.now();
  return record.count;
}

function clearFailures(ip: string) {
  failedAttempts.delete(ip);
}

async function logSecurityAlert(description: string, severity: AlertSeverity, ip: string) {
  try {
    const agent = await Agent.findOne({ name: 'QA Chatbot Agent' });
    await SecurityAlert.create({
      severity,
      description,
      agentId: agent?._id,
      status: 'NEW',
    } as any);

    const adminUser = await User.findOne({});
    if (adminUser && agent) {
      await AuditLog.create({
        userId: adminUser._id,
        agentId: agent._id,
        actionType: 'SENSITIVE_DATA_ACCESS',
        resource: 'employee-records',
        riskScore: severity === AlertSeverity.CRITICAL ? 95 : 75,
        riskLevel: severity === AlertSeverity.CRITICAL ? 'CRITICAL' : 'HIGH',
        decision: 'BLOCK',
        reasons: [description],
        executionStatus: 'BLOCKED',
        threatsDetected: ['Unauthorized Access Attempt'],
      } as any);
    }
  } catch (_err) {
    console.error('Failed to log security alert');
  }
}

// ──────────────────────────────────────────
// POST /api/employees/verify-passkey
// Verify passkey before allowing write ops
// ──────────────────────────────────────────
export const verifyPasskey = async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (isLockedOut(ip)) {
    await logSecurityAlert(
      `🚨 BRUTE FORCE LOCKOUT: IP ${ip} locked out after ${MAX_ATTEMPTS} failed passkey attempts on Employee Records`,
      AlertSeverity.CRITICAL,
      ip
    );
    return res.status(429).json({
      verified: false,
      message: '🔒 Account locked due to too many failed attempts. Try again after 5 minutes.',
      locked: true,
      remainingAttempts: 0,
    });
  }

  const { passkey } = req.body;
  if (!passkey) {
    return res.status(400).json({ verified: false, message: 'Passkey is required' });
  }

  const valid = bcrypt.compareSync(passkey, passkeyHash);

  if (!valid) {
    const attempts = recordFailure(ip);
    const remaining = MAX_ATTEMPTS - attempts;

    await logSecurityAlert(
      `⚠️ INVALID PASSKEY: Failed employee data access attempt from IP ${ip} (${attempts}/${MAX_ATTEMPTS} attempts)`,
      attempts >= 3 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
      ip
    );

    return res.status(403).json({
      verified: false,
      message: `❌ Invalid passkey! ${remaining > 0 ? `${remaining} attempt(s) remaining before lockout.` : 'Account is now locked for 5 minutes.'}`,
      locked: remaining <= 0,
      remainingAttempts: Math.max(0, remaining),
    });
  }

  // Passkey correct — clear failures, return success
  clearFailures(ip);
  return res.json({
    verified: true,
    message: '✅ Passkey verified. Access granted.',
    token: Buffer.from(`navguard_${Date.now()}_${Math.random().toString(36).slice(2)}`).toString('base64'),
  });
};

// ──────────────────────────────────────────
// PUT /api/employees/passkey  (Change passkey)
// ──────────────────────────────────────────
export const changePasskey = async (req: Request, res: Response) => {
  const { currentPasskey, newPasskey } = req.body;

  if (!currentPasskey || !newPasskey) {
    return res.status(400).json({ message: 'Both current and new passkey are required' });
  }

  if (!bcrypt.compareSync(currentPasskey, passkeyHash)) {
    return res.status(403).json({ message: 'Current passkey is incorrect' });
  }

  if (newPasskey.length < 6) {
    return res.status(400).json({ message: 'New passkey must be at least 6 characters' });
  }

  passkeyHash = bcrypt.hashSync(newPasskey, 10);
  return res.json({ message: '✅ Passkey changed successfully' });
};

// ──────────────────────────────────────────
// Middleware: validate passkey token header
// ──────────────────────────────────────────
function validatePasskeyToken(req: Request): boolean {
  const token = req.headers['x-passkey-token'] as string;
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    if (!decoded.startsWith('navguard_')) return false;
    const timestamp = parseInt(decoded.split('_')[1]);
    // Token valid for 30 minutes
    return Date.now() - timestamp < 30 * 60 * 1000;
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────
// GET /api/employees  (READ — no passkey needed)
// ──────────────────────────────────────────
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await StudentRecord.find().sort({ name: 1 });
    res.json(employees);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// POST /api/employees  (CREATE — passkey required)
// ──────────────────────────────────────────
export const addEmployee = async (req: Request, res: Response) => {
  // Verify passkey token
  if (!validatePasskeyToken(req)) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    await logSecurityAlert(
      `🛑 BLOCKED: Attempt to add employee without valid passkey from IP ${ip}`,
      AlertSeverity.HIGH,
      ip
    );
    return res.status(403).json({
      message: '🔒 Access Denied — Valid passkey authentication required to modify employee records.',
      requiresPasskey: true,
    });
  }

  try {
    const { 
      studentId, name, email, position, department, 
      salary, joiningYear, address, skills, 
      gpa, attendance, completedProjects, 
      codingChallengesSolved, softSkills, course 
    } = req.body;
    
    const existing = await StudentRecord.findOne({ studentId });
    if (existing) {
      return res.status(400).json({ message: `Employee ID ${studentId} already exists` });
    }

    const employee = await StudentRecord.create({
      studentId,
      name,
      email,
      position: position || 'Software Engineer',
      department: department || 'Engineering',
      salary: salary || '₹12,00,000',
      joiningYear: joiningYear || 2024,
      address: address || 'Chennai, Tamil Nadu',
      skills: Array.isArray(skills) 
        ? skills.map((s: any) => typeof s === 'string' ? { name: s, proficiency: 'Advanced', score: 85 } : s)
        : [],
      gpa: gpa || 8.5,
      attendance: attendance || 95,
      year: joiningYear || 2024,
      completedProjects: completedProjects || 3,
      codingChallengesSolved: codingChallengesSolved || 15,
      softSkills: softSkills || [],
      course: course || department || 'Cyber Security',
      moduleScores: [],
      projectGrades: [],
    } as any);

    res.status(201).json(employee);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────────────────────────────────
// DELETE /api/employees/:id  (DELETE — passkey required)
// ──────────────────────────────────────────
export const deleteEmployee = async (req: Request, res: Response) => {
  if (!validatePasskeyToken(req)) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    await logSecurityAlert(
      `🛑 BLOCKED: Attempt to delete employee record without valid passkey from IP ${ip}`,
      AlertSeverity.HIGH,
      ip
    );
    return res.status(403).json({
      message: '🔒 Access Denied — Valid passkey authentication required to delete employee records.',
      requiresPasskey: true,
    });
  }

  try {
    await StudentRecord.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
