import { LightningElement, track, api } from 'lwc';

const MIN_CHAR_LENGTH = 2;

export default class SearchableCombobox extends LightningElement {

    @api options;
    @api selectedValue;
    @api label;
    @api disabled = false;
    @track value;
    @track optionData;
    @track searchString;
    @track message;
    @track showDropdown = false;
 
    connectedCallback() {
        this.showDropdown = false;
        let optionData = this.options ? (JSON.parse(JSON.stringify(this.options))) : null;
        let value = this.selectedValue ? (JSON.parse(JSON.stringify(this.selectedValue))) : null;

		if (value) {
            this.searchString = optionData.filter(option => option.label === value);
        }
        this.value = value;
        this.optionData = optionData;
    }

    filterOptions(event) {
        this.searchString = event.target.value;

        if (this.searchString && this.searchString.length > 0) {
            this.message = '';
            
            if (this.searchString.length >= MIN_CHAR_LENGTH) {
                this.optionData = this.optionData.map(option => {
                    if (option.label.toLowerCase().trim().includes(this.searchString.toLowerCase().trim())) {
                        option.isVisible = true;
                    } else {
                        option.isVisible = false;
                    }

                    return option;
                });

                let foundResultList = this.optionData.filter(option => option.isVisible);

                if (foundResultList.length == 0) {
                    this.message = "Nenhum resultado encontrado para '" + this.searchString + "'";
                }
            }

            this.showDropdown = true;
        } else {
            this.showDropdown = false;
        }
	}

    selectItem(event) {
        let selectedVal = event.currentTarget.dataset.id;

        if (selectedVal) {
            this.optionData.forEach(option => {
                if (option.value === selectedVal) {
                    this.value = option.value;
                    this.searchString = option.label;
                }
            });
            
            this.showDropdown = false;

            this.dispatchEvent(new CustomEvent('select', {
                detail: {
                    'option' : {
                        'label' : this.searchString,
                        'value' : this.value
                    }
                }
            }));
        }
    }

    showOptions() {
        if (this.disabled == false && this.options) {
            this.message = '';
            this.searchString = '';
            
            this.optionData = this.optionData.map(option => {
                option.isVisible = true;
                return option;
            })
            
            if (this.optionData.length > 0) {
                this.showDropdown = true;
            }

        }
	}

    blurEvent() {
        var previousLabel;

        if (this.value) {
            for (let i = 0; i < this.optionData.length; i++) {
                if (this.optionData[i].value === this.value) {
                    previousLabel = this.optionData[i].label;
                }
            }
            this.searchString = previousLabel;
                 
            this.dispatchEvent(new CustomEvent('select', {
                detail: {
                    'option' : {
                        'label' : this.searchString,
                        'value' : this.value
                    }
                }
            }));
        }
        
        this.showDropdown = false;
    }
}