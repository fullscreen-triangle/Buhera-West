use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::time::{sleep, Duration};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use reqwest::Client;
use std::time::Duration;
use crate::error::AppError;

use crate::config::Config;
use super::{PublicationRecord, PublicationType};

/// Publication collection service that finds papers associated with data sources
pub struct PublicationCollector {
    config: Arc<Config>,
    http_client: Client,
    search_engines: Vec<Box<dyn PublicationSearchEngine + Send + Sync>>,
}

#[async_trait::async_trait]
pub trait PublicationSearchEngine {
    async fn search_by_doi(&self, doi: &str) -> Result<Option<PublicationRecord>, AppError>;
    async fn search_by_keywords(&self, keywords: &[String]) -> Result<Vec<PublicationRecord>, AppError>;
    async fn search_by_dataset_name(&self, dataset_name: &str) -> Result<Vec<PublicationRecord>, AppError>;
    async fn get_citation_count(&self, doi: &str) -> Result<Option<u32>, AppError>;
}

/// CrossRef API search engine
pub struct CrossRefSearchEngine {
    http_client: Client,
    base_url: String,
}

/// arXiv search engine for preprints
pub struct ArXivSearchEngine {
    http_client: Client,
    base_url: String,
}

/// PubMed search engine for life sciences
pub struct PubMedSearchEngine {
    http_client: Client,
    api_key: Option<String>,
    base_url: String,
}

/// Google Scholar search engine (via ScrapAPI)
pub struct GoogleScholarSearchEngine {
    http_client: Client,
    api_key: Option<String>,
    base_url: String,
}

/// NASA/ESA publication databases
pub struct SpaceAgencySearchEngine {
    http_client: Client,
    base_urls: HashMap<String, String>,
}

/// NOAA publication search
pub struct NOAAPublicationSearchEngine {
    http_client: Client,
    base_url: String,
}

impl PublicationCollector {
    pub async fn new(config: Arc<Config>) -> Result<Self, AppError> {
        let http_client = Client::builder()
            .timeout(Duration::from_secs(30))
            .user_agent("Buhera-West/1.0 Agricultural Weather Platform")
            .build()
            .map_err(|e| AppError::internal(format!("Failed to create HTTP client: {}", e)))?;

        let mut search_engines: Vec<Box<dyn PublicationSearchEngine + Send + Sync>> = Vec::new();
        
        // Add CrossRef search engine
        search_engines.push(Box::new(CrossRefSearchEngine {
            http_client: http_client.clone(),
            base_url: "https://api.crossref.org".to_string(),
        }));
        
        // Add arXiv search engine
        search_engines.push(Box::new(ArXivSearchEngine {
            http_client: http_client.clone(),
            base_url: "http://export.arxiv.org/api/query".to_string(),
        }));
        
        // Add PubMed search engine
        search_engines.push(Box::new(PubMedSearchEngine {
            http_client: http_client.clone(),
            api_key: std::env::var("PUBMED_API_KEY").ok(),
            base_url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils".to_string(),
        }));
        
        // Add Google Scholar search engine (if API key available)
        if let Ok(api_key) = std::env::var("GOOGLE_SCHOLAR_API_KEY") {
            search_engines.push(Box::new(GoogleScholarSearchEngine {
                http_client: http_client.clone(),
                api_key: Some(api_key),
                base_url: "https://serpapi.com/search".to_string(),
            }));
        }
        
        // Add space agency search engines
        let mut space_urls = HashMap::new();
        space_urls.insert("NASA".to_string(), "https://ntrs.nasa.gov/api/citations/search".to_string());
        space_urls.insert("ESA".to_string(), "https://earth.esa.int/eogateway/search".to_string());
        
        search_engines.push(Box::new(SpaceAgencySearchEngine {
            http_client: http_client.clone(),
            base_urls: space_urls,
        }));
        
        // Add NOAA search engine
        search_engines.push(Box::new(NOAAPublicationSearchEngine {
            http_client: http_client.clone(),
            base_url: "https://repository.library.noaa.gov/fedora/export".to_string(),
        }));

        Ok(Self {
            config,
            http_client,
            search_engines,
        })
    }
    
    /// Schedule publication collection for a specific data source
    pub async fn schedule_collection_for_source(&self, source_id: Uuid) -> Result<(), AppError> {
        // This would integrate with the scheduler module
        // For now, we'll just trigger immediate collection
        self.collect_publications_for_source(source_id).await
    }
    
