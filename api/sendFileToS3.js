module.exports.sendFileToS3 = (file, dest) => {

        return new Promise(async function (resolve, reject) {
            fs.readFile(file, (err, data) => {

                if (!data) {
                    reject('no data buffer');
                    return;
                }
                console.log('LOL', data);


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

};