import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { 
  ShoppingBag, ShoppingCart, ShieldCheck, Truck, ArrowRight, CheckCircle2, 
  CreditCard, Sparkles, AlertCircle, Search, Tag, X, User, MapPin, Phone,
  Layers, Palette, Maximize2, Check, ChevronRight, ChevronLeft, PackageCheck, Zap,
  Star, Heart, Eye, Clock, Flame, Percent, RotateCcw, BadgeCheck, Gift,
  Filter, HelpCircle, Headphones, Share2, ThumbsUp, ChevronDown, CheckCheck,
  ExternalLink, SlidersHorizontal, ArrowUpRight, Menu
} from 'lucide-react';
import { 
  INITIAL_TOP_CATEGORIES, 
  INITIAL_MID_CATEGORIES, 
  INITIAL_SHIPPING_RULES,
  INITIAL_COUPONS
} from '../context/ErpContext';
import { getActiveShopCode, installStoreFetchInterceptor, syncAxiosStoreHeaders } from '../utils/storeAuth';

installStoreFetchInterceptor();

// ============================================================================
// 1. 5 DISTINCT MARKETPLACE THEMES METADATA
// ============================================================================
export const THEMES_META = {
  snapdeal: {
    id: 'snapdeal',
    themeNumber: 1,
    name: 'Theme 1: Snapdeal Style',
    subtitle: 'Lightning Deals & Indian Direct Marketplace',
    accentColor: '#e11d48',
  },
  flipkart: {
    id: 'flipkart',
    themeNumber: 2,
    name: 'Theme 2: Flipkart Style',
    subtitle: 'Iconic Royal Blue, Explore Plus ★ & Dual Yellow/Orange Action Buttons',
    accentColor: '#2874f0',
  },
  jiomart: {
    id: 'jiomart',
    themeNumber: 3,
    name: 'Theme 3: JioMart Style',
    subtitle: 'Jio Blue & Leaf Green Fresh Groceries, Smart Bazaar & Essentials',
    accentColor: '#0078ad',
  },
  amazon: {
    id: 'amazon',
    themeNumber: 4,
    name: 'Theme 4: Amazon India Style',
    subtitle: 'Amazon 2-Tier Dark Nav (#131921), Prime Badges & 4-Quadrant Feature Cards',
    accentColor: '#f08804',
  },
  tatacliq: {
    id: 'tatacliq',
    themeNumber: 5,
    name: 'Theme 5: Tata CLiQ Luxury Style',
    subtitle: 'Minimalist Obsidian & Magenta Curated High-Fashion Boutique',
    accentColor: '#da1c5c',
  }
};

