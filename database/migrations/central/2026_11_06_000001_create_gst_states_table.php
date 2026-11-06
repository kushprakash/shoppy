<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::connection('mysql')->hasTable('gst_states')) {
            Schema::connection('mysql')->create('gst_states', function (Blueprint $table) {
                $table->id();
                $table->string('state_code', 10)->unique();
                $table->string('state_name', 128);
                $table->boolean('status')->default(true);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::connection('mysql')->dropIfExists('gst_states');
    }
};

