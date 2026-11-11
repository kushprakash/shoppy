<?php

namespace App\Support;

use Illuminate\Http\Request;

class StoreToken
{
    public const TOKEN_COOKIE = 'shoppy_store_token';
    public const CODE_COOKIE = 'shoppy_active_store_code';
    public const LEGACY_CODE_COOKIE = 'shoppy_active_store';
    public const TTL_MINUTES = 43200; // 30 days

    protected static function signingKey(): string
    {
        $key = (string) config('app.key', '');
        if (str_starts_with($key, 'base64:')) {
            $decoded = base64_decode(substr($key, 7), true);
            if ($decoded !== false && $decoded !== '') {
                return $decoded;
            }
        }
        return $key !== '' ? $key : 'shoppy-default-signing-secret';
    }

    protected static function b64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    protected static function b64UrlDecode(string $data): ?string
    {
        $remainder = strlen($data) % 4;
        if ($remainder > 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        $decoded = base64_decode(strtr($data, '-_', '+/'), true);
        return $decoded === false ? null : $decoded;
    }

    /**
     * Issue a signed HMAC-SHA256 authentication token for a specific store.
     */
    public static function issue(object|int $shopOrId, ?string $shopCode = null, int $ttlSeconds = 2592000): string
    {
        $sid = is_object($shopOrId) ? (int) ($shopOrId->id ?? 0) : (int) $shopOrId;
        $code = strtoupper(trim((string) ($shopCode ?: (is_object($shopOrId) ? ($shopOrId->shop_code ?? $shopOrId->code ?? '') : ''))));

        $payload = [
            'sid' => $sid,
            'code' => $code,
            'iat' => time(),
            'exp' => time() + $ttlSeconds,
            'nonce' => bin2hex(random_bytes(8)),
        ];

        $encodedPayload = self::b64UrlEncode((string) json_encode($payload));
        $sig = hash_hmac('sha256', $encodedPayload, self::signingKey(), true);
        $encodedSig = self::b64UrlEncode($sig);

        return $encodedPayload . '.' . $encodedSig;
    }

    /**
     * Verify a store token signature and expiration. Returns payload array or null.
     */
    public static function verify(?string $token): ?array
    {
        if (!$token || !is_string($token)) {
            return null;
        }

        $token = trim($token);
        $parts = explode('.', $token);
        if (count($parts) !== 2) {
            return null;
        }

        [$encodedPayload, $encodedSig] = $parts;
        if ($encodedPayload === '' || $encodedSig === '') {
            return null;
        }

        $expectedSig = self::b64UrlEncode(hash_hmac('sha256', $encodedPayload, self::signingKey(), true));
        if (!hash_equals($expectedSig, $encodedSig)) {
            return null;
        }

        $json = self::b64UrlDecode($encodedPayload);
        if ($json === null) {
            return null;
        }

        $payload = json_decode($json, true);
        if (!is_array($payload) || empty($payload['code'])) {
            return null;
        }

        if (isset($payload['exp']) && (int) $payload['exp'] < time()) {
            return null;
        }

        $payload['code'] = strtoupper(trim((string) $payload['code']));
        return $payload;
    }

    /**
     * Extract bearer, header, or cookie store token from an incoming request.
     */
    public static function extractFromRequest(Request $request): ?string
    {
        $bearer = $request->bearerToken();
        if ($bearer && str_contains($bearer, '.')) {
            return $bearer;
        }

        $headerToken = $request->header('X-Store-Token');
        if ($headerToken) {
            return (string) $headerToken;
        }

        $cookieToken = $request->cookie(self::TOKEN_COOKIE);
        if ($cookieToken) {
            return (string) $cookieToken;
        }

        return null;
    }

    /**
     * Resolve and verify the authenticated shop code from the request token.
     */
    public static function resolveShopCodeFromRequest(Request $request): ?string
    {
        $token = self::extractFromRequest($request);
        $payload = self::verify($token);
        return $payload['code'] ?? null;
    }

    /**
     * Create store auth & active shop cookies readable across web & API requests.
     */
    public static function authCookies(string $shopCode, string $token): array
    {
        $normalized = strtoupper(trim($shopCode));
        return [
            cookie(self::TOKEN_COOKIE, $token, self::TTL_MINUTES, '/', null, null, false, false, 'lax'),
            cookie(self::CODE_COOKIE, $normalized, self::TTL_MINUTES, '/', null, null, false, false, 'lax'),
            cookie(self::LEGACY_CODE_COOKIE, $normalized, self::TTL_MINUTES, '/', null, null, false, false, 'lax'),
        ];
    }

    /**
     * Create expired cookies to clear store auth state on logout.
     */
    public static function clearCookies(): array
    {
        return [
            cookie()->forget(self::TOKEN_COOKIE, '/'),
            cookie()->forget(self::CODE_COOKIE, '/'),
            cookie()->forget(self::LEGACY_CODE_COOKIE, '/'),
        ];
    }
}

