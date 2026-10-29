<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopCredential extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $fillable = [
        'shop_id',
        'merchant_key_hash',
        'merchant_key_encrypted',
        'key_version',
        'status',
        'last_rotated_at',
    ];

    protected $hidden = [
        'merchant_key_hash',
        'merchant_key_encrypted',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