    /// Collect all publications associated with a data source
    pub async fn collect_publications_for_source(&self, source_id: Uuid) -> Result<Vec<PublicationRecord>, AppError> {
        let mut all_publications = Vec::new();
        
        // Get data source info (would come from database)
        let source_keywords = self.get_source_keywords(source_id).await?;
        let source_name = self.get_source_name(source_id).await?;
        let known_dois = self.get_source_dois(source_id).await?;
        
        // Search by known DOIs first
        for doi in &known_dois {
            for engine in &self.search_engines {
                if let Ok(Some(publication)) = engine.search_by_doi(doi).await {
                    all_publications.push(publication);
                    sleep(Duration::from_millis(100)).await; // Rate limiting
                }
            }
        }
        
        // Search by dataset name
        for engine in &self.search_engines {
            if let Ok(publications) = engine.search_by_dataset_name(&source_name).await {
                all_publications.extend(publications);
                sleep(Duration::from_millis(200)).await; // Rate limiting
            }
        }
        
        // Search by keywords
        for engine in &self.search_engines {
            if let Ok(publications) = engine.search_by_keywords(&source_keywords).await {
                all_publications.extend(publications);
                sleep(Duration::from_millis(200)).await; // Rate limiting
            }
        }
        
        // Deduplicate by DOI and title
        all_publications = self.deduplicate_publications(all_publications).await?;
        
        // Enhance with citation counts
        for publication in &mut all_publications {
            if let Some(doi) = &publication.doi {
                for engine in &self.search_engines {
                    if let Ok(Some(citations)) = engine.get_citation_count(doi).await {
                        publication.citation_count = Some(citations);
                        break;
                    }
                }
            }
        }
        
        // Calculate relevance scores
        for publication in &mut all_publications {
            publication.relevance_score = Some(
                self.calculate_relevance_score(publication, &source_keywords, &source_name).await?
            );
        }
        
        // Sort by relevance
        all_publications.sort_by(|a, b| {
            b.relevance_score.unwrap_or(0.0).partial_cmp(&a.relevance_score.unwrap_or(0.0))
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        
        Ok(all_publications)
    }
    
    /// Calculate relevance score for a publication
    async fn calculate_relevance_score(
        &self, 
        publication: &PublicationRecord, 
        source_keywords: &[String], 
        source_name: &str
    ) -> Result<f32, AppError> {
        let mut score = 0.0;
        
        // Title relevance
        let title = publication.title.to_lowercase();
        for keyword in source_keywords {
            if title.contains(&keyword.to_lowercase()) {
                score += 2.0;
            }
        }
        
        if title.contains(&source_name.to_lowercase()) {
            score += 5.0;
        }
        
        // Abstract relevance
        if let Some(abstract_text) = &publication.abstract_text {
            let abstract_lower = abstract_text.to_lowercase();
            for keyword in source_keywords {
                if abstract_lower.contains(&keyword.to_lowercase()) {
                    score += 1.0;
                }
            }
        }
        
        // Keywords relevance
        for pub_keyword in &publication.keywords {
            for source_keyword in source_keywords {
                if pub_keyword.to_lowercase().contains(&source_keyword.to_lowercase()) {
                    score += 1.5;
                }
            }
        }
        
        // Citation count boost
        if let Some(citations) = publication.citation_count {
            score += (citations as f32).ln() * 0.5;
        }
        
        // Publication type weighting
        match publication.publication_type {
            PublicationType::PeerReviewedPaper => score *= 1.2,
            PublicationType::DatasetPaper => score *= 1.5,
            PublicationType::TechnicalReport => score *= 1.1,
            PublicationType::Documentation => score *= 1.3,
            _ => {},
        }
        
        Ok(score)
    }
    
    /// Remove duplicate publications
    async fn deduplicate_publications(&self, mut publications: Vec<PublicationRecord>) -> Result<Vec<PublicationRecord>, AppError> {
        let mut seen_dois = std::collections::HashSet::new();
        let mut seen_titles = std::collections::HashSet::new();
        let mut deduplicated = Vec::new();
        
        for publication in publications {
            let mut is_duplicate = false;
            
            // Check DOI duplicates
            if let Some(doi) = &publication.doi {
                if seen_dois.contains(doi) {
                    is_duplicate = true;
                } else {
                    seen_dois.insert(doi.clone());
                }
            }
            
            // Check title duplicates (with fuzzy matching)
            if !is_duplicate {
                let normalized_title = self.normalize_title(&publication.title);
                if seen_titles.contains(&normalized_title) {
                    is_duplicate = true;
                } else {
                    seen_titles.insert(normalized_title);
                }
            }
            
            if !is_duplicate {
                deduplicated.push(publication);
            }
        }
        
        Ok(deduplicated)
    }
    
    /// Normalize title for duplicate detection
    fn normalize_title(&self, title: &str) -> String {
        title.to_lowercase()
            .chars()
            .filter(|c| c.is_alphanumeric() || c.is_whitespace())
            .collect::<String>()
            .split_whitespace()
            .collect::<Vec<&str>>()
            .join(" ")
    }
    
    // Placeholder methods that would fetch from database
    async fn get_source_keywords(&self, _source_id: Uuid) -> Result<Vec<String>, AppError> {
        // Would fetch from database
        Ok(vec![
            "MODIS".to_string(),
            "remote sensing".to_string(),
            "vegetation index".to_string(),
            "land surface temperature".to_string(),
        ])
    }
    
    async fn get_source_name(&self, _source_id: Uuid) -> Result<String, AppError> {
        // Would fetch from database
        Ok("MODIS Terra".to_string())
    }
    
    async fn get_source_dois(&self, _source_id: Uuid) -> Result<Vec<String>, AppError> {
        // Would fetch known DOIs from database
        Ok(vec![
            "10.5067/MODIS/MOD09GA.006".to_string(),
            "10.5067/MODIS/MOD11A1.006".to_string(),
        ])
    }
}

// Implementation of search engines

#[async_trait::async_trait]
impl PublicationSearchEngine for CrossRefSearchEngine {
    async fn search_by_doi(&self, doi: &str) -> Result<Option<PublicationRecord>, AppError> {
        let url = format!("{}/works/{}", self.base_url, doi);
        
        let response = self.http_client
            .get(&url)
            .header("User-Agent", "Buhera-West/1.0 (mailto:contact@buhera-west.com)")
            .send()
            .await
            .map_err(|e| AppError::external_service("CrossRef", &format!("DOI search failed: {}", e)))?;
        
        if response.status().is_success() {
            let data: serde_json::Value = response.json().await
                .map_err(|e| AppError::external_service("CrossRef", &format!("JSON parse failed: {}", e)))?;
            
            if let Some(message) = data.get("message") {
                let publication = self.parse_crossref_work(message)?;
                return Ok(Some(publication));
            }
        }
        
        Ok(None)
    }
    
    async fn search_by_keywords(&self, keywords: &[String]) -> Result<Vec<PublicationRecord>, AppError> {
        let query = keywords.join(" ");
        let url = format!("{}/works?query={}&rows=20", self.base_url, urlencoding::encode(&query));
        
        let response = self.http_client
            .get(&url)
            .header("User-Agent", "Buhera-West/1.0 (mailto:contact@buhera-west.com)")
            .send()
            .await
            .map_err(|e| AppError::external_service("CrossRef", &format!("Keyword search failed: {}", e)))?;
        
        if response.status().is_success() {
            let data: serde_json::Value = response.json().await
                .map_err(|e| AppError::external_service("CrossRef", &format!("JSON parse failed: {}", e)))?;
            
            let mut publications = Vec::new();
            
            if let Some(items) = data.get("message").and_then(|m| m.get("items")).and_then(|i| i.as_array()) {
                for item in items.iter().take(10) {
                    if let Ok(publication) = self.parse_crossref_work(item) {
                        publications.push(publication);
                    }
                }
            }
            
            return Ok(publications);
        }
        
        Ok(vec![])
    }
    
    async fn search_by_dataset_name(&self, dataset_name: &str) -> Result<Vec<PublicationRecord>, AppError> {
        let query = format!("\"{}\"", dataset_name);
        let url = format!("{}/works?query={}&rows=15", self.base_url, urlencoding::encode(&query));
        
        let response = self.http_client
            .get(&url)
            .header("User-Agent", "Buhera-West/1.0 (mailto:contact@buhera-west.com)")
            .send()
            .await
            .map_err(|e| AppError::external_service("CrossRef", &format!("Dataset search failed: {}", e)))?;
        
        if response.status().is_success() {
            let data: serde_json::Value = response.json().await
                .map_err(|e| AppError::external_service("CrossRef", &format!("JSON parse failed: {}", e)))?;
            
            let mut publications = Vec::new();
            
            if let Some(items) = data.get("message").and_then(|m| m.get("items")).and_then(|i| i.as_array()) {
                for item in items.iter().take(8) {
                    if let Ok(publication) = self.parse_crossref_work(item) {
                        publications.push(publication);
                    }
                }
            }
            
            return Ok(publications);
        }
        
        Ok(vec![])
    }
    
    async fn get_citation_count(&self, doi: &str) -> Result<Option<u32>, AppError> {
        let url = format!("{}/works/{}", self.base_url, doi);
        
        let response = self.http_client
            .get(&url)
            .header("User-Agent", "Buhera-West/1.0 (mailto:contact@buhera-west.com)")
            .send()
            .await
            .map_err(|e| AppError::external_service("CrossRef", &format!("Citation count failed: {}", e)))?;
        
        if response.status().is_success() {
            let data: serde_json::Value = response.json().await
                .map_err(|e| AppError::external_service("CrossRef", &format!("JSON parse failed: {}", e)))?;
            
            if let Some(count) = data.get("message")
                .and_then(|m| m.get("is-referenced-by-count"))
                .and_then(|c| c.as_u64()) {
                return Ok(Some(count as u32));
            }
        }
        
        Ok(None)
    }
}

impl CrossRefSearchEngine {
    fn parse_crossref_work(&self, work: &serde_json::Value) -> Result<PublicationRecord, AppError> {
        let title = work.get("title")
            .and_then(|t| t.as_array())
            .and_then(|arr| arr.first())
            .and_then(|t| t.as_str())
            .unwrap_or("Untitled")
            .to_string();
        
        let authors = work.get("author")
            .and_then(|a| a.as_array())
            .map(|authors| {
                authors.iter()
                    .filter_map(|author| {
                        let given = author.get("given").and_then(|g| g.as_str()).unwrap_or("");
                        let family = author.get("family").and_then(|f| f.as_str()).unwrap_or("");
                        if !given.is_empty() || !family.is_empty() {
                            Some(format!("{} {}", given, family).trim().to_string())
                        } else {
                            None
                        }
                    })
                    .collect()
            })
            .unwrap_or_default();
        
        let journal = work.get("container-title")
            .and_then(|j| j.as_array())
            .and_then(|arr| arr.first())
            .and_then(|j| j.as_str())
            .map(|s| s.to_string());
        
        let doi = work.get("DOI")
            .and_then(|d| d.as_str())
            .map(|s| s.to_string());
        
        let url = work.get("URL")
            .and_then(|u| u.as_str())
            .map(|s| s.to_string());
        
        let abstract_text = work.get("abstract")
            .and_then(|a| a.as_str())
            .map(|s| s.to_string());
        
        let publication_date = work.get("published-print")
            .or_else(|| work.get("published-online"))
            .and_then(|p| p.get("date-parts"))
            .and_then(|dp| dp.as_array())
            .and_then(|arr| arr.first())
            .and_then(|date| date.as_array())
            .and_then(|parts| {
                if parts.len() >= 3 {
                    let year = parts[0].as_i64()?;
                    let month = parts[1].as_i64()?;
                    let day = parts[2].as_i64()?;
                    chrono::Utc.with_ymd_and_hms(year as i32, month as u32, day as u32, 0, 0, 0).single()
                } else {
                    None
                }
            });
        
        let citation_count = work.get("is-referenced-by-count")
            .and_then(|c| c.as_u64())
            .map(|c| c as u32);
        
        Ok(PublicationRecord {
            id: Uuid::new_v4(),
            title,
            authors,
            journal,
            publication_date,
            doi,
            url,
            abstract_text,
            keywords: vec![],
            associated_data_sources: vec![],
            publication_type: PublicationType::PeerReviewedPaper,
            citation_count,
            relevance_score: None,
        })
    }
}

#[async_trait::async_trait]
impl PublicationSearchEngine for ArXivSearchEngine {
    async fn search_by_doi(&self, _doi: &str) -> Result<Option<PublicationRecord>, AppError> {
        // arXiv doesn't use DOIs, return None
        Ok(None)
    }
    
    async fn search_by_keywords(&self, keywords: &[String]) -> Result<Vec<PublicationRecord>, AppError> {
        let query = keywords.join(" AND ");
        let url = format!("{}?search_query=all:{}&start=0&max_results=20", 
            self.base_url, urlencoding::encode(&query));
        
        let response = self.http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| AppError::external_service("ArXiv", &format!("Search failed: {}", e)))?;
        
        if response.status().is_success() {
            let xml_text = response.text().await
                .map_err(|e| AppError::external_service("ArXiv", &format!("Text parse failed: {}", e)))?;
            
            return self.parse_arxiv_xml(&xml_text);
        }
        
        Ok(vec![])
    }
    
    async fn search_by_dataset_name(&self, dataset_name: &str) -> Result<Vec<PublicationRecord>, AppError> {
        let url = format!("{}?search_query=all:\"{}\"&start=0&max_results=15", 
            self.base_url, urlencoding::encode(dataset_name));
        
        let response = self.http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| AppError::external_service("ArXiv", &format!("Dataset search failed: {}", e)))?;
        
        if response.status().is_success() {
            let xml_text = response.text().await
                .map_err(|e| AppError::external_service("ArXiv", &format!("Text parse failed: {}", e)))?;
            
            return self.parse_arxiv_xml(&xml_text);
        }
        
        Ok(vec![])
    }
    
