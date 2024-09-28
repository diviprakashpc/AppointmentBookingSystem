// Do a local connection to mongo db database
const mongoose = require("mongoose");



async function connectDB(){
   const res =  await mongoose.connect(process.env.MONGO_LOCAL_URI + '/' + process.env.DB_NAME)
   if(res) console.log("DB connected with", res.connection.host);
}

module.exports = {connectDB}