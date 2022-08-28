const Tour = require('./../model/tourModel');
const Bookings = require('./../model/bookingsModel')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError')
const User = require('./../model/userModel')


exports.getOverview = catchAsync(async(req,res,next)=>{
    const tours = await Tour.find()
    res.status(200).render('overview', {
        title: 'Austours | All Tours',
        tours
    })
});

exports.getTour = catchAsync(async(req,res,next)=>{
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
      }
      
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    })
});

exports.getLogin = catchAsync(async(req,res,next)=>{
    res.status(200).render('login',{
        title: 'Austours | Login to your account'
    })
});

exports.getSignup = catchAsync(async(req,res,next)=>{
    res.status(200).render('signup', {
        title: ' Austours | Signup to create an account',
    });
});

exports.getTourManager = catchAsync(async(req,res,next)=>{
    const tours = await Tour.find()
    res.status(200).render('tourManager', {
        title: 'Austours | Tour Manager',
        tours
    })
});

exports.createTour = catchAsync(async(req,res,next)=>{
    res.status(200).render('createTour', {
        title: 'Austours Admin | Create Tour',
    });
});

exports.updateTour = catchAsync(async(req,res,next)=>{
    const tour = await Tour.findOne({ slug: req.params.slug });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
      }

    res.status(200).render('updateTour',{
        title: `Austours Admin | Update ${tour.name}`,
        tour
    })
})

exports.getUser = catchAsync(async(req,res,next)=>{
    res.status(200).render('user',{
        title: 'Your account'
    })
});

exports.getUserManager = catchAsync(async(req,res,next)=>{

    res.status(200).render('userManager',{
        title: 'Manage Users',
        user: User
    })

});

exports.getMyTours = catchAsync(async(req,res,next)=>{
    // 1 find all bookings
    const bookings = await Bookings.find({user: req.user.id})
    // 2 find tours with the returned IDs
    const tourIDs = await bookings.map(el => el.tour)
    const tours = await Tour.find({_id: {$in: tourIDs}})

    res.status(200).render('overview',{
        title: 'My Tours',
        tours
    })
})



exports.updateUserData = catchAsync(async(req,res,next)=>{
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email:req.body.email
    },
    {
        new:true,
        runValidators: true
    })

    res.status(200).render('account',{
        title: 'Your account',
        user: updatedUser
    })

});