    async fn get_citation_count(&self, _doi: &str) -> Result<Option<u32>, AppError> {
        // arXiv doesn't provide citation counts directly
        Ok(None)
    }
}

impl ArXivSearchEngine {
    fn parse_arxiv_xml(&self, xml: &str) -> Result<Vec<PublicationRecord>, AppError> {
        let mut publications = Vec::new();
        
        // Simple XML parsing for arXiv entries
        // In a real implementation, you'd use a proper XML parser like quick-xml
        let entries: Vec<&str> = xml.split("<entry>").collect();
        
        for entry in entries.iter().skip(1).take(10) {
            if let Some(end_pos) = entry.find("</entry>") {
                let entry_xml = &entry[..end_pos];
                
                let title = self.extract_xml_field(entry_xml, "title")
                    .unwrap_or("Untitled".to_string());
                
                let authors = self.extract_arxiv_authors(entry_xml);
                
                let abstract_text = self.extract_xml_field(entry_xml, "summary");
                
                let url = self.extract_xml_field(entry_xml, "id");
                
                let publication_date = self.extract_xml_field(entry_xml, "published")
                    .and_then(|date_str| chrono::DateTime::parse_from_rfc3339(&date_str).ok())
                    .map(|dt| dt.with_timezone(&Utc));
                
                let publication = PublicationRecord {
                    id: Uuid::new_v4(),
                    title,
                    authors,
                    journal: Some("arXiv".to_string()),
                    publication_date,
                    doi: None,
                    url,
                    abstract_text,
                    keywords: vec![],
                    associated_data_sources: vec![],
                    publication_type: PublicationType::Preprint,
                    citation_count: None,
                    relevance_score: None,
                };
                
                publications.push(publication);
            }
        }
        
        Ok(publications)
    }
    
