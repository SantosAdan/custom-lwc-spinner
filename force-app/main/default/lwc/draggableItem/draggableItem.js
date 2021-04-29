import { LightningElement, api } from 'lwc';

export default class DraggableItem extends LightningElement {
    @api item;

    typeColorMap = {
        'Laptop' : 'slds-theme_success',
        'Desktop' : 'slds-badge_inverse',
        'Smartphone' : 'slds-theme_warning',
        'Tablet' : 'slds-theme_error',
    };

    obtainTypeColor(type) {
        return this.typeColorMap[type] || '';
    }

    get labelStyle() {
        return this.obtainTypeColor(this.item.type) + ' slds-float_right';
    }
}