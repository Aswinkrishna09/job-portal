const { response } = require('express');
var express = require('express');
var router = express.Router();
var jobSeekerHelper = require('../helpers/jobseeker-helper')

router.get('/',(req,res)=>{
    jobSeekerHelper.getLatestJobs().then((response)=>{
       
        res.render('index/index',{index:true,response})
      
       
        
      })


})
router.post('/admin-login',(req,res)=>{

    res.render('admin/admin-login')
})

module.exports = router