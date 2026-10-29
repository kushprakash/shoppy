<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 5 Payment Gateways (PhonePe, PayU, Cashfree, Easebuzz, Razorpay)
        Schema::create('tenant_payment_gateways', function (Blueprint $table) {
            $table->id();
            $table->string('gateway_code', 32)->unique(); // phonepe, payu, cashfree, easebuzz, razorpay
            $table->string('display_name', 64);
            $table->text('credentials_encrypted')->nullable(); // JSON encrypted with app key
            $table->boolean('is_active')->default(false);
            $table->boolean('is_test_mode')->default(true);
            $table->timestamps();
        });

        // 5 Courier Aggregators (Shiprocket, iThink Logistics, NimbusPost, Shipmozo, Shipway)
        Schema::create('tenant_shipping_providers', function (Blueprint $table) {
            $table->id();
            $table->string('provider_code', 32)->unique(); // shiprocket, ithink, nimbuspost, shipmozo, shipway
            $table->string('display_name', 64);
            $table->text('credentials_encrypted')->nullable();
            $table->string('pickup_pincode', 16)->nullable();
            $table->json('settings')->nullable(); // warehouse id, default courier
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        // WhatsApp / SMS / Email communication channels
        Schema::create('tenant_notification_settings', function (Blueprint $table) {
            $table->id();
            $table->string('channel', 32); // whatsapp, sms, email
            $table->string('provider', 64); // gupshup, msg91, ses, smtp
            $table->text('credentials_encrypted')->nullable();
            $table->json('templates')->nullable(); // templates for POS bill, order placed, etc.
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->unique(['channel', 'provider']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_notification_settings');
        Schema::dropIfExists('tenant_shipping_providers');
        Schema::dropIfExists('tenant_payment_gateways');
    }
};
