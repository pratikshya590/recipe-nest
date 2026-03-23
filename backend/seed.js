require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { DB_URI } = require('./config/config');

const createAdmin = async () => {
  await mongoose.connect(DB_URI);
  
  const User = require('./src/models/user.model');
  
  const existingAdmin = await User.findOne({ email: 'admin@recipenest.com' });
  if (existingAdmin) {
    console.log('Admin already exists!');
    process.exit();
  }

  const admin = new User({
    name: 'Admin User',
    email: 'admin@recipenest.com',
    password: 'admin123',
    role: 'admin',
  });

  await admin.save();
  console.log('Admin created successfully!');
  console.log('Email: admin@recipenest.com');
  console.log('Password: admin123');
  process.exit();
};

createAdmin();