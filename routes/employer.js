const { response } = require('express');
var express = require('express');
var router = express.Router();
var employerHelper = require('../helpers/employer-helper')
const verifyLogin = (req, res, next) => {
  if (req.session.employerloggedIn) {
    next()
  } else {
    res.redirect('/employer/login')
  }
}
const verifyBlock = (req, res, next) => {
  if (req.session.verifyBlock) {
    next()
  } else {
    res.render('block')
  }
}
router.get('/', async (req, res) => {
 
  if (req.session.employerloggedIn) {
    let employer = req.session.employer
   // jobs = await employerHelper.getJobCount(req.session.employer._id)
    employerHelper.getAllJobs(req.session.employer._id).then((jobs) => {
    console.log(jobs);
      res.render('employer/landing-page', { emPloyer: true, employer, jobs })
    })

  } else {
    res.redirect('/employer/login')
  }

})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/employer/login')
})

router.get('/login', (req, res) => {
  if (req.session.employerloggedIn) {
    res.redirect('/employer')
  } else {
    res.render('employer/login', { "logginErr": req.session.logginErr })
    req.session.logginErr = false
  }
})

router.post('/login', (req, res) => {
  console.log(req.body);
  console.log(req.session);
  employerHelper.doLogin(req.body).then((response) => {
    if (response.blockCheck) {
      res.render('block')
    } else {
      if (response.status) {
        req.session.employerloggedIn = true
        req.session.employer = response.employer
        res.redirect('/employer')
      } else {
        req.session.logginErr = true
        res.redirect('/employer/login')
      }
    }

  })
})

router.get('/signup', function (req, res, next) {

  res.render('employer/signup')

})

router.post('/signup', (req, res) => {
  console.log("call")
  employerHelper.doSign(req.body).then((response) => {
    res.redirect('/employer/login')
    console.log(response)

  })

})

router.get('/add-jobs', verifyLogin, (req, res) => {
  let employer = req.session.employer
  res.render('employer/add-jobs',{ emPloyer: true, employer })
})
router.post('/add-jobs',verifyLogin,(req, res) => {
  console.log(req.body);
  console.log(req.session.employer._id);
  employerHelper.addJob(req.body,req.session.employer._id).then((status)=>{
    console.log(status);
    res.redirect('/employer/add-jobs')
  })
})
router.get('/our-jobs',verifyLogin,(req,res)=>{
  let employer = req.session.employer
 res.render('employer/job-collection',{ emPloyer: true, employer })
})

router.get('/edit-job/:id',async(req,res)=>{
  console.log(req.params.id);
  employerHelper.getJobDetails(req.params.id).then((job)=>{
    
     console.log(job);
    res.render('employer/edit-job',{job})
  })
  
 
})
router.post('/edit-job',(req,res)=>{
  console.log(req.query.id);
  console.log(req.body);
  employerHelper.updateProduct(req.query.id,req.body).then((status)=>{
    console.log(status);
   res.redirect('/employer')
    
   })
})
router.get('/delete-job/:id',(req,res)=>{
  console.log(req.params.id)
  employerHelper.deleteJob(req.params.id).then((status)=>{
    console.log(status);
    res.redirect("/employer")
  })
})
router.get('/profile',verifyLogin,(req,res)=>{
  let employer = req.session.employer
  console.log(employer);
  // employerHelper.employDetails(req.session.employer._id)
  res.render('employer/profile',{ emPloyer: true, employer })
})
router.get('/over-view',(req,res)=>{
  let employer = req.session.employer
  res.render('employer/over-view',{ emPloyer: true, employer })
})
router.get('/update-profile',verifyLogin,(req,res)=>{
  let employer = req.session.employer
  console.log(employer.Name);
  res.render('employer/update-profile',{ emPloyer: true, employer })
})
router.post('/update-profile',(req,res)=>{
  let id = req.session.employer._id
 
  employerHelper.updateProfile(req.session.employer._id,req.body).then(msg=>{
    res.redirect('/employer/profile')
    if (req.files.Image){
      let image = req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
    }
     
  })
 
})
module.exports = router