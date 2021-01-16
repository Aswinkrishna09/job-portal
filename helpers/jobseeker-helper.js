const { response } = require('express')
var db = require('../config/connection')
const { ADMIN_COLLECTION } = require('./collection')
const { EMPLOYER_JOB_COLLECTION } = require('./collection')
const { JOBS } = require('./collection')
var collection = require('./collection')
var bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId
let otp_id
module.exports = {

    doSign: (jobseekerdata) => {
        return new Promise(async (resolve, reject) => {
            jobseekerdata.Password = await bcrypt.hash(jobseekerdata.Password, 10)

            db.get().collection(collection.JOB_SEEKER_COLLECTION).insert(jobseekerdata).then((data) => {
                resolve(data.ops[0])
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let blockCheck= false
            let response = {}
            let jobSeeker = await db.get().collection(collection.JOB_SEEKER_COLLECTION).findOne({ Email: userData.Email })
            if(jobSeeker.block=="block"){
                resolve({blockCheck:true})
            }else{
                if (jobSeeker) {
                    bcrypt.compare(userData.Password, jobSeeker.Password).then((status) => {
                        if (status) {
                            console.log('login success')
                            response.jobSeeker = jobSeeker
                            response.status = true
                            resolve(response)
                        } else {
                            console.log('login failed')
                            resolve({ status: false })
                        }
                    })
                } else {
                    console.log("login failed")
                    resolve({ status: false })
                }
            }
         
        })
    },
    getOtp: (number) => {
        console.log(number.Number);
        return new Promise((resolve, reject) => {
            var request = require('request');
            var options = {
                'method': 'POST',
                'url': 'https://d7networks.com/api/verifier/send',
                'headers': {
                    'Authorization': 'Token cacd7212961e3d6efeab4041cc9de420c12cf71e'
                },
                formData: {
                    'mobile': '91' + number.Number,
                    'sender_id': 'rdbk9246',
                    'message': 'Your otp code is {code}',
                    'expiry': '900'
                }
            };
            request(options, function (error, response) {

                if (error) {
                    console.log("error number");

                } else {


                    resolve(response.body.slice(11, 47))

                    console.log(response.body.slice(11, 47));

                }
            })
        })

    },
    otpLogin: (otp_id, otp) => {
        console.log(typeof(otp_id));
        console.log(typeof(otp));
        return new Promise((resolve, reject) => {
            var request = require('request');
            var options = {
                'method': 'POST',
                'url': 'https://d7networks.com/api/verifier/verify',
                'headers': {
                    'Authorization': 'Token cacd7212961e3d6efeab4041cc9de420c12cf71e'
                },
                formData: {
                    'otp_id': otp_id,
                    'otp_code': otp
                }
            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log(response.body);
                console.log(response.body.slice(11, 18));
                resolve(response.body.slice(11, 18))
                
               
            });

        })
    },
    getLatestJobs: () => {
        return new Promise(async (resolve, reject) => {
            let latest = await db.get().collection(collection.JOBS).aggregate([
                {
                    $project: {
                        Jobs: "$jobs"
                    }
                }]).toArray()

            resolve(latest)
        })
    },
    applyJob: (jobId, jobseekerId) => {


        return new Promise(async (resolve, reject) => {
            let jobDetails = await db.get().collection(collection.JOBS).findOne({ _id: objectId(jobId) })
            console.log(jobDetails.jobs);
            let jobseekerObject = {
                jobId: objectId(jobId),
                jobDetails: jobDetails.jobs

            }
            let employerId= await db.get().collection(collection.JOBS).findOne({_id:objectId(jobId)})
            console.log("employer       "+employerId.employer);
             db.get().collection(collection.APPLIED_COLLECTION).insertOne({jobId:jobId,jobseekerId:jobseekerId,employerId:employerId.employer})
            let jobseeker = await db.get().collection(collection.JOB_SEEKER_JOB_COLLECTION).findOne({ jobseeker: objectId(jobseekerId) }, { _id: 0, jobs: 1 })
            console.log(jobseeker);
            if (jobseeker) {
                db.get().collection(collection.JOB_SEEKER_JOB_COLLECTION).updateOne({ jobseeker: objectId(jobseekerId) },
                    {
                        $push: { appliedjobs: jobseekerObject }
                    }

                )
                resolve("updated")
            } else {
                let jobseekerObj = {
                    jobseeker: objectId(jobseekerId),
                    appliedjobs: [jobseekerObject]
                }
                db.get().collection(collection.JOB_SEEKER_JOB_COLLECTION).insert(jobseekerObj)
                resolve('added')
            }

        })
    },
    appliedJobs: (jobseekerId) => {
        let response={
            status:null
           
        }
           
        return new Promise(async (resolve, reject) => {
            var jobs = await db.get().collection(collection.JOB_SEEKER_JOB_COLLECTION).findOne({ jobseeker: objectId(jobseekerId) })
            
            //     let find= await db.get().collection(collection.JOBS).findOne({_id:objectId(jobs.appliedjobs[0].jobId)})
            //    console.log(find.jobs);
            if(jobs){
               
              
                resolve(jobs.appliedjobs)

            }else{
               response.status=true
                resolve(response.status)
            }
           
        })
    },
    findExistUsingNumber:(number)=>{
        let num = String(number)
        return new Promise(async(resolve,reject)=>{
            let response ={}
            let jobseeker = await db.get().collection(collection.JOB_SEEKER_COLLECTION).findOne({Phone:num})
            console.log(jobseeker);
            if(jobseeker){
                response.jobSeeker = jobseeker
                response.status = true
                resolve({response})
            }else{
                resolve({response:false})
            }
        })
    },
    findUsingNumber:(number)=>{
        return new Promise(async(resolve,reject)=>{
            let jobseeker = await db.get().collection(collection.JOB_SEEKER_COLLECTION).findOne({Phone:number})
            resolve(jobseeker)
        })
    },
    validSignUp:(number)=>{
        return new Promise((resolve,reject)=>{
            var request = require('request');
            var options = {
                'method': 'POST',
                'url': 'https://d7networks.com/api/verifier/send',
                'headers': {
                    'Authorization': 'Token cacd7212961e3d6efeab4041cc9de420c12cf71e'
                },
                formData: {
                    'mobile': '91' + number,
                    'sender_id': 'rdbk9246',
                    'message': 'Your otp code is {code}',
                    'expiry': '900'
                }
            };
            request(options, function (error, response) {

                if (error) {
                    console.log("error number");

                } else {


                    resolve(response.body.slice(11, 47))

                    console.log(response.body.slice(11, 47));

                }
            })
        })

    },
    conformSignup:(otp_id, otp)=>{
        console.log(typeof(otp_id));
        console.log(typeof(otp));
        return new Promise((resolve, reject) => {
            var request = require('request');
            var options = {
                'method': 'POST',
                'url': 'https://d7networks.com/api/verifier/verify',
                'headers': {
                    'Authorization': 'Token cacd7212961e3d6efeab4041cc9de420c12cf71e'
                },
                formData: {
                    'otp_id': otp_id,
                    'otp_code': otp
                }
            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log(response.body);
                console.log(response.body.slice(11, 18));
                resolve(response.body.slice(11, 18))
                
               
            });

        })
    },
    updateProfile:(jobseekerId,details)=>{
        console.log(jobseekerId);
        console.log(details);
        return new Promise((resolve,reject)=>{
        db.get().collection(collection.JOB_SEEKER_COLLECTION).updateOne({_id:objectId(jobseekerId)},{
              $set:{
                  Name:details.Name,
                  Email:details.Email,
                  Experience:details.Experience,
                  Skills:details.Skills,
                  Domain:details.Domain,
                  Githubid:details.Githubid,
                  
              }
          })
         
          resolve("updated")
        })
    },
    search:(regex)=>{
        return new Promise(async(resolve,reject)=>{
            let search = await db.get().collection(collection.JOBS).find({name:regex},{'name':1}).sort({'updated_at':-1}).sort({'created_at':-1}).limit(20)
            resolve(search)
        })
    },
    viewJob:(id)=>{
        return new Promise(async (resolve, reject) => {
            let job = await db.get().collection(collection.JOBS).findOne({_id: objectId(id)})
            console.log(job);
           resolve(job)
        })
    }

}
