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

let addWatermark = function (videoFile) {
    return new Promise(function (resolve, reject) {
        let outputFile = 'watermark_' + videoFile;
        ffmpeg()
            .input(videoFile)
            .input('watermark.png')
            .videoCodec('libx264')
            .outputOptions('-pix_fmt yuv420p')
            .complexFilter([
                "[0:v]scale=640:-1[bg];[bg][1:v]overlay=W-w-10:H-h-10"
            ])
            .on('error', function (err) {
                console.log(err);
                reject(err);
            })
            .on('end', function () {
                console.log('resolve with watermark', outputFile);
                resolve(outputFile);
            })
            .save('src/assets/' + outputFile);
    });
}

let addAudio = function (videoFile, audioFile) {
    return new Promise(function (resolve, reject) {
        let outputFile = 'audio_final_' + videoFile;
        ffmpeg()
            .input(videoFile)
            .input(audioFile)
            //.complexFilter([
            //    '[1:0] adelay=2728000|2728000 [delayed]',
            //    '[0:1][delayed] amix=inputs=2',
            //])
            //.outputOption('-map 0:0')
            //.audioCodec('aac')
            //.videoCodec('copy')
            .on('error', function (err) {
                console.log(err);
                reject(err);
            })
            .on('end', function () {
                console.log('resolve with audio', outputFile);
                resolve(outputFile);
            })
            .save(outputFile);
    });
}

