use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::env;

/// Application configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    // Server configuration
    pub api_host: String,
    pub api_port: u16,
    pub metrics_port: u16,
    
    // Database configuration
    pub database_url: String,
    pub redis_url: String,
    pub max_connections: u32,
    
    // Weather API configuration
    pub openweather_api_key: String,
    pub mapbox_access_token: String,
    pub weather_api_keys: Vec<String>,
    
    // External APIs
    pub ecmwf_api_key: Option<String>,
    pub noaa_api_key: Option<String>,
    pub nasa_api_key: Option<String>,
    
    // Security
    pub jwt_secret: String,
    pub encryption_key: String,
    
    // Performance
    pub worker_threads: usize,
    pub cache_ttl_seconds: u64,
    
    // File storage
    pub data_storage_path: String,
    pub backup_storage_path: String,
    
    // Email configuration for alerts
    pub smtp_host: Option<String>,
    pub smtp_port: Option<u16>,
    pub smtp_username: Option<String>,
    pub smtp_password: Option<String>,
}

impl Config {
    /// Load configuration from environment variables
    pub fn load() -> Result<Self> {
        // Load .env file if it exists
        dotenvy::dotenv().ok();

        let config = Config {
            // Server configuration
            api_host: env::var("API_HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            api_port: env::var("API_PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .context("Invalid API_PORT")?,
            metrics_port: env::var("METRICS_PORT")
                .unwrap_or_else(|_| "9090".to_string())
                .parse()
                .context("Invalid METRICS_PORT")?,

            // Database configuration
            database_url: env::var("DATABASE_URL")
                .context("DATABASE_URL must be set")?,
            redis_url: env::var("REDIS_URL")
                .context("REDIS_URL must be set")?,
            max_connections: env::var("MAX_CONNECTIONS")
                .unwrap_or_else(|_| "100".to_string())
                .parse()
                .context("Invalid MAX_CONNECTIONS")?,

            // Weather API configuration
            openweather_api_key: env::var("OPENWEATHER_API_KEY")
                .context("OPENWEATHER_API_KEY must be set")?,
            mapbox_access_token: env::var("MAPBOX_ACCESS_TOKEN")
                .context("MAPBOX_ACCESS_TOKEN must be set")?,
            weather_api_keys: env::var("WEATHER_API_KEYS")
                .unwrap_or_default()
                .split(',')
                .filter(|s| !s.is_empty())
                .map(|s| s.trim().to_string())
                .collect(),

            // External APIs (optional)
            ecmwf_api_key: env::var("ECMWF_API_KEY").ok(),
            noaa_api_key: env::var("NOAA_API_KEY").ok(),
            nasa_api_key: env::var("NASA_API_KEY").ok(),

            // Security
            jwt_secret: env::var("JWT_SECRET")
                .context("JWT_SECRET must be set")?,
            encryption_key: env::var("ENCRYPTION_KEY")
                .context("ENCRYPTION_KEY must be set")?,

            // Performance
            worker_threads: env::var("WORKER_THREADS")
                .unwrap_or_else(|_| num_cpus::get().to_string())
                .parse()
                .context("Invalid WORKER_THREADS")?,
            cache_ttl_seconds: env::var("CACHE_TTL_SECONDS")
                .unwrap_or_else(|_| "3600".to_string())
                .parse()
                .context("Invalid CACHE_TTL_SECONDS")?,

            // File storage
            data_storage_path: env::var("DATA_STORAGE_PATH")
                .unwrap_or_else(|_| "./data".to_string()),
            backup_storage_path: env::var("BACKUP_STORAGE_PATH")
                .unwrap_or_else(|_| "./backups".to_string()),

            // Email configuration
            smtp_host: env::var("SMTP_HOST").ok(),
            smtp_port: env::var("SMTP_PORT")
                .ok()
                .and_then(|p| p.parse().ok()),
            smtp_username: env::var("SMTP_USERNAME").ok(),
            smtp_password: env::var("SMTP_PASSWORD").ok(),
        };

        // Validate configuration
        config.validate()?;

        Ok(config)
    }

    /// Validate configuration
    fn validate(&self) -> Result<()> {
        // Validate JWT secret length
        if self.jwt_secret.len() < 32 {
            anyhow::bail!("JWT_SECRET must be at least 32 characters long");
        }

        // Validate encryption key length
        if self.encryption_key.len() < 32 {
            anyhow::bail!("ENCRYPTION_KEY must be at least 32 characters long");
        }

        // Validate port ranges
        if self.api_port == 0 || self.api_port > 65535 {
            anyhow::bail!("API_PORT must be between 1 and 65535");
        }

        if self.metrics_port == 0 || self.metrics_port > 65535 {
            anyhow::bail!("METRICS_PORT must be between 1 and 65535");
        }

        // Validate database URL format
        if !self.database_url.starts_with("postgresql://") {
            anyhow::bail!("DATABASE_URL must be a PostgreSQL connection string");
        }

        // Validate Redis URL format
        if !self.redis_url.starts_with("redis://") {
            anyhow::bail!("REDIS_URL must be a Redis connection string");
        }

        // Validate worker threads
        if self.worker_threads == 0 {
            anyhow::bail!("WORKER_THREADS must be greater than 0");
        }

        // Validate SMTP configuration (if provided)
        if let (Some(_), Some(_), Some(_), Some(_)) = (
            &self.smtp_host,
            &self.smtp_port,
            &self.smtp_username,
            &self.smtp_password,
        ) {
            // All SMTP fields are provided - configuration is valid
        } else if self.smtp_host.is_some() 
            || self.smtp_port.is_some()
            || self.smtp_username.is_some()
            || self.smtp_password.is_some()
        {
            anyhow::bail!("If SMTP is configured, all fields (host, port, username, password) must be provided");
        }

        Ok(())
    }

    /// Check if email notifications are configured
    pub fn has_email_config(&self) -> bool {
        self.smtp_host.is_some()
            && self.smtp_port.is_some()
            && self.smtp_username.is_some()
            && self.smtp_password.is_some()
    }

    /// Get all configured weather API keys
    pub fn get_all_weather_keys(&self) -> Vec<String> {
        let mut keys = vec![self.openweather_api_key.clone()];
        keys.extend(self.weather_api_keys.clone());
        keys
    }

    /// Get external API keys that are configured
    pub fn get_configured_external_apis(&self) -> Vec<(&str, &str)> {
        let mut apis = Vec::new();
        
        if let Some(key) = &self.ecmwf_api_key {
            apis.push(("ECMWF", key.as_str()));
        }
        
        if let Some(key) = &self.noaa_api_key {
            apis.push(("NOAA", key.as_str()));
        }
        
        if let Some(key) = &self.nasa_api_key {
            apis.push(("NASA", key.as_str()));
        }
        
        apis
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_config_validation() {
        // Set required environment variables for testing
        env::set_var("DATABASE_URL", "postgresql://user:pass@localhost/db");
        env::set_var("REDIS_URL", "redis://localhost:6379");
        env::set_var("OPENWEATHER_API_KEY", "test_key");
        env::set_var("MAPBOX_ACCESS_TOKEN", "test_token");
        env::set_var("JWT_SECRET", "this_is_a_very_long_secret_key_for_testing_purposes");
        env::set_var("ENCRYPTION_KEY", "this_is_a_very_long_encryption_key_for_testing");

        let config = Config::load();
        assert!(config.is_ok());
    }

    #[test]
    fn test_invalid_jwt_secret() {
        env::set_var("DATABASE_URL", "postgresql://user:pass@localhost/db");
        env::set_var("REDIS_URL", "redis://localhost:6379");
        env::set_var("OPENWEATHER_API_KEY", "test_key");
        env::set_var("MAPBOX_ACCESS_TOKEN", "test_token");
        env::set_var("JWT_SECRET", "short"); // Too short
        env::set_var("ENCRYPTION_KEY", "this_is_a_very_long_encryption_key_for_testing");

        let config = Config::load();
        assert!(config.is_err());
    }
} 