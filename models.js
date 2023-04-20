const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    Id: { type: String, required: true },
    Username: { type: String, required: true },
    Password: { type: String, required: true},
    Type: {type: String, required: true}
})

const studentSchema = mongoose.Schema({
    Id: { type: String, required: true },
    Name: { type: String, required: true },
    Hours: { type: Number, required: true},
    Class: {type: String, required: true},
    Professor: {type: String, required: true}
})

const assignmentSchema = mongoose.Schema({
    Id: { type: String, required: true },
    Name: { type: String, required: true },
    Hours: { type: Number, required: true},
    State: {type: String, required: true},
    Info: {type: Object, required: true},
    Student: {type: Object, required: true}
})

const logSchema = mongoose.Schema({
    User: { type: String, required: true },
    Name: { type: String, required: true },
    Action: { type: String, required: true},
    Time: {type: String, required: true}
})

const Users = mongoose.model("Users", userSchema)
const Students = mongoose.model("Students", studentSchema)
const Assignments = mongoose.model("Assignments", assignmentSchema)
const Logs = mongoose.model("Logs", logSchema)


module.exports ={
    Users, Students, Assignments, Logs 
}

