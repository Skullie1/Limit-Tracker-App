import { LightningElement,track,wire,api } from 'lwc';
import getLimitsMap from '@salesforce/apex/LimitTrackerController.getLimits';
const columns = [
    {
        fieldName: '',
        label: '',
        cellAttributes: { iconName: { fieldName: 'dynamicIcon' } },
        initialWidth: 10
    },
    { label: 'Limit Name', fieldName: 'name'},
    { label: 'Current Count', fieldName: 'current', cellAttributes: { alignment: 'right' }  },
    { label: 'Org Limit', fieldName: 'limitForOrg', cellAttributes: { alignment: 'right' }   },
    { label: 'Percent Used', fieldName: 'percentUsed',type:'percent', cellAttributes: { alignment: 'right' }  },
];

export default class LimitTracker extends LightningElement {
    orgLimits;
    dataObj = {};
    columns = columns;
    startTime;
    stopTime;

    _highWarningDec = '.4';
    get highWarningDec(){
        return this._highWarningDec;
    }
    set highWarningDec(value){
        this._highWarningDec = value;
    }
    _medWarningDec = '.04';
    get medWarningDec(){
        return this._medWarningDec;
    }
    set medWarningDec(value){
        this._medWarningDec = value;
    }
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
    get Limits(){
        
        return this.orgLimits;
    }
    @track
    _data;
    get data(){
        return this._data;
    }
    set data(value){
        this._data = value;
    }
    get buttonLabel(){
        return 'Start tracking';
    }
    get buttonAction(){
        return 'Start tracking';
    }
    handleClick(){
        let button = this.template.querySelector('[data-id="startButton"');
        button.label = 'Update';

        getLimitsMap()
              .then(result => {
                  this.updateDataTable(result);
              })
              .catch(error => {
                  console.error(error);
              }).finally(()=>{

            });

    }
    handleWarningLevelChange(event){
        this.highWarningDec = parseFloat(event.detail.value); 
    
    }
    handleWarningLevelMedChange(event){
        this.medWarningDec = parseFloat(event.detail.value); 
    
    }
    handleComplete(){
        this.handleClick();
        this.stopTime = new Date();
        this.dataObj.stopTime = this.stopTime;
        let button = this.template.querySelector('[data-id="startButton"');
        button.disabled = true;
        this.dataObj.stopTime = this.stopTime;
    }
    connectedCallback() {
            getLimitsMap()
              .then(result => {
                let returnData=[];
                  let parsedData = JSON.parse(result);
                  let percentUsedValue, iconValue;
                  for ( const prop in parsedData) {
                      percentUsedValue = parsedData[prop].current / parsedData[prop].limitForOrg;
                      if(percentUsedValue >= this._highWarningDec){
                        iconValue = 'action:close';
                      }else if(percentUsedValue >= this._medWarningDec){
                        iconValue = 'action:priority';
                      }else{
                        iconValue = 'action:approval';
                      }
                      returnData.push({
                          name: parsedData[prop].name,
                          current : parsedData[prop].current,
                          limitForOrg : parsedData[prop].limitForOrg,
                          percentUsed : (parsedData[prop].limitForOrg== 0 )?.0 :percentUsedValue,
                          dynamicIcon: iconValue
                      });
                  }

                  this.dataObj = returnData.sort((a, b) =>
                  (a.name < b.name) ? 1 : (a.name === b.name) ? ((a.size < b.size) ? 1 : -1) : -1 );;
                  this._data = returnData.sort((a, b) =>
                  (a.percentUsed < b.percentUsed) ? 1 : (a.percentUsed === b.percentUsed) ? ((a.size < b.size) ? 1 : -1) : -1 );
              })
              .catch(error => {
                console.error(error);
            }).finally(() => {
                this.sortDataList();
                this.startTime = new Date();
                this.dataObj.startTime = this.startTime;
                this.template.querySelector('[data-id=mediumWarning').value = this.medWarningDec;
                this.template.querySelector('[data-id=highWarning').value = this.highWarningDec;
             });
    }
    updateDataTable(newDataLst){
        let newData = JSON.parse(newDataLst);
        this.updateDataTableData(newData);
        this.updateColumns();
        this.sortDataList();
    }
    sortDataList(){
        this.data = this.data.sort((a, b) =>
        (a.percentUsed < b.percentUsed) ? 1 : (a.percentUsed === b.percentUsed) ? ((a.size < b.size) ? 1 : -1) : -1 );
    }
    reset(){
        eval("$A.get('e.force:refreshView').fire();");
    }
    updateDataTableData(newData){
        let percentUsedValue, iconValue, diffrence,percentChange,percentUsed;

        for(const i in this.dataObj){
            for(const j in newData){

                if(this.dataObj[i].name==newData[j].name){
                percentUsedValue = this.dataObj[i].current / this.data[i].limitForOrg;
                iconValue = (percentUsedValue >=this.highWarningDec)?'action:close':(percentUsedValue>=this.medWarningDec)?'action:priority':'action:approval';
                diffrence = (newData[j].current-this.dataObj[i].current);
                percentChange = (diffrence==0)?.0:diffrence/this.dataObj[i].current;
                percentUsed = (this.data[i].limitForOrg==0)?.0:percentUsedValue;
                    this.dataObj[i]["newCount"] = newData[j].current;
                    this.dataObj[i]["diffrence"] = diffrence;
                    this.dataObj[i]["percentChange"] = percentChange;
                    this.dataObj[i]["percentUsed"] = percentUsed;
                    this.dataObj[i]["dynamicIcon"] = iconValue;

                }
            }
        }
        this.data = this.dataObj.sort((a, b) =>
        (a.name < b.name) ? 1 : (a.name === b.name) ? ((a.size < b.size) ? 1 : -1) : -1 );
    }
    updateColumns(){
         this.columns = [
            {
                fieldName: '',
                label: '',
                cellAttributes: { iconName: { fieldName: 'dynamicIcon' } },
                initialWidth: 10,
            },
            { label: 'Limit Name', fieldName: 'name' },
            { label: 'Initial Count', fieldName: 'current', cellAttributes: { alignment: 'right' }  },
            { label: 'New Count', fieldName: 'newCount' , cellAttributes: { alignment: 'right' }  },
            { label: 'Difference', fieldName: 'diffrence' , cellAttributes: { alignment: 'right' }  },
            { label: 'Org Limit', fieldName: 'limitForOrg', cellAttributes: { alignment: 'right' }},
            { label: 'Percent Change', fieldName: 'percentChange',type:'percent', cellAttributes: { alignment: 'right' }},
            { label: 'Percent Used', fieldName: 'percentUsed',type:'percent', cellAttributes: { alignment: 'right' }},

        ];
    }
}