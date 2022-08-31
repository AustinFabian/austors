const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/AppError');
const handler = require('./handlerFactory');
const sharp = require('sharp');
const multer = require('multer')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

// Making use of memoryStorage
const multerStorage = multer.memoryStorage()

const multerFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true)
  }else{
    cb(new AppError('Not an Image please upload only Images',400),false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');

// Middle ware to resize user photo after upload
exports.resizeUserPhoto = catchAsync(async (req,res,next)=>{
  if(!req.file) return next();

  const date = new Date();
  
  req.file.filename = `user-${req.user.name}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
  .resize(500,500)
  .toFormat('jpeg')
  .jpeg({quality: 90})
  .toFile(`public/img/users/${req.file.filename}`)

  next();
})

// /me route code
exports.getMe = (req,res,next)=>{
  req.params.id = req.user.id;
  next();
}

// Update user document
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400
        )
      );
    }
  
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    if(req.file)filteredBody.photo = req.file.filename
  
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      status: 'Success',
      data: {
        user: updatedUser
      }
    });
});

// Delete user document by user
exports.deleteMe = catchAsync(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id, {active:false});

  res.status(204).json({
    status : 'Success',
    data : null
  })
});

// Create User
exports.createUser = (req,res)=>{
    res.status(500).json({
        status: 'success',
        message: 'This route is not yet defined/Please use /signup instead'
    });
};

// GET ALL USERS
exports.getUsers = handler.getAll(User);

// Get user
exports.getUser = handler.getOne(User);

// Update User
exports.updateUser = handler.updateOne(User); // Do not update password with this

// Delete user
exports.deleteUser = handler.deleteOne(User);
