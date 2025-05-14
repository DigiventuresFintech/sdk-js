import { AuthManager } from './auth';
import { HttpClient } from './client';
import { RecordService } from './record';
import { DigiConfig, FileResponse } from './types';

export class DigiSDK {
  private authManager: AuthManager;
  private client: HttpClient;
  public record: RecordService;

  constructor(config: DigiConfig) {
    this.authManager = new AuthManager(config);
    this.client = new HttpClient(config, this.authManager);
    this.record = new RecordService(this.client, this.authManager);
  }

  /**
   * Gets a file from a URL
   * @param fileUrl The URL of the file
   * @returns The file content as base64
   */
  async getFile(fileUrl: string): Promise<FileResponse> {
    // Extract just the path portion if a full URL is provided
    const url = fileUrl.startsWith('http')
      ? new URL(fileUrl).pathname
      : fileUrl;
    
    const response = await this.client.get<FileResponse>(url);
    return response.data;
  }
} 