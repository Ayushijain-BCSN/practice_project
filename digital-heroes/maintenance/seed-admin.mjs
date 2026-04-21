import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://ayushijain0807_db_user:CzSZGkTzmcHWBfLa@cluster0.tncoxks.mongodb.net/?appName=Cluster0';

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, default: 'admin' },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin1234@gmail.com';
    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 12);

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log(`Admin ${email} already exists. Updating password...`);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Password updated successfully.');
    } else {
      console.log(`Creating new admin: ${email}`);
      await Admin.create({
        email,
        password: hashedPassword,
        fullName: 'System Administrator',
        role: 'admin'
      });
      console.log('Admin created successfully.');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
