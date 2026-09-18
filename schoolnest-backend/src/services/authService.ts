import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { School } from '../models/School';

export const registerUser = async (userData: any) => {
  const { name, email, passwordHash, role, schoolName } = userData;
  
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(passwordHash as string, salt);

  let schoolId;

  if (role === 'SCHOOL_ADMIN' && schoolName) {
    const school = await School.create({
      schoolName: schoolName,
      schoolCode: schoolName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000),
      email: email,
      phone: '0000000000',
      address: 'Update Address',
      city: 'Update City',
      state: 'Update State',
      country: 'Update Country',
      pincode: '000000',
      academicYear: '2023-2024',
    });
    schoolId = school._id;
  }

  const user = await User.create({
    name,
    email,
    passwordHash: hashedPassword,
    role: role || 'STUDENT',
    schoolId,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId,
    token: generateToken(user._id.toString(), user.role, user.schoolId?.toString()),
  };
};

export const loginUser = async (email: string, passwordHash: string) => {
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(passwordHash, user.passwordHash))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      token: generateToken(user._id.toString(), user.role, user.schoolId?.toString()),
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

const generateToken = (id: string, role: string, schoolId?: string) => {
  return jwt.sign({ userId: id, role, schoolId }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};
