public with sharing class SacTreeSelector {

    public static List<SacTree__c> getTreeOptionListByLevel(String level) {
        return [SELECT Id, Name FROM SacTree__c WHERE RecordType.Name = :level WITH SECURITY_ENFORCED LIMIT 10000];
    }

    public static List<SacTree__c> getTreeOptionListByParentId(Id levelParentId) {
        return [SELECT Id, Name FROM SacTree__c WHERE ParentLevel__c = :levelParentId WITH SECURITY_ENFORCED LIMIT 10000];
    }
}