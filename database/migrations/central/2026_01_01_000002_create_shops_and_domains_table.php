<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('shop_code', 64)->unique(); // e.g. SHP-1001
            $table->string('slug', 128)->unique();      // e.g. ramesh-fashion
            $table->string('database_name', 128)->unique(); // e.g. tenant_shoppy_1001
            $table->string('status', 32)->default('active'); // active, grace, suspended, archived
            $table->string('owner_name');
            $table->string('owner_email');
            $table->string('owner_phone', 32);
            $table->json('settings')->nullable(); // general configs
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('shop_domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained('shops')->cascadeOnDelete();
            $table->string('domain', 191)->unique(); // e.g. ramesh.shoppy.local or rameshfashion.com
            $table->boolean('is_custom')->default(false);
            $table->boolean('is_verified')->default(true);
            $table->string('ssl_status', 32)->default('active'); // pending, active, failed
            $table->boolean('is_primary')->default(true);
            $table->timestamps();
        });

        Schema::create('shop_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained('shops')->cascadeOnDelete();
            $table->string('merchant_key_hash', 128); // For server-side fast verification
            $table->text('merchant_key_encrypted');   // Encrypted-at-rest
            $table->unsignedInteger('key_version')->default(1);
            $table->string('status', 32)->default('active'); // active, rotating, revoked
            $table->timestamp('last_rotated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_credentials');
        Schema::dropIfExists('shop_domains');
        Schema::dropIfExists('shops');
    }
};
