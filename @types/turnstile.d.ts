declare global {
  interface Window {
    turnstile: {
      render: (
        container: string | HTMLElement,
        options: {
          
          appearance?: "always" | "execute" | "interaction-only";
          
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          execution?: "render" | "execute";
        }
      ) => string;

      execute: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export {};