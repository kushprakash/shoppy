<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopSubscription extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $fillable = [
        'shop_id',
        'plan_id',
        'licensed_categories',
        'starts_at',
        'expires_at',
        'grace_ends_at',
        'status',
        'auto_renew',
    ];

    protected $casts = [
        'licensed_categories' => 'array',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'grace_ends_at' => 'datetime',
        'auto_renew' => 'boolean',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
