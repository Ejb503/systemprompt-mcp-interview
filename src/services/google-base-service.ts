import { GoogleAuthService } from "./google-auth-service.js";

export abstract class GoogleBaseService {
  protected auth = GoogleAuthService.getInstance();
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      await this.auth.initialize();
    } catch (error) {
      console.error("Failed to initialize Google auth:", error);
      throw error;
    }
  }

  protected async waitForInit(): Promise<void> {
    await this.initPromise;
  }
}
