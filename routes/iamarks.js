const upload = require('./config').upload;
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const xlsx = require('xlsx');
const verifyToken = require("./config").verifyToken;
const verifyFaculty = require("./config").verifyFaculty;


router.post("/upload", upload.single("file"), async function (req, res) {
    const verified = verifyToken(req.headers.authorization);
    const faculty = await verifyFaculty(req.db, verified.userid, subject, req.body.sem, req.body.branch);
    let query = "REPLACE INTO iamarks (student,sem,subject,marks) VALUES ";
    
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
                    query += `(${obj[0]},${req.body.sem},${req.body.subject},${JSON.stringify(marks)}),`;
                })
            }
            query = query.slice(0,-1)
            query +=';';
            req.db.query(query, (err, result) => {
                res.status(200).json({ message: "Data Uploaded" })
            })
        } else {
            res.status(401).json({ message: "Session expired" })
        }
    }else{
        res.status(401).json({ message: "Not Allowed" })
    }})

router.get("/", function (req, res) {
    const verified = verifyToken(req.headers.authorization);
    if (verified) {
        if (verified.role.toUpperCase() === "STUDENT") {
            const query = `SELECT * FROM iamarks WHERE reg ='${verified.userid}' and subject ='${req.body.subject}'`
        } else {
            const query = `SELECT * FROM iamarks WHERE  subject ='${req.body.subject} ` +
                `INNER JOIN students on iamarks.sem = students.sem'`
        }
    } else {
        res.status(401).json({ message: "Session expired" })
    }
})
module.exports = router