<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentCommission extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $fillable = [
        'agent_id',
        'shop_id',
        'subscription_payment_id',
        'commission_type',
        'commission_amount',
        'tds_rate',
        'tds_amount',
        'net_payable',
        'status',
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
