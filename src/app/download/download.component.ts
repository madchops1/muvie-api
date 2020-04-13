import { Component, OnInit } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss']
})

export class DownloadComponent implements OnInit {

    stripeScript: any = '';
    stripeScriptProd: any = '';
    stripeScriptTest: any = '';
    testMode: Boolean = true;
    yearly: Boolean = false;

    constructor(private sanitizer: DomSanitizer) { }

    ngOnInit() {

        this.stripeScriptProd = this.sanitizer.bypassSecurityTrustHtml(`
        <script>
                var stripe = Stripe('pk_live_ZPeiS3btumpDQ4L0NgtsynHI');

                var checkoutButtonEducationalProd = document.getElementById('checkout-button-plan_H5V1qwEOIY0IXK');
                checkoutButtonEducationalProd.addEventListener('click', function () {
                    // When the customer clicks on the button, redirect
                    // them to Checkout.
                    stripe.redirectToCheckout({
                    items: [{plan: 'plan_H5V1qwEOIY0IXK', quantity: 1}],

                    // Do not rely on the redirect to the successUrl for fulfilling
                    // purchases, customers may not always reach the success_url after
                    // a successful payment.
                    // Instead use one of the strategies described in
                    // https://stripe.com/docs/payments/checkout/fulfillment
                    successUrl: 'https://www.visualzstudio.com/success',
                    cancelUrl: 'https://www.visualzstudio.com/canceled',
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

                var checkoutButtonCommercialProd = document.getElementById('checkout-button-plan_H5V8KwiRi8BxEK');
                checkoutButtonCommercialProd.addEventListener('click', function () {
                    // When the customer clicks on the button, redirect
                    // them to Checkout.
                    stripe.redirectToCheckout({
                    items: [{plan: 'plan_H5V8KwiRi8BxEK', quantity: 1}],

                    // Do not rely on the redirect to the successUrl for fulfilling
                    // purchases, customers may not always reach the success_url after
                    // a successful payment.
                    // Instead use one of the strategies described in
                    // https://stripe.com/docs/payments/checkout/fulfillment
                    successUrl: 'https://www.visualzstudio.com/success',
                    cancelUrl: 'https://www.visualzstudio.com/canceled',
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
            </script>
        `);

        this.stripeScriptTest = this.sanitizer.bypassSecurityTrustHtml(`
            <script>
                var stripe = Stripe('pk_test_JxsCHvXtYWoMblng27w9oah5');

                var checkoutButtonEducationalTest = document.getElementById('checkout-button-plan_H5UfUDScLylpyD');
                checkoutButtonEducationalTest.addEventListener('click', function () {
                    // When the customer clicks on the button, redirect
                    // them to Checkout.
                    stripe.redirectToCheckout({
                    items: [{plan: 'plan_H5UfUDScLylpyD', quantity: 1}],

                    // Do not rely on the redirect to the successUrl for fulfilling
                    // purchases, customers may not always reach the success_url after
                    // a successful payment.
                    // Instead use one of the strategies described in
                    // https://stripe.com/docs/payments/checkout/fulfillment
                    successUrl: 'http://localhost:4200/success',
                    cancelUrl: 'http://localhost:4200/canceled',
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

                var checkoutButtonCommercialTest = document.getElementById('checkout-button-plan_H5UhS6ktwnPAfO');
                checkoutButtonCommercialTest.addEventListener('click', function () {
                    // When the customer clicks on the button, redirect
                    // them to Checkout.
                    stripe.redirectToCheckout({
                    items: [{plan: 'plan_H5UhS6ktwnPAfO', quantity: 1}],

                    // Do not rely on the redirect to the successUrl for fulfilling
                    // purchases, customers may not always reach the success_url after
                    // a successful payment.
                    // Instead use one of the strategies described in
                    // https://stripe.com/docs/payments/checkout/fulfillment
                    successUrl: 'http://localhost:4200/success',
                    cancelUrl: 'http://localhost:4200/canceled',
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

    isMacintosh(): any {
        return navigator.platform.indexOf('Mac') > -1
    }

    isWindows(): any {
        return navigator.platform.indexOf('Win') > -1
    }

    downloadMac(): any {
        console.log('DOWNLOAD MAC CLICKED');
        //https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail
        //this.$gaService.event('download_windows', 'download_page', 'Download Windows');

        //return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        //this.mid = mid;
        let params = 'msg=VISUALZ download for Mac from www.visualzstudio.com';
        xhr.open('POST', 'https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = xhr.responseText;
                    //resolve(response);
                    console.log('EMAIL EVENT RESPONSE: ', response);
                }
                else {
                    console.log('Error');
                    //reject('err');
                }
            }
        };
        xhr.send(params);
        //});

    }


    downloadWindows(): any {
        console.log('DOWNLOAD WINDOWS CLICKED');
        //https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail
        //this.$gaService.event('download_windows', 'download_page', 'Download Windows');

        //return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        //this.mid = mid;
        let params = 'msg=VISUALZ download for Windows from www.visualzstudio.com';
        xhr.open('POST', 'https://kzp2cqupt6.execute-api.us-east-2.amazonaws.com/default/visualzEventEmail', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = xhr.responseText;
                    //resolve(response);
                    console.log('EMAIL EVENT RESPONSE: ', response);
                }
                else {
                    console.log('Error');
                    //reject('err');
                }
            }
        };
        xhr.send(params);
        //});

    }

}
