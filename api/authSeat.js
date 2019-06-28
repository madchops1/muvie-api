/**
 * authSeat.js is the function for authSeat
 * These api functions are called by the electon app
 */

'use strict';
const axios = require('axios');
let async = require("async");


let checkKey = function (key, res) {
    return new Promise(async function (resolve, reject) {
        console.log('checking key');

        //res.status(200).json();
        //resolve();
        //return;

        //resolve("{ plan: 1 }");
        //return;
        try {
            await axios.get('https://visualzkeystore.s3.us-east-2.amazonaws.com/' + key + '.json')
                .then(function (response) {
                    console.log('key', response.data);
                    //res.status(200).json();
                    resolve(response.data);
                    return;

                    // handle success
                    //resolve(response.data);
                    //return;


                    //console.log(response.data);
                    //res.write(response.data);
                    // res.end();
                    //resolve(JSON.stringify(response.data));
                    //res.status(200).json();
                    //res.end();

                })
                .catch(function (error) {
                    reject(error.status);
                    return false;
                    //throw error.status;
                    // handle error
                    //console.log(error);
                })
                .finally(function () {
                    // always executed

                });

        } catch (err) {

            reject(err);
            return false;

        }
    });
}


let AuthSeat = function (req, res) {
    return new Promise(async function (resolve, reject) {
        console.log('req body', req.fields);
        let key = req.fields.mid;
        //let fileContents;
        try {
            //res.status(200).json();
            //resolve();
            //return;

            checkKey(key, res);
            resolve();
            return;
            //let r = await checkKey(key);
            //resolve(r);
            //checkKey(key).then(function (r) {
            //    console.log('checkKey res', r);
            //    fileContents = r;
            //    resolve(fileContents);
            //res.status(200).json();
            //})

        } catch (err) {

            reject(err);
            return false;

        }
    });
}

module.exports.AuthSeat = AuthSeat;
