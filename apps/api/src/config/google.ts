import { google } from 'googleapis';
import { env } from './env.js';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

let driveClientInstance: ReturnType<typeof google.drive> | null = null;

export const getDriveClient = () => {
  if (driveClientInstance) {
    return driveClientInstance;
  }

  if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Drive credentials not configured');
  }

  // Handle various newline escaping scenarios from environment variables
  let privateKey = env.GOOGLE_PRIVATE_KEY;

  // Handle double-escaped newlines (\\n -> \n)
  privateKey = privateKey.replace(/\\\\n/g, '\n');
  // Handle single-escaped newlines (\n as two chars -> actual newline)
  privateKey = privateKey.replace(/\\n/g, '\n');

  // Ensure proper PEM format
  if (!privateKey.includes('-----BEGIN')) {
    throw new Error('Invalid private key format - missing PEM header');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  driveClientInstance = google.drive({ version: 'v3', auth });
  return driveClientInstance;
};
