public with sharing class SacTreeSelector {
    private static SacTreeSelector instance;

    private SacTreeSelector() {

    }

    public static SacTreeSelector getInstance() {
        if (instance == null) {
            instance = new SacTreeSelector();
        }

        return instance;
    }

    public List<SacTree__c> getTreeOptionListByLevel(String level) {
        return [SELECT Id, Name, RecordTypeId, RecordType.Name FROM SacTree__c WHERE RecordType.Name = :level WITH SECURITY_ENFORCED LIMIT 10000];
    }

    public List<SacTree__c> getTreeOptionListByParentId(Id levelParentId) {
        return [SELECT Id, Name, RecordTypeId, RecordType.Name FROM SacTree__c WHERE ParentLevel__c = :levelParentId WITH SECURITY_ENFORCED LIMIT 10000];
    }
}
