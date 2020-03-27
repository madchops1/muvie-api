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
const extractFrame = require('ffmpeg-extract-frame');


let getFrame = (req) => {
    return new Promise(async function (resolve, reject) {
        //console.log('ALPHA', req.body);
        let filePath = req.body['file-name'];
        let fileName = path.basename(filePath);
        let setName = req.body['set-name'];
        let mid = req.body['mid'];
        let outputFile = 'frame_' + fileName.replace("mp4", "jpg");
        S3_BUCKET = req.body['bucket'];
        //console.log('BETA', filePath, fileName, setName, mid);
        try {
            await extractFrame({
                input: encodeURI(filePath),
                output: 'src/assets/' + outputFile,
                offset: 1000 // seek offset in milliseconds
            });
            console.log('BETA', outputFile);
            resolve(outputFile);
            return;
        }
        catch (err) {
            console.log('err', err);
            reject(err);
            return;
        }
        // ffmpeg(filePath)
        //     .inputFormat('gif')
        //     .inputOptions(['-f lavfi', '-i color=FFFFFF'])
        //     .complexFilter(["[0][1]scale2ref[bg][gif]", "[bg]setsar=1[bg]", "[bg][gif]overlay=shortest=1[o]", "[o]scale=trunc(iw/2)*2:trunc(ih/2)*2"])
        //     .outputOptions(['-pix_fmt yuv420p', '-movflags frag_keyframe+empty_moov', '-movflags +faststart', '-crf 20', '-b:v 500k'])
        //     .toFormat('mp4')
        //     .save('src/assets/' + outputFile)
        //     .on('error', function (err) {
        //         console.log(err);
        //         reject(err);
        //     })
        //     .on('end', function () {
        //         console.log('resolve conversion', outputFile);
        //         resolve(outputFile);
        //     });
        //
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

let ExtractFrame = (req) => {
    return new Promise(function (resolve, reject) {

        console.log('request', req.body);
        //return false;
        let filePath;
        //let fileName;

        try {

            async.series([
                // Get the frame from the file
                function (callback) {
                    getFrame(req).then(function (res) {
                        filePath = res;
                        callback(null, 'success');
                    });
                },
                // Copy the frame image to s3
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

module.exports.ExtractFrame = ExtractFrame;
