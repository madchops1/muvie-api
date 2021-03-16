'use strict';

let UploadFile = (req) => {
    
    return new Promise(function (resolve, reject) {
        const aws = require('aws-sdk');
        const S3_BUCKET = process.env.S3_BUCKET_VISUALZ;
        const S3_DIR = process.env.S3_DIR_VISUALZ;
        aws.config.region = 'us-east-2';

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

let UploadBase64 = (req) => {
    

    return new Promise(function (resolve, reject) {
        const aws = require('aws-sdk');
        const S3_BUCKET = process.env.S3_BUCKET_VISUALZ;
        const S3_DIR = process.env.S3_DIR_VISUALZ;
        aws.config.region = 'us-east-2';
        
        let s3 = new aws.S3( { params: { Bucket: S3_BUCKET }} );
        const base64 = req.body['base64'];
        const mid = req.body['mid'];
        const setName = req.body['set'].replace(' ', '').toLowerCase();
        
        let buf = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""),'base64')
        let key = S3_DIR + '/' + mid + '/' + setName  + '/fancam.jpg';
        const s3Params = {
            Key: key,
            Body: buf,
            ContentType: 'image/jpeg',
            ACL: 'public-read'
        };
        s3.putObject(s3Params, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            const returnData = {
                data: data,
                url: `https://${S3_BUCKET}.s3.us-east-2.amazonaws.com/${key}`
            };

            resolve(returnData);
        });
    });
} 

module.exports.uploadFile = UploadFile;
module.exports.uploadBase64 = UploadBase64;