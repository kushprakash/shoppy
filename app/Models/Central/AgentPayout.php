<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentPayout extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $fillable = [
        'agent_id',
        'amount',
        'payment_mode',
        'utr_number',
        'status',
        'paid_at',
        'notes',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}
