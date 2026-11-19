<?php

namespace App\Services\Domain;

use App\Models\StoreDomain;

class DnsVerificationService
{
    protected DomainValidationService $validationService;

    public function __construct(DomainValidationService $validationService)
    {
        $this->validationService = $validationService;
    }

    /**
     * Target VPS Server IP for Custom Domain A records
     */
    public function getExpectedServerIp(): string
    {
        return config('services.custom_domain.server_ip')
            ?: env('CUSTOM_DOMAIN_SERVER_IP', '82.29.167.224');
    }

    /**
     * Verify DNS records for a given StoreDomain model:
     * 1. A Record points to Expected Server IP (with DoH recursive fallback)
     * 2. TXT Record '_shoppy-verification.<domain>' matches domain verification_token
     * 3. (Optional) www CNAME / A record if www_enabled
     */
    public function verify(StoreDomain $domainModel): array
    {
        $domain = $domainModel->domain;
        $token = $domainModel->verification_token;
        $expectedIp = $this->getExpectedServerIp();
        $isApexDomain = $this->validationService->isApexDomain($domain);

        $results = [
            'success' => false,
            'expected_ip' => $expectedIp,
            'domain' => $domain,
            'a_record_valid' => false,
            'txt_record_valid' => false,
            'www_record_valid' => true, // default true if not www enabled
            'resolved_ips' => [],
            'resolved_txt' => [],
            'resolved_www' => [],
            'errors' => [],
            'details' => [],
        ];

        // 1. Verify A Record for root/subdomain
        try {
            $ips = $this->resolveARecords($domain);
            $results['resolved_ips'] = $ips;

            if (!empty($ips)) {
                if (in_array($expectedIp, $ips, true)) {
                    $results['a_record_valid'] = true;
                    $results['details'][] = "A record correctly points to {$expectedIp}.";
                } else {
                    $results['errors'][] = "A record points to [" . implode(', ', $ips) . "] instead of expected server IP {$expectedIp}.";
                }
            } else {
                $results['errors'][] = "No A record found for '{$domain}'. Please add an A record pointing to {$expectedIp}.";
            }
        } catch (\Throwable $e) {
            $results['errors'][] = "DNS lookup for A record failed: " . $e->getMessage();
        }

        // 2. Verify TXT Record for domain ownership
        // Checks host: _shoppy-verification.<domain> AND root domain <domain>
        try {
            $txtHosts = [
                "_shoppy-verification.{$domain}",
                $domain
            ];

            $foundTxtTokens = [];
            foreach ($txtHosts as $th) {
                $tokens = $this->resolveTxtRecords($th);
                if (!empty($tokens)) {
                    $foundTxtTokens = array_merge($foundTxtTokens, $tokens);
                }
            }

            $foundTxtTokens = array_values(array_unique($foundTxtTokens));
            $results['resolved_txt'] = $foundTxtTokens;

            if (in_array($token, $foundTxtTokens, true)) {
                $results['txt_record_valid'] = true;
                $results['details'][] = "TXT ownership verification token confirmed.";
            } else {
                $results['errors'][] = "TXT verification record not found or does not match. Expected '_shoppy-verification.{$domain}' with value '{$token}'.";
            }
        } catch (\Throwable $e) {
            $results['errors'][] = "DNS lookup for TXT record failed: " . $e->getMessage();
        }

        // 3. Check www record if enabled for apex domain
        if ($domainModel->www_enabled && $isApexDomain) {
            $wwwHost = "www.{$domain}";
            try {
                $cnameRecords = @dns_get_record($wwwHost, DNS_CNAME);
                $wwwARecords = $this->resolveARecords($wwwHost);

                $wwwResolved = [];
                if (!empty($cnameRecords)) {
                    $wwwResolved[] = 'CNAME: ' . ($cnameRecords[0]['target'] ?? '');
                }
                if (!empty($wwwARecords)) {
                    $wwwResolved[] = 'A: ' . implode(', ', $wwwARecords);
                }

                $results['resolved_www'] = $wwwResolved;

                $hasValidCname = !empty($cnameRecords) && (strcasecmp($cnameRecords[0]['target'] ?? '', $domain) === 0 || strcasecmp($cnameRecords[0]['target'] ?? '', "{$domain}.") === 0);
                $hasValidA = !empty($wwwARecords) && in_array($expectedIp, $wwwARecords, true);

                if ($hasValidCname || $hasValidA) {
                    $results['www_record_valid'] = true;
                    $results['details'][] = "www.{$domain} DNS record correctly configured.";
                } else {
                    $results['details'][] = "Notice: www.{$domain} is not pointing to {$domain} or {$expectedIp} yet.";
                }
            } catch (\Throwable $e) {
                // Non-blocking
            }
        }

        // Final verification check: Both A record and TXT token must be valid
        $results['success'] = ($results['a_record_valid'] && $results['txt_record_valid']);

        return $results;
    }

