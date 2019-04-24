'use strict';
let videoStitch = require('video-stitch');

let Concat = function (clips) {
    return new Promise(function (resolve, reject) {
        let videoConcat = videoStitch.concat;
        console.log(__dirname);
        console.log(process.cwd);

        /*
        [
            {
              "fileName": "src/assets/videos/test.mp4"
            },
            {
              "fileName": "src/assets/videos/test2.mp4"
            }
          ]
        */

        videoConcat({
            silent: false, // optional. if set to false, gives detailed output on console
            overwrite: true // optional. by default, if file already exists, ffmpeg will ask for overwriting in console and that pause the process. if set to true, it will force overwriting. if set to false it will prevent overwriting.
        })
            .clips(clips)
            //.output("src/assets/ouputvideos/testoutput.mp4") //optional absolute file name for output file
            .concat()
            .then((outputFileName) => {
                resolve(outputFileName);
            });
    });
}
module.exports.Concat = Concat;
