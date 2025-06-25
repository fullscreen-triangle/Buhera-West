use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::time::{sleep, Duration};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use reqwest::Client;

use crate::config::Config;
use crate::error::AppError;
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