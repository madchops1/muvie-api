import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class CartService {

    products: any = [];
    subTotal: number = 0;
    tax: number = 0;
    total: number = 0;
    taxRate: number = 0.11;

    constructor(public auth: AuthService, private _snackBar: MatSnackBar) {
        if (localStorage.getItem('visualzProducts.v1')) {
            this.products = JSON.parse(localStorage.getItem('visualzProducts.v1'));
        }
    }

    addProduct(product) {
        console.log('CartService.addProduct()', product);
        this.products.push(product);
        this.calcTotal();
        localStorage.setItem('visualzProducts.v1', JSON.stringify(this.products));
        this._snackBar.open('Product Added', 'OK', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['green-snackbar']
        });
    }

    removeProduct(target) {

        let index: any = 0;

        for (let i = 0; i < this.products.length; i++) {
            let product = this.products[i];
            if (target.name == product.name) {
                index = i;
            }
        }

        console.log('INDEX', index);
        this.products.splice(index, 1);

        localStorage.setItem('visualzProducts.v1', JSON.stringify(this.products));

        this.calcTotal();

        this._snackBar.open('Product Removed', 'OK', {
            duration: 2000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['green-snackbar']
        });
    }

    calcSubTotal() {

        let subTotal = 0;

        for (let i = 0; i < this.products.length; i++) {
            subTotal = subTotal + Number(this.products[i].price);
        }

        this.subTotal = subTotal;
        return this.subTotal;
    }

    calcTax() {
        this.calcSubTotal();
        this.tax = +this.subTotal * +this.taxRate;
        return this.tax;
    }

    calcTotal() {
        this.total = this.calcSubTotal() + this.calcTax();
        return this.total;
    }

    getCart() {
        return this.products;
    }

    clearCart() {
        this.products = [];
    }

}
