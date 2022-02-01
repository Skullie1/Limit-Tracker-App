public with sharing class LimitTrackerController {
    
    public LimitTrackerController() {
        
    }
    @AuraEnabled
    public static string getLimits(){
        list<orgLimit> returnList = new list<OrgLimit>();
        Map<String,System.OrgLimit> limitsMap = OrgLimits.getMap();
        for(string key: limitsMap.KeySet()){
            returnList.add(new orgLimit(limitsMap.get(key)));
        }
        
        return JSON.serialize(returnList);
        
    }       
    public static string fixLabel(string myString){
        String returnValue ='';
        Integer i=0;
        string tempWord='';
        do{
            if(i<myString.length()){
                //temp.substirng(i,i+1) is what you use to get each character
                if(myString.substring(i,i+1).isAllUpperCase()){
                    returnValue += ' '+tempWord;
                    tempWord='';
                    tempWord +=myString.substring(i,i+1);
                }else{
                    tempWord+= myString.substring(i,i+1);
                }
                if(i==myString.length()-1){returnValue += ' '+tempWord;}
                system.debug(tempWord);
                system.debug(returnValue);
            }
            i=i+1;
        }while(i < myString.length());
        return returnValue;
    }
    public class orgLimit{
        string name;
        integer current;
        integer limitForOrg;
        
        orgLimit(System.OrgLimit oLimit){
            this.name = LimitTrackerController.fixLabel(oLimit.getName());
            this.current = oLimit.getValue();
            this.limitForOrg = oLimit.getLimit();
        }
        
        
    }
}