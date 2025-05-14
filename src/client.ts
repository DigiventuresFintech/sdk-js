import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { AuthManager } from './auth';
import { DigiConfig } from './types';

export class HttpClient {
  private client: AxiosInstance;
  private authManager: AuthManager;
  private baseUrl: string;

  constructor(config: DigiConfig, authManager: AuthManager) {
    this.authManager = authManager;
    this.baseUrl = this.getBaseUrl(config.environment);
    
    // Create Axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 10000,
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: config.maxRetries || 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error: AxiosError): boolean => {
        // Only retry on network errors or 5xx errors (except 401 which will be handled separately)
        if (axiosRetry.isNetworkOrIdempotentRequestError(error)) {
          return true;
        }
        
        if (error.response?.status && error.response.status >= 500) {
          return true;
        }
        
        // Explicitly return false for all other cases
        return false;
      }
    });

    // Add auth token to requests
    this.client.interceptors.request.use(async (config) => {
      // If the URL isn't already handling auth (like the auth endpoint itself)
      if (!config.url?.includes('/authorization/')) {
        const token = await this.authManager.getToken();
        
        // Ensure params object exists
        if (!config.params) {
          config.params = {};
        }
        
        // Explicitly add authorization token as a query parameter
        config.params.authorization = token;
        
        // For debugging - log the URL with params
        console.log(`Request URL: ${config.url} with params:`, config.params);
      }
      return config;
    });

    // Handle 401 responses
    this.client.interceptors.response.use(
      (response) => {
        // Reset retry flag on success
        this.authManager.resetAuthRetry();
        return response;
      },
      async (error) => {
        console.error('Request failed:', error.response?.status, error.config?.url);
        
        // If we get a 401 or 500 and haven't retried yet
        if (
          error.response?.status === 401 || 
          error.response?.status === 500
        ) {
          if (!this.authManager.hasRetried()) {
            console.log('Retrying with new token...');
            this.authManager.markRetry();
            
            // Get a fresh token
            await this.authManager.fetchNewToken();
            
            // Retry the original request
            const config = error.config;
            config.params = config.params || {};
            config.params.authorization = await this.authManager.getToken();
            
            console.log(`Retry with token: ${config.params.authorization}`);
            return this.client(config);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  private getBaseUrl(environment: string): string {
    switch (environment) {
      case 'qa':
        return 'https://api.qa.digiventures.la';
      case 'staging':
        return 'https://api.staging.digiventures.la';
      case 'production':
        return 'https://api.production.digiventures.la';
      default:
        throw new Error(`Invalid environment: ${environment}`);
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // Ensure config has params for authorization
    if (!config) config = {};
    if (!config.params) config.params = {};
    if (!config.params.authorization) {
      const token = await this.authManager.getToken();
      config.params.authorization = token;
    }
    return this.client.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // Ensure config has params for authorization
    if (!config) config = {};
    if (!config.params) config.params = {};
    if (!config.params.authorization) {
      const token = await this.authManager.getToken();
      config.params.authorization = token;
    }
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // Ensure config has params for authorization
    if (!config) config = {};
    if (!config.params) config.params = {};
    if (!config.params.authorization) {
      const token = await this.authManager.getToken();
      config.params.authorization = token;
    }
    return this.client.put<T>(url, data, config);
  }
} 