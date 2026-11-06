<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shop extends Model
{
    use HasFactory, SoftDeletes;

    protected $connection = 'mysql'; // Always connects to Central Database

    protected $fillable = [
        'name',
        'shop_code',
        'slug',
        'database_name',
        'status',
        'owner_name',
        'owner_email',
        'owner_phone',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function domains()
    {
        return $this->hasMany(ShopDomain::class);
    }

    public function primaryDomain()
    {
        return $this->hasOne(ShopDomain::class)->where('is_primary', true);
    }

    public function credentials()
    {
        return $this->hasOne(ShopCredential::class);
    }

    public function subscription()
    {
        return $this->hasOne(ShopSubscription::class)->latestOfMany();
    }

    public function isOperational(): bool
    {
        return in_array($this->status, ['active', 'grace']);
    }

    public function isSuspended(): bool
    {
        return in_array($this->status, ['suspended', 'archived']);
    }

    /**
     * Compute standardized tenant database name prefixed with Central DB.
     * e.g. Central DB: shoppy-live, Store: M/S ZAMZAM ENTERPRISES -> shoppy-live-MS-ZAMZAM-ENTERPRISES
     */
    public static function buildTenantDatabaseName(string $storeName, ?string $shopCode = null): string
    {
        $centralDb = config('database.connections.mysql.database', 'shoppy_live');

        // Clean store name: remove slashes and backslashes
        $clean = str_replace(['/', '\\'], '', $storeName);
        // Convert non-alphanumeric (except hyphen and underscore) to hyphen
        $slug = preg_replace('/[^a-zA-Z0-9_\-]+/', '-', $clean);
        $slug = trim($slug, '-');
        $slug = strtoupper($slug);

        if (empty($slug)) {
            $slug = $shopCode ? strtoupper($shopCode) : 'STORE';
        }

        // e.g. shoppy-live-MS-ZAMZAM-ENTERPRISES
        $dbName = "{$centralDb}-{$slug}";

        // Max identifier length in MySQL is 64 characters
        if (strlen($dbName) > 60) {
            $dbName = substr($dbName, 0, 60);
        }

        return $dbName;
    }
}
