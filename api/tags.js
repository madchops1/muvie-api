'strict'

const { ChangeDetectorRef } = require('@angular/core');

// ENV VARS
const dotenv = require('dotenv');
dotenv.config();



let getTags = (req, res) => {
    return new Promise(async (resolve, reject) => {

    });
}

module.exports = {
    getTags: getTags
};