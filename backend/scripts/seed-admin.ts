/**
 * Development-only test user provisioning script.
 * Run with: npx tsx scripts/seed-admin.ts
 * Only works in NODE_ENV=development
 * Creates ADMIN and FACULTY test accounts for E2E testing
 */
import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase, disconnectDatabase } from '../src/config/database';
import User, { UserRole } from '../src/models/user.model';
import { hashPassword } from '../src/utils/password';

interface TestUser {
  email: string;
  password: string;
  role: UserRole;
  label: string;
}

const TEST_USERS: TestUser[] = [
  { email: 'admin@test.com', password: 'Admin@12345', role: UserRole.ADMIN, label: 'ADMIN' },
  { email: 'faculty@test.com', password: 'Faculty@12345', role: UserRole.FACULTY, label: 'FACULTY' },
];

async function seedTestUsers() {
  if (process.env.NODE_ENV !== 'development') {
    console.error('❌ This script only runs in development mode');
    process.exit(1);
  }

  try {
    await connectDatabase();
    console.log('✅ Connected to database');

    for (const testUser of TEST_USERS) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: testUser.email });
      if (existingUser) {
        let needsSave = false;
        // If role is incorrect, update it
        if (existingUser.role !== testUser.role) {
          console.log(`🔄 Updating ${testUser.label} user role: ${existingUser.role} → ${testUser.role}`);
          existingUser.role = testUser.role;
          needsSave = true;
        }
        // Always update password to ensure it matches the expected test credentials
        const passwordHash = await hashPassword(testUser.password);
        existingUser.password = passwordHash;
        needsSave = true;

        if (needsSave) {
          await existingUser.save();
          console.log(`✅ ${testUser.label} user updated successfully`);
        } else {
          console.log(`ℹ️  ${testUser.label} user already exists: ${testUser.email}`);
        }
        console.log(`   Role: ${existingUser.role}`);
        console.log(`   ID: ${existingUser._id}`);
        console.log('');
        console.log(`📋 ${testUser.label} Login credentials:`);
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Password: ${testUser.password}`);
        console.log('');
        continue;
      }

      // Create user
      const passwordHash = await hashPassword(testUser.password);

      const user = await User.create({
        email: testUser.email,
        password: passwordHash,
        role: testUser.role,
      });

      console.log(`✅ ${testUser.label} user created successfully`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
      console.log(`📋 ${testUser.label} Login credentials:`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
      console.log('');
    }

    // Verify student@test.com exists (should be created via normal registration)
    const student = await User.findOne({ email: 'student@test.com' });
    if (student) {
      console.log('ℹ️  STUDENT user exists: student@test.com');
      console.log(`   Role: ${student.role}`);
      console.log(`   ID: ${student._id}`);
    } else {
      console.log('⚠️  student@test.com not found - will be created via normal registration (STUDENT role)');
    }
  } catch (error) {
    console.error('❌ Failed to create test users:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

seedTestUsers();