const express = require('express');
const router = express.Router();
const s3Client = require('../config/awsS3');
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { PassThrough } = require('stream');
const archiver = require('archiver');


router.get('/:filename', async (req, res) => {
    const { filename } = req.params;
    const params = {
        Bucket: 'jain-dharamshaala',
        Key: filename,
    };
    console.log("filename", filename);

    try {
        const data = await s3Client.send(new GetObjectCommand(params));
        console.log("data received !!!");

        res.set('Content-Type', data.ContentType);
        //res.send(data.Body);
        data.Body.pipe(res);
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving image');
    }
});

// UNTESTED below api to download multiple files.
// router.get('/', async (req, res) => {
//     const filenames = req.query.filenames.split(',');
//     const archive = archiver('zip');

//     res.attachment('files.zip');

//     archive.pipe(res);

//     for (const filename of filenames) {
//         const params = {
//             Bucket: 'jain-dharamshaala',
//             Key: filename,
//         };

//         try {
//             const data = await s3Client.send(new GetObjectCommand(params));
//             const fileStream = new PassThrough();
//             fileStream.end(data.Body);
//             archive.append(fileStream, { name: filename });
//         } catch (err) {
//             console.error(err);
//             res.status(500).send('Error retrieving image');
//             return;
//         }
//     }

//     archive.finalize();
// });





module.exports = router;