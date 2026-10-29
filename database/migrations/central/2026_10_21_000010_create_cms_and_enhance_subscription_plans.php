<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Enhance subscription_plans table with full dynamic fields
        Schema::table('subscription_plans', function (Blueprint $table) {
            if (!Schema::hasColumn('subscription_plans', 'short_name')) {
                $table->string('short_name', 100)->nullable()->after('name');
            }
            if (!Schema::hasColumn('subscription_plans', 'category')) {
                $table->string('category', 64)->default('business')->after('short_name');
            }
            if (!Schema::hasColumn('subscription_plans', 'badge')) {
                $table->string('badge', 100)->nullable()->after('category');
            }
            if (!Schema::hasColumn('subscription_plans', 'ribbon_bg')) {
                $table->string('ribbon_bg', 64)->default('bg-[#008ba3]')->after('badge');
            }
            if (!Schema::hasColumn('subscription_plans', 'button_text')) {
                $table->string('button_text', 64)->default('SIGN UP')->after('ribbon_bg');
            }
            if (!Schema::hasColumn('subscription_plans', 'has_whatsapp')) {
                $table->boolean('has_whatsapp')->default(false)->after('button_text');
            }
            if (!Schema::hasColumn('subscription_plans', 'has_ecommerce')) {
                $table->boolean('has_ecommerce')->default(false)->after('has_whatsapp');
            }
            if (!Schema::hasColumn('subscription_plans', 'subtext')) {
                $table->string('subtext', 255)->nullable()->after('has_ecommerce');
            }
            if (!Schema::hasColumn('subscription_plans', 'cycles')) {
                $table->json('cycles')->nullable()->after('subtext');
            }
            if (!Schema::hasColumn('subscription_plans', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('is_active');
            }
        });

        // 2. Website Settings table (Enexa IT Solutions Private Limited branding & CMS)
        if (!Schema::hasTable('website_settings')) {
            Schema::create('website_settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->longText('value')->nullable();
                $table->string('group', 64)->default('general');
                $table->timestamps();
            });
        }

        // 3. Blogs table
        if (!Schema::hasTable('blogs')) {
            Schema::create('blogs', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('excerpt')->nullable();
                $table->longText('content');
                $table->string('cover_image')->nullable();
                $table->string('category', 64)->default('Retail Tech');
                $table->string('author')->default('Enexa IT Solutions Team');
                $table->string('read_time', 32)->default('4 min read');
                $table->boolean('is_published')->default(true);
                $table->timestamp('published_at')->nullable();
                $table->timestamps();
            });
        }

        // 4. Contact Inquiries / Leads table
        if (!Schema::hasTable('contact_inquiries')) {
            Schema::create('contact_inquiries', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->nullable();
                $table->string('phone');
                $table->string('business_name')->nullable();
                $table->string('city')->nullable();
                $table->string('service_interested')->nullable();
                $table->text('message')->nullable();
                $table->string('status', 32)->default('new'); // new, contacted, demo_scheduled, closed
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_inquiries');
        Schema::dropIfExists('blogs');
        Schema::dropIfExists('website_settings');
    }
};
