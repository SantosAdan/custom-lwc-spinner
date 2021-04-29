public with sharing class ProductController {
    
    @AuraEnabled
    public static List<ItemWrapper> obtainProductList() {
        List<ItemWrapper> itemList = new List<ItemWrapper>();
        
        for (Product2 prod : [SELECT Id, Name, Description, Family, Picture__c FROM Product2 WITH SECURITY_ENFORCED ORDER BY Family ASC]) {
            ItemWrapper item = new ItemWrapper();
            item.id = prod.Id;
            item.index = prod.Id;
            item.name = prod.Name;
            item.description = prod.Description;
            item.type = prod.Family;
            item.picture = prod.Picture__c;
            itemList.add(item);
        }

        return itemList;
    }

    public class ItemWrapper {
        @AuraEnabled
        public Id id;

        @AuraEnabled
        public String index;

        @AuraEnabled
        public String name;

        @AuraEnabled
        public String description;

        @AuraEnabled
        public String type;

        @AuraEnabled
        public String picture;
    }
}
