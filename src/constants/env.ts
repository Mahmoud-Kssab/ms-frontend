const backendPort = '3002';

function resolveLocalBackendUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3002';
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${window.location.protocol}//${window.location.hostname}:${backendPort}`;
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3002';
}

export const env = {
  apiBaseUrl: resolveLocalBackendUrl(),
  socketUrl: resolveLocalBackendUrl(),
} as const;
