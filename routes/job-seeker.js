const { response, Router } = require('express');
var express = require('express');
const { ReplSet, Logger } = require('mongodb');
const jobseekerHelper = require('../helpers/jobseeker-helper');
var router = express.Router();
var jobSeekerHelper = require('../helpers/jobseeker-helper')



const verifyLogin = (req, res, next) => {
  if (req.session.jobseekerloggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
router.get('/', (req, res) => {
  let job_seeker = req.session.jobSeeker
  jobSeekerHelper.getLatestJobs().then((response) => {
    console.log(response);
    res.render('jobseeker/landing-page', { jobSeeker: true, job_seeker, response })
  })
})
// router.get('/',(req,res)=>{
//   let otp = null
//   if(req.session.jobseekerloggedIn||otp){
//     let job_seeker = req.session.jobSeeker
//     jobSeekerHelper.getLatestJobs().then((response)=>{
//       console.log(response);
//         res.render('jobseeker/landing-page',{jobSeeker:true,job_seeker,response})
//       })

//   }else{
//     res.redirect('/login')
//   }

// })

router.get('/login', (req, res) => {
  let otp = null
  if (req.session.jobseekerloggedIn || otp) {
   // module.exports = req.session.employer
    res.redirect('/')
  } else if (req.session.logginBlock) {
    res.render('jobseeker/login', { "logginBlock": req.session.logginBlock })
    req.session.logginBlock = false
  } else {

    res.render('jobseeker/login', { "logginErr": req.session.logginErr})

    req.session.logginErr = false

  }
})

router.get('/signup', function (req, res, next) {

  res.render('jobseeker/signup', { jobSeeker: true })

})

router.post('/signup', (req, res) => {
  console.log("sign-up call")
  console.log(req.body.Phone);
  let details = req.body
  let number = req.body.Phone
  jobseekerHelper.validSignUp(number).then((response) => {  // otp code inside response 
    res.render('jobseeker/otp-register', { response, number, details})
  })


})
router.post('/conform-signup', (req, res) => {
  console.log(req.query.id);
  console.log(req.body);
  console.log(req.body.otp);
  jobseekerHelper.conformSignup(req.query.id, req.body.otp).then((response) => {
    if (response == "success") {
      jobSeekerHelper.doSign(req.body).then((response) => {
        console.log(response)
        res.redirect('/login')
      })
    }
  })
})
router.post('/login', (req, res) => {
  console.log(req.body);
  jobSeekerHelper.doLogin(req.body).then((response) => {
    if (response.blockCheck) {
      req.session.logginBlock = true
      res.redirect('/login')


    } else {
      if (response.status) {
        req.session.jobseekerloggedIn = true
        req.session.jobSeeker = response.jobSeeker
        res.redirect('/')
      } else {

        req.session.logginErr = true
        res.redirect('/login')
      }
    }

  })
})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
router.get('/apply', verifyLogin, (req, res) => {
  let job_seeker = req.session.jobSeeker
  console.log(req.query.id);
  console.log(req.session.jobSeeker._id);
  jobSeekerHelper.applyJob(req.query.id, req.session.jobSeeker._id).then((response) => {
    console.log(response); 
    jobSeekerHelper.getLatestJobs().then((response) => {
      console.log(response);
      res.render('jobseeker/landing-page', { jobSeeker: true, job_seeker, response })
    })

    
  })

})
router.get('/applied-jobs', verifyLogin, (req, res) => {

  jobSeekerHelper.appliedJobs(req.session.jobSeeker._id).then((response) => {
    console.log(response);
    let job_seeker = req.session.jobSeeker
    res.render('jobseeker/appliedjobs', { jobSeeker: true, job_seeker, response })
  })
})
router.get('/otp-login', (req, res) => {

  res.render('jobseeker/get-otp', { otpLogginErr: false })

})

router.post('/get-otp', (req, res) => {

  let number = req.body.Number
  console.log(number);
  jobSeekerHelper.findExistUsingNumber(number).then((response1) => {
    console.log(response1.response.status);
    if (response1.response.status) {
      req.session.jobseekerloggedIn = true
      req.session.jobSeeker = response1.jobSeeker
      jobSeekerHelper.getOtp(req.body).then((response2) => {
        console.log(response2);
        res.render('jobseeker/type-otp', { response2, number })
      })
    } else {
      res.render('jobseeker/get-otp', { otpLogginErr: true })
    }
  })

})
router.post('/type-otp', (req, res) => {
  console.log('big big call');
  console.log(req.query.id);
  console.log(req.body);
  console.log(req.body.otp);
  jobSeekerHelper.otpLogin(req.query.id, req.body.otp).then((response) => {
    if (response == "success") {
      jobSeekerHelper.findUsingNumber(req.body.number).then((response) => {
        req.session.jobseekerloggedIn = true
        let job_seeker = response
        jobSeekerHelper.getLatestJobs().then((response) => {
          res.render('jobseeker/landing-page', { jobSeeker: true, job_seeker, response, otp: true })
          // res.redirect('/job-seeker',{jobSeeker:true,job_seeker,response,otp:true})
        })

      })

    } else {
      console.log('not success');
      res.render('jobseeker/get-otp')
    }
  })


})
router.get('/profile',verifyLogin,(req,res)=>{
  let job_seeker = req.session.jobSeeker
  console.log(job_seeker);
  res.render('jobseeker/profile',{jobSeeker:true,job_seeker})
})
router.get('/update-profile',verifyLogin,(req,res)=>{
  let job_seeker = req.session.jobSeeker
  console.log(job_seeker);
  res.render('jobseeker/update-seeker-profile',{jobSeeker:true,job_seeker})
})
router.post('/update-profile',(req,res)=>{
  let id = req.session.jobSeeker._id
  jobseekerHelper.updateProfile(req.session.jobSeeker._id,req.body).then(msg=>{
    res.redirect('/profile')
    if (req.files.Image){
      let image = req.files.Image
      image.mv('./public/jobseeker-images/'+id+'.jpg')
    }
     
  })

 
})
router.get('/viewjob',(req,res)=>{
  console.log(req.query.id);
  let job_seeker = req.session.jobSeeker
  jobseekerHelper.viewJob(req.query.id).then((job)=>{
    let response = job.jobs
    let id = job._id
    res.render('jobseeker/viewjob',{jobSeeker:true,job_seeker,response,id})
  })

 
})
router.get('/autocomplete/',(req,res)=>{
       console.log('callling');
  var regex = new RegExp(req.query['term'],'i')
  jobseekerHelper.search(regex).then((job)=>{
    job.exec(function(err,data){

      var result=[];
      if(!err){
        if(data && data.length && data.length>0){
          data.forEach(user => {
            let obj = {
              id:user._id,
              label:user.jobs.JOB
            }
            result.push(obj)
          });
        }
      }
      })
  })
 

})
router.get('/about',(req,res)=>{
  let job_seeker = req.session.jobSeeker
 res.render('jobseeker/about',{jobSeeker:true,job_seeker})
})
module.exports = router
