import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User, UserRole } from '../models/User';
import { Agent, RiskLevel, AgentStatus } from '../models/Agent';
import { Permission, PermissionType, PermissionStatus } from '../models/Permission';
import { ActionRequest } from '../models/ActionRequest';
import { AuditLog } from '../models/AuditLog';
import { SecurityAlert } from '../models/SecurityAlert';
import { Approval } from '../models/Approval';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-security-gateway');
    console.log('DB Connected!');

    console.log('Clearing old data...');
    await User.deleteMany({});
    await Agent.deleteMany({});
    await Permission.deleteMany({});
    await ActionRequest.deleteMany({});
    await AuditLog.deleteMany({});
    await SecurityAlert.deleteMany({});
    await Approval.deleteMany({});

    console.log('Creating Admin User...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@zero-trust-ai.local',
      passwordHash,
      role: UserRole.ADMIN,
    });

    console.log('Creating Agents...');
    const researchBot = await Agent.create({
      name: 'ResearchBot',
      description: 'Gathers data from public sources and generates reports.',
      ownerId: adminUser._id,
      status: AgentStatus.ACTIVE,
      riskLevel: RiskLevel.LOW,
    });

    const emailAssistant = await Agent.create({
      name: 'EmailAssistant',
      description: 'Drafts and sends emails on behalf of the user.',
      ownerId: adminUser._id,
      status: AgentStatus.ACTIVE,
      riskLevel: RiskLevel.MEDIUM,
    });

    const dataAnalysisBot = await Agent.create({
      name: 'DataAnalysisBot',
      description: 'Connects to databases to run complex queries.',
      ownerId: adminUser._id,
      status: AgentStatus.ACTIVE,
      riskLevel: RiskLevel.HIGH,
    });

    console.log('Assigning Permissions...');
    // ResearchBot permissions
    await Permission.create({ agentId: researchBot._id, permissionType: PermissionType.FILE_READ, status: PermissionStatus.ALLOW });
    await Permission.create({ agentId: researchBot._id, permissionType: PermissionType.REPORT_GENERATE, status: PermissionStatus.ALLOW });
    await Permission.create({ agentId: researchBot._id, permissionType: PermissionType.DATABASE_WRITE, status: PermissionStatus.DENY });
    await Permission.create({ agentId: researchBot._id, permissionType: PermissionType.EMAIL_SEND, status: PermissionStatus.DENY });

    // EmailAssistant permissions
    await Permission.create({ agentId: emailAssistant._id, permissionType: PermissionType.FILE_READ, status: PermissionStatus.ALLOW });
    await Permission.create({ agentId: emailAssistant._id, permissionType: PermissionType.EMAIL_SEND, status: PermissionStatus.ALLOW });
    await Permission.create({ agentId: emailAssistant._id, permissionType: PermissionType.DATABASE_WRITE, status: PermissionStatus.DENY });

    // DataAnalysisBot permissions
    await Permission.create({ agentId: dataAnalysisBot._id, permissionType: PermissionType.DATABASE_READ, status: PermissionStatus.ALLOW });
    await Permission.create({ agentId: dataAnalysisBot._id, permissionType: PermissionType.DATABASE_WRITE, status: PermissionStatus.ALLOW });
    await Permission.create({ agentId: dataAnalysisBot._id, permissionType: PermissionType.FILE_WRITE, status: PermissionStatus.DENY });

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
