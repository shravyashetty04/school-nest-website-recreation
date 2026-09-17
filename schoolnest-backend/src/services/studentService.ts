import { Student, IStudent } from '../models/Student';

export const getStudents = async () => {
  return await Student.find({});
};

export const createStudent = async (studentData: Partial<IStudent>) => {
  const studentExists = await Student.findOne({ admissionNumber: studentData.admissionNumber });
  if (studentExists) {
    throw new Error('Student with this admission number already exists');
  }
  
  const student = new Student(studentData);
  return await student.save();
};
