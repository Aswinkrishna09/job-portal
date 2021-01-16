const { response } = require('express')
var db = require('../config/connection')
const { ADMIN_COLLECTION } = require('./collection')
const { EMPLOYER_COLLECTION } = require('./collection')
var collection = require('./collection')
var bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
module.exports={
    adminLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
           
            let response={}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            if(admin){
               bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                if(status){
                    console.log('login success')
                    response.admin=admin
                    response.status=true
                    resolve(response)
                }else{
                    console.log('login failed')
                    
                    resolve({status:false,loggedErr:true})

                }
               })
            }else{
                console.log("login failed")
                resolve({status:false})
            }
        })
    },
    employerCount:()=>{
        return new Promise(async(resolve,reject)=>{
        let employNum = await db.get().collection(collection.EMPLOYER_COLLECTION).find().toArray()
        resolve(employNum)
        })
    },
    blockEmploy:(employId)=>{
        return new Promise(async(resolve,reject)=>{
            let check = await db.get().collection(collection.EMPLOYER_COLLECTION).findOne({_id:objectId(employId)})
            console.log(check);
            if(check.block=='block'){
               resolve( 'already blocked' )
            }else{
               db.get().collection(collection.EMPLOYER_COLLECTION).updateOne({_id:objectId(employId)},{$set:{block:'block'}})
                resolve('employ blocked')
                
            }
        })
    },
    unblockEmploy:(employId)=>{
       
        return new Promise(async(resolve,reject)=>{
            let check = await db.get().collection(collection.EMPLOYER_COLLECTION).findOne({_id:objectId(employId)})
            console.log(check);
            if(check.block=='block'){
                 db.get().collection(collection.EMPLOYER_COLLECTION).updateOne({_id:objectId(employId)},{$set:{block:'unblock'}})
                    resolve('employ blocked')
            }else{
                resolve('already unblocked')
            }
        })
    
    },
    jobseekerCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let jobseekerNum = await db.get().collection(collection.JOB_SEEKER_COLLECTION).find().toArray()
            resolve(jobseekerNum)
            })
    },
    blockJobseeker:(jobseekerId)=>{
        return new Promise(async(resolve,reject)=>{
            let check = await db.get().collection(collection.JOB_SEEKER_COLLECTION).findOne({_id:objectId(jobseekerId)})
            console.log(check);
            if(check.block=='block'){
               resolve( 'already blocked' )
            }else{
               db.get().collection(collection.JOB_SEEKER_COLLECTION).updateOne({_id:objectId(jobseekerId)},{$set:{block:'block'}})
                resolve('jobseeker blocked')
                
            }
        })
    },
    unblockJobseeker:(jobseekerId)=>{
       
        return new Promise(async(resolve,reject)=>{
            let check = await db.get().collection(collection.JOB_SEEKER_COLLECTION).findOne({_id:objectId(jobseekerId)})
            console.log(check);
            if(check.block=='block'){
                 db.get().collection(collection.JOB_SEEKER_COLLECTION).updateOne({_id:objectId(jobseekerId)},{$set:{block:'unblock'}})
                    resolve('employ blocked')
            }else{
                resolve('already unblocked')
            }
        })
    
    }

}