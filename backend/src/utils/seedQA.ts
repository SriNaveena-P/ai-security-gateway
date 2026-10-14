import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course } from '../models/Course';
import { StudentRecord } from '../models/StudentRecord';
import { CompanyCriteria } from '../models/CompanyCriteria';
import { QADocument } from '../models/QADocument';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-security-gateway';

const courses = [
  {
    name: 'Full Stack Web Development',
    description: 'Complete full stack development course covering frontend and backend technologies with modern frameworks.',
    category: 'Web Development',
    modules: [
      { name: 'HTML & CSS Fundamentals', topics: ['HTML5', 'CSS3', 'Flexbox', 'Grid', 'Responsive Design'], duration: '2 weeks' },
      { name: 'JavaScript & TypeScript', topics: ['ES6+', 'TypeScript', 'Async/Await', 'DOM Manipulation'], duration: '3 weeks' },
      { name: 'React.js', topics: ['Components', 'Hooks', 'State Management', 'React Router', 'Redux'], duration: '3 weeks' },
      { name: 'Node.js & Express', topics: ['REST APIs', 'Middleware', 'Authentication', 'Error Handling'], duration: '3 weeks' },
      { name: 'MongoDB & Database Design', topics: ['Mongoose', 'CRUD Operations', 'Aggregation', 'Indexing'], duration: '2 weeks' },
      { name: 'Deployment & DevOps', topics: ['Docker', 'CI/CD', 'AWS', 'Nginx', 'SSL'], duration: '1 week' }
    ],
    skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Git', 'Docker'],
    duration: '14 weeks',
    difficulty: 'Intermediate',
    content: 'This Full Stack Web Development course at AMYPO covers end-to-end web application development. Students learn HTML5, CSS3, JavaScript ES6+, TypeScript, React.js for frontend development, Node.js with Express for backend API development, and MongoDB for database management. The course includes hands-on projects building real-world applications, REST API design, JWT authentication, state management with Redux, and deployment using Docker and AWS. Prerequisites include basic programming knowledge. Upon completion, students can build and deploy production-ready web applications.'
  },
  {
    name: 'Data Science & Analytics',
    description: 'Comprehensive data science program covering Python, statistics, machine learning, and data visualization.',
    category: 'Data Science',
    modules: [
      { name: 'Python for Data Science', topics: ['NumPy', 'Pandas', 'Data Cleaning', 'File I/O'], duration: '3 weeks' },
      { name: 'Statistics & Probability', topics: ['Descriptive Stats', 'Hypothesis Testing', 'Regression', 'Distributions'], duration: '2 weeks' },
      { name: 'Data Visualization', topics: ['Matplotlib', 'Seaborn', 'Plotly', 'Dashboard Design'], duration: '2 weeks' },
      { name: 'Machine Learning', topics: ['Supervised Learning', 'Unsupervised Learning', 'Model Evaluation', 'Feature Engineering'], duration: '4 weeks' },
      { name: 'Deep Learning Basics', topics: ['Neural Networks', 'TensorFlow', 'Keras', 'CNNs'], duration: '2 weeks' },
      { name: 'Capstone Project', topics: ['End-to-End ML Pipeline', 'Model Deployment', 'Presentation'], duration: '2 weeks' }
    ],
    skills: ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'SQL', 'Tableau', 'Statistics', 'Machine Learning'],
    duration: '15 weeks',
    difficulty: 'Intermediate',
    content: 'The Data Science & Analytics course at AMYPO trains students in the complete data science pipeline. Starting with Python programming and essential libraries like NumPy and Pandas, students progress through statistical analysis, data visualization with Matplotlib and Seaborn, and machine learning with Scikit-learn. Advanced topics include deep learning with TensorFlow and Keras, natural language processing basics, and model deployment. Students complete a capstone project solving a real-world business problem. The course prepares students for roles as Data Analysts, Data Scientists, and ML Engineers.'
  },
  {
    name: 'Cybersecurity Fundamentals',
    description: 'Learn core cybersecurity concepts including network security, ethical hacking, and incident response.',
    category: 'Cybersecurity',
    modules: [
      { name: 'Network Security', topics: ['TCP/IP', 'Firewalls', 'VPN', 'IDS/IPS', 'DNS Security'], duration: '3 weeks' },
      { name: 'Ethical Hacking', topics: ['Penetration Testing', 'Vulnerability Assessment', 'OWASP Top 10', 'Metasploit'], duration: '3 weeks' },
      { name: 'Cryptography', topics: ['Encryption', 'Hashing', 'PKI', 'SSL/TLS', 'Digital Signatures'], duration: '2 weeks' },
      { name: 'Security Operations', topics: ['SIEM', 'Log Analysis', 'Incident Response', 'Threat Intelligence'], duration: '2 weeks' },
      { name: 'Cloud Security', topics: ['AWS Security', 'IAM', 'Zero Trust', 'Container Security'], duration: '2 weeks' }
    ],
    skills: ['Network Security', 'Ethical Hacking', 'Cryptography', 'SIEM', 'Linux', 'Wireshark', 'Nmap', 'Python'],
    duration: '12 weeks',
    difficulty: 'Advanced',
    content: 'AMYPO Cybersecurity Fundamentals course provides comprehensive training in information security. Students learn network security principles, ethical hacking methodologies, penetration testing using tools like Metasploit and Nmap, cryptographic protocols, and security operations center (SOC) procedures. The course covers OWASP Top 10 vulnerabilities, incident response frameworks, cloud security with AWS, and Zero Trust architecture. Students gain hands-on experience with Wireshark, Burp Suite, and Kali Linux. Prepares students for certifications like CompTIA Security+ and CEH.'
  },
  {
    name: 'AI & Machine Learning',
    description: 'Advanced course on artificial intelligence covering deep learning, NLP, computer vision, and reinforcement learning.',
    category: 'Artificial Intelligence',
    modules: [
      { name: 'ML Foundations', topics: ['Linear Algebra', 'Calculus', 'Optimization', 'Probability Theory'], duration: '2 weeks' },
      { name: 'Deep Learning', topics: ['CNNs', 'RNNs', 'Transformers', 'GANs', 'Autoencoders'], duration: '4 weeks' },
      { name: 'Natural Language Processing', topics: ['Text Processing', 'Word Embeddings', 'BERT', 'Sentiment Analysis'], duration: '3 weeks' },
      { name: 'Computer Vision', topics: ['Image Classification', 'Object Detection', 'YOLO', 'Image Segmentation'], duration: '2 weeks' },
      { name: 'MLOps & Deployment', topics: ['Model Serving', 'MLflow', 'Docker', 'API Integration'], duration: '2 weeks' }
    ],
    skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Deep Learning', 'MLOps', 'Docker'],
    duration: '13 weeks',
    difficulty: 'Advanced',
    content: 'The AI & Machine Learning course at AMYPO is designed for students who want to specialize in artificial intelligence. The curriculum covers mathematical foundations, deep learning architectures including CNNs, RNNs, and Transformers, natural language processing with BERT and GPT concepts, and computer vision applications. Students implement projects using TensorFlow and PyTorch, learn MLOps practices for model deployment, and explore emerging topics like reinforcement learning and generative AI. Prerequisites include Python proficiency and basic statistics knowledge.'
  },
  {
    name: 'Cloud Computing & DevOps',
    description: 'Master cloud platforms, containerization, CI/CD pipelines, and infrastructure as code.',
    category: 'Cloud & DevOps',
    modules: [
      { name: 'Cloud Fundamentals', topics: ['AWS Core Services', 'Azure Basics', 'GCP Overview', 'Cloud Architecture'], duration: '3 weeks' },
      { name: 'Containerization', topics: ['Docker', 'Kubernetes', 'Container Orchestration', 'Helm Charts'], duration: '3 weeks' },
      { name: 'CI/CD Pipelines', topics: ['Jenkins', 'GitHub Actions', 'GitLab CI', 'Automated Testing'], duration: '2 weeks' },
      { name: 'Infrastructure as Code', topics: ['Terraform', 'Ansible', 'CloudFormation', 'Configuration Management'], duration: '2 weeks' },
      { name: 'Monitoring & Observability', topics: ['Prometheus', 'Grafana', 'ELK Stack', 'APM'], duration: '2 weeks' }
    ],
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Linux', 'Git', 'Python', 'Bash Scripting'],
    duration: '12 weeks',
    difficulty: 'Intermediate',
    content: 'AMYPO Cloud Computing & DevOps course prepares students for cloud engineering and DevOps roles. The course covers major cloud platforms (AWS, Azure, GCP), containerization with Docker and Kubernetes, CI/CD pipeline design using Jenkins and GitHub Actions, infrastructure as code with Terraform and Ansible, and monitoring solutions with Prometheus and Grafana. Students gain hands-on experience deploying applications on cloud infrastructure and automating development workflows. Prepares for AWS Solutions Architect and Kubernetes certifications.'
  }
];

