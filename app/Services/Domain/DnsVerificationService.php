<?php

namespace App\Services\Domain;

use App\Models\StoreDomain;

class DnsVerificationService
{
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
     * 1. A Record points to Expected Server IP
     * 2. TXT Record '_shoppy-verification.<domain>' matches domain verification_token
     * 3. (Optional) www CNAME / A record if www_enabled
     */
    public function verify(StoreDomain $domainModel): array
    {
        $domain = $domainModel->domain;
        $token = $domainModel->verification_token;
        $expectedIp = $this->getExpectedServerIp();
        $isRootDomain = (substr_count($domain, '.') === 1);

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
            $aRecords = @dns_get_record($domain, DNS_A);
            if (!empty($aRecords)) {
                $ips = array_column($aRecords, 'ip');
                $results['resolved_ips'] = $ips;
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
                $txtRecords = @dns_get_record($th, DNS_TXT);
                if (!empty($txtRecords)) {
                    foreach ($txtRecords as $tr) {
                        $txtVal = trim($tr['txt'] ?? $tr['entries'][0] ?? '');
                        if (!empty($txtVal)) {
                            $foundTxtTokens[] = $txtVal;
                        }
                    }
                }
            }

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
        if ($domainModel->www_enabled && $isRootDomain) {
            $wwwHost = "www.{$domain}";
            try {
                $cnameRecords = @dns_get_record($wwwHost, DNS_CNAME);
                $wwwARecords = @dns_get_record($wwwHost, DNS_A);

                $wwwResolved = [];
                if (!empty($cnameRecords)) {
                    $wwwResolved[] = 'CNAME: ' . ($cnameRecords[0]['target'] ?? '');
                }
                if (!empty($wwwARecords)) {
                    $wwwResolved[] = 'A: ' . implode(', ', array_column($wwwARecords, 'ip'));
                }

                $results['resolved_www'] = $wwwResolved;

                $hasValidCname = !empty($cnameRecords) && (strcasecmp($cnameRecords[0]['target'] ?? '', $domain) === 0 || strcasecmp($cnameRecords[0]['target'] ?? '', "{$domain}.") === 0);
                $hasValidA = !empty($wwwARecords) && in_array($expectedIp, array_column($wwwARecords, 'ip'), true);

                if ($hasValidCname || $hasValidA) {
                    $results['www_record_valid'] = true;
                    $results['details'][] = "www.{$domain} DNS record correctly configured.";
                } else {
                    // www issue is recorded as notice but we don't strictly fail root verification if customer hasn't added www yet
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
}
