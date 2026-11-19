<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreDomainLog extends Model
{
    use HasFactory;

    protected $connection = 'mysql';
    protected $table = 'store_domain_logs';

    protected $fillable = [
        'store_domain_id',
        'action',
        'status',
        'message',
        'details',
    ];

    protected $casts = [
        'details' => 'array',
    ];

    public function storeDomain()
    {
        return $this->belongsTo(StoreDomain::class, 'store_domain_id');
    }
}
