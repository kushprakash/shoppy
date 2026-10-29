<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentReferral extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $fillable = [
        'agent_id',
        'shop_id',
        'referral_code',
        'referred_at',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
