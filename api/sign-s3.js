'use strict';


//app.get('/sign-s3', (req, res) => {
let SignS3 = function (req) {
    const aws = require('aws-sdk');
    const S3_BUCKET = process.env.S3_BUCKET;
    aws.config.region = 'us-east-2';

    return new Promise(function (resolve, reject) {
        const s3 = new aws.S3();
        const fileName = req.query['file-name'];
        const fileType = req.query['file-type'];
        const s3Params = {
            Bucket: S3_BUCKET,
            Key: fileName,
            Expires: 60,
            ContentType: fileType,
            ACL: 'public-read'
        };

        s3.getSignedUrl('putObject', s3Params, (err, data) => {
            if (err) {
                console.log(err);
                //return res.end();
                reject(err);
            }
            const returnData = {
                signedRequest: data,
                url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
            };

            resolve(returnData);

        });
    });
}

module.exports.signS3 = SignS3;
