<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GstStatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(?string $connection = null): void
    {
        $conn = $connection ?: 'mysql';

        $states = [
            ['state_code' => '01', 'state_name' => 'JAMMU AND KASHMIR', 'status' => 1],
            ['state_code' => '02', 'state_name' => 'HIMACHAL PRADESH', 'status' => 1],
            ['state_code' => '03', 'state_name' => 'PUNJAB', 'status' => 1],
            ['state_code' => '04', 'state_name' => 'CHANDIGARH', 'status' => 1],
            ['state_code' => '05', 'state_name' => 'UTTARAKHAND', 'status' => 1],
            ['state_code' => '06', 'state_name' => 'HARYANA', 'status' => 1],
            ['state_code' => '07', 'state_name' => 'DELHI', 'status' => 1],
            ['state_code' => '08', 'state_name' => 'RAJASTHAN', 'status' => 1],
            ['state_code' => '09', 'state_name' => 'UTTAR PRADESH', 'status' => 1],
            ['state_code' => '10', 'state_name' => 'BIHAR', 'status' => 1],
            ['state_code' => '11', 'state_name' => 'SIKKIM', 'status' => 1],
            ['state_code' => '12', 'state_name' => 'ARUNACHAL PRADESH', 'status' => 1],
            ['state_code' => '13', 'state_name' => 'NAGALAND', 'status' => 1],
            ['state_code' => '14', 'state_name' => 'MANIPUR', 'status' => 1],
            ['state_code' => '15', 'state_name' => 'MIZORAM', 'status' => 1],
            ['state_code' => '16', 'state_name' => 'TRIPURA', 'status' => 1],
            ['state_code' => '17', 'state_name' => 'MEGHALAYA', 'status' => 1],
            ['state_code' => '18', 'state_name' => 'ASSAM', 'status' => 1],
            ['state_code' => '19', 'state_name' => 'WEST BENGAL', 'status' => 1],
            ['state_code' => '20', 'state_name' => 'JHARKHAND', 'status' => 1],
            ['state_code' => '21', 'state_name' => 'ODISHA', 'status' => 1],
            ['state_code' => '22', 'state_name' => 'CHHATTISGARH', 'status' => 1],
            ['state_code' => '23', 'state_name' => 'MADHYA PRADESH', 'status' => 1],
            ['state_code' => '24', 'state_name' => 'GUJARAT', 'status' => 1],
            ['state_code' => '26', 'state_name' => 'DADRA AND NAGAR HAVELI AND DAMAN AND DIU', 'status' => 1],
            ['state_code' => '27', 'state_name' => 'MAHARASHTRA', 'status' => 1],
            ['state_code' => '29', 'state_name' => 'KARNATAKA', 'status' => 1],
            ['state_code' => '30', 'state_name' => 'GOA', 'status' => 1],
            ['state_code' => '31', 'state_name' => 'LAKSHADWEEP', 'status' => 1],
            ['state_code' => '32', 'state_name' => 'KERALA', 'status' => 1],
            ['state_code' => '33', 'state_name' => 'TAMIL NADU', 'status' => 1],
            ['state_code' => '34', 'state_name' => 'PUDUCHERRY', 'status' => 1],
            ['state_code' => '35', 'state_name' => 'ANDAMAN AND NICOBAR ISLANDS', 'status' => 1],
            ['state_code' => '36', 'state_name' => 'TELANGANA', 'status' => 1],
            ['state_code' => '37', 'state_name' => 'ANDHRA PRADESH', 'status' => 1],
            ['state_code' => '38', 'state_name' => 'LADAKH', 'status' => 1],
            ['state_code' => '97', 'state_name' => 'OTHER TERRITORY', 'status' => 1],
            ['state_code' => '99', 'state_name' => 'OTHER COUNTRY', 'status' => 1],
            ['state_code' => '25', 'state_name' => 'DAMAN AND DIU (OLD)', 'status' => 0],
            ['state_code' => '28', 'state_name' => 'ANDHRA PRADESH (OLD)', 'status' => 0],
        ];

        foreach ($states as $s) {
            DB::connection($conn)->table('gst_states')->updateOrInsert(
                ['state_code' => $s['state_code']],
                [
                    'state_name' => $s['state_name'],
                    'status' => $s['status'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}

