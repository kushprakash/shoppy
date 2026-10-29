<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopDomain extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $fillable = [
        'shop_id',
        'domain',
        'is_custom',
        'is_verified',
        'ssl_status',
        'is_primary',
    ];

    protected $casts = [
        'is_custom' => 'boolean',
        'is_verified' => 'boolean',
        'is_primary' => 'boolean',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
