import { Component, OnInit } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser'

//import * as Stripe from 'https://js.stripe.com/v3';

@Component({
    selector: 'app-buy',
    templateUrl: './buy.component.html',
    styleUrls: ['./buy.component.scss'],

})
export class BuyComponent implements OnInit {

    stripeScript: any = '';
    stripeScriptProd: any = '';
    stripeScriptTest: any = '';
    testMode: any = true;
    yearly: Boolean = false;

    constructor(private sanitizer: DomSanitizer) { }

    ngOnInit() {

        this.stripeScriptProd = this.sanitizer.bypassSecurityTrustHtml(``);

        this.stripeScriptTest = this.sanitizer.bypassSecurityTrustHtml(`
            <script>
                var stripe = Stripe('pk_test_JxsCHvXtYWoMblng27w9oah5');

                var checkoutButtonMonthlyTest = document.getElementById('checkout-button-plan_FGMKQF2uISVdiV');
                checkoutButtonMonthlyTest.addEventListener('click', function () {
                    // When the customer clicks on the button, redirect
                    // them to Checkout.
                    stripe.redirectToCheckout({
                    items: [{plan: 'plan_FGMKQF2uISVdiV', quantity: 1}],

                    // Do not rely on the redirect to the successUrl for fulfilling
                    // purchases, customers may not always reach the success_url after
                    // a successful payment.
                    // Instead use one of the strategies described in
                    // https://stripe.com/docs/payments/checkout/fulfillment
                    successUrl: 'https://muvie-video.herokuapp.com/success',
                    cancelUrl: 'https://muvie-video.herokuapp.com/canceled',
                    })
                    .then(function (result) {
                    if (result.error) {
                        // If redirectToCheckout fails due to a browser or network
                        // error, display the localized error message to your customer.
                        var displayError = document.getElementById('error-message');
                        displayError.textContent = result.error.message;
                    }
                    });
                });

                var checkoutButtonYearlyTest = document.getElementById('checkout-button-plan_FGNdA98XXMUJv6');
                checkoutButtonYearlyTest.addEventListener('click', function () {
                    // When the customer clicks on the button, redirect
                    // them to Checkout.
                    stripe.redirectToCheckout({
                    items: [{plan: 'plan_FGNdA98XXMUJv6', quantity: 1}],

                    // Do not rely on the redirect to the successUrl for fulfilling
                    // purchases, customers may not always reach the success_url after
                    // a successful payment.
                    // Instead use one of the strategies described in
                    // https://stripe.com/docs/payments/checkout/fulfillment
                    successUrl: 'https://muvie-video.herokuapp.com/success',
                    cancelUrl: 'https://muvie-video.herokuapp.com/canceled',
                    })
                    .then(function (result) {
                    if (result.error) {
                        // If redirectToCheckout fails due to a browser or network
                        // error, display the localized error message to your customer.
                        var displayError = document.getElementById('error-message');
                        displayError.textContent = result.error.message;
                    }
                    });
                });
            </script>`);

        if (this.testMode) {
            this.stripeScript = this.stripeScriptTest;
        } else {
            this.stripeScript = this.stripeScriptProd;
        }

        const fragment = document.createRange().createContextualFragment(this.stripeScript);
        document.body.appendChild(fragment);
    }

    onChange(event): any {
        console.log('onChange', event.checked);
        this.yearly = event.checked;
    }

    //var stripe = Stripe('pk_live_ZPeiS3btumpDQ4L0NgtsynHI');

    //let checkoutButton = document.getElementById('checkout-button-plan_FGEssJMOVRMg55');
    //checkoutButton.addEventListener('click', function () {

    //console.log('CLICK');

    // When the customer clicks on the button, redirect
    // them to Checkout.
    /*
    stripe.redirectToCheckout({
        items: [{ plan: 'plan_FGEssJMOVRMg55', quantity: 1 }],

        // Do not rely on the redirect to the successUrl for fulfilling
        // purchases, customers may not always reach the success_url after
        // a successful payment.
        // Instead use one of the strategies described in
        // https://stripe.com/docs/payments/checkout/fulfillment
        successUrl: 'https://muvie-video.herokuapp.com/success',
        cancelUrl: 'https://muvie-video.herokuapp.com/canceled',
    })
        .then(function (result) {
            if (result.error) {
                // If `redirectToCheckout` fails due to a browser or network
                // error, display the localized error message to your customer.
                var displayError = document.getElementById('error-message');
                displayError.textContent = result.error.message;
            }
        });
    */
    //});


}
