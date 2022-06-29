'use strict';
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const concat = require('./concat');
const fs = require('file-system');
const aws = require('aws-sdk');
let S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-east-2';
let videoStitch = require('video-stitch');
let async = require("async");
let sendFileToS3 = require('./sendFileToS3');

let convertMovFileToMp4 = (req) => {
    return new Promise(function (resolve, reject) {
        console.log('DELTA', req.body);

        let filePath = req.body['file-name'];
        let fileName = path.basename(filePath);
        let setName = req.body['set-name'];
        let mid = req.body['mid'];
        S3_BUCKET = req.body['bucket'];

        let outputFile = fileName.replace('.mov', '.mp4');

        console.log('ALPHA', filePath, fileName, setName, mid);
        ffmpeg(filePath)
            .inputFormat('mov')
            .withVideoCodec('libx264')
            .toFormat('mp4')
            .save('src/assets/' + outputFile)
            .on('error', function (err) {
                console.log(err);
                reject(err);
            })
            .on('end', function () {
                console.log('resolve conversion', outputFile);
                resolve(outputFile);
            });

        console.log('BETA', outputFile);

    });
}


let MovToMp4 = (req) => {
    return new Promise(function (resolve, reject) {

        console.log('request', req.body);
        //return false;
        let filePath;
        //let fileName;

        try {

            async.series([
                function (callback) {
                    convertMovFileToMp4(req).then(function (res) {
                        filePath = res;
                        callback(null, 'success');
                    });
                },
                function (callback) {
                    console.log('ECHO', filePath);
                    let dest;
                    if (req.body.bucket == 'visualz-1') {
                        dest = 'cloud-sets/' + req.body["mid"] + "/" + req.body["set-name"] + "/" + filePath;
                    } else {
                        dest = filePath
                    }
                    sendFileToS3.sendFileToS3('src/assets/' + filePath, dest).then(function (res) {
                        filePath = res;
                        callback(null, 'final copy to s3');
                    }, function (err) {
                        console.log(err);
                        return false;
                    });
                    //callback(null, '');
                }
            ],
                // optional callback
                function (err, results) {
                    // results is now equal to ['one', 'two']
                    if (err) {
                        reject(err);
                        return false;
                    }

                    let response = {
                        fileName: filePath
                    }
                    resolve(response);
                    return;
                });

        } catch (err) {
            reject(err);
            return false;
        }

    });
}

module.exports.MovToMp4 = MovToMp4;
