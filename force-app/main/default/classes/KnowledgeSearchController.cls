public without sharing class KnowledgeSearchController {
    @AuraEnabled
    public static List<Map<String, String>> searchArticles(String searchTerm) {
        List<Map<String, String>> results = new List<Map<String, String>>();
        
        if (String.isBlank(searchTerm)) {
            return results;
        }

        String searchQuery = 'FIND \'' + String.escapeSingleQuotes(searchTerm) + '*\' IN ALL FIELDS RETURNING Knowledge__kav(Id, Title, Summary, ArticleNumber WHERE PublishStatus = \'Online\' AND IsVisibleInCsp = true) LIMIT 20';
        
        try {
            List<List<SObject>> searchList = Search.query(searchQuery);
            List<Knowledge__kav> articles = (List<Knowledge__kav>)searchList[0];
            
            System.debug('Search term: ' + searchTerm);
            System.debug('Articles found: ' + articles.size());
            
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
            Knowledge__kav article = [
                SELECT Title, Summary, ArticleNumber, Field1__c
                FROM Knowledge__kav 
                WHERE Id = :articleId 
                LIMIT 1
            ];
            
            Map<String, String> result = new Map<String, String>();
            result.put('title', article.Title);
            result.put('content', article.Field1__c != null ? article.Field1__c : article.Summary); 
            
            return result;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}