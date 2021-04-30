public with sharing class SacTreeController {
    
    private static final String FIRST_LEVEL = 'First Level';
    private static final String SECOND_LEVEL = 'Second Level';
    private static final String THIRD_LEVEL = 'Third Level';

    @AuraEnabled
    public static List<SACTree__c> obtainFirstLevel() {
        try {
            return SacTreeSelector.getInstance().getTreeOptionListByLevel(FIRST_LEVEL);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<SACTree__c> obtainNextLevel(Id levelParentId) {
        try {
            return SacTreeSelector.getInstance().getTreeOptionListByParentId(levelParentId);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
