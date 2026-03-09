import { drive, auth as googleAuth } from '@googleapis/drive';
import { env } from './env.js';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

let driveClientInstance: ReturnType<typeof drive> | null = null;
let authInstance: InstanceType<typeof googleAuth.GoogleAuth> | null = null;

function getPrivateKey(): string {
  let privateKey = env.GOOGLE_PRIVATE_KEY;
  privateKey = privateKey.replace(/\\\\n/g, '\n');
  privateKey = privateKey.replace(/\\n/g, '\n');

  if (!privateKey.includes('-----BEGIN')) {
    throw new Error('Invalid private key format - missing PEM header');
  }
  return privateKey;
}

function getAuth() {
  if (authInstance) return authInstance;

  if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Drive credentials not configured');
  }

  authInstance = new googleAuth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: getPrivateKey(),
    },
    scopes: SCOPES,
  });

  return authInstance;
}

export const getDriveClient = () => {
  if (driveClientInstance) {
    return driveClientInstance;
  }

  driveClientInstance = drive({ version: 'v3', auth: getAuth() });
  return driveClientInstance;
};

export const getAccessToken = async (): Promise<string> => {
  const auth = getAuth();
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse.token) throw new Error('Failed to get access token');
  return tokenResponse.token;
};
