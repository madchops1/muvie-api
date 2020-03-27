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

let convertGifFileToMp4 = (req) => {
    return new Promise(function (resolve, reject) {
        console.log('DELTA', req.body);

        let filePath = req.body['file-name'];
        let fileName = path.basename(filePath);
        let setName = req.body['set-name'];
        let mid = req.body['mid'];
        S3_BUCKET = req.body['bucket'];

        let outputFile = fileName.replace('.gif', '.mp4');

        console.log('ALPHA', filePath, fileName, setName, mid);
        ffmpeg(filePath)
            .inputFormat('gif')
            .inputOptions(['-f lavfi', '-i color=FFFFFF'])
            .complexFilter(["[0][1]scale2ref[bg][gif]", "[bg]setsar=1[bg]", "[bg][gif]overlay=shortest=1[o]", "[o]scale=trunc(iw/2)*2:trunc(ih/2)*2"])
            .outputOptions(['-pix_fmt yuv420p', '-movflags frag_keyframe+empty_moov', '-movflags +faststart', '-crf 20', '-b:v 500k'])
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

let sendMp4ToS3 = (file, dest) => {
    return new Promise(async function (resolve, reject) {
        fs.readFile(file, (err, data) => {
            if (err) { reject(err); }

            let base64data = new Buffer(data, 'binary');
            let s3 = new aws.S3();
            //S3_BUCKET = 'muvievideos';
            let s3Object = {
                Bucket: S3_BUCKET,
                Key: dest,
                Body: base64data,
                ACL: 'public-read'
            }

            console.log('FOXTROT', s3Object);

            s3.putObject(s3Object, function (err, resp) {
                if (err) { reject(err); }

                //console.log(this);
                console.log('Successfully uploaded package.');
                resolve('https://' + S3_BUCKET + '.s3.us-east-2.amazonaws.com/' + dest);
            });

        });
    });
}

let GifToMp4 = (req) => {
    return new Promise(function (resolve, reject) {

        console.log('request', req.body);
        //return false;
        let filePath;
        //let fileName;

        try {

            async.series([
                function (callback) {
                    convertGifFileToMp4(req).then(function (res) {
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
                    sendMp4ToS3('src/assets/' + filePath, dest).then(function (res) {
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

module.exports.GifToMp4 = GifToMp4;
