public with sharing class LimitsMonitor_Controller {

    public static Map<String, OrgLimit> getThisOrgLimits(){
         Map<String, OrgLimit> lm = new Map<String, OrgLimit>();
         if(!Test.isRunningTest()){
             return OrgLimits.getMap();
         }
         return lm;
    }

    @AuraEnabled
    public static void scheduleAlert(Decimal percent, string schedTime){
        Time sTime = Time.newInstance(Integer.valueOf(schedTime.split(':')[0]), Integer.valueOf(schedTime.split(':')[1]), 0, 0);
        string schedStr = '0 '+sTime.minute()+' '+sTime.hour()+' * * ?';
        LimitsMonitor_Scheduler SC = new LimitsMonitor_Scheduler(percent); 
        if(!Test.isRunningTest()){
            system.schedule('LimitsMonitorSchedule', schedStr, SC);
        }
    }

    @AuraEnabled
    public static List<ObjectLimitData> getObjectLimit(String apiName){
        
        HTTP h = new HTTP();
        HTTPRequest req = new HTTPRequest();
        HttpResponse resp = new HttpResponse();
        
        req.setMethod('GET');
        req.setEndpoint('callout:LimMon_NC/services/data/v45.0/tooling/query/?q=SELECT+Type,+Label,+Remaining,+Max,+EntityDefinitionid+FROM+EntityLimit+where+EntityDefinitionid=\''+apiName+'\'');
        resp = h.send(req);
        
        System.debug(resp.getBody());
        
        if(resp.getStatusCode() == 200 ){
            ObjectLimitResponse limits = (ObjectLimitResponse)JSON.deserialize(resp.getBody(), ObjectLimitResponse.class);
            return limits.records;
        }
       
        return null;
    }
    @AuraEnabled
    public static string getEntitiesForInput(){
        // 
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
        list<Schema.SObjectType> targetList = new list<Schema.SObjectType>();
        //
        list<String> returnList = new list<String>();
        //
        for(Schema.SObjectType d : gd.values())
        {
            Schema.DescribeSObjectResult ds = d.getDescribe();
            //sorting out entities
            if(ds.isCustom() ||
            !ds.getName().contains('.')&& 
            !ds.getName().contains('__ChangeEvent')&&
            !ds.getName().contains('__mtd')&&
            !ds.getName().contains('__Share')&&
            !ds.getName().contains('__History')){
                returnList.add(ds.getName());
            }
        }
        return JSON.serialize(returnList);
    }

    public class ObjectLimitResponse{
        public List<ObjectLimitData> records;
    }

    public class ObjectLimitData{

        @AuraEnabled
        public String Type;
        @AuraEnabled
        public Integer Remaining;
        @AuraEnabled
        public Integer Max;
        @AuraEnabled
        public String Label;
    }
}