public with sharing class KnowledgeSearchController {
    @AuraEnabled
    public static List<Map<String, String>> searchArticles(String searchTerm) {
        List<Map<String, String>> results = new List<Map<String, String>>();
        
        if (String.isBlank(searchTerm)) {
            return results;
        }

        String searchQuery = 'FIND \'' + String.escapeSingleQuotes(searchTerm) + '*\' IN ALL FIELDS RETURNING Knowledge__kav(Id, Title, Summary, ArticleNumber WHERE PublishStatus = \'Online\' AND Language = \'ko\') LIMIT 20';
        
        try {
            List<List<SObject>> searchList = Search.query(searchQuery);
            List<Knowledge__kav> articles = (List<Knowledge__kav>)searchList[0];
            
            for (Knowledge__kav article : articles) {
                Map<String, String> item = new Map<String, String>();
                item.put('id', article.Id);
                item.put('title', article.Title);
                item.put('summary', article.Summary);
                item.put('number', article.ArticleNumber);
                results.add(item);
            }
        } catch (Exception e) {
            System.debug('Search Error: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
        
        return results;
    }

    @AuraEnabled
    public static Map<String, String> getArticleContent(String articleId) {
        try {
            // 1. Fetch standard fields and the custom content field (Field1__c)
            Knowledge__kav article = [
                SELECT Title, Summary, ArticleNumber, Field1__c
                FROM Knowledge__kav 
                WHERE Id = :articleId 
                LIMIT 1
            ];
            
            Map<String, String> result = new Map<String, String>();
            result.put('title', article.Title);
            // Use Field1__c (Rich Text) if available, otherwise fallback to Summary
            result.put('content', article.Field1__c != null ? article.Field1__c : article.Summary); 
            
            return result;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
