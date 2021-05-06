global class DynamicPicklistDatasource extends VisualEditor.DynamicPickList {
    VisualEditor.DesignTimePageContext context;
    List<DynamicPicklist__mdt> picklistTypes;

    global DynamicPicklistDatasource(VisualEditor.DesignTimePageContext context) {
        this.context = context;
        this.picklistTypes = [SELECT Id, DeveloperName, sObject__c FROM DynamicPicklist__mdt];
    }
    
    global override VisualEditor.DataRow getDefaultValue() {
        VisualEditor.DataRow defaultValue;
        
        if (this.picklistTypes.isEmpty()) {
            return new VisualEditor.DataRow('error', 'error');
        }

        if (this.context.pageType == 'RecordPage') {
            for (DynamicPicklist__mdt picklistType : picklistTypes) {
                if (picklistType.sObject__c == this.context.entityName) {
                    return new VisualEditor.DataRow(picklistType.DeveloperName, picklistType.DeveloperName);
                }
            }
        }

        return new VisualEditor.DataRow(this.picklistTypes[0].DeveloperName, this.picklistTypes[0].DeveloperName);
    }

    global override VisualEditor.DynamicPickListRows getValues() {
        VisualEditor.DynamicPickListRows  myValues = new VisualEditor.DynamicPickListRows();

        for (DynamicPicklist__mdt picklistType : picklistTypes) {
            if (picklistType.sObject__c == this.context.entityName) {
                myValues.addRow(
                    new VisualEditor.DataRow(picklistType.DeveloperName, picklistType.DeveloperName) 
                );
            }
        }
        
        return myValues;
    }
}
