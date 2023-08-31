const upload = require('./config').upload;
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('./config').verifyToken; 

router.post("/upload/:sem", upload.single("file"), async function (req, res) {
    const verified = verifyToken(req.headers.authorization);
    const faculty = await verifyFaculty(req.db, verified.userid, subject, req.body.sem, req.body.branch);
    let query = "REPLACE INTO users (userid,fullname,mobile,email,branch,userRole) VALUES ";
    let query2 = "REPLACE INTO users (regno,sem) VALUES"
    const data = req.body.data;
    const subject = req.body.subject;
    const teacher = req.body.teacher;
    if (verified) {
        if (faculty) {
            const file = xlsx.readFile(req.file.path);
            const sheets = file.SheetNames;

            for (let i = 0; i < sheets.length; i++) {
                const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]])
                temp.forEach((res) => {
                    marks = Object.values(res);
                    marks.shift();
                    query += `('${res.reg}','${res.fullname}','${res.mobile}','${res.email}','${verified.branch}','STUDENT'),`;
                    query2 += `('${res.reg}','${req.params.sem}',`;
                })
            }
            query = query.slice(0,-1)
            query +=';';
            query2 = query2.slice(0,-1)
            query2 +=';';

            req.db.query(query+query2, (err, result) => {
                res.status(200).json({ message: "Data Uploaded" })
            })
        } else {
            res.status(401).json({ message: "Session expired" })
        }
    }else{
        res.status(401).json({ message: "Not Allowed" })
    }})

router.get("/:sem",function(req,res){
    const verified = verifyToken(req.headers.authorization);
    if(verified){
        const query = `SELECT * FROM students WHERE branch ='${verified.branch}' and sem = '${req.params.sem}'`+
        `INNER JOIN users on students.reg = users.userid`;
        req.db.query(query,(err,results)=>{
            res.status(200).send(results)
        })
    }else{
        res.status(401).json({message:"Session expired"})
    }
})
module.exports=router