import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CartService } from '../services/cart.service';
import { MixpanelService } from '../services/mixpanel.service';

@Component({
    selector: 'app-market-place-success',
    templateUrl: './market-place-success.component.html',
    styleUrls: ['./market-place-success.component.scss']
})
export class MarketPlaceSuccessComponent implements OnInit {

    sets: any = [];
    stripeSession: string;
    cartCopy: [];

    constructor(private route: ActivatedRoute, private cart: CartService) {

        this.route.queryParams.subscribe(params => {
            this.stripeSession = params['session_id'];
            console.log('TEST ALPHA', this.stripeSession);
        });
    }

    ngOnInit() {

        // copy the cart
        this.cartCopy = JSON.parse(JSON.stringify(this.cart.getCart()));
        console.log('TEST BETA', this.cartCopy);

        // clear the cart
        //this.cart.clearCart();



    }

    downloadPack(pack) {

        console.log('TEST CHARLIE', pack);

    }
}
