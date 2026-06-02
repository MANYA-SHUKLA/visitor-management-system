require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Visit = require('../src/models/Visit');

const LEGACY_EMAILS = {
  'admin@shuklamanya99': 'admin@shuklamanya99.com',
  'guard@shuklamanya99': 'guard@shuklamanya99.com',
  'resident1@shuklamanya99': 'resident1@shuklamanya99.com',
  'resident2@shuklamanya99': 'resident2@shuklamanya99.com',
};

const users = [
  {
    email: 'admin@shuklamanya99.com',
    password: 'admin123',
    role: 'admin',
    name: 'Society Admin',
    phone: '9000000001',
  },
  {
    email: 'guard@shuklamanya99.com',
    password: 'guard123',
    role: 'guard',
    name: 'Gate Guard',
    phone: '9000000002',
  },
  {
    email: 'resident1@shuklamanya99.com',
    password: 'resident123',
    role: 'resident',
    name: 'MANYA SHUKLA',
    apartment: 'A-101',
    phone: '9000000101',
  },
  {
    email: 'resident2@shuklamanya99.com',
    password: 'resident123',
    role: 'resident',
    name: 'MAHI SHUKLA',
    apartment: 'B-204',
    phone: '9000000204',
  },
];

async function migrateStatuses() {
  await Visit.updateMany({ status: 'checked_in' }, { status: 'entered' });
  await Visit.updateMany({ status: 'checked_out' }, { status: 'exited' });
}

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/visitor_user';
  await mongoose.connect(uri);

  // Drop indexes from older schemas (e.g. unique userId_1 on users)
  await User.syncIndexes();

  for (const [oldEmail, newEmail] of Object.entries(LEGACY_EMAILS)) {
    const migrated = await User.updateOne({ email: oldEmail }, { $set: { email: newEmail } });
    if (migrated.modifiedCount) {
      console.log(`Migrated email: ${oldEmail} → ${newEmail}`);
    }
  }

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      existing.password = u.password;
      existing.name = u.name;
      existing.role = u.role;
      existing.apartment = u.apartment;
      existing.phone = u.phone;
      await existing.save();
      console.log(`Updated: ${u.email}`);
    } else {
      await User.create(u);
      console.log(`Created: ${u.email}`);
    }
  }

  await migrateStatuses();
  console.log('Migrated visit statuses to entered/exited where needed');

  console.log('\nDemo accounts:');
  console.log('  admin@shuklamanya99.com / admin123');
  console.log('  guard@shuklamanya99.com / guard123');
  console.log('  resident1@shuklamanya99.com / resident123 — MANYA SHUKLA (A-101)');
  console.log('  resident2@shuklamanya99.com / resident123 — MAHI SHUKLA (B-204)');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
