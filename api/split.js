'strict'
let ffmpeg = require('fluent-ffmpeg');

let Split = function (clip) {
    return new Promise(function (resolve, reject) {
        ffmpeg(clip)
            .setStartTime('00:00:03')
            .setDuration('10')
            .output('./test.mp4')

            .on('end', function (err) {
                if (!err) {
                    console.log('conversion Done');
                    resolve(done);

                }

            })
            .on('error', function (err) {
                console.log('error: ', +err);
                reject(err);
            }).run();
    });
}

module.exports.Split = Split;