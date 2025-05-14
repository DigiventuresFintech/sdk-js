import { HttpClient } from './client';
import { DigiRecord, RecordCreateData, RecordUpdateData } from './types';
import { AuthManager } from './auth';

export class RecordService {
  private client: HttpClient;
  private authManager: AuthManager;

  constructor(client: HttpClient, authManager: AuthManager) {
    this.client = client;
    this.authManager = authManager;
  }

  /**
   * Gets the API version path prefix
   * @returns The API version path (e.g. "/1.0")
   */
  private getApiVersionPath(): string {
    const version = this.authManager.getApiVersion() || '1.0';
    return `/${version}`;
  }

  /**
   * Creates a new record
   * @param data The data for the new record
   * @param strategy Creation strategy (IGNORE, COMPLETE, OVERRIDE)
   * @returns The created record
   */
  async create(data: RecordCreateData, strategy?: 'IGNORE' | 'COMPLETE' | 'OVERRIDE'): Promise<DigiRecord> {
    const headers: Record<string, string> = {};
    if (strategy) {
      headers['strategy'] = strategy;
    }

    const response = await this.client.post<DigiRecord>(`${this.getApiVersionPath()}/legajo`, data, {
      headers
    });
    
    return response.data;
  }

  /**
   * Gets a record by ID
   * @param recordId The ID of the record
   * @returns The record
   */
  async get(recordId: string): Promise<DigiRecord> {
    const response = await this.client.get<DigiRecord>(`${this.getApiVersionPath()}/legajo/${recordId}`);
    return response.data;
  }

  /**
   * Updates a record
   * @param recordId The ID of the record to update
   * @param data The data to update
   * @returns The updated record
   */
  async update(recordId: string, data: RecordUpdateData): Promise<DigiRecord> {
    const response = await this.client.put<DigiRecord>(`${this.getApiVersionPath()}/legajo/${recordId}`, data);
    return response.data;
  }

  /**
   * Gets the recovery link from a record
   * @param record Either a record ID or a record object
   * @returns The recovery link or null if not found
   */
  async getLinkRecover(record: string | DigiRecord): Promise<string | null> {
    // If a string is provided, fetch the record first
    if (typeof record === 'string') {
      record = await this.get(record);
    }
    
    // Return the linkRecover property if it exists
    return record.linkRecover || null;
  }

  /**
   * Gets the applicant link from a record
   * @param record Either a record ID or a record object
   * @returns The applicant link or null if not found
   */
  async getLinkApplicant(record: string | DigiRecord): Promise<string | null> {
    // If a string is provided, fetch the record first
    if (typeof record === 'string') {
      record = await this.get(record);
    }
    
    // Return the linkApplicant property if it exists
    return (record as any).linkApplicant || null;
  }
} 