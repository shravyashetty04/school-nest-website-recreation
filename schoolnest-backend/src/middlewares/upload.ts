import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed!'), false);
  }
};

export const uploadCSV = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