    fn extract_xml_field(&self, xml: &str, field: &str) -> Option<String> {
        let start_tag = format!("<{}>", field);
        let end_tag = format!("</{}>", field);
        
        if let Some(start_pos) = xml.find(&start_tag) {
            let content_start = start_pos + start_tag.len();
            if let Some(end_pos) = xml[content_start..].find(&end_tag) {
                let content = &xml[content_start..content_start + end_pos];
                return Some(content.trim().to_string());
            }
        }
        
        None
    }
    
    fn extract_arxiv_authors(&self, xml: &str) -> Vec<String> {
        let mut authors = Vec::new();
        let author_sections: Vec<&str> = xml.split("<author>").collect();
        
        for section in author_sections.iter().skip(1) {
            if let Some(end_pos) = section.find("</author>") {
                let author_xml = &section[..end_pos];
                if let Some(name) = self.extract_xml_field(author_xml, "name") {
                    authors.push(name);
                }
            }
        }
        
        authors
    }
}

#[async_trait::async_trait]
impl PublicationSearchEngine for PubMedSearchEngine {
    async fn search_by_doi(&self, doi: &str) -> Result<Option<PublicationRecord>, AppError> {
        let url = format!("{}/esearch.fcgi?db=pubmed&term={}[DOI]&retmode=json", 
            self.base_url, urlencoding::encode(doi));
        
        let mut request = self.http_client.get(&url);
        if let Some(api_key) = &self.api_key {
            request = request.query(&[("api_key", api_key)]);
        }
        
        let response = request.send().await
            .map_err(|e| AppError::external_service("PubMed", &format!("DOI search failed: {}", e)))?;
        
        if response.status().is_success() {
            let data: serde_json::Value = response.json().await
                .map_err(|e| AppError::external_service("PubMed", &format!("JSON parse failed: {}", e)))?;
            
            if let Some(pmids) = data.get("esearchresult")
                .and_then(|r| r.get("idlist"))
                .and_then(|ids| ids.as_array()) {
                
                if let Some(pmid) = pmids.first().and_then(|id| id.as_str()) {
                    return self.fetch_pubmed_details(pmid).await.map(Some);
                }
            }
        }
        
        Ok(None)
    }
    
