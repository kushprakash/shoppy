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
        if (Schema::connection('mysql')->hasTable('subscription_payments')) {
            Schema::connection('mysql')->table('subscription_payments', function (Blueprint $table) {
                if (!Schema::connection('mysql')->hasColumn('subscription_payments', 'metadata')) {
                    $table->longText('metadata')->nullable()->after('status');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::connection('mysql')->hasTable('subscription_payments')) {
            Schema::connection('mysql')->table('subscription_payments', function (Blueprint $table) {
                if (Schema::connection('mysql')->hasColumn('subscription_payments', 'metadata')) {
                    $table->dropColumn('metadata');
                }
            });
        }
    }
};

