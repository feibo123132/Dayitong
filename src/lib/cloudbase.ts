import cloudbase from '@cloudbase/js-sdk';

const fallbackEnvId = 'jieyou-3gr01mvob9ad92de';
const configuredEnvId = import.meta.env.VITE_TCB_ENV_ID;
const envId = typeof configuredEnvId === 'string' && configuredEnvId.trim() ? configuredEnvId.trim() : fallbackEnvId;

export const app = cloudbase.init({
  env: envId,
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
      await auth.signInAnonymously();
    }
  })();

  try {
    await authInFlight;
  } finally {
    authInFlight = null;
  }
};
