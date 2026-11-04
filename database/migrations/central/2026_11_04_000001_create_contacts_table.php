<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::connection('mysql')->hasTable('contacts')) {
            Schema::connection('mysql')->create('contacts', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->nullable();
                $table->string('phone', 32)->nullable();
                $table->string('subject')->nullable();
                $table->text('message')->nullable();
                $table->string('ip_address', 64)->nullable();
                $table->text('user_agent')->nullable();
                $table->string('status', 32)->default('new');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('mysql')->dropIfExists('contacts');
    }
};

