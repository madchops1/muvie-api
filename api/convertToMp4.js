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

        // async convert file from gif to mp4

        // or convert from mov, or avi to mp4

        // put it in the user's sets s3 bucket

        // return the file path

    });
}

module.exports.ConvertToMp4 = ConvertToMp4;
