var express = require('express');
const { response } = require('../app');
var router = express.Router();
var adminHelper = require('../helpers/admin-helper')
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}
// getting call to admin 

router.get('/', (req, res) => {
  if (req.session.loggedIn) {
    let admin_cnt = req.session.admin
    console.log(admin_cnt)
    res.render('admin/admin-cnt', { admin: true, admin_cnt })
  } else {
    res.redirect('admin/login')
  }

})

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/admin')
  } else {
    res.render('admin/admin-login', { loginErr: req.session.loginErr })
    req.session.logginErr = false
  }

})


router.post('/submit', (req, res) => {
  adminHelper.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.admin = response.admin
      res.redirect('/admin')
    } else {
      req.session.loginErr = true
      res.redirect('/admin/login')
    }
  })


})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/admin/login')
})
router.get('/employer', verifyLogin, (req, res) => {
  let admin_cnt = req.session.admin
  adminHelper.employerCount().then((response) => {
    let emplyNum = response
    res.render('admin/view-employers', { admin: true, admin_cnt, emplyNum })
  })
})
router.get('/block-employ',verifyLogin,(req, res) => {
  console.log(req.query);
  adminHelper.blockEmploy(req.query.id).then((status) => {
  console.log(status);
  res.redirect('/admin/employer')
  })

})
router.get('/unblock-employ',verifyLogin,(req, res) => {
  
  adminHelper.unblockEmploy(req.query.id).then((status)=>{
    console.log(status);
    res.redirect('/admin/employer')
  })
})
router.get('/jobseeker', verifyLogin, (req, res) => {
  let admin_cnt = req.session.admin
  adminHelper.jobseekerCount().then((response) => {
    let jobseekerNum = response
    res.render('admin/view-jobseekers', { admin: true, admin_cnt, jobseekerNum })
  })
})
router.get('/block-jobseeker',verifyLogin,(req, res) => {
  console.log(req.query);
  adminHelper.blockJobseeker(req.query.id).then((status) => {
  console.log(status);
  res.redirect('/admin/jobseeker')
  })

})
router.get('/unblock-jobseeker',verifyLogin,(req, res) => {
  
  adminHelper.unblockJobseeker(req.query.id).then((status)=>{
    console.log(status);
    res.redirect('/admin/employer')
  })
})
module.exports = router;