import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { loadStripe } from '@stripe/stripe-js';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

    stripeScriptProd: any;
    stripeScriptTest: any;
    stripeScript: any;
    testMode: any = false;
    stripePromise: any;
    email: any;

    constructor(
        private sanitizer: DomSanitizer,
        public auth: AuthService,
        public cart: CartService,
        private _snackBar: MatSnackBar) { }

    ngOnInit() {
        this.auth.userProfile$.subscribe((profile) => {
            this.email = profile.email;
        });

        this.cart.calcTotal();

        console.log(this.cart);

        this.stripePromise = loadStripe('pk_live_ZPeiS3btumpDQ4L0NgtsynHI');
    }

    formatLineItems() {
        let products = this.cart.getCart();
        let lineItems = [];
        for (let i = 0; i < products.length; i++) {
            let lineItem = { price: products[i].stripeId, quantity: 1 };
            lineItems.push(lineItem);
        }
        return lineItems;
    }

    checkout = async () => {
        const stripe = await this.stripePromise;
        const { error } = await stripe.redirectToCheckout({
            mode: 'payment',
            lineItems: this.formatLineItems(),
            successUrl: `${window.location.origin}/marketplace-success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/cart`,
            customerEmail: `${this.email}`
        });
        if (error) {
            console.log('error', error);
        }
    }

    guestCheckout = async () => {
        const stripe = await this.stripePromise;
        const { error } = await stripe.redirectToCheckout({
            mode: 'payment',
            lineItems: this.formatLineItems(),
            successUrl: `${window.location.origin}/marketplace-success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/cart`,
        });
        if (error) {
            console.log('error', error);
        }
    }
}
