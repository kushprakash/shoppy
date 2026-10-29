<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_provisioning_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->nullable()->constrained('shops')->nullOnDelete();
            $table->string('job_type', 64)->default('create_database'); // create_database, run_migrations, rollback
            $table->string('database_name', 128);
            $table->string('status', 32)->default('pending'); // pending, running, completed, failed
            $table->text('error_message')->nullable();
            $table->unsignedSmallInteger('retries')->default(0);
            $table->timestamps();
        });

        Schema::create('shop_metrics_daily', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained('shops')->cascadeOnDelete();
            $table->date('metric_date')->index();
            $table->decimal('daily_gmv', 12, 2)->default(0.00);
            $table->unsignedInteger('order_count')->default(0);
            $table->unsignedInteger('active_products')->default(0);
            $table->timestamps();

            $table->unique(['shop_id', 'metric_date']);
        });

        Schema::create('security_audit_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id')->nullable()->index();
            $table->string('event_type', 64)->index(); // login_failed, key_rotation, replay_detected, auth_failed
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('severity', 32)->default('info'); // info, warning, critical
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_audit_events');
        Schema::dropIfExists('shop_metrics_daily');
        Schema::dropIfExists('tenant_provisioning_jobs');
    }
};
