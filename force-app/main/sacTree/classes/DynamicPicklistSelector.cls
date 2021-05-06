public with sharing class DynamicPicklistSelector {
  public static List<DynamicPicklist__mdt> findByNameWithLevels(String name) {
    return [
      SELECT
        Id,
        DeveloperName,
        sObject__c,
        (
          SELECT Id, MasterLabel, DeveloperName, LevelOrder__c, FieldMapping__c
          FROM DynamicPicklistLevels__r
          ORDER BY LevelOrder__c ASC
        )
      FROM DynamicPicklist__mdt
      WHERE DeveloperName = :name
      LIMIT 1
    ];
  }
}
