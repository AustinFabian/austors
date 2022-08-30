const Tour = require('./../model/tourModel');
const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/catchAsync')
const handler = require('./handlerFactory');
const sharp = require('sharp');
const multer = require('multer')

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
exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount: 3
  }
]);

// code to resize the image files using multer
exports.resizeTourImages = catchAsync(async (req,res,next)=>{

  console.log(req.body)
  
  if(!req.files.imageCover || !req.files.images) return next();


  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  // FOR IMAGES
  await sharp(req.files.imageCover[0].buffer)
  .resize(2000,1333)
  .toFormat('jpeg')
  .jpeg({quality: 90})
  .toFile(`public/img/tours/${req.body.imageCover}`)


  // FOR IMAGE COVER
  req.body.images = [];

  await Promise.all
    (req.files.images.map(async (file, i)=>{
      const filename =  `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
      
      await sharp(file.buffer)
      .resize(2000,1333)
      .toFormat('jpeg')
      .jpeg({quality: 90})
      .toFile(`public/img/tours/${filename}`)

      req.body.images.push(filename)
    })
  );

  

  next();
});

exports.aliasTopTours = (req,res,next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

// getTours function
exports.getTours = handler.getAll(Tour);

// getTour function
exports.getTour = handler.getOne(Tour, {path: 'reviews'});

// createTour function
exports.createTour = handler.createOne(Tour);

// updateTour function
exports.updateTour = handler.updateOne(Tour);

// Delete tour function
exports.deleteTour = handler.deleteOne(Tour);

// AGGREGATION FUNCTION
exports.getTourStats = catchAsync(async (req,res,next)=>{
        const stats = await Tour.aggregate([
            {
                $match:{ratingsAverage: {$gt: 4.5}}
            },
            {
                $group: {
                    _id: {$toUpper:'$difficulty'},
                    numTours:{ $sum: 1},
                    numRating:{ $sum: '$ratingsQuantity'},
                    avgRating:{ $avg: '$ratingsAverage' },
                    avgPrice:{ $avg: '$price' },
                    minPrice:{ $min: '$price' },
                    maxPrice:{ $max: '$price' }
                }
            },
            {
                $sort:{
                    avgprice: 1
                }
            },
        ]);
        res.status(200).json({
            status:'success',
            result: stats.length,
            data:{
                stats
            }
        })
});

// AGGREGATION FUNCTION FOR MOST REQUESTED TOUR FOR THE YEAR
exports.getMonthlyPlan = catchAsync(async (req,res,next)=>{
        const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match:{
                    startDates:{
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`) 
                    }
                }
            },
            {
                $group:{
                    _id: {$month: '$startDates'},
                    numMonths: {$sum: 1},
                    tours: {$push:'$name'}
                }
            },
            {
               $addFields: { month: '$_id' }
            },
            {
                $project:{_id: 0}
            },
            {
                $sort:{
                    numMonths: -1
                }
            },
            {
                $limit: 6
            }
        ]);
        res.status(200).json({
            status:'success',
            result : plan.length,
            data:{
                plan
            }
        })
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });
  
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    });
  });
  
  exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitute and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  });