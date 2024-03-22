
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.SNS_KEY,
  secretAccessKey: process.env.SNS_SECRET,
  region: 'us-east-1'
});

module.exports = AWS;