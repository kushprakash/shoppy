<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mysql')->table('agents', function (Blueprint $table) {
            if (!Schema::connection('mysql')->hasColumn('agents', 'password')) {
                $table->string('password')->nullable()->after('phone');
            }
            if (!Schema::connection('mysql')->hasColumn('agents', 'photo')) {
                $table->string('photo')->nullable()->after('name');
            }
            if (!Schema::connection('mysql')->hasColumn('agents', 'address')) {
                $table->text('address')->nullable()->after('phone');
            }
            if (!Schema::connection('mysql')->hasColumn('agents', 'city')) {
                $table->string('city', 128)->nullable()->after('address');
            }
            if (!Schema::connection('mysql')->hasColumn('agents', 'state')) {
                $table->string('state', 128)->nullable()->after('city');
            }
            if (!Schema::connection('mysql')->hasColumn('agents', 'id_card_number')) {
                $table->string('id_card_number', 64)->nullable()->after('referral_code');
            }
        });
    }

    public function down(): void
    {
        Schema::connection('mysql')->table('agents', function (Blueprint $table) {
            $cols = ['password', 'photo', 'address', 'city', 'state', 'id_card_number'];
            foreach ($cols as $col) {
                if (Schema::connection('mysql')->hasColumn('agents', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