const faqDocuments = [
  { title: 'Admission Process', content: 'AMYPO admission process: Students can apply online through the AMYPO website. The process includes submitting academic transcripts, completing an online aptitude test, and attending a technical interview. Admissions are offered on a rolling basis. Minimum eligibility is a bachelor degree in any discipline with basic computer knowledge. International students are welcome and can apply through the same process.' },
  { title: 'Fee Structure', content: 'AMYPO course fees vary by program. Full Stack Web Development: INR 45,000. Data Science & Analytics: INR 50,000. Cybersecurity Fundamentals: INR 55,000. AI & Machine Learning: INR 60,000. Cloud Computing & DevOps: INR 48,000. Payment can be made in installments. Scholarships are available for meritorious students with GPA above 8.5. EMI options through partner banks are also available.' },
  { title: 'Placement Support', content: 'AMYPO provides 100% placement assistance to all eligible students. The placement cell maintains partnerships with 200+ companies including TCS, Infosys, Wipro, Cognizant, Accenture, Amazon, Google, Microsoft, and various startups. Students must maintain minimum 75% attendance, GPA above 6.5, and complete all assigned projects to be eligible for placement drives. Mock interviews, resume workshops, and soft skills training are provided free of charge.' },
  { title: 'Course Duration and Schedule', content: 'AMYPO courses run for 12-15 weeks depending on the program. Classes are conducted Monday to Friday, 9 AM to 5 PM. Weekend batches are available for working professionals (Saturday and Sunday, 10 AM to 4 PM). Each course includes minimum 3 hands-on projects and 1 capstone project. Students get access to recorded lectures for revision. Lab access is available 24/7.' },
  { title: 'Certification', content: 'Upon successful completion of the course, students receive an AMYPO certification. This certification is recognized by industry partners. Students who score above 85% overall and complete all projects receive a distinction certificate. AMYPO also provides preparation support for external certifications like AWS, Google Cloud, CompTIA, and Oracle certifications. Certification exam fees for selected certifications are covered by AMYPO for top performers.' },
  { title: 'Attendance Policy', content: 'AMYPO requires minimum 75% attendance for course completion. Students with attendance below 75% will not be eligible for certification or placement support. Medical leaves require documentation and must be reported within 24 hours. Students can make up for missed classes through recorded lectures and extra lab sessions. Three consecutive unexcused absences trigger an academic warning.' },
  { title: 'Project Requirements', content: 'Each AMYPO course requires completion of minimum 3 mini-projects and 1 capstone project. Projects are evaluated on code quality, functionality, documentation, and presentation. Group projects (2-3 members) are allowed for capstone projects only. All project code must be hosted on GitHub. Plagiarism detection is applied to all submissions. Late submissions receive a 10% penalty per day.' },
  { title: 'Refund Policy', content: 'AMYPO offers a full refund if withdrawal is requested within the first week of the course. After the first week, a 50% refund is available up to the end of week 3. No refunds are processed after week 3. Course transfers to a different batch are allowed once, free of charge. Transfer to a different course incurs a fee differential if applicable.' }
];

