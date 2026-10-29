<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'pan_number',
        'bank_name',
        'bank_account_no',
        'bank_ifsc',
        'upi_id',
        'referral_code',
        'status',
        'commission_rate_percent',
        'fixed_signup_bonus',
        'approved_at',
        'notes',
    ];

    public function referrals()
    {
        return $this->hasMany(AgentReferral::class);
    }

    public function commissions()
    {
        return $this->hasMany(AgentCommission::class);
    }

    public function payouts()
    {
        return $this->hasMany(AgentPayout::class);
    }
}
