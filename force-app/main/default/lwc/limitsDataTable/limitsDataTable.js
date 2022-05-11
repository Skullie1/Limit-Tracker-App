import { LightningElement,track,api } from 'lwc';
import getLimitsMap from '@salesforce/apex/LimitTrackerController.getLimits';
import {exportCSV} from 'c/exportUtil';

const columns = [
    {
        fieldName: '',
        label: '',
        cellAttributes: { iconName: { fieldName: 'dynamicIcon' } },
        initialWidth: 10
    },
    { label: 'Limit Name', fieldName: 'name', sortable: "true"},
    { label: 'Current Count', fieldName: 'current', cellAttributes: { alignment: 'right' } , sortable: "true" },
    { label: 'Org Limit', fieldName: 'limitForOrg', cellAttributes: { alignment: 'right' } , sortable: "true"  },
    { label: 'Percent Used', fieldName: 'percentUsed',type:'percent', cellAttributes: { alignment: 'right' }, sortable: "true"  },
];
export default class LimitsDataTable extends LightningElement {
/**** Data Table attributes ****/
    @track data;
    @track columns = columns;
/**** End Of Data Table attributes ****/
/**** Data Table warning indicator attributes ****/
@track highWarningDec = '.4';
@track medWarningDec = '.04';
get warningLevels(){
    return [
        { label: '03%', value: '.03' },
        { label: '04%', value: '.04' },
        { label: '10%', value: '.1' },
        { label: '20%', value: '.2' },
        { label: '30%', value: '.3' },
        { label: '40%', value: '.4' },
        { label: '50%', value: '.5' },
        { label: '60%', value: '.6' },
        { label: '70%', value: '.7' },
        { label: '80%', value: '.8' },
        { label: '90%', value: '.9' },
    ]
}
/**** End Of Data Table warning indicator attributes ****/
/****  Date Time Attributes ****/
startTime;
stopTime;
/**** End Of Date Time Attributes ****/


    connectedCallback() {

        getLimitsMap()
        .then(result => {
            let parsedData = JSON.parse(result);
            this.data = this.getLimitsData(parsedData).sort((a, b) =>
            (a.percentUsed < b.percentUsed) ? 1 : (a.percentUsed === b.percentUsed) ? ((a.size < b.size) ? 1 : -1) : -1 );
        })
        .catch(error => {
            console.error(error);
        }).finally(() => {
            let startBtn = this.template.querySelector('[data-id=startButton');
            startBtn.label = 'Start tracking';
            startBtn.action = 'Start tracking';
            this.startTime = new Date();
        // this.template.querySelector('[data-id=mediumWarning').value = this.medWarningDec;
        // this.template.querySelector('[data-id=highWarning').value = this.highWarningDec;
        });
    }
/**** loads limit info into json data for datatable consumption ****/
    getLimitsData(listOfLimits){
        let percentUsedValue
        let returnData = [];
        for ( const prop in listOfLimits) {
            percentUsedValue = listOfLimits[prop].current / listOfLimits[prop].limitForOrg;
            returnData.push({
                name: listOfLimits[prop].name,
                current : listOfLimits[prop].current,
                limitForOrg : listOfLimits[prop].limitForOrg,
                percentUsed : (listOfLimits[prop].limitForOrg == 0 )?.0 : percentUsedValue,
                dynamicIcon: this.handleIconValue(percentUsedValue)
            });
        }
        return returnData;
    }
/**** Icon Value Logic ****/
    handleIconValue(percentUsedValue){
        let retunValue = 'action:approval';

        if(percentUsedValue >= this.medWarningDec){
            retunValue = 'action:priority';
        }
        if(percentUsedValue >= this.highWarningDec){
            retunValue = 'action:close';
        }
        return retunValue;
    }
/**** Percent Change Logic ****/
    handlePercentChange(obj){
        let returnValue = (obj.diffrence === 0 && obj.current === 0)?0: obj.diffrence / obj.current;

        return returnValue;
    }
/**** Warning Level Logic ****/
    handleWarningLevelChange(event){
        this.highWarningDec = event.detail.value;
    }
/**** Warning Level Logic ****/
    handleWarningLevelMedChange(event){
        this.medWarningDec = event.detail.value;
    }
/**** Download CSV Logic ****/
    handleDownload(){
        exportCSV('Limits Report', this.data);
    }
/**** Complete Report Logic ****/
    handleComplete(){
       // this.handleClick();
        this.stopTime = new Date();
        this.template.querySelector('[data-id="completeBtn"').disabled = true;
        this.template.querySelector('[data-id="startButton"').disabled = true;
    }
/**** Update Table Data Logic ****/
    handleClick(){
       this.template.querySelector('[data-id="startButton"').label = 'Update';
        getLimitsMap()
              .then(result => {
                  this.updateTableWithNewLimits(JSON.parse(result));
                  this.updateColumns();
              })
              .catch(error => {
                  console.error(error);
              }).finally(()=>{

            });
    }
/**** Data Table Update Logic ****/
    updateTableWithNewLimits(newLimits){
        for(const i in this.data){
            for(const j in newLimits){
                if(this.data[i].name==newLimits[j].name){
                    this.data[i]["newCount"] = newLimits[j].current;
                    this.data[i]["diffrence"] = (newLimits[j].current - this.data[i].current);
                    this.data[i]["percentChange"] = this.handlePercentChange(this.data[i]);
                    this.data[i]["percentUsed"] = (this.data[i].limitForOrg == 0)? 1. : this.data[i].current / this.data[i].limitForOrg;
                    this.data[i]["dynamicIcon"] = this.handleIconValue(this.data[i].percentUsed);
                }
            }
        }
    }
/**** Update Table Data Columns Logic ****/
    updateColumns(){
        this.columns = [
           {
               fieldName: '',
               label: '',
               cellAttributes: { iconName: { fieldName: 'dynamicIcon' } },
               initialWidth: 10,
           },
           { label: 'Limit Name', fieldName: 'name', sortable: "true"},
           { label: 'Initial Count', fieldName: 'current', cellAttributes: { alignment: 'right' }, sortable: "true"  },
           { label: 'New Count', fieldName: 'newCount' , cellAttributes: { alignment: 'right' }, sortable: "true"  },
           { label: 'Difference', fieldName: 'diffrence' , cellAttributes: { alignment: 'right' }, sortable: "true"  },
           { label: 'Org Limit', fieldName: 'limitForOrg', cellAttributes: { alignment: 'right' }, sortable: "true"},
           { label: 'Percent Change', fieldName: 'percentChange',type:'percent', cellAttributes: { alignment: 'right' }, sortable: "true"},
           { label: 'Percent Used', fieldName: 'percentUsed',type:'percent', cellAttributes: { alignment: 'right' }, sortable: "true"},

       ];
   }
/**** Data Table Sorting boiler plate ****/
    sortBy;
    sortDirection;
    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }
    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.data));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
    }
/**** End Of Data Table Sorting boiler plate ****/

}