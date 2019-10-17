'use strict';

let UploadFile = function (req) {
    const aws = require('aws-sdk');
    const S3_BUCKET = process.env.S3_BUCKET_VISUALZ;
    const S3_DIR = process.env.S3_DIR_VISUALZ;
    aws.config.region = 'us-east-2';

    return new Promise(function (resolve, reject) {
        const s3 = new aws.S3();
        const fileName = req.query['file-name'];
        const fileType = req.query['file-type'];
        const mid = req.query['mid'];
        const setName = req.query['set-name'].replace(' ', '').toLowerCase();

        const s3Params = {
            Bucket: S3_BUCKET,
            Key: S3_DIR + '/' + mid + '/' + setName  + '/' + fileName,
            Expires: 60,
            ContentType: fileType,
            ACL: 'public-read'
        };

        s3.getSignedUrl('putObject', s3Params, (err, data) => {
            if (err) {
                console.log(err);
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

module.exports.uploadFile = UploadFile;
