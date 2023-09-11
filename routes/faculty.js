const upload = require('./config').upload;
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('./config').verifyToken;
const xlsx = require("xlsx")
const fs = require('fs')

router.post("/upload", upload.single("file"), async function (req, res) {
    const verified = verifyToken(req.headers.authorization);
    let query = "REPLACE INTO users (userid,fullname,mobile,email,branch,userRole) VALUES ";
    if (verified) {
        const file = xlsx.readFile(req.file.path);
        const sheets = file.SheetNames;

        for (let i = 0; i < sheets.length; i++) {
            const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]])
            temp.forEach((entry) => {
                marks = Object.values(entry);
                marks.shift();
                if (verified.role.toLowerCase() === 'admin') {
                    query += `('${entry.empid}','${entry.fullname}','${entry.mobile}','${entry.email}','${verified.branch}','HOD'),`;
                } else {
                    query += `('${entry.empid}','${entry.fullname}','${entry.mobile}','${entry.email}','${verified.branch}','FACULTY'),`;
                }
            })
        }
        query = query.slice(0, -1)
        query += ';';

        req.db.query(query, (err, result) => {
            res.status(200).json({ message: "Data Uploaded" })
        })
        fs.unlink(req.file.path,(err)=>{
            if(err){
                console.log(err.message)
            }else{
                console.log("File deleted")
            }
        })
    } else {
        res.status(401).json({ message: "Session expired" })
    }
})

router.get("/", function (req, res) {
    const verified = verifyToken(req.headers.authorization);
    if (verified) {
        let query = `SELECT * FROM users WHERE branch ='${verified.branch}' AND userRole='FACULTY'`;
        if (verified.role.toLowerCase() === "admin") {
            query = `SELECT * FROM users WHERE branch ='${verified.branch}' AND userRole='HOD'`;
        }
        req.db.query(query, (err, results) => {
            res.status(200).send(results)
        })
    } else {
        res.status(401).json({ message: "Session expired" })
    }
})
module.exports = router