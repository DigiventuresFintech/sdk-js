# Digi JavaScript SDK

SDK oficial para integrar con la API de Digi.

## Instalación

```bash
npm install digi-tech-sdk
```

## Uso

```typescript
import { DigiSDK } from 'digi-tech-sdk';

// Configuración
const sdk = new DigiSDK({
  applicationId: 'your-app-id',
  secret: 'your-secret',
  environment: 'qa' // 'qa', 'staging', 'production'
});

// Crear un legajo
const legajoData = {
  firstname: 'Juan',
  lastname: 'Pérez',
  email: 'juan.perez@example.com',
  idNumber: '12345678'
};

async function createLegajo() {
  try {
    const legajo = await sdk.legajo.create(legajoData);
    console.log('Legajo creado:', legajo);
  } catch (error) {
    console.error('Error al crear legajo:', error);
  }
}

// Obtener un legajo
async function getLegajo(legajoId) {
  try {
    const legajo = await sdk.legajo.get(legajoId);
    console.log('Legajo obtenido:', legajo);
  } catch (error) {
    console.error('Error al obtener legajo:', error);
  }
}

// Actualizar un legajo
async function updateLegajo(legajoId) {
  try {
    const updateData = {
      vouchers: {
        type: 'document',
        status: 'pending',
        data: {
          documentType: 'DNI',
          documentNumber: '12345678'
        }
      }
    };
    
    const legajo = await sdk.legajo.update(legajoId, updateData);
    console.log('Legajo actualizado:', legajo);
  } catch (error) {
    console.error('Error al actualizar legajo:', error);
  }
}

// Descargar un archivo
async function getFile(fileUrl) {
  try {
    const fileResponse = await sdk.getFile(fileUrl);
    console.log('Archivo obtenido:', fileResponse);
  } catch (error) {
    console.error('Error al obtener archivo:', error);
  }
}
```

## Características

- Autenticación automática con token
- Renovación automática de tokens expirados
- Soporte para distintos entornos (QA, Staging, Producción)
- Gestión de errores y reintentos automáticos
- Versionado automático de API

## Documentación

Para más información sobre la API de Digi, consulte la documentación oficial. 