const policyDocuments = [
  { title: 'Academic Integrity Policy', content: 'AMYPO maintains strict academic integrity standards. Plagiarism in assignments, projects, or assessments is not tolerated. First offense results in a zero grade for the assignment and a formal warning. Second offense leads to course failure. Code similarity tools are used to detect plagiarism. Students must cite all external resources and acknowledge collaboration. Group work guidelines must be followed as specified by the instructor.' },
  { title: 'Placement Eligibility Policy', content: 'To be eligible for AMYPO placement drives, students must: maintain minimum 75% attendance, achieve GPA of 6.5 or above, complete all required projects including capstone, clear all pending assessments, and have no active academic integrity violations. Students who meet all criteria are automatically registered for placement drives. Company-specific requirements may impose additional criteria such as higher GPA thresholds or specific skill certifications.' },
  { title: 'Code of Conduct', content: 'AMYPO students are expected to maintain professional behavior at all times. This includes respectful communication with peers and instructors, timely submission of assignments, active participation in classes, and adherence to lab safety guidelines. Harassment, discrimination, or disruptive behavior will result in disciplinary action up to and including dismissal from the program. Students must follow the IT acceptable use policy when using AMYPO computing resources.' },
  { title: 'Data Privacy Policy', content: 'AMYPO is committed to protecting student data privacy. Personal information including academic records, contact details, and assessment scores are kept confidential. Student data is shared with placement partner companies only with student consent. Students have the right to access, modify, and request deletion of their personal data. AMYPO uses encrypted storage and secure communication channels for all student data. Third-party data processing agreements are in place with all service providers.' }
];

