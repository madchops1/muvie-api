'use strict';
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const concat = require('./concat');
const fs = require('file-system');
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-east-2';
let videoStitch = require('video-stitch');
let async = require("async");

let ConvertToMp4 = function (req) {
    return new Promise(function (resolve, reject) {

        console.log('request', req, req.fields);

        try {

            // async convert file from gif to mp4

            // or convert from mov, or avi to mp4

            // put it in the user's sets s3 bucket

            // return the file path


            async.series([
                function (callback) {

                    // detect file type
                    // breakClips(req).then(function (res) {
                    //     brokenClips = res;
                    //     callback(null, 'broken clips');
                    // })
                },
                function (callback) {
                    // mergeVideo(brokenClips.clips, brokenClips.videoDuration, brokenClips.audioDuration).then(function (res) {
                    //     mergedVideoName = res;
                    //     callback(null, 'merged video');
                    // });
                },
                function (callback) {
                    // copySegment('src/assets/' + withWatermark, withWatermark).then(function (res) {
                    //     remoteWithWatermark = res;
                    //     callback(null, 'final copy to s3');
                    // }, function (err) {
                    //     console.log(err);
                    //     return false;
                    // });
                }
            ],
                // optional callback
                function (err, results) {
                    // results is now equal to ['one', 'two']
                    if (err) {
                        reject(err);
                        return false;
                    }
                    //mergedVideoName = await mergeVideo(clips, totalVideoDuration, audioDuration);
                    //withAudioVideoName = await addAudio(mergedVideoName, req.fields.audio);
                    // withWatermark = await addWatermark(withAudioVideoName);

                    let response = {
                        fileName: ''
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

module.exports.ConvertToMp4 = ConvertToMp4;
