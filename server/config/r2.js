import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
dotenv.config();

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'digital-vault-assets';

export const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey);

if (!isR2Configured) {
  console.warn('⚠️ [NOTICE] Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) not yet configured in environment variables.');
  console.warn('⚠️ Download routes will deliver standard links until R2 bucket credentials are added.');
}

// S3-compatible client for Cloudflare R2
export const r2Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    })
  : null;

/**
 * Generates a high-security, time-limited Presigned Download URL for a private R2 asset
 * @param {string} fileKey - Object path inside R2 bucket (e.g. "bundles/mega-pack.zip")
 * @param {number} expiresIn - Expiry in seconds (default 3600 = 1 hour)
 */
export async function generateR2DownloadUrl(fileKey, expiresIn = 3600) {
  if (!r2Client || !isR2Configured) {
    throw new Error('Cloudflare R2 is not configured on the server.');
  }

  // Strip any 'r2://' prefix if present
  const cleanKey = fileKey.replace(/^r2:\/\//i, '').replace(/^\/+/, '');

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: cleanKey
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

export { bucketName };
