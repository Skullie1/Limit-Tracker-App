import { LightningElement, track } from 'lwc';
import getObjectLimit from '@salesforce/apex/LimitsMonitor_Controller.getObjectLimit';
import getMetaDataForOptions from '@salesforce/apex/LimitsMonitor_Controller.getEntitiesForInput';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
    { label: 'Label', fieldName: 'Label' },
    { label: 'Remaining', fieldName: 'Remaining' , type: 'number', initialWidth: 150},
    { label: 'Max', fieldName: 'Max', type : 'number', initialWidth: 70}
];

export default class ObjectLimits extends LightningElement {

    @track value = 'Account';
    @track columns = columns;
    @track objectLimits;
    @track options=[];

    connectedCallback(){
        this.handleOptions();
    }
    handleChange(event) {
        this.value = event.detail.value;
    }
    async handleOptions() {
        try {
            let response1 = await getMetaDataForOptions();
            let parsedRes = JSON.parse(response1);
            let tempObj;
            for(const prop in parsedRes){
                tempObj  = {label:parsedRes[prop] ,value: parsedRes[prop]}
                this.options.push(tempObj);
            }

        } catch (error) {
                this.error = error;
        } finally {
            this.template.querySelector('[data-id=optionsBox]').options = this.options.sort();

        }
    }
    handleBtnClick(event){
        getObjectLimit({ apiName: this.value })
            .then(result => {
                this.objectLimits = result;
                if(this.objectLimits.length === 0){
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error fetching Data',
                            message: 'No Limits data could be retrieved for this object.',
                            variant: 'error',
                        }),
                    );
                }
            })
            .catch(error => {
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error fetching Data',
                        message: 'No Limits data could be retrieved for this object. Please complete all installation steps.',
                        variant: 'error',
                    }),
                );
            });
    }

}