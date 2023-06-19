const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    adminName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:"string",
        required:true
    }
},{timestamps:true});

module.exports = mongoose.model('Admin', adminSchema);