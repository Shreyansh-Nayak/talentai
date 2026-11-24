const dotenv   = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User     = require('./models/User');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  // Clear existing test users
  await User.deleteMany({
    email: {
      $in: ['seeker@test.com', 'employer@test.com', 'admin@test.com']
    }
  });

  await User.create([
    {
      name:     'Arjun Kumar',
      email:    'seeker@test.com',
      password: 'password123',
      role:     'seeker',
      isVerified: true,
      profile: {
        title:    'Senior Software Engineer',
        location: 'Bangalore, India',
        skills:   ['React', 'Node.js', 'TypeScript', 'AWS'],
        experience: 5,
      },
    },
    {
      name:     'TechCorp Inc.',
      email:    'employer@test.com',
      password: 'password123',
      role:     'employer',
      isVerified: true,
    },
    {
      name:     'Admin User',
      email:    'admin@test.com',
      password: 'password123',
      role:     'admin',
      isVerified: true,
    },
  ]);

  console.log('✅ Test users seeded!');
  console.log('   seeker@test.com   / password123');
  console.log('   employer@test.com / password123');
  console.log('   admin@test.com    / password123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});