    async fn search_by_keywords(&self, keywords: &[String]) -> Result<Vec<PublicationRecord>, AppError> {
        let query = keywords.join(" AND ");
        let url = format!("{}/esearch.fcgi?db=pubmed&term={}&retmax=20&retmode=json", 
            self.base_url, urlencoding::encode(&query));
        
        let mut request = self.http_client.get(&url);
        if let Some(api_key) = &self.api_key {
            request = request.query(&[("api_key", api_key)]);
        }
        
        let response = request.send().await
            .map_err(|e| AppError::external_service("PubMed", &format!("Keyword search failed: {}", e)))?;
        
        if response.status().is_success() {
            let data: serde_json::Value = response.json().await
                .map_err(|e| AppError::external_service("PubMed", &format!("JSON parse failed: {}", e)))?;
            
            let mut publications = Vec::new();
            
            if let Some(pmids) = data.get("esearchresult")
                .and_then(|r| r.get("idlist"))
                .and_then(|ids| ids.as_array()) {
                
                for pmid in pmids.iter().take(10) {
                    if let Some(pmid_str) = pmid.as_str() {
                        if let Ok(publication) = self.fetch_pubmed_details(pmid_str).await {
                            publications.push(publication);
                        }
                        // Rate limiting
                        tokio::time::sleep(Duration::from_millis(100)).await;
                    }
                }
            }
            
            return Ok(publications);
        }
        
        Ok(vec![])
    }
    
