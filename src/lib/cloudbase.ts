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
      // User needs to enable Anonymous Login in CloudBase Console > Login Authorization.
      await auth.signInAnonymously();
    }
  })();

  try {
    await authInFlight;
  } finally {
    authInFlight = null;
  }
};
