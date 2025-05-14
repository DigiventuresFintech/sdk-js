# Digi JavaScript SDK

Official SDK for integrating with the Digi API.

## Installation

```bash
npm install digi-tech-sdk
```

## Usage

```typescript
import { DigiSDK } from 'digi-tech-sdk';

// Configuration
const sdk = new DigiSDK({
  applicationId: 'your-app-id',
  secret: 'your-secret',
  environment: 'qa' // 'qa', 'staging', 'production'
});

// Create a record
const recordData = {
  firstname: 'John',
  lastname: 'Doe',
  email: 'john.doe@example.com',
  idNumber: '12345678'
};

async function createRecord() {
  try {
    const record = await sdk.record.create(recordData);
    console.log('Record created:', record);
  } catch (error) {
    console.error('Error creating record:', error);
  }
}

// Get a record
async function getRecord(recordId) {
  try {
    const record = await sdk.record.get(recordId);
    console.log('Record retrieved:', record);
  } catch (error) {
    console.error('Error retrieving record:', error);
  }
}

// Update a record
async function updateRecord(recordId) {
  try {
    const updateData = {
      vouchers: {
        type: 'document',
        status: 'pending',
        data: {
          documentType: 'ID',
          documentNumber: '12345678'
        }
      }
    };
    
    const record = await sdk.record.update(recordId, updateData);
    console.log('Record updated:', record);
  } catch (error) {
    console.error('Error updating record:', error);
  }
}

// Get recovery link
async function getRecoveryLink(recordId) {
  try {
    // Using record ID
    const link = await sdk.record.getLinkRecover(recordId);
    console.log('Recovery link:', link);
    
    // Or using a record object
    const record = await sdk.record.get(recordId);
    const linkFromObject = await sdk.record.getLinkRecover(record);
    console.log('Recovery link from record object:', linkFromObject);
  } catch (error) {
    console.error('Error getting recovery link:', error);
  }
}

// Get applicant link
async function getApplicantLink(recordId) {
  try {
    const link = await sdk.record.getLinkApplicant(recordId);
    console.log('Applicant link:', link);
  } catch (error) {
    console.error('Error getting applicant link:', error);
  }
}

// Download a file
async function getFile(fileUrl) {
  try {
    const fileResponse = await sdk.getFile(fileUrl);
    console.log('File retrieved:', fileResponse);
  } catch (error) {
    console.error('Error retrieving file:', error);
  }
}
```

## Features

- Automatic token authentication
- Automatic token renewal when expired
- Support for different environments (QA, Staging, Production)
- Error handling and automatic retries
- Automatic API versioning
- Convenience methods for accessing links (getLinkRecover, getLinkApplicant)

## Documentation

For more information about the Digi API, please refer to the official documentation. 