const upload = require('./config').upload;
const verifyToken = require('./config').verifyToken;
const verifyRole = require('./config').verifyRole;
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post("/allot", function (req, res) {
    const verified = verifyToken(req.headers.authorization)
    const subject = req.body.subject;
    const teacher = req.body.teacher;
    const sem = req.body.sem;
    const branch = req.body.branch;
    if (verified) {
            const query = `REPLACE INTO subjectalloted (sub,teacher,sem,branch) VALUES ` +
                `(${req.body.subject},${req.body.teacher},${req.body.sem},${req.body.branch})`
            req.body.query(query, function (err, results) {
                if(error){
                    res.status(406).json({message:'Subject already alloted'});
                }else{
                    res.status(200).json({message:"subject alloted"});
                }
            })
        }else {
        res.status(401).json({ message: 'Session Expired' })
    }
})
router.post("/delete", function (req, res) {
    const verified = verifyToken(req.headers.authorization)
    const subject = req.body.subject;
    const teacher = req.body.teacher;
    const sem = req.body.sem;
    const branch = req.body.branch;
    if (verified) {
        if (verifyRole(verified.role)) {
            const query = `DELETE FROM WHERE subject =(${req.body.subject} AND teacher = ${req.body.teacher}`+
            `AND sem = ${req.body.sem} AND branch = ${req.body.branch})`
            req.body.query(query, function (err, results) {
                if(error){
                    res.status(406).json({message:'Subject not alloted'});
                }else{
                    res.status(200).json({message:"Deleted allotment"});
                }
            })
        } else {
            res.status(400).json({ message: 'Not allowed' });
        }
    } else {
        res.status(401).json({ message: 'Session Expired' })
    }
})

router.get("/",function(req,res){
    const verified = verifyToken(req.headers.authorization);
    if(verified){
        let query;
        if(verified.role.toLowerCase() === 'faculty'){
           query =  `SELECT * FROM subjectalloted WHERE branch ='${verified.branch}' and teacher = '${verified.userid}'`
        }else{
            query = `SELECT * FROM subjectalloted WHERE branch ='${verified.branch}'`
        }
        req.db.query(query,(err,results)=>{
            res.status(200).send(results)
        })
    }else{
        res.status(401).json({message:"Session expired"})
    }
})

module.exports = router