    async fn search_by_dataset_name(&self, dataset_name: &str) -> Result<Vec<PublicationRecord>, AppError> {
        let query = format!("\"{}\"", dataset_name);
        let url = format!("{}/esearch.fcgi?db=pubmed&term={}&retmax=15&retmode=json", 
            self.base_url, urlencoding::encode(&query));
        
        let mut request = self.http_client.get(&url);
        if let Some(api_key) = &self.api_key {
            request = request.query(&[("api_key", api_key)]);
        }
        
        let response = request.send().await
            .map_err(|e| AppError::external_service("PubMed", &format!("Dataset search failed: {}", e)))?;
        
        if response.status().is_success() {
            let data: serde_json::Value = response.json().await
                .map_err(|e| AppError::external_service("PubMed", &format!("JSON parse failed: {}", e)))?;
            
            let mut publications = Vec::new();
            
            if let Some(pmids) = data.get("esearchresult")
                .and_then(|r| r.get("idlist"))
                .and_then(|ids| ids.as_array()) {
                
                for pmid in pmids.iter().take(8) {
                    if let Some(pmid_str) = pmid.as_str() {
                        if let Ok(publication) = self.fetch_pubmed_details(pmid_str).await {
                            publications.push(publication);
                        }
                        // Rate limiting
                        tokio::time::sleep(Duration::from_millis(150)).await;
                    }
                }
            }
            
            return Ok(publications);
        }
        
        Ok(vec![])
    }
    
    async fn get_citation_count(&self, _doi: &str) -> Result<Option<u32>, AppError> {
        // PubMed doesn't provide citation counts directly
        Ok(None)
    }
}

impl PubMedSearchEngine {
    async fn fetch_pubmed_details(&self, pmid: &str) -> Result<PublicationRecord, AppError> {
        let url = format!("{}/efetch.fcgi?db=pubmed&id={}&retmode=xml", self.base_url, pmid);
        
        let mut request = self.http_client.get(&url);
        if let Some(api_key) = &self.api_key {
            request = request.query(&[("api_key", api_key)]);
        }
        
        let response = request.send().await
            .map_err(|e| AppError::external_service("PubMed", &format!("Detail fetch failed: {}", e)))?;
        
        if response.status().is_success() {
            let xml_text = response.text().await
                .map_err(|e| AppError::external_service("PubMed", &format!("XML parse failed: {}", e)))?;
            
            return self.parse_pubmed_xml(&xml_text);
        }
        
        Err(AppError::external_service("PubMed", "Failed to fetch article details"))
    }
    
