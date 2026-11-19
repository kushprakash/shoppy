<?php

namespace App\Models;

use App\Models\Central\Shop;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreDomain extends Model
{
    use HasFactory;

    protected $connection = 'mysql';
    protected $table = 'store_domains';

    protected $fillable = [
        'user_id',
        'store_id',
        'domain',
        'www_enabled',
        'verification_token',
        'dns_status',
        'ssl_status',
        'status',
        'nginx_config_path',
        'ssl_expiry_at',
        'verified_at',
        'activated_at',
        'error_message',
    ];

    protected $casts = [
        'www_enabled' => 'boolean',
        'ssl_expiry_at' => 'datetime',
        'verified_at' => 'datetime',
        'activated_at' => 'datetime',
    ];

    public function store()
    {
        return $this->belongsTo(Shop::class, 'store_id');
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'store_id');
    }

    public function logs()
    {
        return $this->hasMany(StoreDomainLog::class, 'store_domain_id')->latest();
    }

    public function log(string $action, string $status, ?string $message = null, ?array $details = null): StoreDomainLog
    {
        return $this->logs()->create([
            'action' => $action,
            'status' => $status,
            'message' => $message,
            'details' => $details,
        ]);
    }
}
