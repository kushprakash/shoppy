<?php

namespace App\Services\Domain;

use App\Models\StoreDomain;
use Illuminate\Validation\ValidationException;

class DomainValidationService
{
    /**
     * Normalize user-supplied domain input:
     * - lowercase
     * - remove http://, https://, whitespace
     * - remove trailing slashes, paths, query strings, and port numbers
     */
    public function normalize(string $input): string
    {
        $domain = trim($input);

        // Strip protocol
        $domain = preg_replace('#^https?://#i', '', $domain);

        // Strip path, query params, hash
        $domain = preg_replace('#[/\\?#].*$#', '', $domain);

        // Strip port number (e.g. domain.com:8080)
        $domain = preg_replace('#:\d+$#', '', $domain);

        // Strip trailing dots
        $domain = rtrim($domain, '.');

        return strtolower($domain);
    }

    /**
     * Validate domain syntax and security rules.
     * Throws ValidationException if invalid.
     */
    public function validate(string $domain, ?int $ignoreStoreDomainId = null): string
    {
        $normalized = $this->normalize($domain);

        if (empty($normalized)) {
            throw ValidationException::withMessages([
                'domain' => ['Please enter a valid domain name (e.g. mystore.in or store.mybrand.com).'],
            ]);
        }

        // Check if it's an IP address
        if (filter_var($normalized, FILTER_VALIDATE_IP)) {
            throw ValidationException::withMessages([
                'domain' => ['IP addresses cannot be used as custom domains. Please use a valid domain name.'],
            ]);
        }

        // Domain regex validation according to RFC 1035
        $domainRegex = '/^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63}(?<!-))*(\.[a-z]{2,})$/i';
        if (!preg_match($domainRegex, $normalized)) {
            throw ValidationException::withMessages([
                'domain' => ['The domain name format is invalid. Please check for special characters or spaces.'],
            ]);
        }

        // Block Shoppy ERP core domains
        $prohibited = [
            'shoppy.live',
            'www.shoppy.live',
            'api.shoppy.live',
            'localhost',
            '127.0.0.1',
            'enexa.in',
            'cloudpanel.io',
        ];

        if (in_array($normalized, $prohibited, true) || str_ends_with($normalized, '.shoppy.live')) {
            throw ValidationException::withMessages([
                'domain' => ['This domain is reserved by Shoppy ERP and cannot be connected as a customer domain.'],
            ]);
        }

        // Check duplicate domain in database across all stores
        $query = StoreDomain::where('domain', $normalized);
        if ($ignoreStoreDomainId) {
            $query->where('id', '!=', $ignoreStoreDomainId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'domain' => ["The domain '{$normalized}' is already connected to another store in the system."],
            ]);
        }

        return $normalized;
    }

    /**
     * Generate unique, cryptographically strong TXT verification token
     */
    public function generateVerificationToken(): string
    {
        return 'shoppy-verify-' . bin2hex(random_bytes(16));
    }
}
