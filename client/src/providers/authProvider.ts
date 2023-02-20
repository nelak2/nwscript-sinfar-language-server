import {
  authentication,
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  AuthenticationSessionAccountInformation,
  Disposable,
  Event,
  EventEmitter,
  SecretStorage,
  window,
} from "vscode";
import { SinfarAPI } from "../api/sinfarAPI";

class SinfarAuthSession implements AuthenticationSession {
  id: string = CookieAuthenticationProvider.id;
  accessToken: string;
  account: AuthenticationSessionAccountInformation = { id: CookieAuthenticationProvider.id, label: "Sinfar Auth Token" };
  scopes: readonly string[] = [];

  constructor(public readonly _accessToken: string) {
    this.accessToken = _accessToken;
  }
}

export class CookieAuthenticationProvider implements AuthenticationProvider {
  private readonly _sessionChangeEmitter = new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
  static id = "SinfarAuth";
  private static readonly secretKey = "SinfarAuth";
  private readonly remoteAPI: SinfarAPI;

  // this property is used to determine if the token has been changed in another window of VS Code.
  // It is used in the checkForUpdates function.
  private readonly currentToken: Promise<string | undefined> | undefined;
  private initializedDisposable: Disposable | undefined;

  private readonly _onDidChangeSessions = new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
  get onDidChangeSessions(): Event<AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return this._onDidChangeSessions.event;
  }

  constructor(private readonly secretStorage: SecretStorage, api: SinfarAPI) {
    this.remoteAPI = api;
  }

  dispose(): void {
    this.initializedDisposable?.dispose();
  }

  // Register event handlers when the secret storage changes and auth needs checking
  private ensureInitialized(): void {
    if (this.initializedDisposable === undefined) {
      void this.cacheTokenFromStorage();

      this.initializedDisposable = Disposable.from(
        this.secretStorage.onDidChange((e) => {
          if (e.key === CookieAuthenticationProvider.secretKey) {
            void this.checkForUpdates();
          }
        }),
        authentication.onDidChangeSessions((e) => {
          if (e.provider.id === CookieAuthenticationProvider.id) {
            void this.checkForUpdates();
          }
        }),
      );
    }
  }

  private async checkForUpdates(): Promise<void> {
    const added: AuthenticationSession[] = [];
    const removed: AuthenticationSession[] = [];
    const changed: AuthenticationSession[] = [];

    const previousToken = await this.currentToken;
    const session = (await this.getSessions())[0];

    if (session?.accessToken && !previousToken) {
      added.push(session);
    } else if (!session?.accessToken && previousToken) {
      removed.push(session);
    } else if (session?.accessToken !== previousToken) {
      changed.push(session);
    } else {
      return;
    }

    void this.cacheTokenFromStorage();
    this._onDidChangeSessions.fire({ added, removed, changed });
  }

  private async cacheTokenFromStorage() {
    return await this.secretStorage.get(CookieAuthenticationProvider.secretKey);
  }

  async getSessions(scopes?: string[]): Promise<readonly AuthenticationSession[]> {
    this.ensureInitialized();
    const token = await this.cacheTokenFromStorage();
    return token ? [new SinfarAuthSession(token)] : [];
  }

  async createSession(_scopes: string[]): Promise<AuthenticationSession> {
    this.ensureInitialized();

    // Prompt for username
    const userid = await window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "Username",
      prompt: "Enter your username.",
      password: false,
    });
    if (!userid) {
      throw new Error("Username is required");
    }

    // Prompt for password
    const password = await window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "Password",
      prompt: "Enter your password.",
      password: true,
    });
    if (!password) {
      throw new Error("Password is required");
    }

    const cookie = await this.remoteAPI.doLogin(userid, password);

    // Store session ID
    await this.secretStorage.store(CookieAuthenticationProvider.secretKey, cookie);

    return new SinfarAuthSession(cookie);
  }

  public async removeSession(_sessionId: string): Promise<void> {
    await this.secretStorage.delete(CookieAuthenticationProvider.secretKey);
  }
}
