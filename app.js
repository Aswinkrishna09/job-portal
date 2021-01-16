var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var session = require('express-session')
var jobSeekerRouter = require('./routes/job-seeker')
var indexRouter = require('./routes/index')
var adminRouter = require('./routes/admin');
var employerRouter = require('./routes/employer');
var fileUpload = require('express-fileupload');
var db = require('./config/connection')
var app = express();
require('events').EventEmitter.defaultMaxListeners = 15;
// view engine setup
app.use((req,res,next)=>{
  res.set('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  next()
})
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.use(logger('dev'));
app.use('/css', express.static('css'));
app.use(express.static("./app/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
app.use('/',session({
  name:'jobseekerCookie',
  secret:"key",
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:600000}
}))
app.use('/employer',session({
  name:'employerCookie',
  secret:"employerKey",
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:600000}
}))
app.use('/admin',session({
  name:'adminCookie',
  secret:"adminKey",
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:600000}
}))


app.use('/',jobSeekerRouter)
app.use('/employer',employerRouter)
app.use('/admin', adminRouter);
db.connect((err)=>{
  if(err){
    console.log("error on connection"+err)
    }else{
      console.log('Database connected')
    }
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
