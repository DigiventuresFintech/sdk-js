import { RecordService } from '../src/record';
import { HttpClient } from '../src/client';
import { AuthManager } from '../src/auth';
import nock from 'nock';
import { AxiosResponse } from 'axios';

// Mock dependencies
jest.mock('../src/client');
jest.mock('../src/auth');

describe('RecordService', () => {
  let recordService: RecordService;
  let mockClient: jest.Mocked<HttpClient>;
  let mockAuthManager: jest.Mocked<AuthManager>;

  const mockRecord = {
    _id: 'test-id',
    name: 'John Doe',
    email: 'john.doe@example.com',
    idNumber: '12345678',
    referenceCode: 'REF123',
    linkLandingNext: 'https://example.com/landing',
    linkRecover: 'https://example.com/recover',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mocks
    mockClient = new HttpClient({} as any, {} as any) as jest.Mocked<HttpClient>;
    mockAuthManager = new AuthManager({} as any) as jest.Mocked<AuthManager>;

    // Configure auth manager to return version
    mockAuthManager.getApiVersion.mockReturnValue('1.0');

    // Setup the record service with mocked dependencies
    recordService = new RecordService(mockClient, mockAuthManager);
  });

  describe('create', () => {
    it('should create a record successfully', async () => {
      // Mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockRecord
      };
      mockClient.post.mockResolvedValue(mockResponse as AxiosResponse);

      // Test data
      const recordData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        idNumber: '12345678'
      };

      // Call the method
      const result = await recordService.create(recordData);

      // Verify results
      expect(result).toEqual(mockRecord);
      expect(mockClient.post).toHaveBeenCalledWith('/1.0/legajo', recordData, { headers: {} });
    });

    it('should include strategy header when specified', async () => {
      // Mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockRecord
      };
      mockClient.post.mockResolvedValue(mockResponse as AxiosResponse);

      // Test data
      const recordData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        idNumber: '12345678'
      };
      const strategy = 'COMPLETE';

      // Call the method
      const result = await recordService.create(recordData, strategy);

      // Verify results
      expect(result).toEqual(mockRecord);
      expect(mockClient.post).toHaveBeenCalledWith('/1.0/legajo', recordData, { 
        headers: { strategy: 'COMPLETE' } 
      });
    });
  });

  describe('get', () => {
    it('should get a record by ID', async () => {
      // Mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockRecord
      };
      mockClient.get.mockResolvedValue(mockResponse as AxiosResponse);

      // Call the method
      const result = await recordService.get('test-id');

      // Verify results
      expect(result).toEqual(mockRecord);
      expect(mockClient.get).toHaveBeenCalledWith('/1.0/legajo/test-id');
    });
  });

  describe('update', () => {
    it('should update a record', async () => {
      // Mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: {
          ...mockRecord,
          updatedAt: '2023-01-02T00:00:00.000Z'
        }
      };
      mockClient.put.mockResolvedValue(mockResponse as AxiosResponse);

      // Test data
      const updateData = {
        vouchers: {
          type: 'test',
          value: 123
        }
      };

      // Call the method
      const result = await recordService.update('test-id', updateData);

      // Verify results
      expect(result).toEqual(mockResponse.data);
      expect(mockClient.put).toHaveBeenCalledWith('/1.0/legajo/test-id', updateData);
    });
  });

  describe('API versioning', () => {
    it('should use API version from auth manager', async () => {
      // Setup a different API version
      mockAuthManager.getApiVersion.mockReturnValue('2.0');

      // Mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockRecord
      };
      mockClient.get.mockResolvedValue(mockResponse as AxiosResponse);

      // Call the method
      await recordService.get('test-id');

      // Verify the correct API version was used
      expect(mockClient.get).toHaveBeenCalledWith('/2.0/legajo/test-id');
    });

    it('should default to 1.0 if no API version is available', async () => {
      // Setup no API version
      mockAuthManager.getApiVersion.mockReturnValue(null);

      // Mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockRecord
      };
      mockClient.get.mockResolvedValue(mockResponse as AxiosResponse);

      // Call the method
      await recordService.get('test-id');

      // Verify it defaulted to 1.0
      expect(mockClient.get).toHaveBeenCalledWith('/1.0/legajo/test-id');
    });
  });

  describe('getLinkRecover', () => {
    it('should get the recovery link using a record ID', async () => {
      // Mock the get method response
      const mockResponseWithLink = {
        ...mockRecord,
        linkRecover: 'https://example.com/recover/123'
      };
      
      const mockResponse: Partial<AxiosResponse> = {
        data: mockResponseWithLink
      };
      
      mockClient.get.mockResolvedValue(mockResponse as AxiosResponse);

      // Call the method with an ID
      const result = await recordService.getLinkRecover('test-id');

      // Verify the result and that get was called
      expect(result).toEqual('https://example.com/recover/123');
      expect(mockClient.get).toHaveBeenCalledWith('/1.0/legajo/test-id');
    });

    it('should get the recovery link directly from a record object', async () => {
      // Create a mock record with link
      const recordWithLink = {
        ...mockRecord,
        linkRecover: 'https://example.com/recover/123'
      };

      // Call the method with the record object
      const result = await recordService.getLinkRecover(recordWithLink);

      // Verify the result and that get was NOT called
      expect(result).toEqual('https://example.com/recover/123');
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should return null if the record has no recovery link', async () => {
      // Create a mock record without a link
      const recordWithoutLink = {
        _id: mockRecord._id,
        name: mockRecord.name,
        email: mockRecord.email,
        idNumber: mockRecord.idNumber,
        referenceCode: mockRecord.referenceCode,
        linkLandingNext: mockRecord.linkLandingNext,
        createdAt: mockRecord.createdAt,
        updatedAt: mockRecord.updatedAt
        // Intentionally omitting linkRecover
      };

      // Call the method with the record object
      const result = await recordService.getLinkRecover(recordWithoutLink);

      // Verify the result is null
      expect(result).toBeNull();
    });
  });

  describe('getLinkApplicant', () => {
    it('should get the applicant link using a record ID', async () => {
      // Mock the get method response
      const mockResponseWithLink = {
        ...mockRecord,
        linkApplicant: 'https://example.com/applicant/123'
      };
      
      const mockResponse: Partial<AxiosResponse> = {
        data: mockResponseWithLink
      };
      
      mockClient.get.mockResolvedValue(mockResponse as AxiosResponse);

      // Call the method with an ID
      const result = await recordService.getLinkApplicant('test-id');

      // Verify the result and that get was called
      expect(result).toEqual('https://example.com/applicant/123');
      expect(mockClient.get).toHaveBeenCalledWith('/1.0/legajo/test-id');
    });

    it('should get the applicant link directly from a record object', async () => {
      // Create a mock record with link
      const recordWithLink = {
        ...mockRecord,
        linkApplicant: 'https://example.com/applicant/123'
      };

      // Call the method with the record object
      const result = await recordService.getLinkApplicant(recordWithLink);

      // Verify the result and that get was NOT called
      expect(result).toEqual('https://example.com/applicant/123');
      expect(mockClient.get).not.toHaveBeenCalled();
    });

    it('should return null if the record has no applicant link', async () => {
      // Create a mock record without a link
      const recordWithoutLink = {
        _id: mockRecord._id,
        name: mockRecord.name,
        email: mockRecord.email,
        idNumber: mockRecord.idNumber,
        referenceCode: mockRecord.referenceCode,
        linkLandingNext: mockRecord.linkLandingNext,
        linkRecover: mockRecord.linkRecover,
        createdAt: mockRecord.createdAt,
        updatedAt: mockRecord.updatedAt
        // Intentionally omitting linkApplicant
      };

      // Call the method with the record object
      const result = await recordService.getLinkApplicant(recordWithoutLink);

      // Verify the result is null
      expect(result).toBeNull();
    });
  });
}); 