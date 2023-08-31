var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require("./config").verifyToken;
const verifyOTP = require('./config').verifyOTP;

function generateJWT(payload, expiresIn) {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: expiresIn + "h" })
}

router.post('/activate', async function (req, res, next) {
  const otp = await verifyOTP(req.db, req.body.otp, req.body.email);
  const query = `SELECT * FROM users WHERE email = '${req.body.email}'`
  req.db.query(query, (err, results) => {
    if (results.length > 0) {
      if (results[0].userPassword === 'default') {
        if (otp.isValid) {
          if (req.body.password) {
            const passh = bcrypt.hashSync(req.body.password, 10);
            const updateQuery = `UPDATE users SET userPassword = '${passh.toString()}' WHERE email = '${req.body.email}'`;
            req.db.query(updateQuery, (err, results) => {
              console.log(results.changedRows)
            })
            const payload ={
              email: req.body.email,
              userid: results[0].userid, 
              branch: results[0].branch, 
              role: results[0].userRole
            }
            generateJWT(payload, 24)
            res.status(200).json({ message: "Account activated", token: token })
          } else {
            res.status(406).json({ message: "Password required" })
          }

        } else {
          res.status(401).json({ message: otp.message })
        }
      } else {
        res.status(400).json({ message: "Account already active" })
      }
    } else {
      res.status(404).json({ message: "Email not found please contact your branch HOD" })
    }
  })
});

router.post('/login', async function (req, res) {
  const query = `SELECT*from users WHERE email = '${req.body.email}'`
  req.db.query(query, (err, results) => {
    if (results.length > 0) {
      if (results[0].userPassword.toLowerCase() === 'default') {
        res.status(404).json({ message: "Account inactive" })
      } else {

        let valid = bcrypt.compareSync(req.body.password, results[0].userPassword)
        if (valid) {
          const payload ={
            email: req.body.email,
            userid: results[0].userid, 
            branch: results[0].branch, 
            role: results[0].userRole
          }
          const token = generateJWT(payload, 24)
          res.status(200).json({ token: token, message: "Login success" })
        } else {
          res.status(401).json({ message: "Incorrect Password" })
        }
      }
    } else {
      res.status(404).json({ message: "Email not found please contact your branch HOD" })
    }
  })
})

router.put('/forgot', async function (req, res) {
  const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;
  const otp = await verifyOTP(req.db, req.body.otp, req.body.email);
  req.db.query(query, (err, results) => {
    if (results.length === 0) {
      res.status(404).json({ message: "Email not found please contact your branch HOD" })
    } else {
      if (results[0].userPassword === 'default') {
        res.status(400).json({ message: "Account is inactive" })
      } else {

        if (otp.isValid) {
          if (req.body.password) {
            const passh = bcrypt.hashSync(req.body.password, 10);
            const updateQuery = `UPDATE users SET userPassword = '${passh.toString()}' WHERE email = '${req.body.email}'`;
            req.db.query(updateQuery, (err, results) => {
              console.log(results.changedRows)
            })
            res.status(200).json({ message: "Password reset success" })
          } else {
            res.status(406).json({ message: "Password required" })
          }
        } else {
          res.status(401).json({ message: otp.message })
        }
      }
    }
  })
})

router.put('/update', function (req, res) {
  if (!req.body.password) { return res.status(401).json({ message: "Please provide passsword" }) }
  if (!req.body.update) { return res.status(401).json({ message: "Please provide update option" }) }
  const verified = verifyToken(req.headers.authorization);
  const query = `SELECT*FROM users WHERE email = '${verified.email}'`
  if (verified) {
    req.db.query(query, (err, results) => {
      if (!results.length>0) { return res.status(401).json({ message: "Not Allowed" }) }
      if (bcrypt.compareSync(req.body.password, results[0].userPassword)) {
        let updateQuery;
        if (req.body.update.toLowerCase() === "email") {
          updateQuery = `UPDATE users SET email='${req.body.email}' WHERE email = '${verified.email}'`;
        } else {
          if (!req.body.newPassword) { return res.status(401).json({ message: "Please provide new passsword" }) }
          const passh = bcrypt.hashSync(req.body.password, 10);
          updateQuery = `UPDATE users SET userPassword = '${passh}' WHERE email = '${verified.email}'`;
        }
        req.db.query(updateQuery, (err, results) => {
          console.log("Updated rows:"+results.changedRows)
        })
        const payload ={
          email: req.body.email,
          userid: results[0].userid, 
          branch: results[0].branch, 
          role: results[0].userRole
        }
        const token = generateJWT(payload,24)
        res.status(200).json({ message: "Profile updated" ,token:token})
      } else {
        res.status(401).json({ message: "Incorrect Password" })
      }
    })
  } else {
    res.status(401).json({ message: "Session expired" })
  }
})


module.exports = router;
