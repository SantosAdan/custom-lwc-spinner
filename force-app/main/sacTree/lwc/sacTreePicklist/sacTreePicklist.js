import { LightningElement, track } from 'lwc';

import obtainFirstLevel from '@salesforce/apex/SacTreeController.obtainFirstLevel';
import obtainNextLevel from '@salesforce/apex/SacTreeController.obtainNextLevel';

const FIRST_LEVEL = "firstLevel";
const SECOND_LEVEL = "secondLevel";
const THIRD_LEVEL = "thirdLevel";
const FOURTH_LEVEL = "fourthLevel";

export default class SacTreePicklist extends LightningElement {

    @track firstLevelList = [];
    @track secondLevelList = [];
    
    selectedFirstLevelId;
    selectedFirstLevelName;

    selectedSecondLevelId;
    selectedSecondLevelName;

    selectedThirdLevelId;
    selectedThirdLevelName;

    hasFirstLevel = false;
    hasSecondLevel = false;
    hasThirdLevel = false;

    isLoading = true;

    extractOptionsList(optionList) {
        return optionList.map(item => {
            return {
                label: item.Name,
                value: item.Name
            }
        });
    }

    get firstLevelOptions() {
        return this.extractOptionsList(this.firstLevelList);
    }

    get secondLevelOptions() {
        return this.extractOptionsList(this.secondLevelList);

    }

    get thirdLevelOptions() {
        return this.extractOptionsList(this.thirdLevelList);

    }

    connectedCallback() {
        this.getFirstLevel();
    }

    getFirstLevel() {
        this.isLoading = true;
        obtainFirstLevel()
            .then(result => {
                this.firstLevelList = result;
                
                if (this.firstLevelList && this.firstLevelList.length > 0) {
                    this.hasFirstLevel = true;
                }

                this.isLoading = false;
            })
            .catch(error => {
                console.log(error.message.body);
            })
    }

    getNextLevelOptions(level, levelParentId) {
        this.isLoading = true;
        obtainNextLevel({ levelParentId })
            .then(result => {
                if (level === SECOND_LEVEL) {
                    this.secondLevelList = result;
                    if (this.secondLevelList && this.secondLevelList.length > 0) {
                        this.hasSecondLevel = true;
                    }
                } else if (level === THIRD_LEVEL) {
                    this.thirdLevelList = result;
                    if (this.thirdLevelList && this.thirdLevelList.length > 0) {
                        this.hasThirdLevel = true;
                    }
                }

                this.isLoading = false;
            })
            .catch(error => {
                console.log(error.message.body);
            })
    }

    handleChange(event) {
        const level = event.target.dataset.name;

        if (level === FIRST_LEVEL) {
            this.clearNextLevelOnChange(SECOND_LEVEL);
            [this.selectedFirstLevelId, this.selectedFirstLevelName] = this.handleChangeLevel(event, this.firstLevelList, SECOND_LEVEL);
        } else if (level === SECOND_LEVEL) {
            this.clearNextLevelOnChange(THIRD_LEVEL);
            [this.selectedSecondLevelId, this.selectedSecondLevelName] = this.handleChangeLevel(event, this.secondLevelList, THIRD_LEVEL);
        } else if (level === THIRD_LEVEL) {
            this.clearNextLevelOnChange(FOURTH_LEVEL);
            [this.selectedThirdLevelId, this.selectedThirdLevelName] = this.handleChangeLevel(event, this.thirdLevelList, FOURTH_LEVEL);
        }
    }

    handleChangeLevel(event, optionList, nextLevel) {
        const selectedName = event.detail.option.value;
        const selectedRecord = optionList.filter(item => item.Name == selectedName);

        this.getNextLevelOptions(nextLevel, selectedRecord[0].Id);

        return [selectedRecord[0].Id, selectedRecord[0].Name];
    }

    clearNextLevelOnChange(level) {
        if (level === SECOND_LEVEL) {
            this.hasSecondLevel = false;
            this.secondLevelList = [];
            this.selectedSecondLevelName = undefined;
        }

        if (level === SECOND_LEVEL || level === THIRD_LEVEL) {
            this.hasThirdLevel = false;
            this.thirdLevelList = [];
            this.selectedThirdLevelName = undefined;
        }
    }

    handleSave(event) {
        console.log(this.selectedFirstLevelName);
        console.log(this.selectedSecondLevelName);
        console.log(this.selectedThirdLevelName);
    }
}