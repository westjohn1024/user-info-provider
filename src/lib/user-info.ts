export interface UserInfoData {
  ipAddress?: string;
  userAgent?: string;
  language?: string;
  screenSize?: string;
  timezone?: string;
  platform?: string;
  browser?: string;
  referrer?: string;
  location?: string;
  country?: string;
  city?: string;
  device?: string;
  osName?: string;
  osVersion?: string;
  browserVersion?: string;
  webGLRenderer?: string;
  cpuCores?: number;
  ram?: string;
  cookiesEnabled?: boolean;
  localStorageAvailable?: boolean;
  sessionStorageAvailable?: boolean;
  connectionType?: string;
  batteryLevel?: number;
  batteryCharging?: boolean;
  orientation?: string;
  touchScreen?: boolean;
  cookies?: Record<string, string>;
  additionalData?: Record<string, any>;
}

interface ErrorResponse {
  error: string;
}

/**
 * Collects various information about the user's browser and device
 */
export async function collectUserInfo(): Promise<UserInfoData> {
  if (typeof window === 'undefined') {
    return {}; // Return empty object if running on server
  }

  const userInfo: UserInfoData = {
    language: navigator.language,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    referrer: document.referrer,
    cookiesEnabled: navigator.cookieEnabled,
    localStorageAvailable: isLocalStorageAvailable(),
    sessionStorageAvailable: isSessionStorageAvailable(),
    touchScreen: isTouchDevice(),
    cookies: parseCookies(document.cookie),
  };

  // Parse user agent to get browser, OS info
  try {
    const uaData = parseUserAgent(navigator.userAgent);
    userInfo.browser = uaData.browser;
    userInfo.browserVersion = uaData.browserVersion;
    userInfo.osName = uaData.os;
    userInfo.osVersion = uaData.osVersion;
    userInfo.device = uaData.device;
  } catch (error) {
    console.error('Error parsing user agent:', error);
  }

  // Get CPU cores
  if (navigator.hardwareConcurrency) {
    userInfo.cpuCores = navigator.hardwareConcurrency;
  }

  // Get device memory if available
  if ((navigator as any).deviceMemory) {
    userInfo.ram = `${(navigator as any).deviceMemory} GB`;
  }

  // Get orientation
  if (window.screen.orientation) {
    userInfo.orientation = window.screen.orientation.type;
  }

  // Get WebGL renderer (graphics card info)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        userInfo.webGLRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) {
    console.error('Error getting WebGL info:', e);
  }

  // Try to get connection information
  if ((navigator as any).connection) {
    const connection = (navigator as any).connection;
    userInfo.connectionType = connection.effectiveType || connection.type;
  }

  // Try to get battery information
  try {
    if ((navigator as any).getBattery) {
      const battery = await (navigator as any).getBattery();
      userInfo.batteryLevel = battery.level;
      userInfo.batteryCharging = battery.charging;
    }
  } catch (e) {
    console.error('Error getting battery info:', e);
  }

  return userInfo;
}

/**
 * Basic user agent parser
 */
function parseUserAgent(ua: string): {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
} {
  let browser = 'Unknown';
  let browserVersion = '';
  let os = 'Unknown';
  let osVersion = '';
  let device = 'Desktop';

  // Mobile detection
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
    device = 'Mobile';
  } else if (/Tablet|iPad/i.test(ua)) {
    device = 'Tablet';
  }

  // OS detection
  if (/Windows/i.test(ua)) {
    os = 'Windows';
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    if (match) {
      const version = match[1];
      const versionMap: Record<string, string> = {
        '10.0': '10',
        '6.3': '8.1',
        '6.2': '8',
        '6.1': '7',
        '6.0': 'Vista',
        '5.2': 'XP 64-bit',
        '5.1': 'XP',
      };
      osVersion = versionMap[version] || version;
    }
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
    const match = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
    if (match) {
      osVersion = match[1].replace(/_/g, '.');
    }
  } else if (/Android/i.test(ua)) {
    os = 'Android';
    const match = ua.match(/Android (\d+(\.\d+)*)/);
    if (match) {
      osVersion = match[1];
    }
  } else if (/iOS|iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
    const match = ua.match(/OS (\d+[._]\d+[._]?\d*)/);
    if (match) {
      osVersion = match[1].replace(/_/g, '.');
    }
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  // Browser detection
  if (/Chrome/i.test(ua) && !/Chromium|Edge|Edg|OPR|Opera/i.test(ua)) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+(\.\d+)*)/);
    if (match) {
      browserVersion = match[1];
    }
  } else if (/Firefox/i.test(ua)) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+(\.\d+)*)/);
    if (match) {
      browserVersion = match[1];
    }
  } else if (/Safari/i.test(ua) && !/Chrome|Chromium|Edge|Edg|OPR|Opera/i.test(ua)) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+(\.\d+)*)/);
    if (match) {
      browserVersion = match[1];
    }
  } else if (/Edge|Edg/i.test(ua)) {
    browser = 'Edge';
    const match = ua.match(/Edge\/(\d+(\.\d+)*)|Edg\/(\d+(\.\d+)*)/);
    if (match) {
      browserVersion = match[1] || match[3];
    }
  } else if (/Opera|OPR/i.test(ua)) {
    browser = 'Opera';
    const match = ua.match(/Opera\/(\d+(\.\d+)*)|OPR\/(\d+(\.\d+)*)/);
    if (match) {
      browserVersion = match[1] || match[3];
    }
  }

  return { browser, browserVersion, os, osVersion, device };
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if sessionStorage is available
 */
function isSessionStorageAvailable(): boolean {
  try {
    const test = 'test';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if the device is a touch device
 */
function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Parse cookie string into an object
 */
function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieString) {
    return cookies;
  }
  
  cookieString.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (name) {
        try {
          cookies[name] = decodeURIComponent(value);
        } catch (e) {
          cookies[name] = value;
        }
      }
    }
  });
  
  return cookies;
}

/**
 * Send collected user information to the server
 */
export async function sendUserInfoToServer(data: UserInfoData): Promise<void> {
  try {
    const response = await fetch('/api/user-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.error || 'Failed to send user information');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error sending user information:', error.message);
    } else {
      console.error('Unknown error occurred while sending user information');
    }
  }
} 