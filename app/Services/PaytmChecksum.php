<?php

namespace App\Services;

class PaytmChecksum
{
    private static $iv = "@@@@&&&&####$$$$";

    public static function encrypt(string $input, string $key): string
    {
        $key = html_entity_decode($key);
        if (function_exists('openssl_encrypt')) {
            return openssl_encrypt($input, "AES-128-CBC", $key, 0, self::$iv) ?: '';
        }
        return '';
    }

    public static function decrypt(string $encrypted, string $key): string
    {
        $key = html_entity_decode($key);
        if (function_exists('openssl_decrypt')) {
            return openssl_decrypt($encrypted, "AES-128-CBC", $key, 0, self::$iv) ?: '';
        }
        return '';
    }

    public static function generateSignature($params, string $key): string
    {
        if (!is_array($params) && !is_string($params)) {
            throw new \InvalidArgumentException("string or array expected, " . gettype($params) . " given");
        }
        if (is_array($params)) {
            $params = self::getStringByParams($params);
        }
        return self::generateSignatureByString($params, $key);
    }

    public static function verifySignature($params, string $key, string $checksum): bool
    {
        if (!is_array($params) && !is_string($params)) {
            throw new \InvalidArgumentException("string or array expected, " . gettype($params) . " given");
        }
        if (is_array($params) && isset($params['CHECKSUMHASH'])) {
            unset($params['CHECKSUMHASH']);
        }
        if (is_array($params)) {
            $params = self::getStringByParams($params);
        }
        return self::verifySignatureByString($params, $key, $checksum);
    }

    private static function generateSignatureByString(string $params, string $key): string
    {
        $salt = self::generateRandomString(4);
        return self::calculateChecksum($params, $key, $salt);
    }

    private static function verifySignatureByString(string $params, string $key, string $checksum): bool
    {
        $paytm_hash = self::decrypt($checksum, $key);
        $salt = substr($paytm_hash, -4);
        return $paytm_hash === self::calculateHash($params, $salt);
    }

    private static function generateRandomString(int $length): string
    {
        $data = "9876543210ZYXWVUTSRQPONMLKJIHGFEDCBAabcdefghijklmnopqrstuvwxyz!@#$&_";
        $random = "";
        $max = strlen($data) - 1;
        for ($i = 0; $i < $length; $i++) {
            $random .= $data[random_int(0, $max)];
        }
        return $random;
    }

    private static function getStringByParams(array $params): string
    {
        ksort($params);
        $params = array_map(function ($value) {
            return ($value !== null && strtolower((string)$value) !== "null") ? (string)$value : "";
        }, $params);
        return implode("|", $params);
    }

    private static function calculateHash(string $params, string $salt): string
    {
        $finalString = $params . "|" . $salt;
        $hash = hash("sha256", $finalString);
        return $hash . $salt;
    }

    private static function calculateChecksum(string $params, string $key, string $salt): string
    {
        $hashString = self::calculateHash($params, $salt);
        return self::encrypt($hashString, $key);
    }
}