    fn parse_pubmed_xml(&self, xml: &str) -> Result<PublicationRecord, AppError> {
        // Simple XML parsing for PubMed articles
        // In a real implementation, you'd use a proper XML parser
        
        let title = self.extract_xml_content(xml, "ArticleTitle")
            .unwrap_or("Untitled".to_string());
        
        let abstract_text = self.extract_xml_content(xml, "AbstractText");
        
        let journal = self.extract_xml_content(xml, "Title");
        
        let authors = self.extract_pubmed_authors(xml);
        
        let doi = self.extract_pubmed_doi(xml);
        
        let publication_date = self.extract_pubmed_date(xml);
        
        Ok(PublicationRecord {
            id: Uuid::new_v4(),
            title,
            authors,
            journal,
            publication_date,
            doi,
            url: None,
            abstract_text,
            keywords: vec![],
            associated_data_sources: vec![],
            publication_type: PublicationType::PeerReviewedPaper,
            citation_count: None,
            relevance_score: None,
        })
    }
    
    fn extract_xml_content(&self, xml: &str, tag: &str) -> Option<String> {
        let start_tag = format!("<{}", tag);
        let end_tag = format!("</{}>", tag);
        
        if let Some(start_pos) = xml.find(&start_tag) {
            if let Some(content_start) = xml[start_pos..].find('>') {
                let content_start = start_pos + content_start + 1;
                if let Some(end_pos) = xml[content_start..].find(&end_tag) {
                    let content = &xml[content_start..content_start + end_pos];
                    return Some(content.trim().to_string());
                }
            }
        }
        
        None
    }
    
    fn extract_pubmed_authors(&self, xml: &str) -> Vec<String> {
        let mut authors = Vec::new();
        let author_sections: Vec<&str> = xml.split("<Author ").collect();
        
        for section in author_sections.iter().skip(1) {
            if let Some(end_pos) = section.find("</Author>") {
                let author_xml = &section[..end_pos];
                
                let last_name = self.extract_xml_content(author_xml, "LastName").unwrap_or_default();
                let first_name = self.extract_xml_content(author_xml, "ForeName").unwrap_or_default();
                
                if !last_name.is_empty() || !first_name.is_empty() {
                    authors.push(format!("{} {}", first_name, last_name).trim().to_string());
                }
            }
        }
        
        authors
    }
    
    fn extract_pubmed_doi(&self, xml: &str) -> Option<String> {
        // Look for DOI in ArticleId elements
        let doi_sections: Vec<&str> = xml.split("<ArticleId IdType=\"doi\">").collect();
        
        if doi_sections.len() > 1 {
            if let Some(end_pos) = doi_sections[1].find("</ArticleId>") {
                let doi = &doi_sections[1][..end_pos];
                return Some(doi.trim().to_string());
            }
        }
        
        None
    }
    
    fn extract_pubmed_date(&self, xml: &str) -> Option<DateTime<Utc>> {
        // Extract publication date from PubDate
        if let Some(year_str) = self.extract_xml_content(xml, "Year") {
            if let Ok(year) = year_str.parse::<i32>() {
                let month = self.extract_xml_content(xml, "Month")
                    .and_then(|m| m.parse::<u32>().ok())
                    .unwrap_or(1);
                let day = self.extract_xml_content(xml, "Day")
                    .and_then(|d| d.parse::<u32>().ok())
                    .unwrap_or(1);
                
                return chrono::Utc.with_ymd_and_hms(year, month, day, 0, 0, 0).single();
            }
        }
        
        None
    }
}

// Implement stub implementations for other search engines
#[async_trait::async_trait]
impl PublicationSearchEngine for GoogleScholarSearchEngine {
    async fn search_by_doi(&self, _doi: &str) -> Result<Option<PublicationRecord>, AppError> {
        // Google Scholar search by DOI - would require SerpAPI or similar
        Ok(None)
    }
    
    async fn search_by_keywords(&self, _keywords: &[String]) -> Result<Vec<PublicationRecord>, AppError> {
        // Google Scholar search - would require SerpAPI key
        Ok(vec![])
    }
    
    async fn search_by_dataset_name(&self, _dataset_name: &str) -> Result<Vec<PublicationRecord>, AppError> {
        Ok(vec![])
    }
    
    async fn get_citation_count(&self, _doi: &str) -> Result<Option<u32>, AppError> {
        Ok(None)
    }
}

#[async_trait::async_trait]
impl PublicationSearchEngine for SpaceAgencySearchEngine {
    async fn search_by_doi(&self, _doi: &str) -> Result<Option<PublicationRecord>, AppError> {
        Ok(None)
    }
    
    async fn search_by_keywords(&self, keywords: &[String]) -> Result<Vec<PublicationRecord>, AppError> {
        let mut all_publications = Vec::new();
        
        // Search NASA Technical Reports Server
        if let Some(nasa_url) = self.base_urls.get("NASA") {
            let query = keywords.join(" ");
            let url = format!("{}?q={}&size=10", nasa_url, urlencoding::encode(&query));
            
            if let Ok(response) = self.http_client.get(&url).send().await {
                if response.status().is_success() {
                    if let Ok(data) = response.json::<serde_json::Value>().await {
                        // Parse NASA NTRS response format
                        all_publications.extend(self.parse_nasa_ntrs(&data));
                    }
                }
            }
        }
        
        Ok(all_publications)
    }
    
