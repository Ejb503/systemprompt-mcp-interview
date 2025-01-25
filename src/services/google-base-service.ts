import { GoogleAuthService } from "./google-auth-service.js";

export abstract class GoogleBaseService {
  protected auth = GoogleAuthService.getInstance();
  private initPromise: Promise<void>;

  constructor() {
    // Start the initialization but don't wait for it
    this.initPromise = this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      await this.auth.initialize();
      await this.auth.authenticate();
    } catch (error) {
      console.error("Failed to initialize Google auth:", error);
      throw error;
    }
  }

  protected async waitForInit(): Promise<void> {
    await this.initPromise;
  }
}
