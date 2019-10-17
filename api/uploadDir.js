'use strict';

let UploadDir = function (req) {
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
        
        aws.headBucket({Bucket:bucketFolder},function(err,data){
            if(err){
                s3.createBucket({Bucket:bucketFolder},function(err,data){
                    if(err){ throw err; }
                    console.log("Bucket created");
                });
             } else {
                 console.log("Bucket exists and we have access");
             }
        });
    });
}

module.exports.uploadFile = UploadFile;
