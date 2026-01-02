Map<String, Schema.SObjectField> fields = Schema.SObjectType.Knowledge__kav.fields.getMap();
for(String fieldName : fields.keySet()) {
    Schema.DescribeFieldResult dfr = fields.get(fieldName).getDescribe();
    if(dfr.isCustom()) {
        System.debug('Custom Field: ' + fieldName + ' (' + dfr.getType() + ')');
    }
}
