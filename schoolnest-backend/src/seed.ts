import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models/User';
import { School } from './models/School';
import { Class } from './models/Class';
import { Subject } from './models/Subject';
import { Teacher } from './models/Teacher';
import { Parent } from './models/Parent';
import { Student } from './models/Student';
import { Attendance } from './models/Attendance';
import { Timetable } from './models/Timetable';
import { Exam } from './models/Exam';
import { Result } from './models/Result';
import { Fee } from './models/Fee';
import { Payment } from './models/Payment';
import { Assignment } from './models/Assignment';
import { Submission } from './models/Submission';
import dns from 'dns';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected!');

    console.log('Clearing existing data...');
    await User.deleteMany();
    await School.deleteMany();
    await Class.deleteMany();
    await Subject.deleteMany();
    await Teacher.deleteMany();
    await Parent.deleteMany();
    await Student.deleteMany();
    await Attendance.deleteMany();
    await Timetable.deleteMany();
    await Exam.deleteMany();
    await Result.deleteMany();
    await Fee.deleteMany();
    await Payment.deleteMany();
    await Assignment.deleteMany();
    await Submission.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    console.log('Seeding School...');
    const school = await School.create({
      schoolName: 'SchoolNest Academy',
      schoolCode: 'SNA001',
      email: 'admin@schoolnest.com',
      phone: '1234567890',
      address: '123 Education Lane',
      city: 'Techville',
      state: 'Innovation State',
      country: 'Webland',
      pincode: '12345',
      academicYear: '2023-2024',
    });

    console.log('Seeding Users (Admins)...');
    await User.create({ name: 'Super Admin', email: 'super@schoolnest.com', passwordHash, role: 'SUPER_ADMIN' });
    await User.create({ name: 'Principal John Doe', email: 'admin@schoolnest.com', passwordHash, role: 'SCHOOL_ADMIN', schoolId: school._id });

    console.log('Seeding Teachers...');
    const teachers = [];
    for (let i = 1; i <= 5; i++) {
      const tUser = await User.create({ name: `Teacher ${i}`, email: i===1 ? 'teacher@schoolnest.com' : `teacher${i}@schoolnest.com`, passwordHash, role: 'TEACHER', schoolId: school._id });
      const t = await Teacher.create({ teacherId: `TCH00${i}`, employeeId: `EMP00${i}`, firstName: 'Teacher', lastName: `${i}`, email: tUser.email, phone: '9876543210', schoolId: school._id, userId: tUser._id, status: 'ACTIVE' });
      teachers.push(t);
    }

    console.log('Seeding Classes & Subjects...');
    const classes = [];
    const subjects = [];
    for (let i = 1; i <= 3; i++) {
      const cls = await Class.create({ className: `Grade ${9+i}`, grade: `${9+i}`, section: 'A', academicYear: '2023-2024', classTeacher: teachers[i%5]._id, schoolId: school._id });
      classes.push(cls);

      const math = await Subject.create({ subjectName: 'Mathematics', subjectCode: `MATH${9+i}`, teacherId: teachers[0]._id, classId: cls._id, schoolId: school._id, maxMarks: 100, passingMarks: 40 });
      const sci = await Subject.create({ subjectName: 'Science', subjectCode: `SCI${9+i}`, teacherId: teachers[1]._id, classId: cls._id, schoolId: school._id, maxMarks: 100, passingMarks: 40 });
      subjects.push(math, sci);

      await Class.findByIdAndUpdate(cls._id, { $push: { subjects: { $each: [math._id, sci._id] } } });
      await Teacher.findByIdAndUpdate(teachers[0]._id, { $push: { assignedClasses: cls._id, assignedSubjects: math._id } });
      await Teacher.findByIdAndUpdate(teachers[1]._id, { $push: { assignedClasses: cls._id, assignedSubjects: sci._id } });
    }

    console.log('Seeding Parents & Students...');
    const parentUser = await User.create({ name: 'Robert Brown', email: 'parent@schoolnest.com', passwordHash, role: 'PARENT', schoolId: school._id });
    const parent = await Parent.create({ parentId: 'PRT001', firstName: 'Robert', lastName: 'Brown', email: 'parent@schoolnest.com', phone: '5555555555', schoolId: school._id, userId: parentUser._id });

    const students = [];
    for (let i = 1; i <= 20; i++) {
      const sUser = await User.create({ name: `Student ${i}`, email: i===1 ? 'student@schoolnest.com' : `student${i}@schoolnest.com`, passwordHash, role: 'STUDENT', schoolId: school._id });
      const cls = classes[i % 3];
      const stu = await Student.create({
        studentId: `STU00${i}`, admissionNumber: `ADM100${i}`, firstName: 'Student', lastName: `${i}`, email: sUser.email,
        parentId: parent._id, schoolId: school._id, classId: cls._id, section: 'A', userId: sUser._id, status: 'ACTIVE'
      });
      students.push(stu);
      await Class.findByIdAndUpdate(cls._id, { $push: { students: stu._id } });
      if (i === 1) await Parent.findByIdAndUpdate(parent._id, { $push: { children: stu._id } });
    }

    console.log('Seeding Attendance (30 days historical)...');
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (const stu of students) {
      for (let d = 0; d < 30; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - d);
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const isAbsent = Math.random() > 0.85; // 15% absence rate
        await Attendance.create({
          studentId: stu._id, classId: stu.classId, teacherId: teachers[0]._id, schoolId: school._id,
          date: date, status: isAbsent ? 'ABSENT' : 'PRESENT'
        });
      }
    }

    console.log('Seeding Timetables & Assignments...');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (let c = 0; c < classes.length; c++) {
      const cls = classes[c];
      const clsSubjects = subjects.filter(s => s.classId.toString() === cls._id.toString());
      
      for (const day of days) {
        // Vary times slightly per day
        const offset = days.indexOf(day);
        const startTime1 = `${8 + c + (offset % 2)}:00 AM`;
        const endTime1 = `${9 + c + (offset % 2)}:00 AM`;
        const startTime2 = `${10 + c + (offset % 2)}:00 AM`;
        const endTime2 = `${11 + c + (offset % 2)}:00 AM`;
        
        await Timetable.create({ classId: cls._id, section: 'A', subjectId: clsSubjects[0]._id, teacherId: teachers[0]._id, day: day, startTime: startTime1, endTime: endTime1, roomNumber: `${101 + c}`, schoolId: school._id });
        await Timetable.create({ classId: cls._id, section: 'A', subjectId: clsSubjects[1]._id, teacherId: teachers[1]._id, day: day, startTime: startTime2, endTime: endTime2, roomNumber: `${102 + c}`, schoolId: school._id });
      }
      
      const assignment = await Assignment.create({ title: `Homework 1 for ${cls.className}`, description: 'Complete all exercises.', subjectId: clsSubjects[0]._id, teacherId: teachers[0]._id, classId: cls._id, dueDate: new Date(Date.now() + 7 * 86400000), schoolId: school._id });
      for (const stu of students.filter(s => s.classId.toString() === cls._id.toString())) {
        await Submission.create({ assignmentId: assignment._id, studentId: stu._id, status: Math.random() > 0.5 ? 'SUBMITTED' : 'LATE', schoolId: school._id });
      }
    }

    console.log('Seeding Exams, Results & Fees...');
    const exam = await Exam.create({ examName: 'Mid-Term Examination', academicYear: '2023-2024', startDate: new Date(), endDate: new Date(Date.now() + 10 * 86400000), classes: classes.map(c=>c._id), subjects: subjects.map(s=>s._id), schoolId: school._id });

    for (const stu of students) {
      const clsSubjects = subjects.filter(s => s.classId.toString() === stu.classId.toString());
      for (const sub of clsSubjects) {
        const marks = Math.floor(Math.random() * 60) + 40; // 40 to 100
        await Result.create({ studentId: stu._id, examId: exam._id, subjectId: sub._id, teacherId: teachers[0]._id, marksObtained: marks, maxMarks: 100, grade: marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B' : 'C', remarks: 'Good', schoolId: school._id });
      }

      const fee = await Fee.create({ studentId: stu._id, schoolId: school._id, academicYear: '2023-2024', feeType: 'Tuition Fee', amount: 50000, dueDate: new Date(Date.now() + 30 * 86400000), amountPaid: 0, balance: 50000, status: 'PENDING' });
      const paid = Math.random() > 0.5;
      if (paid) {
        await Payment.create({ paymentId: `PAY${Math.floor(Math.random()*10000)}`, studentId: stu._id, parentId: parent._id, schoolId: school._id, feeId: fee._id, amount: 25000, paymentMethod: 'ONLINE', transactionId: 'TXN123', status: 'SUCCESS' });
        fee.amountPaid = 25000;
        await fee.save();
      }
    }

    console.log('✅ Rich Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};
seedDatabase();
