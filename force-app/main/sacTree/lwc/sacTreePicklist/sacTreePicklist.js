import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

import obtainLevelMap from '@salesforce/apex/SacTreeController.obtainLevelMap';
import obtainLevelDepth from '@salesforce/apex/SacTreeController.obtainLevelDepth';
import obtainRecord from '@salesforce/apex/SacTreeController.obtainRecord';
import updateRecord from '@salesforce/apex/SacTreeController.updateRecord';

export default class SacTreePicklist extends LightningElement {
    @api recordId;
    @api picklistMdt;
    @api cardTitle;
    @api cardIcon;

    @track levels = [];
    @track levelOptionsList = [];
    @track levelsMap;

    depth = 0;
    fields = undefined;
    isLoading = true;
    noConfigFound = false;
    readOnly = true;

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

    getRecord() {
        obtainRecord({ recordId: this.recordId, metadataConfigName: this.picklistMdt })
            .then(data => {
                this.fields = data;
            })
            .catch(error => console.log(error.body.message));
    }

    connectedCallback() {
        this.getRecord();

        obtainLevelDepth({ metadataConfigName: this.picklistMdt })
            .then(data => {
                this.depth = data.length;

                if (this.depth != 0) {
                    this.levels = data;

                    this.levelOptionsList = data.map(level => []);

                    this.obtainMap();
                } else {
                    this.noConfigFound = true;
                    this.isLoading = false;
                }
            });        
    }

    obtainMap() {
        obtainLevelMap()
            .then(result => {
                this.levelsMap = result;

                this.getFirstLevel();
            })
            .catch(error => console.log(error.body.message))
    }

    getFirstLevel() {
        this.levelOptionsList[0] = this.levelsMap.null;

        if (this.levelOptionsList[0] && this.levelOptionsList[0].length > 0) {
            this.levels = this.buildLevelOptions(1, this.levelOptionsList[0]);
        }

        this.isLoading = false;
    }

    getNextLevelOptions(levelOrder, levelParentId) {
        if (levelOrder > this.depth) {
            return;
        }
        
        this.levelOptionsList[levelOrder-1] = this.levelsMap[levelParentId];
        
        if (this.levelOptionsList[levelOrder-1] && this.levelOptionsList[levelOrder-1].length > 0) {
            this.levels = this.buildLevelOptions(levelOrder, this.levelOptionsList[levelOrder-1]);
        }
    }

    handleChange(event) {
        const levelString = event.target.dataset.name;
        const levelOrder = parseInt(levelString);
        
        this.clearNextLevelOnChange(levelOrder+1);
        this.isLoading = true;
        setTimeout(() => {
            this.handleChangeLevel(event, this.levelOptionsList[levelOrder-1], levelOrder+1);
        }, 250);
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

        this.isLoading = false;
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
                this.getRecord();
                
                this.isLoading = false;
                this.readOnly = true;
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

    handleEdit() {
        this.readOnly = false;
    }

    handleCancel() {
        this.readOnly = true;
    }
}