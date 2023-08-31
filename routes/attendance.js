const upload = require('./config');
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('./config').verifyToken;
const verifyFaculty = require('./config').verifyFaculty;

router.post("/mark",async function(req,res){
    const verified = verifyToken(req.headers.authorization);
    let query = "REPLACE INTO attendance (subject,teacher,student,present) VALUES ";
 
    const data = req.body.data;
    const subject = req.body.subject;
    const faculty = await verifyFaculty(req.db,verified.userid,subject,req.body.sem,req.body.branch);
    if(verified){
        if(faculty){
            for(index in data){
                    query += `('${subject}','${verified.userid}','${data[index].reg}',${data[index].present}),`
            }
            query = query.slice(0,-1)
            query +=';';
            req.db.query(query,(err,results)=>{
                if(err){
                    console.log(err.sqlMessage);
                    res.status(200).json({message:"Attendance already submitted"})
                }else{
                    res.status(200).json({message:"Attendance submitted"})
                }
                
            })
        }else{
            res.status(401).json({message:"Not Allowed"})
        }
    }else{
        res.status(401).json({message:"Session expired"})
    }
})

router.get("/",function(req,res){
    const verified = verifyToken();
    if(verified){
        if(verified.role.toUpperCase() === "STUDENT"){
            const query = `SELECT * FROM attendance WHERE reg ='${verified.userid}' and subject ='${req.body.subject}'`;
        }else{
            const query = `SELECT * FROM attendance WHERE  subject ='${req.body.subject}' AND date = '${req.body.date}' `+
            `INNER JOIN students on attendance.sem = students.sem'`
        }
        req.db.query(query,(er,results)=>{

        })
    }else{
        res.status(401).json({message:"Session expired"})
    }
})
module.exports=router