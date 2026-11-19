<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::connection('mysql')->hasTable('store_domains')) {
            Schema::connection('mysql')->create('store_domains', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->foreignId('store_id')->constrained('shops')->cascadeOnDelete();
                $table->string('domain', 255)->unique();
                $table->boolean('www_enabled')->default(true);
                $table->string('verification_token', 255)->index();
                $table->string('dns_status', 50)->default('pending'); // pending, verified, failed
                $table->string('ssl_status', 50)->default('pending'); // pending, active, failed
                $table->string('status', 50)->default('pending_verification'); // pending_verification, dns_verified, provisioning, ssl_pending, active, failed, removing
                $table->string('nginx_config_path', 500)->nullable();
                $table->timestamp('ssl_expiry_at')->nullable();
                $table->timestamp('verified_at')->nullable();
                $table->timestamp('activated_at')->nullable();
                $table->text('error_message')->nullable();
                $table->timestamps();

                $table->index('status');
                $table->index('store_id');
            });
        }

        if (!Schema::connection('mysql')->hasTable('store_domain_logs')) {
            Schema::connection('mysql')->create('store_domain_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('store_domain_id')->constrained('store_domains')->cascadeOnDelete();
                $table->string('action', 64); // submitted, dns_check, provisioning, ssl_issue, activated, error, removed
                $table->string('status', 32); // info, success, warning, failed
                $table->text('message')->nullable();
                $table->json('details')->nullable();
                $table->timestamps();

                $table->index('store_domain_id');
            });
        }
    }

    public function down(): void
    {
        Schema::connection('mysql')->dropIfExists('store_domain_logs');
        Schema::connection('mysql')->dropIfExists('store_domains');
    }
};
