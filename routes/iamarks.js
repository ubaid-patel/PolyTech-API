const upload = require('./config').upload;
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const xlsx = require('xlsx');
const verifyToken = require("./config").verifyToken;
const verifyFaculty = require("./config").verifyFaculty;
const fs = require("fs");


router.post("/upload", upload.single("file"), async function (req, res) {
    const verified = verifyToken(req.headers.authorization);
    const data = req.body.data;
    const subject = req.body.subject;
    const teacher = req.body.teacher;
    let query = "REPLACE INTO iamarks (student,sem,subject,marks) VALUES ";
    
    if (verified) {
            const file = xlsx.readFile(req.file.path);
            const sheets = file.SheetNames;

            for (let i = 0; i < sheets.length; i++) {
                const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]])
                temp.forEach((obj) => {
                    marks = Object.values(obj);
                    marks.shift();
                    query += `('${obj.regno}',${req.body.sem},'${req.body.subject}','${JSON.stringify(marks)}'),`;
                })
            }
            fs.unlink(req.file.path,(err)=>{
                if(err){
                    console.log(err.message)
                }else{
                    console.log("File deleted")
                }
            })
            query = query.slice(0,-1)
            query +=';';
            req.db.query(query, (err, result) => {
                res.status(200).json({ message: "Data Uploaded"})
            })
    }else{
       res.status(401).json({ message: "Session expired" })
    }})

router.get("/:info", function (req, res) {
    const verified = verifyToken(req.headers.authorization);
    if (verified) {
        let query;
        if (verified.role.toUpperCase() === "STUDENT") {
            query = `SELECT * FROM iamarks WHERE student ='${verified.userid}' and sem ='${req.params.info}'`
        } else {
            query = `SELECT * FROM iamarks WHERE  subject ='${req.params.info}'`
        }
        req.db.query(query, (err, result) => {
            res.status(200).json(result)
        })
    } else {
        res.status(401).json({ message: "Session expired" })
    }
})
module.exports = router