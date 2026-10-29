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
}