// ============================================================================
// 2. HORIZONTAL CATEGORIES WITH MEGA MENU
// ============================================================================
export const TOP_CATEGORIES_MENU = [
  {
    id: 'ALL',
    name: 'All Departments',
    icon: '⚡',
    count: '1,200+ Items',
    subcategories: ['All Electronics', 'Mobiles & 5G', 'Fashion & Wear', 'Home & Kitchen', 'Supermarket Grocery', 'Beauty & Personal Care', 'Appliances', 'Sports & Fitness'],
    accessories: ['Trending Deals', 'Top 50 Best Sellers', 'Budget Buys Under ₹499', 'Clearance Outlet', 'Fast 24H Delivery'],
    brands: ['Apple', 'Samsung', 'OnePlus', 'Sony', 'Puma', 'Philips', 'Tata Sampann', 'Fortune'],
    promo: {
      title: 'Mega Festive Bazaar',
      badge: 'FLAT ₹150 OFF',
      code: 'SHOPPY150',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'CAT-MOBILES',
    name: 'Mobiles & 5G',
    icon: '📱',
    count: '140+ Phones',
    subcategories: ['Flagship 5G Smartphones', 'Affordable 5G Under ₹20,000', 'Apple iPhones', 'Samsung Galaxy Series', 'OnePlus Nord & Pro', 'Gaming Phones'],
    accessories: ['Fast USB-C Chargers', 'TWS Wireless Earbuds', 'MagSafe Cases & Covers', 'Tempered Glass Protectors', 'High-Speed Power Banks', 'Smartwatch Fitness Bands'],
    brands: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Google Pixel', 'Motorola'],
    promo: {
      title: 'Flagship Mobiles Fest',
      badge: 'Up to 35% Off',
      code: 'MOBILES150',
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'CAT-ELECTRONICS',
    name: 'Electronics & Audio',
    icon: '🎧',
    count: '280+ Items',
    subcategories: ['Noise Cancelling Headphones', 'True Wireless Earbuds (TWS)', 'Bluetooth Party Speakers', 'Laptops & Workstations', 'Smart Home Assistants', 'PC & Mac Accessories'],
    accessories: ['Braided HDMI Cables', 'Multiport USB-C Docks', 'Surge Protectors', 'Mechanical Keyboards', 'Ergonomic Mice'],
    brands: ['Sony', 'boAt', 'JBL', 'Bose', 'Logitech', 'Sennheiser', 'SanDisk'],
    promo: {
      title: 'Audio Mania Days',
      badge: 'Flat 50% Off',
      code: 'AUDIO50',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'CAT-FASHION',
    name: "Fashion & Wear",
    icon: '👗',
    count: '450+ Styles',
    subcategories: ['Men Cotton Shirts & T-Shirts', 'Women Festive Kurta Sets', 'Slim-Fit Stretch Denim Jeans', 'Athletic Running Sneakers', 'Formal Trousers & Blazers', 'Ethnic Dupattas & Sarees'],
    accessories: ['Genuine Leather Wallets', 'Polarized Sunglasses', 'Analog & Smart Watches', 'Backpacks & Duffle Bags', 'Belt & Tie Combos'],
    brands: ["Levi's", 'Puma', 'Libas', 'Nike', 'Zara', 'Fastrack', 'Allen Solly'],
    promo: {
      title: 'Festive Wardrobe Sale',
      badge: 'Min 60% Off',
      code: 'FASHION150',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'CAT-HOME',
    name: 'Home & Kitchen',
    icon: '🍳',
    count: '190+ Essentials',
    subcategories: ['Granite Non-Stick Cookware Sets', 'Stainless Steel Dinner Sets', 'Gas & Induction Compatible Tawa', 'Bed Linen & Cotton Bedspreads', 'Storage Containers & Lunchboxes'],
    accessories: ['Chef Knife Sets', 'Silicone Spatulas', 'Water Purifier Bottles', 'Microfiber Cleaning Towels'],
    brands: ['Prestige', 'Hawkins', 'Pigeon', 'Milton', 'Wonderchef', 'Borosil'],
    promo: {
      title: 'Kitchen Master Upgrade',
      badge: 'Up to 55% Off',
      code: 'HOMEKITCHEN',
      image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=400&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'CAT-APPLIANCES',
    name: 'Appliances',
    icon: '🔌',
    count: '90+ Models',
    subcategories: ['Heavy Duty 750W Mixer Grinders', 'Induction Cooktops', 'Electric Kettles & Tea Makers', 'Air Fryers & Toasters', 'Garment Steamers & Dry Irons'],
    accessories: ['Stainless Steel Extra Jars', 'Descaling Solutions', 'Surge Adapters'],
    brands: ['Philips', 'Bajaj', 'Morphy Richards', 'Havells', 'Prestige', 'Kent'],
    promo: {
      title: 'Smart Appliance Bonanza',
      badge: 'Save Extra ₹500',
      code: 'APPLIANCE500',
      image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'CAT-GROCERY',
    name: 'Grocery Supermarket',
    icon: '🛒',
    count: '320+ Staples',
    subcategories: ['Pure Refined & Mustard Cooking Oils', 'Unpolished Arhar & Moong Pulses', 'Basmati Long Grain Rice', 'Organic Spices & Masalas', 'Dry Fruits & Almonds', 'Breakfast Cereals & Oats'],
    accessories: ['Direct Farm Honey', 'Desi Cow Ghee', 'Himalayan Pink Rock Salt'],
    brands: ['Fortune', 'Tata Sampann', 'Aashirvaad', 'Dabur', 'Saffola', 'Catch'],
    promo: {
      title: 'Supermarket Express (2 Hr)',
      badge: 'Wholesale Rates',
      code: 'GROCERY100',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'CAT-BEAUTY',
    name: 'Beauty & Wellness',
    icon: '💄',
    count: '160+ Products',
    subcategories: ['Daily Skincare & Sunscreens', 'Hair Serums & Shampoos', 'Luxury Perfumes & Body Mists', 'Men Grooming & Beard Kits', 'Herbal & Ayurvedic Oils'],
    accessories: ['Makeup Sponges', 'Jade Facial Rollers', 'Travel Grooming Pouches'],
    brands: ['L’Oreal', 'Nivea', 'Minimalist', 'The Derma Co', 'Biotique', 'Beardo'],
    promo: {
      title: 'Glow & Glam Days',
      badge: 'Flat 40% Off',
      code: 'BEAUTY40',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80'
    }
  }
];

// ============================================================================
// 3. MASTER CATALOG DATA
// ============================================================================
export const SHOPPY_PRODUCTS = [
  // 1. MOBILES & TECH
  {
    id: 'MOB-101',
    name: 'Apple iPhone 15 Pro (128 GB) - Natural Titanium',
    category: 'Mobiles',
    topCategoryId: 'CAT-MOBILES',
    brand: 'Apple',
    selling_price: 119900,
    mrp: 134900,
    rating: 4.8,
    rating_count: 14280,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    badge: 'Shoppy Certified',
    is_deal_of_day: true,
    bank_offer: 'Flat ₹5,000 Off on HDFC Credit Card',
    delivery_text: 'Free Express Delivery by Tomorrow',
    stock: 18,
    specs: ['128 GB ROM', '15.49 cm (6.1 inch) Super Retina XDR Display', '48MP + 12MP + 12MP Camera', 'A17 Pro Chip Processor'],
    variants: [
      { id: 'v1', size: '128 GB', color: 'Natural Titanium', colorHex: '#9a948d', sellingPrice: 119900, mrp: 134900, sku: 'IP15P-128-NAT' },
      { id: 'v2', size: '256 GB', color: 'Blue Titanium', colorHex: '#2b3648', sellingPrice: 129900, mrp: 144900, sku: 'IP15P-256-BLU' },
      { id: 'v3', size: '512 GB', color: 'Black Titanium', colorHex: '#1e1e1e', sellingPrice: 149900, mrp: 164900, sku: 'IP15P-512-BLK' },
    ]
  },
  {
    id: 'MOB-102',
    name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)',
    category: 'Mobiles',
    topCategoryId: 'CAT-MOBILES',
    brand: 'Samsung',
    selling_price: 109999,
    mrp: 134999,
    rating: 4.7,
    rating_count: 9840,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
    badge: 'Shoppy Certified',
    is_deal_of_day: true,
    bank_offer: '10% Instant Discount on SBI Cards',
    delivery_text: 'Free Express Delivery by Tomorrow',
    stock: 25,
    specs: ['12 GB RAM | 256 GB ROM', '17.27 cm (6.8 inch) Dynamic AMOLED 2X', '200MP + 50MP + 12MP + 10MP Camera', 'Snapdragon 8 Gen 3'],
    variants: [
      { id: 'v1', size: '256 GB', color: 'Titanium Gray', colorHex: '#737373', sellingPrice: 109999, mrp: 134999, sku: 'S24U-256-GRY' },
      { id: 'v2', size: '512 GB', color: 'Titanium Violet', colorHex: '#4c1d95', sellingPrice: 119999, mrp: 144999, sku: 'S24U-512-VIO' },
    ]
  },
  {
    id: 'MOB-103',
    name: 'OnePlus Nord CE4 5G (Dark Chrome, 128 GB) (8 GB RAM)',
    category: 'Mobiles',
    topCategoryId: 'CAT-MOBILES',
    brand: 'OnePlus',
    selling_price: 24999,
    mrp: 27999,
    rating: 4.5,
    rating_count: 32410,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
    badge: 'Shoppy Certified',
    is_deal_of_day: false,
    bank_offer: 'Save ₹1,500 with ICICI Bank Netbanking',
    delivery_text: 'Free Delivery in 2 Days',
    stock: 45,
    specs: ['8 GB RAM | 128 GB ROM', '17.02 cm (6.7 inch) 120 Hz AMOLED', '50MP Sony LYT-600 with OIS', '5500 mAh with 100W SuperVOOC'],
    variants: [
      { id: 'v1', size: '8GB/128GB', color: 'Dark Chrome', colorHex: '#27272a', sellingPrice: 24999, mrp: 27999, sku: 'OP-CE4-128-CHR' },
      { id: 'v2', size: '8GB/256GB', color: 'Celadon Marble', colorHex: '#99f6e4', sellingPrice: 26999, mrp: 29999, sku: 'OP-CE4-256-MAR' },
    ]
  },
  {
    id: 'AUD-104',
    name: 'Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones',
    category: 'Electronics',
    topCategoryId: 'CAT-ELECTRONICS',
    brand: 'Sony',
    selling_price: 26990,
    mrp: 34990,
    rating: 4.8,
    rating_count: 18900,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    badge: 'Top Rated Audio',
    is_deal_of_day: true,
    bank_offer: 'Flat ₹2,000 Instant Cashback',
    delivery_text: 'Free Express Delivery by Tomorrow',
    stock: 30,
    specs: ['Industry Leading Noise Cancellation', '30 Hours Battery Life with Quick Charge', 'Speak-to-Chat & Multipoint Connection'],
    variants: [
      { id: 'v1', size: 'Standard', color: 'Black Matte', colorHex: '#18181b', sellingPrice: 26990, mrp: 34990, sku: 'SNY-WH-BLK' },
      { id: 'v2', size: 'Standard', color: 'Silver Platinum', colorHex: '#e2e8f0', sellingPrice: 26990, mrp: 34990, sku: 'SNY-WH-SLV' },
    ]
  },

  // 2. FASHION & LIFESTYLE
  {
    id: 'FSH-201',
    name: "Levi's Men's 511 Slim Fit Stretch Dark Indigo Denim Jeans",
    category: 'Fashion',
    topCategoryId: 'CAT-FASHION',
    brand: "Levi's",
    selling_price: 1999,
    mrp: 3999,
    rating: 4.6,
    rating_count: 42100,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    badge: 'Best Seller',
    is_deal_of_day: true,
    bank_offer: '50% Flat Clearance Discount',
    delivery_text: 'Free Delivery by Wednesday',
    stock: 70,
    specs: ['99% Cotton, 1% Elastane Stretch', 'Slim fit through seat and thigh with slim leg', 'Zip fly with metal button closure'],
    variants: [
      { id: 'v1', size: '30 Waist', color: 'Dark Indigo Blue', colorHex: '#1e3a8a', sellingPrice: 1999, mrp: 3999, sku: 'LVI-511-30-IND' },
      { id: 'v2', size: '32 Waist', color: 'Dark Indigo Blue', colorHex: '#1e3a8a', sellingPrice: 1999, mrp: 3999, sku: 'LVI-511-32-IND' },
      { id: 'v3', size: '34 Waist', color: 'Washed Black', colorHex: '#27272a', sellingPrice: 2099, mrp: 4199, sku: 'LVI-511-34-BLK' },
      { id: 'v4', size: '36 Waist', color: 'Washed Black', colorHex: '#27272a', sellingPrice: 2099, mrp: 4199, sku: 'LVI-511-36-BLK' },
    ]
  },
  {
    id: 'FSH-202',
    name: 'Libas Women Embroidered Pure Cotton Anarkali Kurta with Pant & Dupatta',
    category: 'Fashion',
    topCategoryId: 'CAT-FASHION',
    brand: 'Libas',
    selling_price: 1299,
    mrp: 3499,
    rating: 4.7,
    rating_count: 19400,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    badge: 'Trending Festive',
    is_deal_of_day: true,
    bank_offer: '62% Off Festive Special',
    delivery_text: 'Free Express Delivery in 2 Days',
    stock: 65,
    specs: ['Pure Cotton Breathable Fabric', 'Zari & Gotta Patti Hand Embroidery', 'Set includes Kurta, Pant & Organza Dupatta'],
    variants: [
      { id: 'v1', size: 'S (36)', color: 'Ruby Red', colorHex: '#be123c', sellingPrice: 1299, mrp: 3499, sku: 'LBS-KUR-S-RED' },
      { id: 'v2', size: 'M (38)', color: 'Ruby Red', colorHex: '#be123c', sellingPrice: 1299, mrp: 3499, sku: 'LBS-KUR-M-RED' },
      { id: 'v3', size: 'L (40)', color: 'Emerald Green', colorHex: '#047857', sellingPrice: 1299, mrp: 3499, sku: 'LBS-KUR-L-GRN' },
      { id: 'v4', size: 'XL (42)', color: 'Emerald Green', colorHex: '#047857', sellingPrice: 1399, mrp: 3699, sku: 'LBS-KUR-XL-GRN' },
    ]
  },
  {
    id: 'FSH-204',
    name: "Puma Unisex-Adult Rebound Future Soft Foam Walking & Gym Sneakers",
    category: 'Fashion',
    topCategoryId: 'CAT-FASHION',
    brand: 'Puma',
    selling_price: 1899,
    mrp: 4999,
    rating: 4.4,
    rating_count: 31200,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    badge: 'Shoppy Certified',
    is_deal_of_day: true,
    bank_offer: 'Extra ₹100 Off on Prepaid UPI',
    delivery_text: 'Free Delivery by Tomorrow',
    stock: 45,
    specs: ['SoftFoam+ Dual-Density Cushioning', 'Durable Rubber Outsole for Grip', 'Padded Collar and Tongue'],
    variants: [
      { id: 'v1', size: 'UK 7', color: 'White / Red Flame', colorHex: '#dc2626', sellingPrice: 1899, mrp: 4999, sku: 'PMA-SNK-07-WHT' },
      { id: 'v2', size: 'UK 8', color: 'White / Red Flame', colorHex: '#dc2626', sellingPrice: 1899, mrp: 4999, sku: 'PMA-SNK-08-WHT' },
      { id: 'v3', size: 'UK 9', color: 'All Black Classic', colorHex: '#18181b', sellingPrice: 1999, mrp: 5199, sku: 'PMA-SNK-09-BLK' },
      { id: 'v4', size: 'UK 10', color: 'All Black Classic', colorHex: '#18181b', sellingPrice: 1999, mrp: 5199, sku: 'PMA-SNK-10-BLK' },
    ]
  },

  // 3. HOME & APPLIANCES
  {
    id: 'HOM-301',
    name: 'Philips Daily Collection 750 Watt Mixer Grinder with 4 Stainless Steel Jars',
    category: 'Appliances',
    topCategoryId: 'CAT-APPLIANCES',
    brand: 'Philips',
    selling_price: 2899,
    mrp: 4995,
    rating: 4.5,
    rating_count: 22800,
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80',
    badge: 'Kitchen Top Seller',
    is_deal_of_day: true,
    bank_offer: '42% Off Mega Kitchen Deal',
    delivery_text: 'Free Delivery by Wednesday',
    stock: 35,
    specs: ['750W Tough Motor with Overload Protector', '4 Heavy Gauge Food Grade Jars', '2-Year Full Manufacturer Warranty'],
    variants: [
      { id: 'v1', size: '750W 4-Jar', color: 'Pistachio White', colorHex: '#f1f5f9', sellingPrice: 2899, mrp: 4995, sku: 'PHP-MXG-750-WHT' },
      { id: 'v2', size: '1000W Heavy', color: 'Metallic Grey', colorHex: '#64748b', sellingPrice: 3899, mrp: 6295, sku: 'PHP-MXG-1000-GRY' },
    ]
  },
  {
    id: 'HOM-302',
    name: 'Prestige Omega Deluxe Induction Compatible 3 Pcs Non-Stick Kitchen Set',
    category: 'Home',
    topCategoryId: 'CAT-HOME',
    brand: 'Prestige',
    selling_price: 1499,
    mrp: 3200,
    rating: 4.4,
    rating_count: 16400,
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
    badge: 'Value Combo',
    is_deal_of_day: false,
    bank_offer: '53% Off Festival Combo',
    delivery_text: 'Free Delivery in 2 Days',
    stock: 50,
    specs: ['3-Layer German Granite Stone Coating', 'Includes Omni Tawa, Fry Pan & Kadai with Glass Lid', 'Gas & Induction Compatible Base'],
    variants: [
      { id: 'v1', size: '3-Piece Set', color: 'Black Granite', colorHex: '#27272a', sellingPrice: 1499, mrp: 3200, sku: 'PRST-CKW-3PC-BLK' },
    ]
  },

  // 4. GROCERY & DAILY ESSENTIALS
  {
    id: 'GRO-401',
    name: 'Fortune Sunlite Refined Sunflower Edible Cooking Oil (5 Litre Can)',
    category: 'Grocery',
    topCategoryId: 'CAT-GROCERY',
    brand: 'Fortune',
    selling_price: 649,
    mrp: 850,
    rating: 4.7,
    rating_count: 54100,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    badge: 'Super Saver',
    is_deal_of_day: true,
    bank_offer: 'Flat ₹50 Off on orders above ₹499',
    delivery_text: 'Free 2-Hour Express Delivery',
    stock: 200,
    specs: ['Enriched with Vitamin A and Vitamin D', 'Heart Healthy Light Edible Oil', '100% Pure Sunflower Seed Extraction'],
    variants: [
      { id: 'v1', size: '5 Litre Can', color: 'Golden Yellow', colorHex: '#eab308', sellingPrice: 649, mrp: 850, sku: 'FTN-OIL-5L' },
      { id: 'v2', size: '1 Litre Pouch', color: 'Golden Yellow', colorHex: '#eab308', sellingPrice: 135, mrp: 175, sku: 'FTN-OIL-1L' },
    ]
  },
  {
    id: 'GRO-402',
    name: 'Tata Sampann Unpolished Pure Desi Toor Dal / Arhar Dal (1 kg Pack)',
    category: 'Grocery',
    topCategoryId: 'CAT-GROCERY',
    brand: 'Tata',
    selling_price: 169,
    mrp: 215,
    rating: 4.6,
    rating_count: 38200,
    image: 'https://images.unsplash.com/photo-1585994192701-49b80f1e0cf6?w=600&auto=format&fit=crop&q=80',
    badge: 'Purity Assured',
    is_deal_of_day: false,
    bank_offer: 'Buy 2 Get 5% Off',
    delivery_text: 'Free 2-Hour Express Delivery',
    stock: 180,
    specs: ['Unpolished - Natural Goodness & Protein Retained', '5-Step Purity & Quality Tested', 'High Dietary Fiber & Rich in Iron'],
    variants: [
      { id: 'v1', size: '1 kg Pack', color: 'Golden Yellow', colorHex: '#ca8a04', sellingPrice: 169, mrp: 215, sku: 'TATA-TRD-1KG' },
      { id: 'v2', size: '2 kg Value Pack', color: 'Golden Yellow', colorHex: '#ca8a04', sellingPrice: 325, mrp: 420, sku: 'TATA-TRD-2KG' },
    ]
  }
];

// ============================================================================
// 4. FULL-WIDTH HERO BANNERS
// ============================================================================
export const HERO_BANNERS = [
  {
    id: 1,
    tag: 'FESTIVE MEGA BAZAAR 2026',
    title: 'Brand Quality, Unbeatable Direct Rates',
    subtitle: 'Up to 80% Off on Top Smartphones, Footwear, Audio Gear & Daily Supermarket Essentials',
    badgeText: 'Instant 10% HDFC & SBI Bank Cashback',
    bgGradient: 'from-[#0f172a] via-[#1e1b4b] to-[#312e81]',
    accentColor: '#e11d48',
    ctaText: 'Explore Mega Deals',
    categoryTarget: 'ALL'
  },
  {
    id: 2,
    tag: '5G MOBILES & TECH BONANZA',
    title: 'Next-Gen Smartphones & Audio Gear',
    subtitle: 'Apple iPhone 15 Pro, Samsung S24 Ultra & OnePlus • No Cost EMI starting at ₹1,499/mo',
    badgeText: 'Extra Exchange Bonus up to ₹5,000',
    bgGradient: 'from-[#881337] via-[#9f1239] to-[#be123c]',
    accentColor: '#f59e0b',
    ctaText: 'Shop Flagship Mobiles',
    categoryTarget: 'CAT-MOBILES'
  },
  {
    id: 3,
    tag: 'SUPERMARKET DIRECT EXPRESS',
    title: 'Pure Kitchen Staples & Edible Oils',
    subtitle: 'Fortune Sunflower Oil, Tata Sampann Pulses & Spices at Guaranteed Wholesale Rates',
    badgeText: 'Flat ₹100 Cashback on 1st Order • 2-Hour Delivery',
    bgGradient: 'from-[#064e3b] via-[#047857] to-[#059669]',
    accentColor: '#34d399',
    ctaText: 'Order Fresh Groceries',
    categoryTarget: 'CAT-GROCERY'
  },
  {
    id: 4,
    tag: 'TRENDING WARDROBE FEST',
    title: 'Premium Ethnic & Casual Collection',
    subtitle: 'Levi’s Denim, Libas Anarkali Sets, Puma Sneakers & Fastrack Watches at 50% - 70% Off',
    badgeText: 'Use Code: SHOPPY150 for Extra ₹150 Off',
    bgGradient: 'from-[#4c1d95] via-[#5b21b6] to-[#6d28d9]',
    accentColor: '#f43f5e',
    ctaText: 'Discover Fashion Trends',
    categoryTarget: 'CAT-FASHION'
  }
];

// ============================================================================
// 5. LIVE SOCIAL PROOF TICKER
// ============================================================================
const SOCIAL_PROOF_EVENTS = [
  { name: 'Amit Kumar', city: 'Patna', item: 'Apple iPhone 15 Pro', time: '1 min ago' },
  { name: 'Priya Sharma', city: 'Bengaluru', item: 'Libas Pure Cotton Anarkali Set', time: 'Just now' },
  { name: 'Vikram Singh', city: 'Jaipur', item: 'Puma Rebound Soft Foam Shoes', time: '3 mins ago' },
  { name: 'Sneha Patel', city: 'Ahmedabad', item: 'Fortune Sunlite Sunflower Oil (5L)', time: '2 mins ago' },
  { name: 'Rajesh Mishra', city: 'Lucknow', item: 'Sony WH-1000XM5 Headphones', time: '4 mins ago' }
];

export default function Storefront() {
  const [shopCode, setShopCode] = useState(() => getActiveShopCode());
  const [storeInfo, setStoreInfo] = useState(null);

  // Check if store owner / admin is previewing a demo theme from Store Settings
  const previewThemeParam = new URLSearchParams(window.location.search).get('preview_theme');
  const serverThemeAttr = typeof document !== 'undefined' ? document.getElementById('root')?.getAttribute('data-theme') : null;

  // Active Theme: Immediate zero-millisecond load from server, or preview parameter
  const [activeThemeId, setActiveThemeId] = useState(() => {
    if (previewThemeParam && THEMES_META[previewThemeParam]) return previewThemeParam;
    if (serverThemeAttr && THEMES_META[serverThemeAttr]) return serverThemeAttr;
    return 'snapdeal';
  });

  // Active Category & Mega Menu State
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategoryFilter, setSearchCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('relevance');

  // Master Products & Variant Selection Map
  const [products, setProducts] = useState(SHOPPY_PRODUCTS);
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const map = {};
    SHOPPY_PRODUCTS.forEach((p) => {
      if (p.variants && p.variants.length > 0) {
        map[p.id] = p.variants[0];
      }
    });
    return map;
  });

  // Cart & Modals
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addedToCartNotification, setAddedToCartNotification] = useState(null);
  const addedToCartTimerRef = useRef(null);
  const [welcomePopupOpen, setWelcomePopupOpen] = useState(false);
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState('800001');
  const [pincodeInput, setPincodeInput] = useState('800001');
  const [wishlist, setWishlist] = useState({});

  // Carousel Active Slide
  const [activeBanner, setActiveBanner] = useState(0);

  // Live Flash Sale Countdown (Ticking seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 45 });

  // Live Social Proof Toast
  const [socialProof, setSocialProof] = useState(null);

  // Coupons
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Checkout Payment
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [customerForm, setCustomerForm] = useState(() => {
    try {
      const saved = localStorage.getItem('shoppy_customer_checkout_info');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {
      name: '',
      phone: '',
      email: '',
      address: '',
      city: 'Patna',
      state: 'Bihar',
      pincode: '800001',
    };
  });
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Synchronize Axios Headers for Tenant Context
  syncAxiosStoreHeaders(axios);
  if (shopCode) {
    axios.defaults.headers.common['X-Shop-Code'] = shopCode;
  }

  // Auto-slide Hero Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Live Flash Sale Countdown Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // First-Time Welcome Offer Popup
  useEffect(() => {
    const hasSeen = sessionStorage.getItem('shoppy_seen_welcome_popup');
    if (!hasSeen) {
      const timeout = setTimeout(() => {
        setWelcomePopupOpen(true);
        sessionStorage.setItem('shoppy_seen_welcome_popup', '1');
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Rotating Social Proof Toasts
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setSocialProof(SOCIAL_PROOF_EVENTS[index % SOCIAL_PROOF_EVENTS.length]);
      index++;
      setTimeout(() => {
        setSocialProof(null);
      }, 4500);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Store Info & Live Catalog from backend
  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const params = shopCode ? { code: shopCode } : {};
      const [infoRes, catalogRes] = await Promise.all([
        axios.get('/api/storefront/info', { params }).catch(() => ({ data: {} })),
        axios.get('/api/storefront/catalog', { params }).catch(() => ({ data: {} }))
      ]);

      if (infoRes.data?.success && infoRes.data.store) {
        const s = infoRes.data.store;
        setStoreInfo(s);

        // If not in preview mode, set theme directly from store's saved settings
        if (!previewThemeParam) {
          const dbTheme = s.ecom_theme || s.settings?.ecom_theme;
          if (dbTheme && THEMES_META[dbTheme]) {
            setActiveThemeId(dbTheme);
          }
        }

        // Dynamically update document title & favicon
        if (s.name) {
          document.title = `${s.name} — Official Online Store | Exclusive Deals & Offers`;
        }
        const faviconUrl = s.favicon || s.settings?.favicon;
        if (faviconUrl) {
          let link = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'shortcut icon';
            document.head.appendChild(link);
          }
          link.href = faviconUrl;
        }
      } else {
        setStoreInfo({
          name: shopCode ? `Shoppy Store (${shopCode})` : 'Shoppy ERP Store',
          shop_code: shopCode || 'SP-LIVE',
        });
      }

      if (catalogRes.data?.success && catalogRes.data.data?.data?.length > 0) {
        const dbProducts = catalogRes.data.data.data.map((item, idx) => ({
          id: item.id || `PRD-${idx + 1}`,
          name: item.name,
          category: item.category || 'General',
          topCategoryId: 'CAT-MOBILES',
          brand: item.brand || storeInfo?.name || 'Shoppy',
          selling_price: Number(item.selling_price || item.price || 999),
          mrp: Number(item.mrp || (Number(item.selling_price || 999) * 1.35).toFixed(0)),
          rating: 4.6,
          rating_count: 120 + idx * 15,
          image: item.image || item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
          badge: 'Shoppy Certified',
          is_deal_of_day: idx % 2 === 0,
          bank_offer: 'Flat 10% Bank Discount',
          delivery_text: 'Free Express Delivery in 2 Days',
          stock: item.stock || 50,
          specs: [item.barcode ? `Barcode: ${item.barcode}` : 'Quality Verified', '100% Genuine Direct Store Warranty'],
          variants: [
            { id: 'v1', size: 'Standard', color: 'Default', colorHex: '#475569', sellingPrice: Number(item.selling_price || 999), mrp: Number(item.mrp || 1299), sku: `SKU-${idx}` }
          ]
        }));
        setProducts(dbProducts);
      }
    } catch (err) {
      console.warn('Storefront data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [shopCode]);

  // Wishlist toggle
  const toggleWishlist = (id, e) => {
    if (e) e.stopPropagation();
    setWishlist((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Add to Bag (DO NOT auto-open Shopping Bag, show center notification)
  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    const variant = selectedVariants[product.id] || (product.variants && product.variants[0]) || {
      id: 'default',
      size: 'Standard',
      color: 'Default',
      sellingPrice: product.selling_price,
      mrp: product.mrp,
      sku: product.id
    };

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (ci) => ci.id === product.id && ci.variantId === variant.id
      );

      if (existingIdx > -1) {
        const next = [...prevCart];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + 1,
        };
        return next;
      }

      return [
        ...prevCart,
        {
          cartItemId: `${product.id}_${variant.id}_${Date.now()}`,
          id: product.id,
          variantId: variant.id,
          name: product.name,
          brand: product.brand,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          selling_price: variant.sellingPrice,
          mrp: variant.mrp,
          image: product.image,
          quantity: 1,
        }
      ];
    });

    // Show middle center notification toast
    if (addedToCartTimerRef.current) {
      clearTimeout(addedToCartTimerRef.current);
    }

    setAddedToCartNotification({
      name: product.name,
      brand: product.brand,
      image: product.image,
      price: variant.sellingPrice,
      mrp: variant.mrp,
      size: variant.size,
      color: variant.color,
    });

    addedToCartTimerRef.current = setTimeout(() => {
      setAddedToCartNotification(null);
    }, 2800);
  };

  // Buy Now
  const handleBuyNow = (product, e) => {
    if (e) e.stopPropagation();
    const variant = selectedVariants[product.id] || (product.variants && product.variants[0]) || {
      id: 'default',
      size: 'Standard',
      color: 'Default',
      sellingPrice: product.selling_price,
      mrp: product.mrp,
      sku: product.id
    };

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (ci) => ci.id === product.id && ci.variantId === variant.id
      );

      if (existingIdx > -1) {
        const next = [...prevCart];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + 1,
        };
        return next;
      }

      return [
        ...prevCart,
        {
          cartItemId: `${product.id}_${variant.id}_${Date.now()}`,
          id: product.id,
          variantId: variant.id,
          name: product.name,
          brand: product.brand,
          size: variant.size,
          color: variant.color,
          colorHex: variant.colorHex,
          selling_price: variant.sellingPrice,
          mrp: variant.mrp,
          image: product.image,
          quantity: 1,
        }
      ];
    });

    setCartOpen(false);
    setAddedToCartNotification(null);
    setCheckoutOpen(true);
  };

  // Quantity updates in cart
  const updateQuantity = (cartItemId, change) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + change;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeCartItem = (cartItemId) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  // Select Product Variant
  const handleSelectVariant = (productId, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  // Calculate Cart Totals
  const { totalMrp, subtotal, totalDiscount, voucherDiscount, shippingFee, grandTotal, totalSavings } = useMemo(() => {
    let tMrp = 0;
    let sTotal = 0;

    cart.forEach((item) => {
      tMrp += item.mrp * item.quantity;
      sTotal += item.selling_price * item.quantity;
    });

    const tDiscount = tMrp - sTotal;
    let vDiscount = 0;

    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        vDiscount = (sTotal * appliedCoupon.value) / 100;
        if (appliedCoupon.max_discount) {
          vDiscount = Math.min(vDiscount, appliedCoupon.max_discount);
        }
      } else {
        vDiscount = appliedCoupon.value;
      }
    }

    const ship = sTotal >= 499 || sTotal === 0 ? 0 : 49;
    const gTotal = Math.max(0, sTotal - vDiscount + ship);
    const savings = tDiscount + vDiscount;

    return {
      totalMrp: tMrp,
      subtotal: sTotal,
      totalDiscount: tDiscount,
      voucherDiscount: vDiscount,
      shippingFee: ship,
      grandTotal: gTotal,
      totalSavings: savings,
    };
  }, [cart, appliedCoupon]);

  // Apply Coupon
  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCodeInput).trim().toUpperCase();
    setCouponError('');
    setCouponSuccess('');

    if (!code) {
      setCouponError('Please enter a voucher code');
      return;
    }

    if (code === 'SHOPPY150') {
      if (subtotal < 499) {
        setCouponError('SHOPPY150 requires a minimum cart value of ₹499');
        return;
      }
      setAppliedCoupon({ code: 'SHOPPY150', value: 150, type: 'flat' });
      setCouponSuccess('🎉 Voucher SHOPPY150 applied! Flat ₹150 discount added.');
      setWelcomePopupOpen(false);
      return;
    }

    const found = INITIAL_COUPONS.find((c) => c.code.toUpperCase() === code);
    if (!found) {
      setCouponError(`Invalid voucher code: "${code}". Try code: SHOPPY150`);
      return;
    }

    if (subtotal < (found.min_cart_amount || 0)) {
      setCouponError(`Minimum order value of ₹${found.min_cart_amount} required.`);
      return;
    }

    setAppliedCoupon(found);
    setCouponSuccess(`Coupon ${found.code} applied successfully!`);
    setWelcomePopupOpen(false);
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (activeCategory !== 'ALL' && p.topCategoryId !== activeCategory && p.category !== activeCategory) {
          return false;
        }
        if (searchCategoryFilter !== 'ALL' && p.topCategoryId !== searchCategoryFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          return matchName || matchCategory || matchBrand;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.selling_price - b.selling_price;
        if (sortBy === 'price_desc') return b.selling_price - a.selling_price;
        if (sortBy === 'discount') {
          const discA = ((a.mrp - a.selling_price) / a.mrp);
          const discB = ((b.mrp - b.selling_price) / b.mrp);
          return discB - discA;
        }
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [products, activeCategory, searchCategoryFilter, searchQuery, sortBy]);

  // Flash Deals of the Day (Spotlight Products)
  const dealProducts = useMemo(() => {
    return products.filter((p) => p.is_deal_of_day || p.selling_price > 1000);
  }, [products]);

  // Handle Checkout Order Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerForm.name || !customerForm.phone || !customerForm.address || !customerForm.pincode) {
      alert('Please fill all required shipping address fields.');
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem('shoppy_customer_checkout_info', JSON.stringify(customerForm));

      const payload = {
        store_code: shopCode,
        customer: customerForm,
        items: cart,
        applied_coupon: appliedCoupon ? appliedCoupon.code : null,
        subtotal,
        discount: totalDiscount + voucherDiscount,
        shipping: shippingFee,
        grand_total: grandTotal,
        payment_method: selectedPayment.toUpperCase(),
      };

      const res = await axios.post('/api/storefront/order', payload).catch(() => ({ data: {} }));

      const orderNumber = res.data?.order?.order_number || `ORD-${Date.now().toString().slice(-6)}`;
      const invoiceNumber = res.data?.order?.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      setOrderSuccess({
        order_number: orderNumber,
        invoice_number: invoiceNumber,
        grand_total: grandTotal.toFixed(0),
        savings: totalSavings.toFixed(0),
        payment_method: selectedPayment.toUpperCase(),
        items_count: cart.length,
      });

      setCart([]);
      setAppliedCoupon(null);
      setCheckoutOpen(false);
    } catch (err) {
      console.error('Order submission error:', err);
      setOrderSuccess({
        order_number: `ORD-${Date.now().toString().slice(-6)}`,
        invoice_number: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        grand_total: grandTotal.toFixed(0),
        savings: totalSavings.toFixed(0),
        payment_method: selectedPayment.toUpperCase(),
        items_count: cart.length,
      });
      setCart([]);
      setAppliedCoupon(null);
      setCheckoutOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Activate Theme (when admin clicks Activate inside Demo Preview)
  const handleActivateCurrentTheme = async (themeKey) => {
    const target = themeKey || activeThemeId;
    try {
      setLoading(true);
      const res = await axios.post('/api/tenant/settings/branding', {
        ecom_theme: target,
      }).catch(() => ({ data: {} }));
      alert(`🎉 Theme ${target.toUpperCase()} activated successfully for store ${shopCode}!`);
      // Remove preview parameter and reload
      const url = new URL(window.location.href);
      url.searchParams.delete('preview_theme');
      window.location.href = url.toString();
    } catch (err) {
      alert('Failed to activate theme. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const storeLogo = storeInfo?.logo || storeInfo?.settings?.logo;
  const storeName = storeInfo?.name || 'Shoppy Store';

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">

      {/* =========================================================================
          ADMIN LIVE DEMO PREVIEW BAR (ONLY VISIBLE IF ADMIN CLICKS "LIVE DEMO")
      ========================================================================== */}
      {previewThemeParam && (
        <div className="bg-slate-900 text-amber-300 text-xs py-2 px-4 flex flex-wrap items-center justify-between border-b border-amber-400/30 z-50 sticky top-0 shadow-lg">
          <div className="flex items-center gap-2 font-bold">
            <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>
              STORE ADMIN LIVE DEMO: Previewing <span className="text-white underline">{THEMES_META[activeThemeId]?.name}</span> for Store: <span className="font-mono text-white">{shopCode}</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleActivateCurrentTheme(activeThemeId)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-xs transition"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Activate This Theme Now</span>
            </button>
            <a
              href="/shop-admin/store-settings"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              Back to Settings
            </a>
          </div>
        </div>
      )}

      {/* =========================================================================
          THEME 1: SNAPDEAL STYLE LAYOUT
      ========================================================================== */}
      {activeThemeId === 'snapdeal' && (
        <div className="flex-1 flex flex-col bg-[#f8fafc]">
          {/* Snapdeal Top Deals Bar */}
          <div className="bg-[#0f172a] text-white text-[11px] font-medium py-1.5 px-4 border-b border-slate-800">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold uppercase tracking-wider text-rose-400">⚡ SNAPDEAL LIGHTNING OFFERS</span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="hidden sm:inline text-slate-200">10% Instant Bank Cashback • Use Code: <span className="font-mono font-bold text-amber-300">SHOPPY150</span></span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="flex items-center gap-1 font-bold text-amber-300">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>Sale Ends: {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Snapdeal Header */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }} className="flex items-center gap-3 cursor-pointer flex-shrink-0 group">
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="h-9 sm:h-11 max-w-[200px] object-contain" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#e11d48] text-white flex items-center justify-center font-black text-xl shadow-md">
                      {storeName ? storeName[0] : 'S'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl md:text-2xl font-black font-heading text-slate-900">{storeName}</span>
                        <span className="text-xl md:text-2xl font-black text-[#e11d48]">Store</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold block">Shoppy Verified Deals</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Snapdeal Category Selector Search Bar */}
              <div className="flex-1 max-w-2xl relative">
                <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg overflow-hidden focus-within:border-[#e11d48] focus-within:ring-2 focus-within:ring-rose-500/10 transition">
                  <div className="hidden sm:flex items-center gap-1 pl-3 pr-2 py-2 text-xs font-bold text-slate-700 border-r border-slate-200 bg-slate-100 flex-shrink-0">
                    <select
                      value={searchCategoryFilter}
                      onChange={(e) => setSearchCategoryFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="CAT-MOBILES">Mobiles &amp; 5G</option>
                      <option value="CAT-ELECTRONICS">Electronics</option>
                      <option value="CAT-FASHION">Fashion &amp; Wear</option>
                      <option value="CAT-HOME">Home &amp; Kitchen</option>
                      <option value="CAT-APPLIANCES">Appliances</option>
                      <option value="CAT-GROCERY">Grocery Supermarket</option>
                      <option value="CAT-BEAUTY">Beauty &amp; Wellness</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Search products, brands, or daily essentials (e.g. iPhone, Puma, Denim, Oil)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2.5 px-3 text-xs md:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-2 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button className="px-5 py-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white flex items-center gap-1 text-xs font-black transition flex-shrink-0">
                    <Search className="w-4 h-4" />
                    <span className="hidden md:inline">Search</span>
                  </button>
                </div>
              </div>

              {/* Delivery Pincode */}
              <button
                onClick={() => setPincodeModalOpen(true)}
                className="hidden lg:flex items-center gap-2 text-xs text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
              >
                <MapPin className="w-4 h-4 text-[#e11d48]" />
                <div className="text-left leading-tight">
                  <span className="text-[10px] text-slate-400 block font-semibold">Deliver to</span>
                  <span className="font-extrabold text-slate-800">{deliveryPincode} • Change</span>
                </div>
              </button>

              {/* Shopping Bag */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs md:text-sm font-extrabold rounded-lg shadow-sm transition active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Bag</span>
                {cart.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#e11d48] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
                {cart.length > 0 && <span className="text-xs font-black text-amber-300 hidden md:inline">• ₹{grandTotal.toFixed(0)}</span>}
              </button>
            </div>

            {/* Top Horizontal Categories with Mega Menu */}
            <div className="border-t border-slate-100 bg-white relative">
              <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto scrollbar-none py-1">
                <div className="flex items-center gap-1 py-1">
                  {TOP_CATEGORIES_MENU.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        activeCategory === cat.id
                          ? 'bg-rose-50 text-[#e11d48] border border-[#e11d48] font-black shadow-xs'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-[#e11d48]'
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
                <div className="hidden lg:flex items-center gap-2 pl-4 text-xs font-bold shrink-0">
                  <span className="text-slate-400 text-[11px]">FLAT ₹150 OFF:</span>
                  <button onClick={() => handleApplyCoupon('SHOPPY150')} className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-mono text-[11px] font-black transition flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-600" />
                    <span>SHOPPY150</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Snapdeal Hero Carousel */}
          <main className="max-w-7xl mx-auto px-3 md:px-4 space-y-5 w-full mt-3 flex-1">
            <div className="w-full relative rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-[180px] sm:h-[220px] md:h-[260px] lg:h-[280px]">
              <div className={`w-full h-full p-6 md:p-8 bg-gradient-to-br ${HERO_BANNERS[activeBanner].bgGradient} text-white flex flex-col justify-between transition-all duration-700 relative`}>
                <div className="space-y-1.5 max-w-2xl z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/15 backdrop-blur text-[10px] font-black tracking-wider uppercase text-amber-300">
                    <Flame className="w-3 h-3 fill-current" />
                    {HERO_BANNERS[activeBanner].tag}
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-heading leading-tight tracking-tight text-white drop-shadow">
                    {HERO_BANNERS[activeBanner].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 line-clamp-1 font-medium">{HERO_BANNERS[activeBanner].subtitle}</p>
                </div>
                <div className="flex items-center justify-between pt-2 z-10">
                  <span className="bg-black/30 backdrop-blur px-3 py-1 rounded-md text-[11px] font-bold text-amber-300 border border-white/10">
                    {HERO_BANNERS[activeBanner].badgeText}
                  </span>
                  <button
                    onClick={() => {
                      if (HERO_BANNERS[activeBanner].categoryTarget !== 'ALL') setActiveCategory(HERO_BANNERS[activeBanner].categoryTarget);
                      window.scrollTo({ top: 520, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-black shadow-lg transition active:scale-95 flex items-center gap-1.5"
                  >
                    <span>{HERO_BANNERS[activeBanner].ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Snapdeal Lightning Deals */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#e11d48] text-white flex items-center justify-center font-black">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-base font-black font-heading text-slate-900">⚡ Lightning Deals of the Day</h3>
                    <p className="text-xs text-slate-500">Up to 70% Off • Live Deals Refreshed Daily</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-black text-slate-800">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>Ends in: <span className="text-[#e11d48]">{String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m</span></span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {dealProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col justify-between hover:shadow-md transition">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-50">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black bg-[#e11d48] text-white">DEAL</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">{p.brand}</span>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</h4>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-black text-slate-900">₹{p.selling_price.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] text-slate-400 line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <button onClick={(e) => handleAddToCart(p, e)} className="mt-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Snapdeal Catalog Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <h3 className="text-base font-black text-slate-900">{activeCategory === 'ALL' ? 'All Curated Products' : activeCategory}</h3>
                <span className="text-xs text-slate-500 font-bold">{filteredProducts.length} Products</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between hover:shadow-lg transition">
                    <div className="space-y-2">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black bg-[#e11d48] text-white">
                          {Math.round(((product.mrp - product.selling_price) / product.mrp) * 100)}% OFF
                        </span>
                        <button onClick={(e) => toggleWishlist(product.id, e)} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow-xs">
                          <Heart className={`w-3.5 h-3.5 ${wishlist[product.id] ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">{product.brand}</span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{product.name}</h4>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{product.rating} ({product.rating_count})</span>
                      </div>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-black text-slate-900">₹{product.selling_price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-slate-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-slate-100">
                      <button onClick={(e) => handleAddToCart(product, e)} className="py-2 text-xs border border-slate-200 hover:border-slate-300 font-bold rounded-lg flex items-center justify-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                      <button onClick={(e) => handleBuyNow(product, e)} className="py-2 text-xs bg-[#e11d48] hover:bg-[#be123c] text-white font-black rounded-lg flex items-center justify-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* =========================================================================
          THEME 2: FLIPKART STYLE LAYOUT (Classic Blue Header, Circular Icons, f-Assured)
      ========================================================================== */}
      {activeThemeId === 'flipkart' && (
        <div className="flex-1 flex flex-col bg-[#f1f2f4]">
          {/* Flipkart Royal Blue Top Header */}
          <header className="bg-[#2874f0] text-white sticky top-0 z-40 shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-6">
              {/* Flipkart Store Logo & Plus Star */}
              <div onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }} className="flex flex-col cursor-pointer flex-shrink-0 group leading-none">
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="h-8 md:h-9 object-contain" />
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xl md:text-2xl font-black italic tracking-tight text-white font-heading">{storeName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[11px] italic font-semibold text-slate-200 mt-0.5">
                  <span>Explore</span>
                  <span className="text-[#ffe500] font-black flex items-center">Plus<Star className="w-3 h-3 fill-[#ffe500] ml-0.5" /></span>
                </div>
              </div>

              {/* Flipkart Center Search Input */}
              <div className="flex-1 max-w-2xl relative">
                <div className="flex items-center bg-white rounded-sm overflow-hidden shadow-inner">
                  <input
                    type="text"
                    placeholder="Search for products, brands and more"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 px-4 text-xs md:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                  <button className="px-4 py-2 text-[#2874f0] hover:text-[#1e60cc]">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Flipkart Header Actions */}
              <div className="flex items-center gap-4 text-xs font-extrabold flex-shrink-0">
                <a href="/store" className="bg-white text-[#2874f0] px-6 py-1.5 rounded-sm shadow-xs font-bold hover:bg-slate-50 transition">
                  Login
                </a>
                <span className="hidden md:inline cursor-pointer hover:text-slate-200">Become a Seller</span>
                <span className="hidden md:inline cursor-pointer hover:text-slate-200">More ▾</span>

                <button onClick={() => setCartOpen(true)} className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer">
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#ffe500] text-slate-900 text-[10px] font-black flex items-center justify-center">
                        {cart.reduce((a, b) => a + b.quantity, 0)}
                      </span>
                    )}
                  </div>
                  <span>Cart</span>
                </button>
              </div>
            </div>

            {/* Flipkart Circular Icon Ribbon (Below Header) */}
            <div className="bg-white border-b border-slate-200 py-3 text-slate-800 shadow-xs">
              <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto scrollbar-none gap-6">
                {[
                  { id: 'ALL', name: 'Top Offers', icon: '⚡' },
                  { id: 'CAT-MOBILES', name: 'Mobiles', icon: '📱' },
                  { id: 'CAT-ELECTRONICS', name: 'Electronics', icon: '💻' },
                  { id: 'CAT-FASHION', name: 'Fashion', icon: '👗' },
                  { id: 'CAT-HOME', name: 'Home & Kitchen', icon: '🛋️' },
                  { id: 'CAT-APPLIANCES', name: 'Appliances', icon: '📺' },
                  { id: 'CAT-GROCERY', name: 'Grocery', icon: '🛒' },
                  { id: 'CAT-BEAUTY', name: 'Beauty & Toys', icon: '🧸' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveCategory(item.id); setSearchQuery(''); }}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer flex-shrink-0"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center text-xl transition-transform group-hover:scale-105 border border-slate-200 group-hover:border-[#2874f0]">
                      {item.icon}
                    </div>
                    <span className={`text-xs font-bold transition ${activeCategory === item.id ? 'text-[#2874f0] font-black' : 'text-slate-700 group-hover:text-[#2874f0]'}`}>
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Flipkart Hero & Featured Sliders */}
          <main className="max-w-7xl mx-auto px-3 md:px-4 space-y-4 w-full mt-3 flex-1">
            {/* Banner */}
            <div className="w-full relative rounded-sm overflow-hidden shadow-sm h-[190px] sm:h-[230px] md:h-[260px]">
              <div className={`w-full h-full p-6 md:p-8 bg-gradient-to-r from-[#2874f0] via-[#1e60cc] to-[#124294] text-white flex flex-col justify-between`}>
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#ffe500] text-slate-900 text-[10px] font-black uppercase">FLIPKART BIG SAVING DAYS</span>
                  <h2 className="text-2xl md:text-3xl font-black text-white">{HERO_BANNERS[activeBanner].title}</h2>
                  <p className="text-xs text-blue-100">{HERO_BANNERS[activeBanner].subtitle}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#ffe500]">{HERO_BANNERS[activeBanner].badgeText}</span>
                  <button onClick={() => window.scrollTo({ top: 480, behavior: 'smooth' })} className="px-5 py-2 rounded-sm bg-[#fb641b] text-white text-xs font-black uppercase shadow">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>

            {/* Flipkart Multi-Product Deal Strip ("Best of Electronics") */}
            <section className="bg-white rounded-sm border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch overflow-hidden">
              <div className="w-full md:w-56 p-5 bg-gradient-to-b from-blue-50 to-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between items-center text-center">
                <div className="space-y-1">
                  <h3 className="text-lg font-black font-heading text-slate-900">Best of Tech &amp; Gadgets</h3>
                  <p className="text-xs text-emerald-600 font-bold">From ₹1,299</p>
                </div>
                <button onClick={() => setActiveCategory('CAT-MOBILES')} className="mt-4 px-4 py-2 bg-[#2874f0] text-white text-xs font-bold rounded-sm shadow uppercase">
                  VIEW ALL
                </button>
              </div>

              <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-x-auto">
                {products.slice(0, 4).map((p) => (
                  <div key={p.id} className="text-center space-y-1 p-2 hover:shadow-md rounded transition cursor-pointer" onClick={() => handleAddToCart(p)}>
                    <img src={p.image} alt={p.name} className="w-24 h-24 object-contain mx-auto" />
                    <h5 className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</h5>
                    <p className="text-xs text-emerald-600 font-bold">Min 40% Off</p>
                    <p className="text-[11px] text-slate-500 font-semibold">{p.brand}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Flipkart Product Cards Grid (With f-Assured Badge & Dual Yellow/Orange Buttons) */}
            <section className="bg-white p-4 rounded-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Featured Deals For You</h3>
                <span className="text-xs font-bold text-slate-500">{filteredProducts.length} Items</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="rounded-sm border border-slate-200 p-3 flex flex-col justify-between hover:shadow-lg transition bg-white">
                    <div className="space-y-2">
                      <div className="relative aspect-square rounded-sm overflow-hidden bg-slate-50 flex items-center justify-center">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-sm bg-[#2874f0] text-[#ffe500] text-[9px] font-black italic">
                          f-Assured ★
                        </span>
                        <button onClick={(e) => toggleWishlist(p.id, e)} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow-xs">
                          <Heart className={`w-3.5 h-3.5 ${wishlist[p.id] ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">{p.brand}</span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{p.name}</h4>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-black text-slate-900">₹{p.selling_price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-slate-400 line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                        <span className="text-xs font-bold text-emerald-600">
                          {Math.round(((p.mrp - p.selling_price) / p.mrp) * 100)}% off
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 block">Free delivery</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-3 mt-2 border-t border-slate-100">
                      <button onClick={(e) => handleAddToCart(p, e)} className="py-2 text-xs bg-[#ff9f00] hover:bg-[#e68f00] text-white font-black rounded-sm">
                        Add to Cart
                      </button>
                      <button onClick={(e) => handleBuyNow(p, e)} className="py-2 text-xs bg-[#fb641b] hover:bg-[#e65612] text-white font-black rounded-sm">
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* =========================================================================
          THEME 3: JIOMART STYLE LAYOUT (Fresh Groceries & Supermarket Retail)
      ========================================================================== */}
      {activeThemeId === 'jiomart' && (
        <div className="flex-1 flex flex-col bg-[#f3f9fb]">
          {/* JioMart Clean White Header with Location Pill & Green Bag */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }} className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="h-9 md:h-10 object-contain" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[#0078ad] text-white flex items-center justify-center font-black text-xl">
                      {storeName ? storeName[0] : 'J'}
                    </div>
                    <div>
                      <span className="text-xl font-black text-[#0078ad]">{storeName}</span>
                      <span className="text-xs font-bold text-[#0c831f] block leading-none">Smart Bazaar Direct</span>
                    </div>
                  </div>
                )}
              </div>

              {/* JioMart Location Pill */}
              <button onClick={() => setPincodeModalOpen(true)} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3f9fb] border border-cyan-100 text-xs font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-[#0078ad]" />
                <span>Deliver to: {deliveryPincode} (Patna) ▾</span>
              </button>

              {/* JioMart Search Bar */}
              <div className="flex-1 max-w-xl">
                <div className="flex items-center bg-[#f3f9fb] border border-slate-300 rounded-full px-4 py-2 focus-within:border-[#0078ad] transition">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search essentials, groceries & electronics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs md:text-sm bg-transparent focus:outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* JioMart Leaf Green Pill Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0c831f] hover:bg-[#096e1a] text-white text-xs font-bold shadow transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">My Cart</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
                {cart.length > 0 && <span className="font-mono hidden md:inline">• ₹{grandTotal.toFixed(0)}</span>}
              </button>
            </div>

            {/* JioMart Department Capsules */}
            <div className="border-t border-slate-100 bg-[#f8fafc] py-2 overflow-x-auto scrollbar-none">
              <div className="max-w-7xl mx-auto px-4 flex items-center gap-2">
                {[
                  { id: 'ALL', name: 'All Departments' },
                  { id: 'CAT-GROCERY', name: '🍎 Fruits & Veggies' },
                  { id: 'CAT-GROCERY', name: '🥛 Dairy & Bakery' },
                  { id: 'CAT-GROCERY', name: '🌾 Staples & Pulses' },
                  { id: 'CAT-GROCERY', name: '🍪 Snacks & Biscuits' },
                  { id: 'CAT-BEAUTY', name: '🧴 Personal Care' },
                  { id: 'CAT-HOME', name: '🧹 Home Care' },
                  { id: 'CAT-MOBILES', name: '📱 Electronics' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCategory(item.id)}
                    className="px-3.5 py-1 rounded-full text-xs font-bold border border-slate-200 bg-white hover:border-[#0078ad] hover:text-[#0078ad] transition whitespace-nowrap text-slate-700"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* JioMart Main Content */}
          <main className="max-w-7xl mx-auto px-3 md:px-4 space-y-4 w-full mt-3 flex-1">
            {/* Smart Bazaar Banner */}
            <div className="w-full rounded-2xl overflow-hidden shadow-xs h-[180px] sm:h-[220px] bg-gradient-to-r from-[#0078ad] to-[#0c831f] p-6 text-white flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-[#0078ad] text-[10px] font-black uppercase">SMART BAZAAR SUPER SAVINGS</span>
                <h2 className="text-2xl md:text-3xl font-black mt-1">Guaranteed Lowest Rates Every Day</h2>
                <p className="text-xs text-blue-50">Direct from wholesale mandi to your doorstep in 2 hours.</p>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Free 2-Hour Express Delivery</span>
                <button onClick={() => window.scrollTo({ top: 450, behavior: 'smooth' })} className="px-4 py-1.5 rounded-full bg-white text-[#0c831f] font-black">
                  Explore Deals →
                </button>
              </div>
            </div>

            {/* JioMart Product Cards Grid */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Daily Essentials &amp; Supermarket</h3>
                <span className="text-xs font-bold text-emerald-700">⚡ 2-Hour Delivery Available</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-3 flex flex-col justify-between hover:shadow-md transition">
                    <div className="space-y-1.5">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#0c831f] text-white text-[9px] font-black">
                          SAVE ₹{p.mrp - p.selling_price}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">{p.brand}</span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                      <span className="text-[10px] text-slate-500 font-medium">Standard Pack</span>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-black text-slate-900">₹{p.selling_price}</span>
                        <span className="text-xs text-slate-400 line-through">₹{p.mrp}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(p, e)}
                      className="mt-3 w-full py-2 rounded-full border border-[#0c831f] text-[#0c831f] hover:bg-[#0c831f] hover:text-white font-bold text-xs transition flex items-center justify-center gap-1"
                    >
                      <span>Add +</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* =========================================================================
          THEME 4: AMAZON INDIA STYLE LAYOUT (Dark 2-Tier Nav, Prime, 4-Quadrant Cards)
      ========================================================================== */}
      {activeThemeId === 'amazon' && (
        <div className="flex-1 flex flex-col bg-[#eaeded]">
          {/* Amazon Tier 1: Dark Navy #131921 Header */}
          <header className="bg-[#131921] text-white sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
              {/* Store Logo with Smile arc */}
              <div onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }} className="cursor-pointer flex-shrink-0">
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="h-8 md:h-9 object-contain" />
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xl md:text-2xl font-black text-white font-heading">{storeName}</span>
                    <span className="text-xs font-bold text-[#f08804]">.in</span>
                  </div>
                )}
              </div>

              {/* Amazon Location Block */}
              <button onClick={() => setPincodeModalOpen(true)} className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white leading-tight">
                <MapPin className="w-4 h-4 text-white" />
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block font-semibold">Deliver to</span>
                  <span className="font-bold text-white">Patna {deliveryPincode}</span>
                </div>
              </button>

              {/* Amazon 3-Part Search Bar */}
              <div className="flex-1 max-w-2xl relative">
                <div className="flex items-center bg-white rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#f08804]">
                  <select
                    value={searchCategoryFilter}
                    onChange={(e) => setSearchCategoryFilter(e.target.value)}
                    className="hidden sm:block bg-slate-100 text-slate-800 text-xs px-2 py-2.5 border-r border-slate-300 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All</option>
                    <option value="CAT-MOBILES">Mobiles</option>
                    <option value="CAT-ELECTRONICS">Electronics</option>
                    <option value="CAT-FASHION">Fashion</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search Amazon / Shoppy.in"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 px-3 text-xs md:text-sm text-slate-900 focus:outline-none"
                  />
                  <button className="px-4 py-2 bg-[#febd69] hover:bg-[#f3a847] text-slate-900 font-bold">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Amazon Orders & Cart */}
              <div className="flex items-center gap-4 text-xs font-bold flex-shrink-0">
                <a href="/store" className="hidden sm:block leading-tight text-slate-300 hover:text-white">
                  <span className="text-[10px] text-slate-400 block">Hello, sign in</span>
                  <span>Account &amp; Lists ▾</span>
                </a>
                <span className="hidden sm:block leading-tight text-slate-300 hover:text-white cursor-pointer">
                  <span className="text-[10px] text-slate-400 block">Returns</span>
                  <span>&amp; Orders</span>
                </span>
                <button onClick={() => setCartOpen(true)} className="flex items-center gap-1.5 text-white cursor-pointer">
                  <div className="relative">
                    <ShoppingCart className="w-6 h-6" />
                    <span className="absolute -top-1 left-2 text-[#f08804] text-xs font-black">
                      {cart.reduce((a, b) => a + b.quantity, 0)}
                    </span>
                  </div>
                  <span className="font-black text-sm hidden sm:inline">Cart</span>
                </button>
              </div>
            </div>

            {/* Amazon Tier 2: #232f3e Sub-Nav */}
            <div className="bg-[#232f3e] text-white text-xs py-1.5 px-4 overflow-x-auto scrollbar-none">
              <div className="max-w-7xl mx-auto flex items-center gap-5 whitespace-nowrap">
                <button onClick={() => setActiveCategory('ALL')} className="flex items-center gap-1 font-black text-white hover:text-amber-300">
                  <Menu className="w-4 h-4" />
                  <span>All</span>
                </button>
                <span onClick={() => setActiveCategory('CAT-MOBILES')} className="cursor-pointer hover:text-amber-300 font-semibold">Today's Deals</span>
                <span onClick={() => setActiveCategory('CAT-ELECTRONICS')} className="cursor-pointer hover:text-amber-300 font-semibold">Customer Service</span>
                <span onClick={() => setActiveCategory('CAT-FASHION')} className="cursor-pointer hover:text-amber-300 font-semibold">Registry</span>
                <span onClick={() => setActiveCategory('CAT-HOME')} className="cursor-pointer hover:text-amber-300 font-semibold">Gift Cards</span>
                <span onClick={() => setActiveCategory('CAT-GROCERY')} className="cursor-pointer hover:text-amber-300 font-semibold">Sell</span>
                <span className="text-[#febd69] font-black cursor-pointer">✓prime</span>
              </div>
            </div>
          </header>

          {/* Amazon Main Content */}
          <main className="max-w-7xl mx-auto px-3 md:px-4 space-y-4 w-full mt-3 flex-1">
            {/* Amazon 4-Quadrant Feature Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Appliances for your home | Up to 55% off', cat: 'CAT-APPLIANCES', img: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300' },
                { title: 'Starting ₹999 | Best Selling Audio Gear', cat: 'CAT-ELECTRONICS', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300' },
                { title: 'Revamp your wardrobe | Min 50% off', cat: 'CAT-FASHION', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
                { title: 'Daily Supermarket | Up to 40% off', cat: 'CAT-GROCERY', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300' }
              ].map((box, bIdx) => (
                <div key={bIdx} className="bg-white p-4 rounded-sm border border-slate-200 space-y-3 shadow-xs">
                  <h4 className="text-base font-black text-slate-900 leading-tight">{box.title}</h4>
                  <img src={box.img} alt={box.title} className="w-full h-44 object-cover rounded-sm" />
                  <button onClick={() => setActiveCategory(box.cat)} className="text-xs font-bold text-[#007185] hover:underline block text-left">
                    See more offers →
                  </button>
                </div>
              ))}
            </div>

            {/* Amazon Product Cards Grid (Prime Badges & Yellow Buy Buttons) */}
            <section className="bg-white p-5 rounded-sm border border-slate-200 space-y-4">
              <h3 className="text-base font-black text-slate-900">Today's Deals &amp; Top Recommendations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="rounded-sm border border-slate-200 p-3 flex flex-col justify-between hover:shadow-md transition bg-white">
                    <div className="space-y-1.5">
                      <div className="aspect-square bg-slate-50 rounded-sm overflow-hidden flex items-center justify-center p-2">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-sm bg-[#b12704] text-white text-[10px] font-bold">
                        Limited time deal
                      </span>
                      <h4 className="text-xs font-medium text-slate-900 hover:text-[#c45500] line-clamp-2 leading-snug cursor-pointer">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500 font-bold text-xs">★★★★☆</span>
                        <span className="text-[10px] text-[#007185]">{p.rating_count}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-[#b12704]">₹{p.selling_price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-slate-500">M.R.P: <span className="line-through">₹{p.mrp}</span></span>
                      </div>
                      <span className="text-[10px] text-slate-600 block">Get it by <span className="font-bold">Tomorrow</span> • <span className="text-[#007185] font-black">✓prime</span></span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-3 mt-2 border-t border-slate-100">
                      <button onClick={(e) => handleAddToCart(p, e)} className="py-2 text-xs bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 font-bold rounded-full">
                        Add to Cart
                      </button>
                      <button onClick={(e) => handleBuyNow(p, e)} className="py-2 text-xs bg-[#ffa41c] hover:bg-[#fa8900] text-slate-900 font-bold rounded-full">
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* =========================================================================
          THEME 5: TATA CLIQ LUXURY STYLE (Minimalist Black & Magenta, Curated Editorial)
      ========================================================================== */}
      {activeThemeId === 'tatacliq' && (
        <div className="flex-1 flex flex-col bg-white">
          {/* Tata CLiQ Top Luxury Strip */}
          <div className="bg-[#111111] text-white text-[10px] font-bold tracking-widest uppercase py-1.5 px-4 text-center border-b border-slate-800">
            <span>100% LUXURY AUTHENTIC • COMPLIMENTARY EXPRESS DOORSTEP SHIPPING ACROSS INDIA</span>
          </div>

          {/* Tata CLiQ Minimalist Header */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
              <div onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }} className="cursor-pointer flex-shrink-0">
                {storeLogo ? (
                  <img src={storeLogo} alt={storeName} className="h-9 object-contain" />
                ) : (
                  <div className="tracking-widest uppercase font-black text-xl md:text-2xl text-slate-900 font-heading">
                    {storeName} <span className="text-[#da1c5c] font-light">LUXURY</span>
                  </div>
                )}
              </div>

              {/* Tata CLiQ Minimalist Search Input */}
              <div className="flex-1 max-w-md">
                <div className="flex items-center border-b border-slate-300 focus-within:border-[#da1c5c] py-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search luxury brands, designer apparel, footwear..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs text-slate-900 focus:outline-none bg-transparent placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Tata Actions */}
              <div className="flex items-center gap-6 text-xs uppercase tracking-wider font-bold text-slate-800">
                <a href="/store" className="hover:text-[#da1c5c] transition">Sign In</a>
                <button onClick={() => setCartOpen(true)} className="flex items-center gap-1.5 hover:text-[#da1c5c] cursor-pointer">
                  <ShoppingBag className="w-4 h-4 text-slate-800" />
                  <span>Bag ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                </button>
              </div>
            </div>

            {/* Tata CLiQ Department Bar */}
            <div className="border-t border-slate-100 py-2.5 overflow-x-auto scrollbar-none">
              <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-700 whitespace-nowrap">
                {['CLIQ LUXURY', 'WOMEN', 'MEN', 'KIDS', 'BEAUTY', 'WATCHES', 'HOME & LIVING'].map((dept, idx) => (
                  <span key={idx} onClick={() => setActiveCategory('ALL')} className="hover:text-[#da1c5c] cursor-pointer transition">
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          </header>

          {/* Tata CLiQ Editorial Hero Banner */}
          <main className="max-w-7xl mx-auto px-4 space-y-6 w-full mt-4 flex-1">
            <div className="w-full h-[220px] md:h-[260px] bg-slate-950 text-white rounded-none p-8 flex flex-col justify-between border-t-2 border-[#da1c5c]">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#da1c5c] font-black">CURATED DESIGNER EDIT</span>
                <h2 className="text-3xl md:text-4xl font-serif font-normal italic tracking-wide">The High-Fashion Autumn Edit</h2>
                <p className="text-xs text-slate-300 font-light">Explore authentic luxury creations crafted with precision.</p>
              </div>
              <button onClick={() => window.scrollTo({ top: 460, behavior: 'smooth' })} className="self-start px-6 py-2 bg-white text-slate-900 text-xs uppercase tracking-widest font-black hover:bg-slate-100">
                DISCOVER THE EDIT
              </button>
            </div>

            {/* Tata CLiQ Luxury Product Cards */}
            <section className="space-y-4">
              <div className="text-center py-2">
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-900">Featured Designer Showcase</h3>
                <p className="text-xs text-slate-400 tracking-wide mt-0.5">Handpicked luxury items with verified authenticity</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="group border border-slate-200 p-4 flex flex-col justify-between hover:shadow-lg transition bg-white">
                    <div className="space-y-2">
                      <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <button onClick={(e) => toggleWishlist(p.id, e)} className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 shadow-xs">
                          <Heart className={`w-3.5 h-3.5 ${wishlist[p.id] ? 'fill-[#da1c5c] text-[#da1c5c]' : 'text-slate-400'}`} />
                        </button>
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">{p.brand}</span>
                      <h4 className="text-xs font-normal text-slate-600 line-clamp-1">{p.name}</h4>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-black text-slate-900">₹{p.selling_price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-slate-400 line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                        <span className="text-[11px] font-bold text-[#da1c5c]">
                          {Math.round(((p.mrp - p.selling_price) / p.mrp) * 100)}% Off
                        </span>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-700 font-bold block">100% Luxury Authentic</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-4 mt-2 border-t border-slate-100">
                      <button onClick={(e) => handleAddToCart(p, e)} className="py-2.5 text-[11px] uppercase tracking-wider bg-black text-white font-bold hover:bg-slate-800">
                        Add to Bag
                      </button>
                      <button onClick={(e) => handleBuyNow(p, e)} className="py-2.5 text-[11px] uppercase tracking-wider bg-[#da1c5c] text-white font-bold hover:bg-[#b8124b]">
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      )}

      {/* =========================================================================
          COMMON SECTION: TRUST PAY GUARANTEE (PLACED RIGHT ABOVE FOOTER)
      ========================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6 max-w-7xl mx-auto px-4 w-full mt-10">
        <div className="text-center max-w-2xl mx-auto space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>100% BUYER &amp; PAYMENT PROTECTION</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black font-heading text-slate-900">
            {storeName} Buyer Trust Guarantee
          </h3>
          <p className="text-xs text-slate-500">
            Every order placed at {storeName} is backed by direct merchant warranty, fast dispatch, and verified tax invoicing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#e11d48] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Free Express Delivery</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Free doorstep delivery on orders above ₹499 with real-time SMS tracking updates.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">7-Day Easy Replacement</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Hassle-free doorstep returns and instant replacements with zero questions asked.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">100% Genuine Products</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Direct brand-authorized inventory with valid manufacturer warranty and GST tax invoices.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Instant UPI &amp; COD</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Zero payment surcharge on Google Pay, PhonePe, Cards, Netbanking, or Cash on Delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMMON FOOTER
      ========================================================================== */}
      <footer className="bg-[#0f172a] text-white mt-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="text-lg font-black text-white">{storeName}</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's trusted retail store powered by Shoppy Cloud ERP. Authentic brand products, fast dispatch, and instant GST invoices.
            </p>
            <div className="pt-2 text-slate-400 text-xs space-y-1">
              <p>Store Code: <span className="font-mono text-white font-bold">{shopCode || 'SP-LIVE'}</span></p>
              <p>Helpline: <span className="text-emerald-400 font-bold">+91 95460 42639</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Customer Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#track" onClick={(e) => { e.preventDefault(); alert('Order tracking SMS sent to your mobile upon dispatch.'); }} className="hover:text-white transition">Track Order</a></li>
              <li><a href="#returns" onClick={(e) => { e.preventDefault(); alert('7-day doorstep replacement policy.'); }} className="hover:text-white transition">Return Policy</a></li>
              <li><a href="/store" className="hover:text-white transition">Merchant POS Login</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Payment Modes</h4>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">UPI (GPay / PhonePe)</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">Credit / Debit Cards</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">Cash on Delivery</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Shoppy Cloud Technology</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Engineered by Enexa IT Solutions Private Limited.
            </p>
            <span className="inline-block px-3 py-1 bg-slate-800 text-emerald-400 font-mono text-[10px] rounded-lg border border-slate-700">
              SSL 256-Bit Secured
            </span>
          </div>
        </div>

        <div className="border-t border-slate-800 py-4 px-4 text-center text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {storeName}. All Rights Reserved. Built on Shoppy Omnichannel ERP.</p>
        </div>
      </footer>

      {/* =========================================================================
          SLIDE-OVER CART DRAWER (Smooth right-to-left slide, NO backdrop fade)
      ========================================================================== */}
      <div className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'opacity-0'}`}>
        {cartOpen && (
          <div className="fixed inset-0 pointer-events-auto bg-black/10 transition-colors" onClick={() => setCartOpen(false)} />
        )}

        <div className={`pointer-events-auto fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg bg-white shadow-[-15px_0_40px_rgba(0,0,0,0.18)] border-l border-slate-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-black font-heading">My Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)} Items)</h3>
            </div>
            <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Your Bag is Empty!</h4>
                <p className="text-xs text-slate-500">Explore items and add products to your cart.</p>
                <button onClick={() => setCartOpen(false)} className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm">
                  START SHOPPING
                </button>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.cartItemId} className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs flex gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-slate-50 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>Size: {item.size}</span>
                        <span>•</span>
                        <span>Color: {item.color}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-sm font-black text-slate-900">₹{item.selling_price.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-slate-400 line-through">₹{item.mrp.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end">
                      <button onClick={() => removeCartItem(item.cartItemId)} className="text-slate-400 hover:text-rose-500 p-1">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button onClick={() => updateQuantity(item.cartItemId, -1)} className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200">-</button>
                        <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartItemId, 1)} className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200">+</button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-slate-800">Promotional Voucher</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SHOPPY150"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 uppercase font-mono font-bold focus:outline-none"
                    />
                    <button onClick={() => handleApplyCoupon()} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold">
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-emerald-600 font-bold">{couponSuccess}</p>}
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 pb-1 border-b border-slate-100">PRICE DETAILS</h4>
                  <div className="flex justify-between text-slate-600">
                    <span>Total MRP:</span>
                    <span>₹{totalMrp.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Product Discount:</span>
                    <span>- ₹{totalDiscount.toLocaleString('en-IN')}</span>
                  </div>
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Voucher Discount:</span>
                      <span>- ₹{voucherDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Doorstep Delivery:</span>
                    <span>{shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Amount:</span>
                    <span>₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">TOTAL PAYABLE</span>
                  <span className="text-lg font-black text-slate-900">₹{grandTotal.toFixed(0)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-600 font-bold block">SAVINGS</span>
                  <span className="text-xs font-black text-emerald-600">₹{totalSavings.toFixed(0)} SAVED</span>
                </div>
              </div>
              <button
                onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MIDDLE CENTER NOTIFICATION TOAST (Item Added to Bag)
      ========================================================================== */}
      {addedToCartNotification && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
          <div className="pointer-events-auto bg-slate-900/95 text-white backdrop-blur-md px-5 py-4 rounded-2xl shadow-2xl border border-slate-700 max-w-sm w-full mx-auto animate-in zoom-in-95 fade-in duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 fill-emerald-500/20 text-emerald-400" />
                <span>Added to Bag Successfully!</span>
              </div>
              <button onClick={() => setAddedToCartNotification(null)} className="text-slate-400 hover:text-white p-1 rounded-md transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img src={addedToCartNotification.image} alt={addedToCartNotification.name} className="w-12 h-12 rounded-xl object-cover bg-white/10 border border-white/10 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">{addedToCartNotification.brand}</span>
                <h4 className="text-xs font-bold text-white truncate">{addedToCartNotification.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-black text-white">₹{addedToCartNotification.price?.toLocaleString('en-IN')}</span>
                  {addedToCartNotification.size && addedToCartNotification.size !== 'Standard' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">{addedToCartNotification.size}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button onClick={() => setAddedToCartNotification(null)} className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition text-center">
                Continue Shopping
              </button>
              <button
                onClick={() => { setAddedToCartNotification(null); setCartOpen(true); }}
                className="py-2 px-3 rounded-xl bg-[#e11d48] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>View Bag ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ONE-PAGE EXPRESS CHECKOUT MODAL
      ========================================================================== */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black font-heading">Express Checkout • GST Invoice</h3>
              </div>
              <button onClick={() => setCheckoutOpen(false)} className="p-1 rounded-full hover:bg-white/20 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Order Items:</span>
                  <p className="font-bold text-slate-800">{cart.length} Products ({cart.reduce((a, b) => a + b.quantity, 0)} Units)</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Payable Total:</span>
                  <p className="text-base font-black text-rose-600">₹{grandTotal.toFixed(0)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <MapPin className="w-4 h-4 text-[#e11d48]" />
                  <span>Doorstep Delivery Address</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Full Name *</label>
                    <input type="text" required value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} placeholder="e.g. Rahul Sharma" className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Mobile Number *</label>
                    <input type="tel" required value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} placeholder="e.g. 9829012345" className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-bold mb-1">Street Address, Flat / Shop No *</label>
                    <input type="text" required value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} placeholder="e.g. Flat 304, Green Park Enclave" className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">City *</label>
                    <input type="text" required value={customerForm.city} onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Pincode *</label>
                    <input type="text" required value={customerForm.pincode} onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Choose Payment Mode</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div onClick={() => setSelectedPayment('cod')} className={`p-3 rounded-xl border-2 cursor-pointer transition ${selectedPayment === 'cod' ? 'border-[#e11d48] bg-rose-50/50' : 'border-slate-200 bg-white'}`}>
                    <span className="font-bold text-slate-900">Cash on Delivery</span>
                    <p className="text-[10px] text-slate-500 mt-1">Pay cash at doorstep upon delivery</p>
                  </div>
                  <div onClick={() => setSelectedPayment('upi')} className={`p-3 rounded-xl border-2 cursor-pointer transition ${selectedPayment === 'upi' ? 'border-[#e11d48] bg-rose-50/50' : 'border-slate-200 bg-white'}`}>
                    <span className="font-bold text-slate-900">Instant UPI QR</span>
                    <p className="text-[10px] text-slate-500 mt-1">GPay / PhonePe / Paytm / BHIM</p>
                  </div>
                  <div onClick={() => setSelectedPayment('card')} className={`p-3 rounded-xl border-2 cursor-pointer transition ${selectedPayment === 'card' ? 'border-[#e11d48] bg-rose-50/50' : 'border-slate-200 bg-white'}`}>
                    <span className="font-bold text-slate-900">Debit / Credit Card</span>
                    <p className="text-[10px] text-slate-500 mt-1">Visa, Mastercard, RuPay &amp; Netbanking</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <button type="submit" disabled={loading} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                  <PackageCheck className="w-4 h-4" />
                  <span>{loading ? 'CONFIRMING ORDER...' : `PLACE ORDER • ₹${grandTotal.toFixed(0)}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          PINCODE MODAL
      ========================================================================== */}
      {pincodeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black font-heading text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#e11d48]" />
                <span>Delivery Location</span>
              </h3>
              <button onClick={() => setPincodeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">Enter your 6-digit Indian PIN code to check delivery status.</p>
            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-sm focus:outline-none"
              />
              <button
                onClick={() => {
                  if (pincodeInput.length === 6) {
                    setDeliveryPincode(pincodeInput);
                    setPincodeModalOpen(false);
                  } else {
                    alert('Please enter a valid 6-digit pincode');
                  }
                }}
                className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Update Delivery Pincode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ORDER SUCCESS MODAL
      ========================================================================== */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black font-heading text-slate-900">🎉 Order Placed Successfully!</h3>
              <p className="text-xs text-slate-500">Thank you for shopping at {storeName}. Your order is confirmed.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-mono font-bold text-slate-900">{orderSuccess.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST Invoice:</span>
                <span className="font-mono font-bold text-emerald-600">{orderSuccess.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold text-slate-900">₹{orderSuccess.grand_total}</span>
              </div>
            </div>
            <button onClick={() => setOrderSuccess(null)} className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md">
              CONTINUE SHOPPING
            </button>
          </div>
        </div>
      )}

      {/* Social Proof Toast */}
      {socialProof && (
        <div className="fixed bottom-4 left-4 z-40 max-w-xs bg-white rounded-xl shadow-xl border border-slate-200 p-3 flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-[11px] leading-snug">
            <p className="text-slate-800 font-bold">
              <span className="text-rose-600">{socialProof.name}</span> from {socialProof.city}
            </p>
            <p className="text-slate-500 line-clamp-1">Ordered {socialProof.item}</p>
            <span className="text-[10px] text-emerald-600 font-medium">{socialProof.time}</span>
          </div>
        </div>
      )}

    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Storefront />);
}