    async fn search_by_dataset_name(&self, dataset_name: &str) -> Result<Vec<PublicationRecord>, AppError> {
        let keywords = vec![dataset_name.to_string()];
        self.search_by_keywords(&keywords).await
    }
    
    async fn get_citation_count(&self, _doi: &str) -> Result<Option<u32>, AppError> {
        Ok(None)
    }
}

impl SpaceAgencySearchEngine {
    fn parse_nasa_ntrs(&self, data: &serde_json::Value) -> Vec<PublicationRecord> {
        let mut publications = Vec::new();
        
        if let Some(results) = data.get("results").and_then(|r| r.as_array()) {
            for result in results.iter().take(5) {
                let title = result.get("title").and_then(|t| t.as_str()).unwrap_or("Untitled").to_string();
                let authors = result.get("authors")
                    .and_then(|a| a.as_array())
                    .map(|authors| {
                        authors.iter()
                            .filter_map(|author| author.as_str())
                            .map(|s| s.to_string())
                            .collect()
                    })
                    .unwrap_or_default();
                
                let abstract_text = result.get("abstract").and_then(|a| a.as_str()).map(|s| s.to_string());
                let url = result.get("downloadUrl").and_then(|u| u.as_str()).map(|s| s.to_string());
                
                let publication = PublicationRecord {
                    id: Uuid::new_v4(),
                    title,
                    authors,
                    journal: Some("NASA Technical Reports".to_string()),
                    publication_date: None,
                    doi: None,
                    url,
                    abstract_text,
                    keywords: vec![],
                    associated_data_sources: vec![],
                    publication_type: PublicationType::TechnicalReport,
                    citation_count: None,
                    relevance_score: None,
                };
                
                publications.push(publication);
            }
        }
        
        publications
    }
}

#[async_trait::async_trait]
impl PublicationSearchEngine for NOAAPublicationSearchEngine {
    async fn search_by_doi(&self, _doi: &str) -> Result<Option<PublicationRecord>, AppError> {
        Ok(None)
    }
    
    async fn search_by_keywords(&self, keywords: &[String]) -> Result<Vec<PublicationRecord>, AppError> {
        let query = keywords.join(" ");
        let url = format!("{}?q={}&format=json", self.base_url, urlencoding::encode(&query));
        
        let response = self.http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| AppError::external_service("NOAA", &format!("Search failed: {}", e)))?;
        
        if response.status().is_success() {
            let data: serde_json::Value = response.json().await
                .map_err(|e| AppError::external_service("NOAA", &format!("JSON parse failed: {}", e)))?;
            
            return Ok(self.parse_noaa_publications(&data));
        }
        
        Ok(vec![])
    }
    
    async fn search_by_dataset_name(&self, dataset_name: &str) -> Result<Vec<PublicationRecord>, AppError> {
        let keywords = vec![dataset_name.to_string()];
        self.search_by_keywords(&keywords).await
    }
    
    async fn get_citation_count(&self, _doi: &str) -> Result<Option<u32>, AppError> {
        Ok(None)
    }
}

impl NOAAPublicationSearchEngine {
    fn parse_noaa_publications(&self, data: &serde_json::Value) -> Vec<PublicationRecord> {
        let mut publications = Vec::new();
        
        if let Some(items) = data.get("items").and_then(|i| i.as_array()) {
            for item in items.iter().take(8) {
                let title = item.get("title").and_then(|t| t.as_str()).unwrap_or("Untitled").to_string();
                let abstract_text = item.get("description").and_then(|d| d.as_str()).map(|s| s.to_string());
                let url = item.get("link").and_then(|l| l.as_str()).map(|s| s.to_string());
                
                let publication = PublicationRecord {
                    id: Uuid::new_v4(),
                    title,
                    authors: vec![],
                    journal: Some("NOAA Repository".to_string()),
                    publication_date: None,
                    doi: None,
                    url,
                    abstract_text,
                    keywords: vec![],
                    associated_data_sources: vec![],
                    publication_type: PublicationType::TechnicalReport,
                    citation_count: None,
                    relevance_score: None,
                };
                
                publications.push(publication);
            }
        }
        
        publications
    }
} 