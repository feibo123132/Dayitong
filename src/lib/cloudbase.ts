import cloudbase from '@cloudbase/js-sdk';

// Initialize CloudBase
// Region is optional if it's the default region, but good to have if known.
// Assuming default for now or auto-detected.
export const app = cloudbase.init({
  env: 'jieyou-3gr01mvob9ad92de',
});

export const auth = app.auth();
export const db = app.database();

let authInFlight: Promise<void> | null = null;

// Ensure auth once, and share the same in-flight login across concurrent calls.
export const ensureAuth = async (): Promise<void> => {
  if (authInFlight) {
    await authInFlight;
    return;
  }

  authInFlight = (async () => {
    const loginState = await auth.getLoginState();
    if (!loginState) {
      // For email login flow, we might not want auto-anonymous login 
      // if we want to force user to login page.
      // But for some features like viewing ranking, anonymous is fine.
      // Let's keep it but be aware.
      await auth.signInAnonymously();
    }
  })();

  try {
    await authInFlight;
  } finally {
    authInFlight = null;
  }
};
