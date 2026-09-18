import { Response, NextFunction } from 'express';
import { Parent } from '../models/Parent';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export const createParent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, firstName, lastName, ...otherData } = req.body;
    const schoolId = req.user?.schoolId;

    // Create auth user for parent
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('parent123', salt); // Default password
    
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      passwordHash: hashedPassword,
      role: 'PARENT',
      schoolId,
    });

    const parentData = { 
      ...otherData, 
      email, 
      firstName, 
      lastName, 
      schoolId,
      userId: user._id
    };
    
    if (!parentData.parentId) parentData.parentId = `PRT${Math.floor(Math.random() * 100000)}`;
    
    const parent = await Parent.create(parentData);
    
    res.status(201).json({ success: true, data: parent });
  } catch (error) {
    next(error);
  }
};

export const getParents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parents = await Parent.find({ schoolId: req.user?.schoolId })
      .populate('children', 'firstName lastName admissionNumber');
      
    res.status(200).json({ success: true, data: parents });
  } catch (error) {
    next(error);
  }
};

export const updateParent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updatedParent = await Parent.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user?.schoolId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedParent) {
      res.status(404);
      throw new Error('Parent not found');
    }
    
    res.status(200).json({ success: true, data: updatedParent });
  } catch (error) {
    next(error);
  }
};

export const deleteParent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const deletedParent = await Parent.findOneAndDelete({ _id: req.params.id, schoolId: req.user?.schoolId });
    
    if (!deletedParent) {
      res.status(404);
      throw new Error('Parent not found');
    }
    
    await User.findByIdAndDelete(deletedParent.userId);
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
