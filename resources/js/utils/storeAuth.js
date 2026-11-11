export const STORE_TOKEN_KEY = 'shoppy_store_token';
export const STORE_CODE_KEY = 'shoppy_active_store_code';
export const STORE_DATA_KEY = 'shoppy_active_store';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const PER_STORE_CACHE_KEYS = [
  'shoppy_store_branding_data',
  'shoppy_store_branding',
  'shoppy_products_v3',
  'shoppy_orders_v3',
  'shoppy_customers',
  'shoppy_suppliers',
  'shoppy_purchase_bills',
  'shoppy_expenses',
  'shoppy_active_user'
];

export function getCookieValue(name) {
  if (typeof document === 'undefined') return '';
  try {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : '';
  } catch (e) {
    return '';
  }
}

export function decodeTokenPayload(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  try {
    const [payloadB64] = token.split('.');
    if (!payloadB64) return null;
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    const data = JSON.parse(json);
    if (data && data.exp && Number(data.exp) * 1000 < Date.now()) {
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}

export function getStoredStoreToken() {
  try {
    const lsToken = typeof localStorage !== 'undefined' ? localStorage.getItem(STORE_TOKEN_KEY) : '';
    const token = lsToken || getCookieValue(STORE_TOKEN_KEY) || '';
    if (!token) return '';
    // Only keep token if payload isn't expired
    const payload = decodeTokenPayload(token);
    if (!payload) return '';
    if (!lsToken && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORE_TOKEN_KEY, token);
    }
    return token;
  } catch (e) {
    return '';
  }
}

export function clearPerStoreLocalCaches() {
  if (typeof localStorage === 'undefined') return;
  try {
    PER_STORE_CACHE_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
}

export function getActiveShopCode() {
  try {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const urlCode = (sp.get('code') || sp.get('shop_code') || '').trim().toUpperCase();
      if (urlCode) return urlCode;
    }

    const token = getStoredStoreToken();
    const tokenPayload = decodeTokenPayload(token);
    if (tokenPayload?.code) {
      return String(tokenPayload.code).trim().toUpperCase();
    }

    if (typeof localStorage !== 'undefined') {
      const lsCode = (localStorage.getItem(STORE_CODE_KEY) || '').trim().toUpperCase();
      if (lsCode) return lsCode;
    }

    const cookieCode = (
      getCookieValue(STORE_CODE_KEY) ||
      getCookieValue('shoppy_active_store') ||
      ''
    ).trim().toUpperCase();
    if (cookieCode) return cookieCode;

    if (typeof document !== 'undefined') {
      const dsCode = (document.getElementById('root')?.dataset?.shopCode || '').trim().toUpperCase();
      if (dsCode && dsCode !== 'MASTER-ROOT') return dsCode;
    }
  } catch (e) {}
  return '';
}

export function setStoreAuthSession({ token = '', shopCode = '', store = null } = {}) {
  const tokenCode = decodeTokenPayload(token)?.code || '';
  const cleanCode = String(shopCode || store?.code || store?.shop_code || tokenCode || '')
    .trim()
    .toUpperCase();

  try {
    if (typeof localStorage !== 'undefined' && cleanCode) {
      const prevCode = (localStorage.getItem(STORE_CODE_KEY) || '').trim().toUpperCase();
      if (prevCode && prevCode !== cleanCode) {
        clearPerStoreLocalCaches();
        localStorage.removeItem(STORE_DATA_KEY);
      }
      localStorage.setItem(STORE_CODE_KEY, cleanCode);
    }

    if (typeof localStorage !== 'undefined' && token) {
      localStorage.setItem(STORE_TOKEN_KEY, token);
    }

    if (typeof localStorage !== 'undefined' && store) {
      localStorage.setItem(STORE_DATA_KEY, JSON.stringify(store));
    }

    if (typeof document !== 'undefined') {
      if (token) {
        document.cookie = `${STORE_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
      }
      if (cleanCode) {
        document.cookie = `${STORE_CODE_KEY}=${encodeURIComponent(cleanCode)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
        document.cookie = `shoppy_active_store=${encodeURIComponent(cleanCode)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
      }
    }
  } catch (e) {}

  syncAxiosStoreHeaders();
  return cleanCode;
}

export function clearStoreAuthSession() {
  try {
    clearPerStoreLocalCaches();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORE_TOKEN_KEY);
      localStorage.removeItem(STORE_CODE_KEY);
      localStorage.removeItem(STORE_DATA_KEY);
    }
    if (typeof document !== 'undefined') {
      document.cookie = `${STORE_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `${STORE_CODE_KEY}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `shoppy_active_store=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch (e) {}
  syncAxiosStoreHeaders();
}

export async function logoutStore(redirectUrl = '/store') {
  clearStoreAuthSession();
  try {
    await fetch('/api/store/logout', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      keepalive: true
    });
  } catch (e) {}
  if (typeof window !== 'undefined' && redirectUrl) {
    window.location.href = redirectUrl;
  }
}

export function getStoreAuthHeaders(explicitShopCode = '') {
  const headers = {};
  const code = (explicitShopCode || getActiveShopCode() || '').trim().toUpperCase();
  const token = getStoredStoreToken();
  if (code) {
    headers['X-Shop-Code'] = code;
  }
  if (token) {
    headers['X-Store-Token'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function syncAxiosStoreHeaders(axiosInstance = null) {
  try {
    const ax = axiosInstance || (typeof window !== 'undefined' ? window.axios : null);
    if (!ax || !ax.defaults) return;
    const code = getActiveShopCode();
    const token = getStoredStoreToken();

    if (code) {
      ax.defaults.headers.common['X-Shop-Code'] = code;
    } else {
      delete ax.defaults.headers.common['X-Shop-Code'];
    }

    if (token) {
      ax.defaults.headers.common['X-Store-Token'] = token;
      ax.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete ax.defaults.headers.common['X-Store-Token'];
      delete ax.defaults.headers.common['Authorization'];
    }
  } catch (e) {}
}

let fetchInterceptorInstalled = false;

export function installStoreFetchInterceptor() {
  if (fetchInterceptorInstalled || typeof window === 'undefined' || typeof window.fetch !== 'function') {
    return;
  }
  fetchInterceptorInstalled = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init = {}) {
    try {
      const rawUrl = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
      const parsed = new URL(rawUrl, window.location.origin);

      const isSameOrigin = parsed.origin === window.location.origin;
      const isStoreScopedApi = /^\/api\/(tenant|pos|payu|paytm|store\/|storefront)/.test(parsed.pathname);

      if (isSameOrigin && isStoreScopedApi) {
        const nextHeaders = new Headers(
          init?.headers || (input instanceof Request ? input.headers : undefined)
        );
        const shopCode = getActiveShopCode();
        const token = getStoredStoreToken();

        if (shopCode && !nextHeaders.has('X-Shop-Code')) {
          nextHeaders.set('X-Shop-Code', shopCode);
        }
        if (token) {
          if (!nextHeaders.has('X-Store-Token')) {
            nextHeaders.set('X-Store-Token', token);
          }
          if (!nextHeaders.has('Authorization')) {
            nextHeaders.set('Authorization', `Bearer ${token}`);
          }
        }

        const nextInit = {
          ...init,
          credentials: init?.credentials || 'same-origin',
          headers: nextHeaders
        };
        return originalFetch(input, nextInit);
      }
    } catch (e) {}

    return originalFetch(input, init);
  };
}

