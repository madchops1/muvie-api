'strict'

const { ChangeDetectorRef } = require('@angular/core');
// ENV VARS
const dotenv = require('dotenv');
dotenv.config();

// Stripe
const stripe = require('stripe')(process.env.STRIPE_KEY);

let handleChargeSucceeded = (charge) => {

    console.log('TEST ALPHA charge', charge);

    return new Promise((resolve, reject) => {

        // the charge.description contains the products and qtys
        let description = charge.description;
        console.log('TEST BETA description', description);

        /**
         * [1x] [product-name] [1x] [product-name]
         */
        let descriptionArray = description.split(" ");

        /**
         * [1x]
         * [product-name]
         * [1x]
         * [product-name]
         */
        let setArray = [];
        for (let i = 0; i < descriptionArray.length; i++) {
            if (i % 2) {
                setArray.push(descriptionArray[i].replace('/-/g', ' '));
            }
        }

        console.log('TEST CHARLIE setArray', setArray);

        // get the products from the database

        // then send an email with the files

    });
}

let getSubscriptions = (req, res) => {
    return new Promise(async (resolve, reject) => {
        let email = req.body.email;
        let subscriptions = [];
        for await (const customer of stripe.customers.list({ limit: 100, email: email })) {
            if (customer.subscriptions.data.length) {
                //console.log(customer);
                subscriptions.push(customer.subscriptions);
            }
        }
        resolve(subscriptions);
    });
}

module.exports = {
    handleChargeSucceeded: handleChargeSucceeded,
    getSubscriptions: getSubscriptions
};