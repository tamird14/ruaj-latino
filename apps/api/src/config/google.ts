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

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: env.GOOGLE_PRIVATE_KEY,
    },
    scopes: SCOPES,
  });

  driveClientInstance = google.drive({ version: 'v3', auth });
  return driveClientInstance;
};
