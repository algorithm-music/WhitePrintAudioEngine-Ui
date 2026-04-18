import { Storage } from '@google-cloud/storage';

/**
 * GCS bucket + GCSFuse-mount convention used by the Cloud Run backend services.
 * Cloud Run services (rendition-dsp, audition, concertmaster) mount this bucket
 * at GCSFUSE_MOUNT, so an object named "uploads/user/abc.wav" is readable as
 * "/mnt/gcs/aimastering-tmp-audio/uploads/user/abc.wav" inside those containers.
 */
export const GCS_BUCKET =
  process.env.GCS_BUCKET || 'aidriven-mastering-fyqu-source-bucket';
export const GCSFUSE_MOUNT =
  process.env.GCSFUSE_MOUNT || '/mnt/gcs/aimastering-tmp-audio';

const DEFAULT_PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT || 'aidriven-mastering-fyqu';

let _storage: Storage | null = null;

function getStorage(): Storage {
  if (_storage) return _storage;

  // Service-account credentials arrive on Vercel as a single env var holding
  // the key JSON. Parse once and hand it to the Storage client.
  const credsJson = process.env.GCP_SERVICE_ACCOUNT_KEY;
  if (credsJson) {
    let credentials: { client_email: string; private_key: string };
    try {
      credentials = JSON.parse(credsJson);
    } catch (e) {
      throw new Error(
        `GCP_SERVICE_ACCOUNT_KEY is set but not valid JSON: ${(e as Error).message}`,
      );
    }
    _storage = new Storage({
      projectId: DEFAULT_PROJECT_ID,
      credentials,
    });
  } else {
    // Fall back to ADC (for local dev against `gcloud auth application-default login`).
    _storage = new Storage({ projectId: DEFAULT_PROJECT_ID });
  }
  return _storage;
}

/**
 * V4 signed PUT URL for direct browser → GCS upload.
 */
export async function generateUploadUrl(
  objectName: string,
  contentType: string,
  expiresMinutes = 15,
): Promise<string> {
  const [url] = await getStorage()
    .bucket(GCS_BUCKET)
    .file(objectName)
    .getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + expiresMinutes * 60 * 1000,
      contentType,
    });
  return url;
}

/**
 * V4 signed GET URL for a finished object. Used to hand the browser a URL
 * it can download from without the bucket being public.
 */
export async function generateDownloadUrl(
  objectName: string,
  expiresMinutes = 60,
): Promise<string> {
  const [url] = await getStorage()
    .bucket(GCS_BUCKET)
    .file(objectName)
    .getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresMinutes * 60 * 1000,
    });
  return url;
}

/**
 * Resolve a bucket-relative object name to the absolute path that the
 * backend services see via their GCSFuse mount.
 */
export function objectToFusePath(objectName: string): string {
  const normalized = objectName.replace(/^\/+/, '');
  return `${GCSFUSE_MOUNT.replace(/\/+$/, '')}/${normalized}`;
}

/**
 * Convenience: allocate a unique object name under a prefix.
 * Format: `${prefix}/${userId|'guest'}/${timestamp}-${rand}.${ext}`
 */
export function makeObjectName(
  prefix: 'uploads' | 'outputs',
  userId: string | null,
  filename: string,
): string {
  const ext = (filename.split('.').pop() || 'wav').toLowerCase().replace(/[^a-z0-9]/g, '') || 'wav';
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  const owner = userId ?? 'guest';
  return `${prefix}/${owner}/${ts}-${rand}.${ext}`;
}
