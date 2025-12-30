/* eslint-disable @typescript-eslint/no-explicit-any */
interface OneSignalDeferred {
  push(callback: () => void): void;
}

interface OneSignalInitOptions {
  appId: string;
  safari_web_id?: string;
  notifyButton?: { enable: boolean };
  allowLocalhostAsSecureOrigin?: boolean;
  [key: string]: any;
}

interface OneSignalSDK {
  init(options: OneSignalInitOptions): void;
  showNativePrompt(): Promise<void>;
  isPushNotificationsEnabled(): Promise<boolean>;
  on(event: string, listener: (event: any) => void): void;
  off(event: string, listener: (event: any) => void): void;
}

declare global {
  interface Window {
    OneSignal: OneSignalDeferred | OneSignalSDK | undefined;
  }
}

export {};