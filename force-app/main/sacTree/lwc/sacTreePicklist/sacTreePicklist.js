import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

import obtainLevelMap from '@salesforce/apex/SacTreeController.obtainLevelMap';
import obtainLevelDepth from '@salesforce/apex/SacTreeController.obtainLevelDepth';
import obtainFirstLevel from '@salesforce/apex/SacTreeController.obtainFirstLevel';
import obtainNextLevel from '@salesforce/apex/SacTreeController.obtainNextLevel';
import updateRecord from '@salesforce/apex/SacTreeController.updateRecord';

export default class SacTreePicklist extends LightningElement {
    @api recordId;
    @api picklistMdt;
    @api cardTitle;
    @api cardIcon;

    @track levels = [];
    @track levelOptionsList = [];

    record = undefined;
    isLoading = true;
    noConfigFound = false;

    extractOptionsList(optionList) {
        return optionList.map(item => {
            return {
                label: item.Name,
                value: item.Name
            }
        });
    }

    buildLevelOptions(levelOrder, optionList) {
        return this.levels.map(level => {
            if (level.order === levelOrder) {
                return {
                    ...level,
                    options: this.extractOptionsList(optionList),
                    show: true
                }
            }

            return level;
        })
    }

    connectedCallback() {
        obtainLevelMap()
            .then(result => {
                console.log(JSON.parse(JSON.stringify(result)));
            })
            .catch(error => console.log(error.body.message))
    }

    @wire(obtainLevelDepth, { metadataConfigName: '$picklistMdt'})
    wiredLevelDepth({error, data}) {
        if (data) {
            let depth = data.length;

            if (depth != 0) {
                this.levels = data;

                this.levelOptionsList = data.map(level => []);

                this.getFirstLevel();
            } else {
                this.noConfigFound = true;
                this.isLoading = false;
            }
        } else if (error) {
            this.isLoading = false;
            console.log(error);
        }
    }

    getFirstLevel() {
        this.isLoading = true;
        obtainFirstLevel()
            .then(result => {
                this.levelOptionsList[0] = result;
                
                if (result && result.length > 0) {
                    this.levels = this.buildLevelOptions(1, result);
                }

                this.isLoading = false;
            })
            .catch(error => {
                console.log(error.message.body);
            })
    }

    getNextLevelOptions(levelOrder, levelParentId) {
        this.isLoading = true;

        obtainNextLevel({ levelParentId })
            .then(result => {
                
                if (result && result.length > 0) {
                    this.levelOptionsList[levelOrder-1] = result;
                    this.levels = this.buildLevelOptions(levelOrder, result);
                }

                this.isLoading = false;
            })
            .catch(error => {
                console.log(error.message.body);
            })
    }

    handleChange(event) {
        const levelString = event.target.dataset.name;
        const levelOrder = parseInt(levelString);
        
        this.clearNextLevelOnChange(levelOrder+1);
        this.handleChangeLevel(event, this.levelOptionsList[levelOrder-1], levelOrder+1);
    }

    handleChangeLevel(event, optionList, nextLevel) {
        const selectedName = event.detail.option.value;
        const selectedRecord = optionList.filter(item => item.Name == selectedName);
        
        this.levels = this.levels.map(level => {
            if (level.order == (nextLevel-1)) {
                return {
                    ...level,
                    selectedLevelName: selectedRecord[0].Name,
                    selectedLevelId: selectedRecord[0].Id
                }
            }

            return level;
        })

        this.getNextLevelOptions(nextLevel, selectedRecord[0].Id);
    }

    clearNextLevelOnChange(nextLevel) {
        this.levels = this.levels.map(level => {
            if (level.order >= nextLevel) {
                return {
                    ...level,
                    options: [],
                    selectedLevelName: undefined,
                    selectedLevelId: undefined,
                    show: false
                }
            }

            return level;
        });

        this.levelOptionsList[nextLevel] = [];
    }

    handleSave(event) {
        this.isLoading = true;
        updateRecord({ recordId: this.recordId, levelsJson: JSON.stringify(this.levels) })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Sucesso!',
                        message: `${this.picklistMdt} atualizado.`,
                        variant: 'success'
                    })
                );
                
                getRecordNotifyChange([{ recordId: this.recordId }]);
                
                this.isLoading = false;
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Erro!',
                        message: error.body.message,
                        variant: 'error'
                    })
                );

                this.isLoading = false;
            });
    }
}