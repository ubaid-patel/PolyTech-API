const upload = require('./config').upload;
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('./config').verifyToken;

router.post("/upload", upload.single("file"), function (req, res) {
    const verified = verifyToken(req.headers.authorization);
    let query = "REPLACE INTO results (reg,exam,marks) VALUES ";
    const data = req.body.data;
    const subject = req.body.subject;
    const teacher = req.body.teacher;
    if (verified) {
        if (!verified.role === 'HOD') {
            return res.status(404).json({ message: "Not Allowed" })
        }
        const file = xlsx.readFile(req.file.path);
        const sheets = file.SheetNames
        for (let i = 0; i < sheets.length; i++) {
            const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]])
            temp.forEach((res) => {
                const marks = [reg, ...res];
                query += `(${res.reg},${req.body.sem},${req.body.subject},${JSON.stringify(marks)}),`
            })
        }
        query = query.slice(0, -1)
        query += ';';
        req.db.query(query, (err, result) => {
            res.status(200).json({ message: "Data Uploaded" })
        })
    } else {
        res.status(401).json({ message: "Session expired" })
    }
})
router.get("/:sem", function (req, res) {
    const verified = verifyToken(req.headers.authorization);
    if (verified) {
        if (verified.role.toUpperCase() === "STUDENT") {
            const query = `SELECT * FROM results WHERE reg ='${verified.userid}'`
        } else {
            const query = `SELECT * FROM results WHERE  sem ='${req.body.sem} ` +
                `INNER JOIN students on results.sem = students.sem'`
        }
        req.db.query(query,(err,results)=>{
            res.status(200).send(results)
        })
    } else {
        res.status(401).json({ message: "Session expired" })
    }
})
module.exports = router