const students = [
  {
    studentId: 'AMYPO2024001', name: 'Arun Kumar', email: 'arun.kumar@amypo.edu', department: 'Computer Science', year: 4, gpa: 8.5, attendance: 92,
    skills: [
      { name: 'JavaScript', proficiency: 'Advanced', score: 85 }, { name: 'React', proficiency: 'Advanced', score: 80 },
      { name: 'Node.js', proficiency: 'Intermediate', score: 70 }, { name: 'Python', proficiency: 'Intermediate', score: 65 },
      { name: 'MongoDB', proficiency: 'Intermediate', score: 72 }, { name: 'Git', proficiency: 'Advanced', score: 88 }
    ],
    projects: [
      { title: 'E-Commerce Platform', description: 'Full stack e-commerce app with payment integration', techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'], grade: 'A' },
      { title: 'Task Manager API', description: 'RESTful API with JWT authentication', techStack: ['Express', 'MongoDB', 'JWT'], grade: 'A' }
    ],
    codingChallenges: [{ platform: 'LeetCode', solved: 180, rank: 'Guardian' }],
    softSkills: { communication: 78, teamwork: 85, leadership: 72, problemSolving: 88 },
    placementStatus: 'Not Placed'
  },
  {
    studentId: 'AMYPO2024002', name: 'Priya Sharma', email: 'priya.sharma@amypo.edu', department: 'Computer Science', year: 4, gpa: 9.1, attendance: 96,
    skills: [
      { name: 'Python', proficiency: 'Expert', score: 92 }, { name: 'TensorFlow', proficiency: 'Advanced', score: 82 },
      { name: 'SQL', proficiency: 'Advanced', score: 85 }, { name: 'Pandas', proficiency: 'Expert', score: 90 },
      { name: 'Machine Learning', proficiency: 'Advanced', score: 80 }, { name: 'Statistics', proficiency: 'Advanced', score: 78 }
    ],
    projects: [
      { title: 'Sentiment Analysis Tool', description: 'NLP-based sentiment classifier using BERT', techStack: ['Python', 'TensorFlow', 'BERT', 'Flask'], grade: 'A+' },
      { title: 'Sales Prediction Model', description: 'Time series forecasting for retail sales', techStack: ['Python', 'Scikit-learn', 'Pandas'], grade: 'A' }
    ],
    codingChallenges: [{ platform: 'HackerRank', solved: 220, rank: '5 Star' }],
    softSkills: { communication: 90, teamwork: 88, leadership: 80, problemSolving: 92 },
    placementStatus: 'Not Placed'
  },
  {
    studentId: 'AMYPO2024003', name: 'Rajesh Menon', email: 'rajesh.menon@amypo.edu', department: 'Information Technology', year: 4, gpa: 7.2, attendance: 78,
    skills: [
      { name: 'Java', proficiency: 'Intermediate', score: 68 }, { name: 'Spring Boot', proficiency: 'Beginner', score: 45 },
      { name: 'SQL', proficiency: 'Intermediate', score: 65 }, { name: 'HTML', proficiency: 'Advanced', score: 80 },
      { name: 'CSS', proficiency: 'Intermediate', score: 70 }
    ],
    projects: [
      { title: 'Library Management System', description: 'CRUD application for library books', techStack: ['Java', 'MySQL', 'JSP'], grade: 'B+' }
    ],
    codingChallenges: [{ platform: 'LeetCode', solved: 60, rank: 'Knight' }],
    softSkills: { communication: 65, teamwork: 70, leadership: 55, problemSolving: 68 },
    placementStatus: 'Not Placed'
  },
  {
    studentId: 'AMYPO2024004', name: 'Deepa Lakshmi', email: 'deepa.lakshmi@amypo.edu', department: 'Computer Science', year: 4, gpa: 8.8, attendance: 94,
    skills: [
      { name: 'AWS', proficiency: 'Advanced', score: 82 }, { name: 'Docker', proficiency: 'Advanced', score: 78 },
      { name: 'Kubernetes', proficiency: 'Intermediate', score: 70 }, { name: 'Linux', proficiency: 'Advanced', score: 85 },
      { name: 'Terraform', proficiency: 'Intermediate', score: 65 }, { name: 'Python', proficiency: 'Advanced', score: 80 }
    ],
    projects: [
      { title: 'Cloud Deployment Pipeline', description: 'Automated CI/CD pipeline with Jenkins and Docker', techStack: ['Docker', 'Jenkins', 'AWS', 'Terraform'], grade: 'A' },
      { title: 'Microservices Architecture', description: 'Distributed system with Kubernetes orchestration', techStack: ['Kubernetes', 'Node.js', 'Redis', 'RabbitMQ'], grade: 'A' }
    ],
    codingChallenges: [{ platform: 'HackerRank', solved: 150, rank: '4 Star' }],
    softSkills: { communication: 82, teamwork: 90, leadership: 78, problemSolving: 85 },
    placementStatus: 'Not Placed'
  },
  {
    studentId: 'AMYPO2024005', name: 'Mohammed Faisal', email: 'faisal.m@amypo.edu', department: 'Computer Science', year: 4, gpa: 6.8, attendance: 72,
    skills: [
      { name: 'JavaScript', proficiency: 'Intermediate', score: 60 }, { name: 'React', proficiency: 'Beginner', score: 45 },
      { name: 'HTML', proficiency: 'Advanced', score: 82 }, { name: 'CSS', proficiency: 'Intermediate', score: 68 },
      { name: 'PHP', proficiency: 'Intermediate', score: 58 }
    ],
    projects: [
      { title: 'Portfolio Website', description: 'Personal portfolio with responsive design', techStack: ['HTML', 'CSS', 'JavaScript'], grade: 'B' }
    ],
    codingChallenges: [{ platform: 'LeetCode', solved: 35, rank: 'Beginner' }],
    softSkills: { communication: 60, teamwork: 65, leadership: 50, problemSolving: 58 },
    placementStatus: 'Not Placed'
  }
];

const companies = [
  {
    companyName: 'TCS', industry: 'IT Services',
    roles: [{
      title: 'Software Developer', description: 'Build enterprise applications using Java and Spring framework',
      requiredSkills: ['Java', 'SQL', 'Git'], preferredSkills: ['Spring Boot', 'Microservices', 'AWS'],
      minGPA: 6.5, minAttendance: 75, minProjectCount: 1, experienceLevel: 'Fresher', salaryRange: '3.5 - 7 LPA'
    }],
    techStack: ['Java', 'Spring Boot', 'Oracle', 'Angular', 'AWS'],
    minCodingChallenges: 30,
    softSkillRequirements: { communication: 60, teamwork: 65, leadership: 50, problemSolving: 65 },
    hiringProcess: ['Online Test', 'Technical Interview', 'HR Interview']
  },
  {
    companyName: 'Infosys', industry: 'IT Services',
    roles: [{
      title: 'Systems Engineer', description: 'Full stack development and system integration',
      requiredSkills: ['JavaScript', 'SQL', 'Python'], preferredSkills: ['React', 'Node.js', 'Docker'],
      minGPA: 6.0, minAttendance: 75, minProjectCount: 1, experienceLevel: 'Fresher', salaryRange: '3.6 - 8 LPA'
    }],
    techStack: ['Java', 'Python', 'React', 'Node.js', 'Azure'],
    minCodingChallenges: 25,
    softSkillRequirements: { communication: 65, teamwork: 60, leadership: 50, problemSolving: 60 },
    hiringProcess: ['Online Assessment', 'Technical Round', 'HR Round']
  },
  {
    companyName: 'Amazon', industry: 'Technology',
    roles: [{
      title: 'SDE-1', description: 'Design and build scalable distributed systems',
      requiredSkills: ['Python', 'Data Structures', 'System Design'], preferredSkills: ['AWS', 'Docker', 'Kubernetes', 'Machine Learning'],
      minGPA: 8.0, minAttendance: 80, minProjectCount: 2, experienceLevel: 'Fresher', salaryRange: '15 - 30 LPA'
    }],
    techStack: ['Java', 'Python', 'AWS', 'DynamoDB', 'React'],
    minCodingChallenges: 150,
    softSkillRequirements: { communication: 80, teamwork: 85, leadership: 75, problemSolving: 90 },
    hiringProcess: ['Online Assessment', 'Phone Screen', 'Onsite (4 rounds)', 'Bar Raiser']
  },
  {
    companyName: 'Wipro', industry: 'IT Services',
    roles: [{
      title: 'Project Engineer', description: 'Application development and maintenance',
      requiredSkills: ['Java', 'SQL'], preferredSkills: ['Python', 'Cloud', 'DevOps'],
      minGPA: 6.0, minAttendance: 70, minProjectCount: 1, experienceLevel: 'Fresher', salaryRange: '3.5 - 6 LPA'
    }],
    techStack: ['Java', '.NET', 'SQL Server', 'Angular'],
    minCodingChallenges: 20,
    softSkillRequirements: { communication: 55, teamwork: 60, leadership: 45, problemSolving: 55 },
    hiringProcess: ['Aptitude Test', 'Technical Interview', 'HR Interview']
  },
  {
    companyName: 'Google', industry: 'Technology',
    roles: [{
      title: 'Software Engineer L3', description: 'Build products used by billions of people',
      requiredSkills: ['Python', 'Data Structures', 'Algorithms', 'System Design'], preferredSkills: ['Machine Learning', 'Distributed Systems', 'Kubernetes'],
      minGPA: 8.5, minAttendance: 85, minProjectCount: 3, experienceLevel: 'Fresher', salaryRange: '25 - 45 LPA'
    }],
    techStack: ['Python', 'Go', 'C++', 'TensorFlow', 'GCP'],
    minCodingChallenges: 200,
    softSkillRequirements: { communication: 85, teamwork: 90, leadership: 80, problemSolving: 95 },
    hiringProcess: ['Phone Screen', 'Coding Challenge', 'Onsite (5 rounds)', 'Hiring Committee']
  }
];

const seedQAData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for QA seeding...');

    // Clear existing QA data
    await Course.deleteMany({});
    await StudentRecord.deleteMany({});
    await CompanyCriteria.deleteMany({});
    await QADocument.deleteMany({});

    // Seed Courses
    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Seeded ${createdCourses.length} courses`);

    // Seed Students (link course IDs)
    const studentsWithCourses = students.map((s, i) => ({
      ...s,
      courses: [{ courseId: createdCourses[i % createdCourses.length]._id, courseName: createdCourses[i % createdCourses.length].name, grade: 'A', score: 85, completed: true }]
    }));
    const createdStudents = await StudentRecord.insertMany(studentsWithCourses);
    console.log(`✅ Seeded ${createdStudents.length} student records`);

    // Seed Companies
    const createdCompanies = await CompanyCriteria.insertMany(companies);
    console.log(`✅ Seeded ${createdCompanies.length} company criteria`);

    // Create QADocuments from all sources (without embeddings for now)
    const docs: any[] = [];

    // From courses
    for (const course of createdCourses) {
      docs.push({
        content: course.content,
        chunk: course.content,
        sourceType: 'course',
        sourceId: course._id.toString(),
        sourceName: course.name,
        metadata: { category: course.category, difficulty: course.difficulty }
      });
      // Module-level chunks
      for (const mod of course.modules) {
        const modContent = `Course: ${course.name}. Module: ${mod.name}. Topics covered: ${mod.topics.join(', ')}. Duration: ${mod.duration}.`;
        docs.push({
          content: modContent, chunk: modContent, sourceType: 'course',
          sourceId: course._id.toString(), sourceName: `${course.name} - ${mod.name}`, metadata: { moduleName: mod.name }
        });
      }
    }

    // From FAQs
    for (const faq of faqDocuments) {
      docs.push({
        content: faq.content, chunk: faq.content, sourceType: 'faq',
        sourceId: `faq-${faq.title.toLowerCase().replace(/\s+/g, '-')}`, sourceName: `FAQ: ${faq.title}`, metadata: { title: faq.title }
      });
    }

    // From Policies
    for (const policy of policyDocuments) {
      docs.push({
        content: policy.content, chunk: policy.content, sourceType: 'policy',
        sourceId: `policy-${policy.title.toLowerCase().replace(/\s+/g, '-')}`, sourceName: `Policy: ${policy.title}`, metadata: { title: policy.title }
      });
    }

    // From Students (structured records as text)
    for (const student of createdStudents) {
      const studentText = `Student: ${student.name}. ID: ${student.studentId}. Department: ${student.department}. Year: ${student.year}. GPA: ${student.gpa}. Attendance: ${student.attendance}%. Skills: ${student.skills.map((s: any) => `${s.name} (${s.proficiency})`).join(', ')}. Projects: ${student.projects.map((p: any) => p.title).join(', ')}. Coding challenges solved: ${student.codingChallenges.map((c: any) => `${c.solved} on ${c.platform}`).join(', ')}. Placement status: ${student.placementStatus}.`;
      docs.push({
        content: studentText, chunk: studentText, sourceType: 'student_record',
        sourceId: student._id.toString(), sourceName: `Student: ${student.name}`, metadata: { studentId: student.studentId, gpa: student.gpa }
      });
    }

    // From Companies (structured records as text)
    for (const company of createdCompanies) {
      for (const role of company.roles) {
        const companyText = `Company: ${company.companyName}. Industry: ${company.industry}. Role: ${role.title}. Description: ${role.description}. Required Skills: ${role.requiredSkills.join(', ')}. Preferred Skills: ${role.preferredSkills.join(', ')}. Minimum GPA: ${role.minGPA}. Minimum Attendance: ${role.minAttendance}%. Minimum Projects: ${role.minProjectCount}. Salary Range: ${role.salaryRange}. Hiring Process: ${company.hiringProcess.join(' → ')}.`;
        docs.push({
          content: companyText, chunk: companyText, sourceType: 'company',
          sourceId: company._id.toString(), sourceName: `${company.companyName} - ${role.title}`, metadata: { companyName: company.companyName, role: role.title }
        });
      }
    }

    const createdDocs = await QADocument.insertMany(docs);
    console.log(`✅ Seeded ${createdDocs.length} QA documents`);

    console.log('\n🎉 QA Data seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedQAData();
