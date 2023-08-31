 
//Multer configuration
const multer = require('multer');
const jwt = require("jsonwebtoken");
// Storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Where to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Set a unique filename
  }
});

// Create a Multer instance with the storage configuration
const upload = multer({ storage: storage });

function verifyToken(token) {
  try {
    jwt.verify(token, process.env.SECRET_KEY)
    return (jwt.decode(token))
  } catch (err) {
    return (false)
  }
}

function verifyRole(){

}

function verifyOTP(db, otp, email) {
  return (new Promise((resolve, reject) => {
    const query = `SELECT * FROM otps WHERE email='${email}'`;
    db.query(query, (err, results) => {
      if (results.length > 0) {
        if (results[0].otp === otp) {
          resolve({ isValid: true })
        } else {
          resolve({ isValid: false, message: "Incorrect OTP" })
        }
      } else {
        resolve({ isValid: false, message: "OTP not generated" })
      }
    })
  }))
}

function verifyFaculty(db,userid,subject,sem,branch){
  return(new Promise((resolve,reject)=>{
    const query = `SELECT * FROM subjectalloted WHERE sub= '${subject}' AND sem=${sem} AND branch = '${branch}'`;
    db.query(query,(err,results)=>{
      if(results){
        resolve(results[0].teacher === userid)
      }else{
          resolve(false)
      }
  });
  }))
}

module.exports = {upload,verifyToken,verifyRole,verifyOTP,verifyFaculty}