use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

/// Application error types
#[derive(Error, Debug)]
pub enum AppError {
    /// Database errors
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    
    /// Redis errors
    #[error("Cache error: {0}")]
    Cache(#[from] redis::RedisError),
    
    /// HTTP request errors
    #[error("HTTP request error: {0}")]
    Http(#[from] reqwest::Error),
    
    /// JSON parsing errors
    #[error("JSON parsing error: {0}")]
    Json(#[from] serde_json::Error),
    
    /// Configuration errors
    #[error("Configuration error: {0}")]
    Config(#[from] anyhow::Error),
    
    /// Weather API errors
    #[error("Weather API error: {message}")]
    WeatherApi { message: String },
    
    /// Agricultural analysis errors
    #[error("Agricultural analysis error: {message}")]
    Agriculture { message: String },
    
    /// Spatial analysis errors
    #[error("Spatial analysis error: {message}")]
    Spatial { message: String },
    
    /// Forecasting errors
    #[error("Forecasting error: {message}")]
    Forecasting { message: String },
    
    /// Authentication errors
    #[error("Authentication error: {message}")]
    Authentication { message: String },
    
    /// Authorization errors
    #[error("Authorization error: {message}")]
    Authorization { message: String },
    
    /// Validation errors
    #[error("Validation error: {message}")]
    Validation { message: String },
    
    /// Not found errors
    #[error("Resource not found: {message}")]
    NotFound { message: String },
    
    /// Rate limiting errors
    #[error("Rate limit exceeded: {message}")]
    RateLimit { message: String },
    
    /// External service errors
    #[error("External service error: {service}: {message}")]
    ExternalService { service: String, message: String },
    
    /// Internal server errors
    #[error("Internal server error: {message}")]
    Internal { message: String },
}

impl AppError {
    /// Create a new weather API error
    pub fn weather_api<T: Into<String>>(message: T) -> Self {
        Self::WeatherApi {
            message: message.into(),
        }
    }
    
    /// Create a new agricultural analysis error
    pub fn agriculture<T: Into<String>>(message: T) -> Self {
        Self::Agriculture {
            message: message.into(),
        }
    }
    
    /// Create a new spatial analysis error
    pub fn spatial<T: Into<String>>(message: T) -> Self {
        Self::Spatial {
            message: message.into(),
        }
    }
    
    /// Create a new forecasting error
    pub fn forecasting<T: Into<String>>(message: T) -> Self {
        Self::Forecasting {
            message: message.into(),
        }
    }
    
    /// Create a new authentication error
    pub fn authentication<T: Into<String>>(message: T) -> Self {
        Self::Authentication {
            message: message.into(),
        }
    }
    
    /// Create a new authorization error
    pub fn authorization<T: Into<String>>(message: T) -> Self {
        Self::Authorization {
            message: message.into(),
        }
    }
    
    /// Create a new validation error
    pub fn validation<T: Into<String>>(message: T) -> Self {
        Self::Validation {
            message: message.into(),
        }
    }
    
    /// Create a new not found error
    pub fn not_found<T: Into<String>>(message: T) -> Self {
        Self::NotFound {
            message: message.into(),
        }
    }
    
    /// Create a new rate limit error
    pub fn rate_limit<T: Into<String>>(message: T) -> Self {
        Self::RateLimit {
            message: message.into(),
        }
    }
    
    /// Create a new external service error
    pub fn external_service<T: Into<String>, U: Into<String>>(service: T, message: U) -> Self {
        Self::ExternalService {
            service: service.into(),
            message: message.into(),
        }
    }
    
    /// Create a new internal error
    pub fn internal<T: Into<String>>(message: T) -> Self {
        Self::Internal {
            message: message.into(),
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message, error_code) = match &self {
            AppError::Database(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Database operation failed",
                "DATABASE_ERROR",
            ),
            AppError::Cache(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Cache operation failed",
                "CACHE_ERROR",
            ),
            AppError::Http(_) => (
                StatusCode::BAD_GATEWAY,
                "External service request failed",
                "HTTP_ERROR",
            ),
            AppError::Json(_) => (
                StatusCode::BAD_REQUEST,
                "Invalid JSON format",
                "JSON_ERROR",
            ),
            AppError::Config(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Configuration error",
                "CONFIG_ERROR",
            ),
            AppError::WeatherApi { .. } => (
                StatusCode::BAD_GATEWAY,
                "Weather service unavailable",
                "WEATHER_API_ERROR",
            ),
            AppError::Agriculture { .. } => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "Agricultural analysis failed",
                "AGRICULTURE_ERROR",
            ),
            AppError::Spatial { .. } => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "Spatial analysis failed",
                "SPATIAL_ERROR",
            ),
            AppError::Forecasting { .. } => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "Forecasting failed",
                "FORECASTING_ERROR",
            ),
            AppError::Authentication { .. } => (
                StatusCode::UNAUTHORIZED,
                "Authentication failed",
                "AUTH_ERROR",
            ),
            AppError::Authorization { .. } => (
                StatusCode::FORBIDDEN,
                "Insufficient permissions",
                "AUTHZ_ERROR",
            ),
            AppError::Validation { .. } => (
                StatusCode::BAD_REQUEST,
                "Validation failed",
                "VALIDATION_ERROR",
            ),
            AppError::NotFound { .. } => (
                StatusCode::NOT_FOUND,
                "Resource not found",
                "NOT_FOUND",
            ),
            AppError::RateLimit { .. } => (
                StatusCode::TOO_MANY_REQUESTS,
                "Rate limit exceeded",
                "RATE_LIMIT",
            ),
            AppError::ExternalService { service, .. } => (
                StatusCode::BAD_GATEWAY,
                "External service error",
                &format!("EXTERNAL_SERVICE_ERROR_{}", service.to_uppercase()),
            ),
            AppError::Internal { .. } => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error",
                "INTERNAL_ERROR",
            ),
        };

        let body = Json(json!({
            "error": {
                "code": error_code,
                "message": error_message,
                "details": self.to_string(),
                "timestamp": chrono::Utc::now().to_rfc3339(),
            }
        }));

        // Log the error for debugging
        tracing::error!(
            error = %self,
            status_code = %status,
            error_code = %error_code,
            "Request failed"
        );

        (status, body).into_response()
    }
}

/// Result type alias for the application
pub type AppResult<T> = Result<T, AppError>;

/// Utility function to convert any error to AppError::Internal
pub fn internal_error<E: std::fmt::Display>(err: E) -> AppError {
    AppError::internal(err.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::StatusCode;

    #[test]
    fn test_error_status_codes() {
        assert_eq!(
            AppError::validation("test").into_response().status(),
            StatusCode::BAD_REQUEST
        );
        
        assert_eq!(
            AppError::authentication("test").into_response().status(),
            StatusCode::UNAUTHORIZED
        );
        
        assert_eq!(
            AppError::authorization("test").into_response().status(),
            StatusCode::FORBIDDEN
        );
        
        assert_eq!(
            AppError::not_found("test").into_response().status(),
            StatusCode::NOT_FOUND
        );
        
        assert_eq!(
            AppError::rate_limit("test").into_response().status(),
            StatusCode::TOO_MANY_REQUESTS
        );
        
        assert_eq!(
            AppError::internal("test").into_response().status(),
            StatusCode::INTERNAL_SERVER_ERROR
        );
    }
} 