    /**
     * Resolve A records using PHP native dns_get_record with Google & Cloudflare DoH fallback
     */
    public function resolveARecords(string $domain): array
    {
        $ips = [];
        $expectedIp = $this->getExpectedServerIp();

        // 1. Native PHP DNS lookup
        try {
            $records = @dns_get_record($domain, DNS_A);
            if (!empty($records)) {
                foreach ($records as $r) {
                    if (!empty($r['ip'])) {
                        $ips[] = trim($r['ip']);
                    }
                }
            }
        } catch (\Throwable $e) {}

        if (in_array($expectedIp, $ips, true)) {
            return array_values(array_unique($ips));
        }

        // 2. Google DNS-over-HTTPS (DoH) for real-time authoritative resolution
        try {
            $dohIps = $this->queryGoogleDoh($domain, 'A');
            if (!empty($dohIps)) {
                $ips = array_merge($ips, $dohIps);
            }
        } catch (\Throwable $e) {}

        if (in_array($expectedIp, $ips, true)) {
            return array_values(array_unique($ips));
        }

        // 3. Cloudflare DNS-over-HTTPS (DoH)
        try {
            $cfIps = $this->queryCloudflareDoh($domain, 'A');
            if (!empty($cfIps)) {
                $ips = array_merge($ips, $cfIps);
            }
        } catch (\Throwable $e) {}

        return array_values(array_unique($ips));
    }

    /**
     * Resolve TXT records using PHP native dns_get_record with Google & Cloudflare DoH fallback
     */
    public function resolveTxtRecords(string $host): array
    {
        $tokens = [];

        // 1. Native PHP DNS lookup
        try {
            $records = @dns_get_record($host, DNS_TXT);
            if (!empty($records)) {
                foreach ($records as $tr) {
                    $val = trim($tr['txt'] ?? $tr['entries'][0] ?? '');
                    if (!empty($val)) {
                        $tokens[] = $val;
                    }
                }
            }
        } catch (\Throwable $e) {}

        // 2. Google DNS-over-HTTPS (DoH)
        try {
            $dohTokens = $this->queryGoogleDoh($host, 'TXT');
            if (!empty($dohTokens)) {
                $tokens = array_merge($tokens, $dohTokens);
            }
        } catch (\Throwable $e) {}

        // 3. Cloudflare DNS-over-HTTPS (DoH)
        try {
            $cfTokens = $this->queryCloudflareDoh($host, 'TXT');
            if (!empty($cfTokens)) {
                $tokens = array_merge($tokens, $cfTokens);
            }
        } catch (\Throwable $e) {}

        return array_values(array_unique($tokens));
    }

    /**
     * Query Google DNS-over-HTTPS
     */
    protected function queryGoogleDoh(string $name, string $type): array
    {
        $url = "https://dns.google/resolve?name=" . urlencode($name) . "&type=" . urlencode($type);
        $ctx = stream_context_create([
            'http' => [
                'timeout' => 4,
                'header' => "Accept: application/json\r\nUser-Agent: Shoppy-ERP-DNS-Verifier/1.0\r\n",
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ]
        ]);

        $res = @file_get_contents($url, false, $ctx);
        if (!$res) {
            return [];
        }

        $json = @json_decode($res, true);
        $items = [];
        if (!empty($json['Answer']) && is_array($json['Answer'])) {
            foreach ($json['Answer'] as $ans) {
                if (!empty($ans['data'])) {
                    $data = trim($ans['data'], "\"' \t\n\r\0\x0B");
                    $items[] = $data;
                }
            }
        }

        return $items;
    }

    /**
     * Query Cloudflare DNS-over-HTTPS
     */
    protected function queryCloudflareDoh(string $name, string $type): array
    {
        $url = "https://cloudflare-dns.com/dns-query?name=" . urlencode($name) . "&type=" . urlencode($type);
        $ctx = stream_context_create([
            'http' => [
                'timeout' => 4,
                'header' => "Accept: application/dns-json\r\nUser-Agent: Shoppy-ERP-DNS-Verifier/1.0\r\n",
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ]
        ]);

        $res = @file_get_contents($url, false, $ctx);
        if (!$res) {
            return [];
        }

        $json = @json_decode($res, true);
        $items = [];
        if (!empty($json['Answer']) && is_array($json['Answer'])) {
            foreach ($json['Answer'] as $ans) {
                if (!empty($ans['data'])) {
                    $data = trim($ans['data'], "\"' \t\n\r\0\x0B");
                    $items[] = $data;
                }
            }
        }

        return $items;
    }
}
