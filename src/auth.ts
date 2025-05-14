import axios from 'axios';
import { AuthToken, DigiConfig } from './types';

export class AuthManager {
  private config: DigiConfig;
  private token: string | null = null;
  private expirationTime: Date | null = null;
  private apiVersion: string | null = null;
  private authRetry: boolean = false;
  private baseUrl: string;

  constructor(config: DigiConfig) {
    this.config = config;
    this.baseUrl = this.getBaseUrl(config.environment);
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

  async getToken(): Promise<string> {
    // If we have a token and it's not expired, return it
    if (this.token && this.expirationTime && new Date() < this.expirationTime) {
      return this.token;
    }

    // Otherwise, get a new token
    return this.fetchNewToken();
  }

  async fetchNewToken(): Promise<string> {
    try {
      const { applicationId, secret } = this.config;
      const url = `${this.baseUrl}/authorization/${applicationId}/${secret}`;
      
      console.log(`Fetching new token from: ${url}`);
      const response = await axios.get<AuthToken>(url, {
        timeout: this.config.timeout || 10000
      });
      
      console.log('Auth response data:', response.data);
      
      this.token = response.data.authorization;
      this.expirationTime = new Date(response.data.expiration);
      this.apiVersion = response.data.api?.version || null;
      this.authRetry = false;
      
      if (this.token === null) {
        console.error('Authentication response:', response.data);
        throw new Error('Authentication response missing authorization token');
      }
      
      return this.token;
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getApiVersion(): string | null {
    return this.apiVersion;
  }

  // Reset auth retry flag when a request succeeds
  resetAuthRetry(): void {
    this.authRetry = false;
  }

  // Check if we've already tried to refresh the token
  hasRetried(): boolean {
    return this.authRetry;
  }

  // Mark that we've tried to refresh the token
  markRetry(): void {
    this.authRetry = true;
  }
} 