public with sharing class SacTreeController {
  private static final String FIRST_LEVEL = 'First Level';

  @AuraEnabled(cacheable=true)
  public static List<LevelInfo> obtainLevelDepth(String metadataConfigName) {
    List<DynamicPicklist__mdt> picklistTypes = DynamicPicklistSelector.findByNameWithLevels(
      metadataConfigName
    );

    if (picklistTypes.isEmpty()) {
      return new List<LevelInfo>();
    }

    if (picklistTypes[0].DynamicPicklistLevels__r.isEmpty()) {
      return new List<LevelInfo>();
    }

    List<LevelInfo> levels = new List<LevelInfo>();
    for (DynamicPicklistLevel__mdt level : picklistTypes[0].DynamicPicklistLevels__r) {
      LevelInfo lvl = new LevelInfo();
      lvl.name = level.DeveloperName;
      lvl.order = Integer.valueOf(level.LevelOrder__c);
      lvl.fieldName = level.FieldMapping__c;
      lvl.fieldLabel = getFieldLabel(
        picklistTypes[0].sObject__c,
        level.FieldMapping__c
      );
      levels.add(lvl);
    }

    return levels;
  }

  @AuraEnabled
  public static Map<Id, List<SacTree__c>> obtainLevelMap() {
    Map<Id, List<SacTree__c>> treesByParentLevel = new Map<Id, List<SacTree__c>>();
    List<SacTree__c> trees = [SELECT Id, Name, ParentLevel__c FROM SacTree__c ORDER BY Name ASC, ParentLevel__c NULLS FIRST LIMIT 10000];

    for (SACTree__c tree : trees) {
      if (treesByParentLevel.containsKey(tree.ParentLevel__c)) {
        treesByParentLevel.get(tree.ParentLevel__c).add(tree);
      } else {
        treesByParentLevel.put(tree.ParentLevel__c, new List<SACTree__c>{tree});
      }
    }

    return treesByParentLevel;
  }

  @AuraEnabled
  public static List<RecordInfo> obtainRecord(Id recordId, String metadataConfigName) {
    try {
      List<DynamicPicklist__mdt> picklistTypes = DynamicPicklistSelector.findByNameWithLevels(
        metadataConfigName
      );
      String fields = '';
      for (DynamicPicklistLevel__mdt level : picklistTypes[0].DynamicPicklistLevels__r) {
        fields += level.FieldMapping__c + ', ';
      }

      String query = 'SELECT Id, ';
      query += fields.substringBeforeLast(',');
      query += ' FROM ' + picklistTypes[0].sObject__c;
      query += ' WHERE Id = :recordId';

      sObject record = Database.query(query)[0];

      List<RecordInfo> recordFields = new List<RecordInfo>();
      
      for (DynamicPicklistLevel__mdt level : picklistTypes[0].DynamicPicklistLevels__r) {
        RecordInfo info = new RecordInfo();
        info.label = getFieldLabel(picklistTypes[0].sObject__c, level.FieldMapping__c);
        info.value = (String) record.get(level.FieldMapping__c);
        recordFields.add(info);
      }

      return recordFields;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  // @AuraEnabled
  // public static List<SACTree__c> obtainFirstLevel() {
  //   try {
  //     return SacTreeSelector.getTreeOptionListByLevel(FIRST_LEVEL);
  //   } catch (Exception e) {
  //     throw new AuraHandledException(e.getMessage());
  //   }
  // }

  // @AuraEnabled
  // public static List<SACTree__c> obtainNextLevel(Id levelParentId) {
  //   try {
  //     return SacTreeSelector.getTreeOptionListByParentId(levelParentId);
  //   } catch (Exception e) {
  //     throw new AuraHandledException(e.getMessage());
  //   }
  // }

  @AuraEnabled
  public static void updateRecord(Id recordId, String levelsJson) {
    List<LevelInfo> levels = (List<LevelInfo>) JSON.deserialize(
      levelsJson,
      List<LevelInfo>.class
    );

    try {
      sObject obj = recordId.getSobjectType().newSObject(recordId);

      for (LevelInfo level : levels) {
        obj.put(level.fieldName, level.selectedLevelName);
      }

      update obj;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  private static String getFieldLabel(String sObjectType, String fieldApiName) {
    Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
    Schema.SObjectType objectSchema = schemaMap.get(sObjectType);
    Map<String, Schema.SObjectField> fieldMap = objectSchema.getDescribe()
      .fields.getMap();

    return fieldMap?.get(fieldApiName)?.getDescribe().getLabel();
  }

  public class LevelInfo {
    @AuraEnabled
    public String name;

    @AuraEnabled
    public Integer order;

    @AuraEnabled
    public String fieldName;

    @AuraEnabled
    public String fieldLabel;

    @AuraEnabled
    public String selectedLevelName;

    @AuraEnabled
    public Boolean show;
  }

  public class RecordInfo {
    @AuraEnabled
    public String label;

    @AuraEnabled
    public String value;
  }
}
