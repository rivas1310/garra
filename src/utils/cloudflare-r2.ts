// Configuración para Cloudflare R2
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';



export const R2_CONFIG = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME || 'garrasfelinas',
  endpoint: process.env.R2_ENDPOINT || 'https://c72a675eb86ca9425b3d71721ac0954f.r2.cloudflarestorage.com',
  publicEndpoint: 'https://pub-3a2cd0a7cd8c431faaa5d888824013d7.r2.dev',
  region: 'auto', // R2 usa 'auto' como región
};

// Cliente S3 para R2 - Configuración optimizada
const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: R2_CONFIG.endpoint,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId!,
    secretAccessKey: R2_CONFIG.secretAccessKey!,
  },
  forcePathStyle: true,
  // Configuración específica para Windows
  requestHandler: {
    httpOptions: {
      timeout: 60000, // 60 segundos
    },
  },
});



// Función para subir imagen a R2
export async function uploadToR2(
  file: File | Buffer,
  options: {
    folder?: string;
    fileName?: string;
  } = {}
): Promise<{ key: string; url: string }> {
  const { accessKeyId, secretAccessKey, bucketName } = R2_CONFIG;
  
  if (!accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('R2 configuration missing');
  }

  // Generar nombre único para el archivo
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = file instanceof File ? file.name.split('.').pop() || 'jpg' : 'jpg';
  const fileName = options.fileName || `${timestamp}-${randomId}.${extension}`;
  
  // Construir la key (ruta) del archivo
  const folder = options.folder || 'productos';
  const key = `${folder}/${fileName}`;

  try {
    // Convertir File a Buffer si es necesario
    let buffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }



    // Subir a R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      ACL: 'public-read', // Hacer público el archivo
    });

    await s3Client.send(command);

    // Construir URL pública usando el endpoint público CON bucket en la ruta
    const url = `${R2_CONFIG.publicEndpoint}/${bucketName}/${key}`;

    return {
      key,
      url,
    };

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('AccessDenied')) {
        throw new Error('R2 upload failed: Access denied. Verifica permisos del token.');
      } else if (error.message.includes('NoSuchBucket')) {
        throw new Error(`R2 upload failed: Bucket "${bucketName}" no existe.`);
      } else if (error.message.includes('InvalidAccessKeyId')) {
        throw new Error('R2 upload failed: Access Key ID inválido.');
      } else if (error.message.includes('SignatureDoesNotMatch')) {
        throw new Error('R2 upload failed: Secret Access Key incorrecto.');
      } else if (error.message.includes('EPROTO') || error.message.includes('SSL')) {
        throw new Error('R2 upload failed: Error de conexión SSL. Intenta nuevamente.');
      }
    }
    
    throw new Error(`R2 upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Función para eliminar imagen de R2
export async function deleteFromR2(key: string): Promise<void> {
  const { accessKeyId, secretAccessKey, bucketName } = R2_CONFIG;
  
  if (!accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('R2 configuration missing');
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    throw new Error(`R2 delete failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Función para generar URL firmada (opcional, para archivos privados)
export async function generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const { bucketName } = R2_CONFIG;
  
  if (!bucketName) {
    throw new Error('R2 configuration missing');
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    throw new Error(`Signed URL generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default {
  upload: uploadToR2,
  delete: deleteFromR2,
  generateSignedUrl,
  config: R2_CONFIG,
};
