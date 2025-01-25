import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private oAuth2Client: OAuth2Client | null = null;

  private constructor() {}

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  async initialize(): Promise<void> {
    try {
      const credentialsBase64 = process.env.GOOGLE_CREDENTIALS;
      if (!credentialsBase64) {
        throw new Error("GOOGLE_CREDENTIALS_BASE64 environment variable is not set");
      }
      const credentials = JSON.parse(Buffer.from(credentialsBase64, "base64").toString());
      const { client_secret, client_id, redirect_uris } = credentials.installed;

      this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      const tokenBase64 = process.env.GOOGLE_TOKEN;
      if (tokenBase64) {
        const token = JSON.parse(Buffer.from(tokenBase64, "base64").toString());
        this.oAuth2Client.setCredentials(token);
      }
    } catch (error) {
      console.error("Error loading Google credentials:", error);
      throw error;
    }
  }

  getAuth(): OAuth2Client {
    if (!this.oAuth2Client) {
      throw new Error("OAuth2Client not initialized");
    }
    return this.oAuth2Client;
  }
}
