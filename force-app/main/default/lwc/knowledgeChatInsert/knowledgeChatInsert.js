import { LightningElement, api, track } from 'lwc';
import searchKnowledge from '@salesforce/apex/KnowledgeSearchController.searchArticles';
import getArticleContent from '@salesforce/apex/KnowledgeSearchController.getArticleContent';

export default class KnowledgeChatInsert extends LightningElement {
    @api recordId;
    
    @track searchTerm = '';
    @track articles = [];
    @track selectedArticle = null;
    @track isLoading = false;
    @track error = null;
    @track copiedMessage = '';

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    async handleSearch() {
        if (!this.searchTerm || this.searchTerm.length < 2) {
            return;
        }
        
        this.isLoading = true;
        this.error = null;
        this.articles = [];
        
        try {
            const result = await searchKnowledge({ searchTerm: this.searchTerm });
            this.articles = result;
        } catch (err) {
            this.error = err.body ? err.body.message : '검색 오류';
        } finally {
            this.isLoading = false;
        }
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.handleSearch();
        }
    }

    async handleArticleClick(event) {
        const articleId = event.currentTarget.dataset.id;
        this.isLoading = true;
        
        try {
            const content = await getArticleContent({ articleId: articleId });
            this.selectedArticle = content;
        } catch (err) {
            this.error = err.body ? err.body.message : '문서 로드 오류';
        } finally {
            this.isLoading = false;
        }
    }

    handleBack() {
        this.selectedArticle = null;
    }

    handleCopyContent() {
        if (this.selectedArticle && this.selectedArticle.content) {
            const textArea = document.createElement('textarea');
            textArea.value = this.selectedArticle.content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.copiedMessage = '클립보드에 복사됨!';
            setTimeout(() => {
                this.copiedMessage = '';
            }, 2000);
        }
    }

    get hasArticles() {
        return this.articles && this.articles.length > 0;
    }

    get noResults() {
        return !this.isLoading && this.searchTerm && this.articles.length === 0;
    }

    get showList() {
        return !this.selectedArticle;
    }

    get showDetail() {
        return this.selectedArticle !== null;
    }
}