// config/upload.js

const multer = require('multer');
const multerS3 = require('multer-s3');
const s3Client = require('./awsS3');

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 'jain-dharamshaala',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname);
      console.log("uploaded file----------")
    }
  })
});

module.exports = upload;
