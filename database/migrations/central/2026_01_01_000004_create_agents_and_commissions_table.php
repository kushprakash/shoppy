<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 32)->unique();
            $table->string('pan_number', 32)->nullable();
            $table->string('bank_name', 128)->nullable();
            $table->string('bank_account_no', 64)->nullable();
            $table->string('bank_ifsc', 32)->nullable();
            $table->string('upi_id', 128)->nullable();
            $table->string('referral_code', 64)->unique(); // e.g. AGT-1001
            $table->string('status', 32)->default('pending'); // pending, approved, rejected, blocked
            $table->decimal('commission_rate_percent', 5, 2)->default(10.00); // 10% on renewals
            $table->decimal('fixed_signup_bonus', 10, 2)->default(500.00);    // ₹500 on first signup
            $table->timestamp('approved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('agent_referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->foreignId('shop_id')->constrained('shops')->cascadeOnDelete();
            $table->string('referral_code', 64);
            $table->timestamp('referred_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('agent_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->foreignId('shop_id')->constrained('shops')->cascadeOnDelete();
            $table->foreignId('subscription_payment_id')->nullable()->constrained('subscription_payments')->nullOnDelete();
            $table->string('commission_type', 32)->default('renewal'); // signup, renewal, bonus
            $table->decimal('commission_amount', 10, 2);
            $table->decimal('tds_rate', 5, 2)->default(5.00); // 5% TDS
            $table->decimal('tds_amount', 10, 2)->default(0.00);
            $table->decimal('net_payable', 10, 2);
            $table->string('status', 32)->default('pending'); // pending, approved, paid
            $table->timestamps();
        });

        Schema::create('agent_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('payment_mode', 32)->default('bank_transfer'); // bank_transfer, upi, cheque
            $table->string('utr_number', 128)->nullable();
            $table->string('status', 32)->default('pending'); // requested, processed, rejected
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_payouts');
        Schema::dropIfExists('agent_commissions');
        Schema::dropIfExists('agent_referrals');
        Schema::dropIfExists('agents');
    }
};
