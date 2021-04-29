import { LightningElement, track } from 'lwc';

import obtainProductList from '@salesforce/apex/ProductController.obtainProductList';

export default class DraggableContainer extends LightningElement {

    @track items = [];

    @track selectedItems = [];

    isLoading = true;

    connectedCallback() {
        this.obtainItems();
    }

    obtainItems() {
        obtainProductList()
            .then(result => {
                this.items = result;
            })
            .catch(error => {
                console.log(error.body.message);
            })
            .finally(() => {
                this.isLoading = false;
            })
    }

    handleDragStartAvailable(event) {
        event.dataTransfer.setData("indexId", event.target.dataset.index);
        event.dataTransfer.effectAllowed = "move";

        this.template.querySelector(".selectedDropzone").classList.add("dragover");
    }

    handleDragStartSelected(event) {
        event.dataTransfer.setData("indexId", event.target.dataset.index);
        event.dataTransfer.effectAllowed = "move";

        this.template.querySelector(".unselectedDropzone").classList.add("dragover");
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }

    handleDropSelected(event) {
        event.preventDefault();
        let indexId = event.dataTransfer.getData("indexId");

        let selectedItem = this.items.filter(item => item.index == indexId);

        if (selectedItem.length > 0) {
            this.items = this.items.filter(item => item.index != indexId);

            this.selectedItems = [...this.selectedItems, selectedItem[0]];
        }

        this.disableDropzone();
    }

    handleDropAvailable(event) {
        event.preventDefault();
        let indexId = event.dataTransfer.getData("indexId");

        let selectedItem = this.selectedItems.filter(item => item.index == indexId);

        if (selectedItem.length > 0) {
            this.selectedItems = this.selectedItems.filter(item => item.index != indexId);
    
            this.items = [...this.items, selectedItem[0]];
        }
        
        this.disableDropzone();
    }

    disableDropzone() {
        this.template.querySelector(".selectedDropzone").classList.remove("dragover");
        this.template.querySelector(".unselectedDropzone").classList.remove("dragover");
    }
}