const mongoClient = require('mongodb').MongoClient
const state = {
    db:null
}

module.exports.connect=function(done,){
    // const url = "mongodb+srv://aswin_krishna:Portal_33@test.iahyn.mongodb.net/Perfectjob?retryWrites=true&w=majority"
    // const dbname = 'jobPortal'
     const url = 'mongodb://localhost:27017'
     const dbname = 'jobPortal'
    mongoClient.connect(url,{ useUnifiedTopology: true },(err,data)=>{  //  MongoClient constructor.
        if(err) throw err
        state.db=data.db(dbname)

    })
    done()
}

module.exports.get = function(){
    return state.db
}