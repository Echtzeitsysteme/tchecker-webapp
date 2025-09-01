export interface AppConfig {
    backend: {
        url: string;
    };
}


async function loadConfig(): Promise<AppConfig> {
  const response = await fetch('/config.json');
  if (!response.ok) {
    throw new Error('Failed to load configuration');
  }
  return await response.json();
}

let configCache = null;

export async function getAppConfig(): Promise<AppConfig> {
  try {
    if (configCache) {
      return configCache;
    }

    const config = await loadConfig();
    console.log('App configuration loaded:', config);
    configCache = config;
    return config;
  } catch (error) {
    console.error('Error loading app configuration:', error);
    throw error;
  }
}


