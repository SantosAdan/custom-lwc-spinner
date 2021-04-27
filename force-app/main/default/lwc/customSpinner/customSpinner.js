import { LightningElement, api } from 'lwc';

export default class CustomSpinner extends LightningElement {
    @api variant;
    @api size;

    get spinnerClass() {
        if (this.size == undefined || this.size == 'medium') {
            return 'lds-facebook_medium';
        }

        return this.size == 'small' ? 'lds-facebook_small' : 'lds-facebook_large';
    }

    get variantClass() {
        return this.variant != undefined && this.variant == 'brand' ? 'variant-brand' : 'variant-base';
    }
}