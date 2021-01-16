const { response } = require('express')
var db = require('../config/connection')
const { EMPLOYER_COLLECTION } = require('./collection')
const { EMPLOYER_JOB_COLLECTION } = require('./collection')
var collection = require('./collection')
var bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
const { Logger } = require('mongodb')
module.exports = {
    doSign:(employerdata)=>{
        return new Promise(async(resolve,reject)=>{
            employerdata.Password = await bcrypt.hash(employerdata.Password,10)

            db.get().collection(collection.EMPLOYER_COLLECTION).insert(employerdata).then((data)=>{
                resolve(data.ops[0])
            })
        })
    },
    doLogin:(employerData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let blockCheck= false
            let response={}
            let employer = await db.get().collection(collection.EMPLOYER_COLLECTION).findOne({Email:employerData.Email})
            console.log(employer);
            if(employer.block=='block'){
                
                resolve({blockCheck:true})
                
            }else{
                
                if(employer){
                    
                    bcrypt.compare(employerData.Password,employer.Password).then((status)=>{
                        console.log(status);
                     if(status){
                         
                         console.log('login success')
                         response.employer=employer
                         response.status=true
                         resolve(response)
                     }else{
                         console.log('login failed')
                         resolve({status:false})
                     }
                    })
                 }else{
                     console.log("login failed")
                     resolve({status:false})
                 }
            }
            
        })
    },
    addJob:(jobDetails,employId)=>{
        let employObj={
            employer:objectId(employId),
            jobs: jobDetails
        }
       return new Promise((resolve,reject)=>{

        db.get().collection(collection.JOBS).insertOne(employObj)
        resolve('inserted')

       })
    },
    getAllJobs:(employ)=>{
        console.log(employ);
        return new Promise(async(resolve,reject)=>{
            let Jobs = await db.get().collection(collection.JOBS).find({employer:objectId(employ)}).toArray()
            
            resolve(Jobs)
        })
    },
    getJobDetails:(jobId)=>{
       return  new Promise(async(resolve,reject)=>{
           let job =await db.get().collection(collection.JOBS).findOne({_id:objectId(jobId)})
           console.log(job);
            resolve(job)
           
        })
    },
    updateProduct:(jobId,jobDetails)=>{
        console.log(jobId);
        console.log(jobDetails);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.JOBS)
            .updateOne({_id:objectId(jobId)},{
            $set:{jobs:{
                Job:jobDetails.Job,
                Date:jobDetails.Date,
                Description:jobDetails.Description,
                Experience:jobDetails.Experience,
                LastDateForApply:jobDetails.LastDateForApply,
                Location:jobDetails.Location
            }}
         })
             resolve("updated")
        
        })
    },
    deleteJob:(jobId)=>{
        return new Promise((reslove,reject)=>{
            db.get().collection(collection.JOBS).removeOne({_id:objectId(jobId)})
            reslove("deleted")
        })
    },
    updateProfile:(employerId,details)=>{
        console.log(employerId);
        console.log(details);
        return new Promise((resolve,reject)=>{
        db.get().collection(collection.EMPLOYER_COLLECTION).updateOne({_id:objectId(employerId)},{
              $set:{
                  Name:details.Name,
                  Email:details.email,
                  website:details.url,
                  street:details.street,
                  city:details.city,
                  state:details.state,
                  phone:details.phone,
                  zip:details.zip
              }
          })
         
          resolve("updated")
        })
    }
}