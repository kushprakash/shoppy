<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 64)->unique(); // all_category, standard, enterprise
            $table->decimal('monthly_price', 10, 2);
            $table->decimal('annual_price', 10, 2);
            $table->boolean('all_category_access')->default(false);
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('subscription_category_prices', function (Blueprint $table) {
            $table->id();
            $table->string('category_code', 64)->unique(); // fashion, grocery, pharmacy, electronics, etc.
            $table->string('category_name', 128);
            $table->decimal('monthly_price', 10, 2);
            $table->decimal('annual_price', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('shop_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained('shops')->cascadeOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained('subscription_plans')->nullOnDelete();
            $table->json('licensed_categories')->nullable(); // List of category codes active
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('grace_ends_at')->nullable(); // +7 days after expires_at
            $table->string('status', 32)->default('active'); // active, grace, suspended, archived
            $table->boolean('auto_renew')->default(true);
            $table->timestamps();
        });

        Schema::create('subscription_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained('shops')->cascadeOnDelete();
            $table->foreignId('shop_subscription_id')->nullable()->constrained('shop_subscriptions')->nullOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 64)->default('online');
            $table->string('gateway', 64)->nullable(); // phonepe, razorpay, cashfree, manual
            $table->string('transaction_id', 128)->nullable();
            $table->string('status', 32)->default('completed'); // pending, completed, failed
            $table->timestamps();
        });

        Schema::create('saas_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained('shops')->cascadeOnDelete();
            $table->foreignId('subscription_payment_id')->nullable()->constrained('subscription_payments')->nullOnDelete();
            $table->string('invoice_number', 64)->unique();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_total', 10, 2);
            $table->decimal('grand_total', 10, 2);
            $table->string('pdf_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saas_invoices');
        Schema::dropIfExists('subscription_payments');
        Schema::dropIfExists('shop_subscriptions');
        Schema::dropIfExists('subscription_category_prices');
        Schema::dropIfExists('subscription_plans');
    }
};