let padDigits = function (number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

let probeDuration = function (file) {
    return new Promise(function (resolve, reject) {
        ffmpeg.ffprobe(file, function (err, metadata) {
            if (err) {
                reject(err);
            }
            //console.log(metadata); // all metadata
            //audioDuration = metadata.format.duration;
            console.log(metadata.format.duration);
            resolve(metadata.format.duration);
        });

    });
}

let getSegment = function (file, start, end, i) {
    return new Promise(async function (resolve, reject) {
        let filename = path.basename(file);
        start = padDigits(start, 2);
        end = padDigits(end, 2);
        ffmpeg(file)
            .noAudio()
            .setStartTime('00:00:' + start + '')
            .setDuration('05')
            //.setDuration('00:00:' + end + '')
            .output('./' + filename + '_' + i + '.mp4')
            .on('end', async function (err) {
                if (!err) {
                    console.log('conversion Done');
                    try {
                        let s3Name = await copySegment('./' + filename + '_' + i + '.mp4', filename + '_' + i + '.mp4');
                        resolve(s3Name);
                    } catch (err) {
                        reject(err);
                    }
                }
            })
            .on('error', function (err) {
                console.log('error: ', +err);
                reject(err);
            }).run();
    });
}

let copySegment = function (file, dest) {
    return new Promise(async function (resolve, reject) {
        fs.readFile(file, function (err, data) {
            if (err) { reject(err); }

            var base64data = new Buffer(data, 'binary');

            var s3 = new aws.S3();
            s3.putObject({
                Bucket: S3_BUCKET,
                Key: dest,
                Body: base64data,
                ACL: 'public-read'
            }, function (err, resp) {
                if (err) { reject(err); }

                //console.log(this);
                console.log('Successfully uploaded package.');
                resolve('https://muvievideos.s3.us-east-2.amazonaws.com/' + dest);
            });

        });
    });
}

let splitClip = function (file) {
    return new Promise(async function (resolve, reject) {

        let segmentLength = 5;
        let response = {
            clipDuration: 0,
            clipNum: 0,
            clips: []
        }
        try {
            let clipDuration = await probeDuration(file);
            let clipNum = Math.floor(clipDuration / segmentLength);
            if (clipNum == 0) { throw ('clip too short'); }
            let start = parseInt(0);
            let end = segmentLength;
            for (let i = 0; i < clipNum; i++) {
                console.log('segment', start, end);
                response.clips[i] = await getSegment(file, start, end, i);
                start += segmentLength;
                end += segmentLength;
            }

            response.clipDuration = clipDuration;
            response.clipNum = clipNum;
            resolve(response);

        } catch (err) {
            reject(err);
        }
    });
}

let mergeVideo = function (clips, videoDuration, audioDuration) {
    return new Promise(async function (resolve, reject) {
        let outputName;
        let videoConcat = videoStitch.concat;
        let videos = [];
        let mergedDuration = parseInt(0);
        //let mergedffmpeg = ffmpeg();

        /*
        clips.forEach(function (clip) {
            clip.clips.forEach(function (clip) {
                //mergedVideo = mergedVideo.addInput(clip);
                outputName = 'merged_' + path.basename(clip);
                videos.push({ "fileName": clip });
            });
        });
        */



        let i = 0;
        let j = 0;
        //for(let i=0;i<clips.length;i++) {
        while (i < clips.length) {

            let exists = false;

            if (j < clips[i].clips.length) {
                outputName = 'merged_' + path.basename(clips[i].clips[j]);
                videos.push({ "fileName": clips[i].clips[j] });
                exists = true;
            } else {
                videos.push({ "fileName": clips[i].clips[clips[i].clips.length - 1] });
            }
            mergedDuration += parseInt(5);
            if (mergedDuration > audioDuration) { break; }

            i++;

            if (i == clips.length && exists) {
                i = 0;
                j++;
            }

            //for(let j=0;j<clips[i].clips.length;null) {
            //    outputName = 'merged_' + path.basename(clips[i].clips[j]);
            //    videos.push({ "fileName": clips[i].clips[j] });
            //}
        }


        console.log('Videos', videos);

        videoConcat({
            silent: false, // optional. if set to false, gives detailed output on console
            overwrite: true // optional. by default, if file already exists, ffmpeg will ask for overwriting in console and that pause the process. if set to true, it will force overwriting. if set to false it will prevent overwriting.
        })
            .clips(videos)
            .output(outputName) //optional absolute file name for output file
            .concat()
            .then((outputFileName) => {
                resolve(outputFileName);
            });

    });
}

let breakClips = function (req) {
    return new Promise(async function (resolve, reject) {
        //console.log('req body', req.fields);
        //length of song and videos
        //let ffmpeg = require('fluent-ffmpeg');
        let audioDuration = 0;
        let audioFileName = req.fields.audio;
        let totalVideoDuration = 0;
        let clips = [];
        //let mergedVideoName;
        //let withAudioVideoName;
        //let withWatermark;

        try {

            // Get Audio Duration
            audioDuration = await probeDuration(req.fields.audio);

            // Get Video Duration and split clips
            for (let i = 0; i < req.fields.clips.length; i++) {
                totalVideoDuration += await probeDuration(req.fields.clips[i]);
                clips[i] = await splitClip(req.fields.clips[i]);
                //videoDuration = videoDur + parseInt(videoDur);
            }


            let response = {
                audioDuration: audioDuration,
                videoDuration: totalVideoDuration,
                audioFileName: audioFileName,
                clips: clips
            }
            resolve(response);
        } catch (err) {
            reject(err);
        }



        //concat.Concat(clips);
    });
}

let Make = function (req) {
    return new Promise(function (resolve, reject) {
        console.log('req body', req.fields);
        //length of song and videos
        //let ffmpeg = require('fluent-ffmpeg');
        //let audioDuration = 0;
        //let audioFileName = req.fields.audio;
        //let totalVideoDuration = 0;
        //let clips = [];
        let mergedVideoName;
        let withAudioVideoName;
        let withWatermark;
        let remoteWithWatermark;
        let brokenClips;

        try {

            async.series([
                function (callback) {
                    breakClips(req).then(function (res) {
                        brokenClips = res;
                        callback(null, 'broken clips');
                    })
                },
                function (callback) {
                    mergeVideo(brokenClips.clips, brokenClips.videoDuration, brokenClips.audioDuration).then(function (res) {
                        mergedVideoName = res;
                        callback(null, 'merged video');
                    });
                },
                function (callback) {
                    addAudio(mergedVideoName, req.fields.audio).then(function (res) {
                        withAudioVideoName = res;
                        callback(null, 'with audio');
                    });
                },
                function (callback) {
                    addWatermark(withAudioVideoName).then(function (res) {
                        withWatermark = res;
                        callback(null, 'with watermark');
                    });
                },
                function (callback) {
                    copySegment('src/assets/' + withWatermark, withWatermark).then(function (res) {
                        remoteWithWatermark = res;
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
                    //mergedVideoName = await mergeVideo(clips, totalVideoDuration, audioDuration);
                    //withAudioVideoName = await addAudio(mergedVideoName, req.fields.audio);
                    // withWatermark = await addWatermark(withAudioVideoName);

                    let response = {
                        video: brokenClips,
                        mergedVideoName: mergedVideoName,
                        withAudioVideoName: withAudioVideoName,
                        withWatermark: '/assets/' + withWatermark,
                        remoteWithWatermark: remoteWithWatermark
                    }
                    resolve(response);
                    return;
                });




        } catch (err) {
            reject(err);
            return false;
        }



        //concat.Concat(clips);
    });
}

module.exports.Make = Make;
