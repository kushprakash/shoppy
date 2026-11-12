import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { 
  ShoppingBag, ShoppingCart, ShieldCheck, Truck, ArrowRight, CheckCircle2, 
  CreditCard, Sparkles, AlertCircle, Search, Tag, X, User, MapPin, Phone,
  Layers, Palette, Maximize2, Check, ChevronRight, ChevronLeft, PackageCheck, Zap,
  Star, Heart, Eye, Clock, Flame, Percent, RotateCcw, BadgeCheck, Gift,
  Filter, HelpCircle, Headphones, Share2, ThumbsUp, ChevronDown, CheckCheck,
  ExternalLink, SlidersHorizontal, ArrowUpRight
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
// 1. 5 TOP INDIAN MARKETPLACE THEMES CONFIGURATION
// ============================================================================
export const MARKETPLACE_THEMES = {
  snapdeal: {
    id: 'snapdeal',
    name: 'Shoppy Snapdeal Hybrid',
    badge: 'DEFAULT • HIGH CONVERTING',
    accentColor: '#e11d48',
    primaryHeaderBg: 'bg-[#0f172a]',
    primaryHeaderBorder: 'border-slate-800',
    primaryHeaderText: 'text-white',
    subHeaderBg: 'bg-white',
    subHeaderBorder: 'border-slate-200',
    searchBorder: 'border-slate-300 focus-within:border-[#e11d48] focus-within:ring-2 focus-within:ring-rose-500/10',
    searchBtnBg: 'bg-[#e11d48] hover:bg-[#be123c] text-white',
    cartBtnBg: 'bg-slate-900 hover:bg-slate-800 text-white',
    cartIconColor: 'text-rose-400',
    badgeText: 'Shoppy Verified',
    tagColor: 'text-[#e11d48]',
    priceColor: 'text-[#e11d48]',
    buyNowBtn: 'bg-[#e11d48] hover:bg-[#be123c] text-white font-black shadow-md shadow-rose-600/20 rounded-lg',
    addToCartBtn: 'border border-slate-200 hover:border-slate-300 text-slate-800 bg-white hover:bg-slate-50 font-bold rounded-lg',
    bodyBg: 'bg-[#f8fafc]',
    categoryChipActive: 'bg-rose-50 text-[#e11d48] border-[#e11d48]',
    categoryHoverText: 'hover:text-[#e11d48]',
    dealsTag: '⚡ Lightning Deals',
    dealsBadgeBg: 'bg-rose-500 text-white',
    guaranteeTitle: 'Shoppy Trust Pay Guarantee',
  },
  flipkart: {
    id: 'flipkart',
    name: 'Flipkart Style',
    badge: 'POPULAR INDIAN MARKETPLACE',
    accentColor: '#2874f0',
    primaryHeaderBg: 'bg-[#2874f0]',
    primaryHeaderBorder: 'border-[#1e60cc]',
    primaryHeaderText: 'text-white',
    subHeaderBg: 'bg-white',
    subHeaderBorder: 'border-slate-200',
    searchBorder: 'border-slate-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20',
    searchBtnBg: 'bg-[#ffe500] hover:bg-[#ebd300] text-slate-900 font-black',
    cartBtnBg: 'bg-white/15 hover:bg-white/25 text-white border border-white/25',
    cartIconColor: 'text-amber-300',
    badgeText: 'Shoppy Assured',
    tagColor: 'text-[#2874f0]',
    priceColor: 'text-slate-900',
    buyNowBtn: 'bg-[#fb641b] hover:bg-[#e65612] text-white font-black shadow-md shadow-orange-500/20 rounded-sm',
    addToCartBtn: 'bg-[#ff9f00] hover:bg-[#e68f00] text-white font-black rounded-sm',
    bodyBg: 'bg-[#f1f2f4]',
    categoryChipActive: 'bg-blue-50 text-[#2874f0] border-[#2874f0]',
    categoryHoverText: 'hover:text-[#2874f0]',
    dealsTag: '🔥 Flipkart Top Deals of the Day',
    dealsBadgeBg: 'bg-[#2874f0] text-white',
    guaranteeTitle: 'Shoppy Assured Quality Promise',
  },
  jiomart: {
    id: 'jiomart',
    name: 'JioMart Fresh & Essentials',
    badge: 'GROCERY & OMNICHANNEL',
    accentColor: '#0078ad',
    primaryHeaderBg: 'bg-[#0078ad]',
    primaryHeaderBorder: 'border-[#006694]',
    primaryHeaderText: 'text-white',
    subHeaderBg: 'bg-[#006694]',
    subHeaderBorder: 'border-[#00557c]',
    searchBorder: 'border-slate-300 focus-within:border-[#0078ad] focus-within:ring-2 focus-within:ring-cyan-500/20',
    searchBtnBg: 'bg-[#0c831f] hover:bg-[#096e1a] text-white font-bold',
    cartBtnBg: 'bg-[#0c831f] hover:bg-[#096e1a] text-white',
    cartIconColor: 'text-emerald-200',
    badgeText: 'Jio Smart Quality',
    tagColor: 'text-[#0078ad]',
    priceColor: 'text-slate-900',
    buyNowBtn: 'bg-[#0c831f] hover:bg-[#096e1a] text-white font-bold rounded-full shadow-sm',
    addToCartBtn: 'border border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-white font-bold rounded-full',
    bodyBg: 'bg-[#f3f9fb]',
    categoryChipActive: 'bg-emerald-50 text-[#0c831f] border-[#0c831f]',
    categoryHoverText: 'hover:text-[#0078ad]',
    dealsTag: '🛒 Smart Bazaar Super Savings',
    dealsBadgeBg: 'bg-[#0c831f] text-white',
    guaranteeTitle: '100% Quality & Freshness Guarantee',
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon India Style',
    badge: 'GLOBAL RETAIL CLASSIC',
    accentColor: '#f08804',
    primaryHeaderBg: 'bg-[#131921]',
    primaryHeaderBorder: 'border-slate-900',
    primaryHeaderText: 'text-white',
    subHeaderBg: 'bg-[#232f3e]',
    subHeaderBorder: 'border-[#334155]',
    searchBorder: 'border-slate-300 focus-within:border-[#f08804] focus-within:ring-2 focus-within:ring-amber-500/20',
    searchBtnBg: 'bg-[#febd69] hover:bg-[#f3a847] text-slate-900 font-bold',
    cartBtnBg: 'bg-transparent hover:bg-white/10 text-white border border-white/20',
    cartIconColor: 'text-amber-400',
    badgeText: "Shoppy's Choice",
    tagColor: 'text-[#f08804]',
    priceColor: 'text-[#b12704]',
    buyNowBtn: 'bg-[#ffa41c] hover:bg-[#fa8900] text-slate-900 font-bold rounded-full shadow-xs',
    addToCartBtn: 'bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 font-bold rounded-full',
    bodyBg: 'bg-[#eaeded]',
    categoryChipActive: 'bg-amber-50 text-[#b12704] border-[#f08804]',
    categoryHoverText: 'hover:text-[#f08804]',
    dealsTag: '⚡ Amazon Deal of the Day',
    dealsBadgeBg: 'bg-[#b12704] text-white',
    guaranteeTitle: 'Shoppy A-to-z Buyer Protection',
  },
  tatacliq: {
    id: 'tatacliq',
    name: 'Tata CLiQ Luxury & Fashion',
    badge: 'PREMIUM LUXURY CURATION',
    accentColor: '#da1c5c',
    primaryHeaderBg: 'bg-[#111111]',
    primaryHeaderBorder: 'border-[#222222]',
    primaryHeaderText: 'text-white',
    subHeaderBg: 'bg-white',
    subHeaderBorder: 'border-slate-200',
    searchBorder: 'border-slate-300 focus-within:border-[#da1c5c] focus-within:ring-1 focus-within:ring-pink-500/20',
    searchBtnBg: 'bg-[#da1c5c] hover:bg-[#b8124b] text-white text-[10px] font-black tracking-widest uppercase',
    cartBtnBg: 'bg-[#1c1c1c] hover:bg-[#282828] text-white border border-slate-700',
    cartIconColor: 'text-pink-400',
    badgeText: 'Curated 100% Luxury Authentic',
    tagColor: 'text-[#da1c5c]',
    priceColor: 'text-[#111111]',
    buyNowBtn: 'bg-[#da1c5c] hover:bg-[#b8124b] text-white uppercase tracking-wider text-xs font-black rounded-none shadow-sm',
    addToCartBtn: 'bg-black text-white hover:bg-slate-900 uppercase tracking-wider text-xs font-black rounded-none border border-black',
    bodyBg: 'bg-[#ffffff]',
    categoryChipActive: 'bg-pink-50 text-[#da1c5c] border-[#da1c5c]',
    categoryHoverText: 'hover:text-[#da1c5c]',
    dealsTag: '💎 Handpicked Luxury Edit',
    dealsBadgeBg: 'bg-[#da1c5c] text-white',
    guaranteeTitle: 'Tata Trust & Authentic Luxury Guarantee',
  }
};

// ============================================================================
// 2. HORIZONTAL CATEGORIES WITH MEGA MENU DATA
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
    name: "Men & Women's Fashion",
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
// 4. FULL-WIDTH HERO BANNERS (Compact widescreen format, 25-30% reduced height)
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
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [addedToCartNotification, setAddedToCartNotification] = useState(null);
  const addedToCartTimerRef = useRef(null);
  const [welcomePopupOpen, setWelcomePopupOpen] = useState(false);
  const [pincodeModalOpen, setPincodeModalOpen] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState('800001');
  const [pincodeInput, setPincodeInput] = useState('800001');
  const [wishlist, setWishlist] = useState({});

  // Theme Switcher State
  const [activeThemeId, setActiveThemeId] = useState(() => {
    const urlParam = new URLSearchParams(window.location.search).get('theme');
    if (urlParam && MARKETPLACE_THEMES[urlParam]) return urlParam;
    return 'snapdeal';
  });
  const [themeSwitcherOpen, setThemeSwitcherOpen] = useState(false);

  // Active Theme Object
  const theme = useMemo(() => {
    return MARKETPLACE_THEMES[activeThemeId] || MARKETPLACE_THEMES.snapdeal;
  }, [activeThemeId]);

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
  const [paymentMethods, setPaymentMethods] = useState([]);
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

        // Update Theme from Store Database if not forced by URL param
        const urlParam = new URLSearchParams(window.location.search).get('theme');
        if (!urlParam) {
          const dbTheme = s.ecom_theme || s.settings?.ecom_theme || s.settings?.theme_template;
          if (dbTheme && MARKETPLACE_THEMES[dbTheme]) {
            setActiveThemeId(dbTheme);
          }
        }

        // Dynamically update document title & favicon from Store Settings
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

  // Add to Bag
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

    // DO NOT force-open the full cart drawer. Instead, show middle center notification toast!
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
        return 0; // relevance
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
      // Client-side simulated order confirmation
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

  // Store Brand Logo Check
  const storeLogo = storeInfo?.logo || storeInfo?.settings?.logo;
  const storeName = storeInfo?.name || 'Shoppy Store';

  return (
    <div className={`min-h-screen ${theme.bodyBg} text-slate-900 flex flex-col font-sans transition-colors duration-200`}>

      {/* =========================================================================
          1. TOP NOTIFICATION RIBBON (Marketplace Theme Styled)
      ========================================================================== */}
      <div className={`${theme.primaryHeaderBg} ${theme.primaryHeaderText} text-[11px] font-medium py-1.5 px-4 border-b ${theme.primaryHeaderBorder}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase tracking-wider text-amber-300">
              {theme.dealsTag}
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline text-slate-200">
              Extra 10% Instant Off on HDFC &amp; SBI Cards • Use Code: <span className="font-mono font-bold text-amber-300">SHOPPY150</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            {/* Live Ticking Countdown */}
            <div className="flex items-center gap-1 font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>
                Sale Ends: {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>

            <a
              href="tel:+919546042639"
              className="hidden md:flex items-center gap-1 hover:text-white transition"
            >
              <Headphones className="w-3 h-3 text-emerald-400" />
              <span>Help: +91 95460 42639</span>
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN STORE HEADER (With Store Logo, Favicon, Search & Cart)
      ========================================================================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Store Logo / Store Name */}
          <div
            onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
            className="flex items-center gap-3 cursor-pointer flex-shrink-0 group"
          >
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={storeName}
                className="h-9 sm:h-11 max-w-[200px] object-contain group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallbackEl = document.getElementById('store-fallback-text-logo');
                  if (fallbackEl) fallbackEl.style.display = 'flex';
                }}
              />
            ) : null}

            <div
              id="store-fallback-text-logo"
              className={`flex items-center gap-2.5 ${storeLogo ? 'hidden' : 'flex'}`}
            >
              <div 
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform"
                style={{ backgroundColor: theme.accentColor }}
              >
                {storeName ? storeName[0] : 'S'}
              </div>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl md:text-2xl font-black font-heading text-slate-900 tracking-tight">
                    {storeName}
                  </span>
                  <span className="text-xl md:text-2xl font-black" style={{ color: theme.accentColor }}>
                    Store
                  </span>
                </div>
                <div className="flex items-center gap-1 pt-0.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] font-bold text-slate-500">{theme.badgeText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Dropdown + Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <div className={`flex items-center bg-slate-50 border rounded-lg overflow-hidden transition ${theme.searchBorder}`}>

              {/* Category Dropdown Selector */}
              <div className="hidden sm:flex items-center gap-1 pl-3 pr-2 py-2 text-xs font-bold text-slate-700 border-r border-slate-200 bg-slate-100/80 flex-shrink-0">
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

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search products, brands, or daily essentials (e.g. iPhone, Puma, Denim, Oil)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 px-3 text-xs md:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search CTA Button */}
              <button
                type="button"
                className={`px-4 md:px-5 py-2.5 flex items-center gap-1.5 text-xs font-black transition flex-shrink-0 ${theme.searchBtnBg}`}
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Search</span>
              </button>
            </div>
          </div>

          {/* Delivery Pincode */}
          <button
            onClick={() => setPincodeModalOpen(true)}
            className="hidden lg:flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 transition"
          >
            <MapPin className="w-4 h-4" style={{ color: theme.accentColor }} />
            <div className="text-left leading-tight">
              <span className="text-[10px] text-slate-400 block font-semibold">Deliver to</span>
              <span className="font-extrabold text-slate-800">{deliveryPincode} • Change</span>
            </div>
          </button>

          {/* Actions: Terminal Login & Shopping Bag */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <a
              href="/store"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Merchant Terminal</span>
            </a>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className={`relative flex items-center gap-2 px-3.5 md:px-4 py-2.5 text-xs md:text-sm font-extrabold rounded-lg shadow-sm transition active:scale-95 ${theme.cartBtnBg}`}
            >
              <div className="relative">
                <ShoppingBag className={`w-4 h-4 ${theme.cartIconColor}`} />
                {cart.length > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-white text-[10px] font-black flex items-center justify-center animate-pulse"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Bag</span>
              {cart.length > 0 && (
                <span className="text-xs font-black text-amber-300 hidden md:inline">
                  • ₹{grandTotal.toFixed(0)}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* =========================================================================
            3. HORIZONTAL TOP CATEGORIES (LEFT TO RIGHT) WITH MEGA MENU
        ========================================================================== */}
        <div className="border-t border-slate-100 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto scrollbar-none py-1">
            <div className="flex items-center gap-1 py-1">
              {TOP_CATEGORIES_MENU.map((cat) => {
                const isActive = activeCategory === cat.id;
                const isHovered = hoveredCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setHoveredCategory(cat.id)}
                    className="relative"
                  >
                    <button
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setSearchQuery('');
                        setHoveredCategory(null);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        isActive
                          ? theme.categoryChipActive + ' font-black shadow-xs'
                          : `text-slate-700 hover:bg-slate-50 ${theme.categoryHoverText}`
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span>{cat.name}</span>
                      <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isHovered ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Coupon Voucher Pill */}
            <div className="hidden lg:flex items-center gap-2 pl-4 text-xs font-bold shrink-0">
              <span className="text-slate-400 text-[11px]">FLAT ₹150 OFF:</span>
              <button
                onClick={() => handleApplyCoupon('SHOPPY150')}
                className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-mono text-[11px] font-black transition flex items-center gap-1"
              >
                <Tag className="w-3 h-3 text-amber-600" />
                <span>SHOPPY150</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              3B. RICH MEGA MENU DROPDOWN PANEL (On Hover / Click)
          ========================================================================== */}
          {hoveredCategory && (
            <div
              onMouseLeave={() => setHoveredCategory(null)}
              className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="max-w-7xl mx-auto p-6">
                {(() => {
                  const catData = TOP_CATEGORIES_MENU.find((c) => c.id === hoveredCategory) || TOP_CATEGORIES_MENU[0];
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                      {/* Column 1: Subcategories */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                          <span className="text-lg">{catData.icon}</span>
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                            {catData.name} Departments
                          </h4>
                        </div>
                        <ul className="space-y-2 text-xs">
                          {catData.subcategories.map((sub, sIdx) => (
                            <li key={sIdx}>
                              <button
                                onClick={() => {
                                  setActiveCategory(catData.id);
                                  setSearchQuery(sub);
                                  setHoveredCategory(null);
                                }}
                                className="text-slate-600 hover:text-slate-900 font-medium hover:font-bold transition flex items-center justify-between w-full group"
                              >
                                <span>{sub}</span>
                                <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 2: Accessories & Peripherals */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Accessories &amp; Add-ons
                          </h4>
                        </div>
                        <ul className="space-y-2 text-xs">
                          {catData.accessories.map((acc, aIdx) => (
                            <li key={aIdx}>
                              <button
                                onClick={() => {
                                  setActiveCategory(catData.id);
                                  setSearchQuery(acc);
                                  setHoveredCategory(null);
                                }}
                                className="text-slate-600 hover:text-slate-900 font-medium hover:font-bold transition flex items-center justify-between w-full group"
                              >
                                <span>{acc}</span>
                                <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600 transition-transform" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Column 3: Featured Brands */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                          <BadgeCheck className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                            Top Featured Brands
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {catData.brands.map((brand, bIdx) => (
                            <button
                              key={bIdx}
                              onClick={() => {
                                setActiveCategory(catData.id);
                                setSearchQuery(brand);
                                setHoveredCategory(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition"
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Column 4: Promo Deal Card */}
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 space-y-3 shadow-md relative group">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white">
                            {catData.promo.badge}
                          </span>
                          <span className="text-[10px] font-mono text-amber-300">Code: {catData.promo.code}</span>
                        </div>
                        <div>
                          <h5 className="text-sm font-black text-white">{catData.promo.title}</h5>
                          <p className="text-[11px] text-slate-300 mt-0.5">Explore certified models with instant dispatch.</p>
                        </div>
                        <img
                          src={catData.promo.image}
                          alt={catData.promo.title}
                          className="w-full h-24 object-cover rounded-lg group-hover:scale-102 transition-transform duration-300"
                        />
                        <button
                          onClick={() => {
                            setActiveCategory(catData.id);
                            setHoveredCategory(null);
                          }}
                          className="w-full py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-black transition flex items-center justify-center gap-1"
                        >
                          <span>Explore {catData.name}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 md:px-4 space-y-5 w-full mt-3 flex-1">

        {/* =========================================================================
            4. FULL-WIDTH HERO BANNER CAROUSEL (Compact Widescreen - Height Reduced ~25%)
        ========================================================================== */}
        <div className="w-full relative rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-[180px] sm:h-[220px] md:h-[260px] lg:h-[280px]">
          <div className={`w-full h-full p-6 md:p-8 bg-gradient-to-br ${HERO_BANNERS[activeBanner].bgGradient} text-white flex flex-col justify-between transition-all duration-700 relative`}>

            <div className="space-y-1.5 md:space-y-2 max-w-2xl z-10">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/15 backdrop-blur text-[10px] font-black tracking-wider uppercase text-amber-300">
                <Flame className="w-3 h-3 fill-current" />
                {HERO_BANNERS[activeBanner].tag}
              </span>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black font-heading leading-tight tracking-tight text-white drop-shadow">
                {HERO_BANNERS[activeBanner].title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 line-clamp-1 sm:line-clamp-2 font-medium max-w-xl">
                {HERO_BANNERS[activeBanner].subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 z-10">
              <div className="bg-black/30 backdrop-blur px-3 py-1 rounded-md text-[11px] font-bold text-amber-300 border border-white/10 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>{HERO_BANNERS[activeBanner].badgeText}</span>
              </div>

              <button
                onClick={() => {
                  if (HERO_BANNERS[activeBanner].categoryTarget !== 'ALL') {
                    setActiveCategory(HERO_BANNERS[activeBanner].categoryTarget);
                  }
                  window.scrollTo({ top: 520, behavior: 'smooth' });
                }}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white text-xs font-black shadow-lg shadow-black/20 transition active:scale-95 flex items-center gap-1.5 ${theme.buyNowBtn}`}
              >
                <span>{HERO_BANNERS[activeBanner].ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {HERO_BANNERS.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBanner(idx)}
                  className={`h-1.5 rounded-full transition-all ${activeBanner === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next controls */}
            <button
              onClick={() => setActiveBanner((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur transition z-20"
              aria-label="Previous Banner"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveBanner((prev) => (prev + 1) % HERO_BANNERS.length)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur transition z-20"
              aria-label="Next Banner"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* =========================================================================
            5. VALUE OFFERS STRIP (Bank Cards & Instant UPI)
        ========================================================================== */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#e11d48] flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">10% Bank Discount</p>
              <p className="text-[10px] text-slate-500">HDFC, SBI &amp; ICICI Cards</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Instant UPI Cashback</p>
              <p className="text-[10px] text-slate-500">PhonePe, Paytm &amp; Google Pay</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Free Express Delivery</p>
              <p className="text-[10px] text-slate-500">On all orders above ₹499</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Flat ₹150 OFF Voucher</p>
              <p className="text-[10px] text-slate-500">Use Code: SHOPPY150</p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. ⚡ LIGHTNING DEALS OF THE DAY
        ========================================================================== */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 md:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-black shadow-xs"
                style={{ backgroundColor: theme.accentColor }}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black font-heading text-slate-900">
                    {theme.dealsTag}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-50 text-[#e11d48]">
                    UP TO 70% OFF
                  </span>
                </div>
                <p className="text-xs text-slate-500">Handpicked top deals refreshed every 24 hours.</p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
              <Clock className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-black text-slate-800">
                Ends in: <span className="font-mono text-[#e11d48]">{String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s</span>
              </span>
            </div>
          </div>

          {/* Deals Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {dealProducts.slice(0, 4).map((product) => {
              const activeVariant = selectedVariants[product.id] || product.variants[0];
              const sellingPrice = activeVariant?.sellingPrice || product.selling_price;
              const mrp = activeVariant?.mrp || product.mrp;
              const discountPct = Math.round(((mrp - sellingPrice) / mrp) * 100);

              return (
                <div
                  key={product.id}
                  onClick={() => setQuickViewProduct(product)}
                  className="group rounded-xl border border-slate-200 hover:border-slate-300 bg-white p-3 flex flex-col justify-between transition-all hover:shadow-md cursor-pointer relative"
                >
                  <div className="space-y-2">
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black bg-[#e11d48] text-white shadow-xs">
                        {discountPct}% OFF
                      </span>
                      <button
                        onClick={(e) => toggleWishlist(product.id, e)}
                        className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur shadow-xs transition ${
                          wishlist[product.id] ? 'text-[#e11d48]' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    {/* Title */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">{product.brand}</span>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-rose-600 transition">
                        {product.name}
                      </h4>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                        <span>{product.rating}</span>
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </span>
                      <span className="text-[10px] text-slate-400">({product.rating_count.toLocaleString('en-IN')})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-slate-900">₹{sellingPrice.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Quick Add CTA */}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full mt-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            7. FULL PRODUCT CATALOG WITH FILTERS & SORTING
        ========================================================================== */}
        <section className="space-y-4 pt-2">
          {/* Header & Sort Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black font-heading text-slate-900">
                {activeCategory === 'ALL' ? 'All Curated Products' : activeCategory}
              </h3>
              <p className="text-xs text-slate-500">
                Showing {filteredProducts.length} verified products with doorstep delivery
              </p>
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No Products Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items match your search or filter criteria. Try resetting the category or searching for another term.
              </p>
              <button
                onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); setSearchCategoryFilter('ALL'); }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const activeVariant = selectedVariants[product.id] || (product.variants && product.variants[0]);
                const sellingPrice = activeVariant?.sellingPrice || product.selling_price;
                const mrp = activeVariant?.mrp || product.mrp;
                const discountPct = Math.round(((mrp - sellingPrice) / mrp) * 100);

                return (
                  <div
                    key={product.id}
                    onClick={() => setQuickViewProduct(product)}
                    className="group rounded-2xl border border-slate-200 hover:border-slate-300 bg-white p-3.5 flex flex-col justify-between transition-all hover:shadow-lg cursor-pointer relative"
                  >
                    <div className="space-y-3">
                      {/* Product Image & Wishlist Heart */}
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span 
                            className="px-2 py-0.5 rounded text-[9px] font-black text-white shadow-xs"
                            style={{ backgroundColor: theme.accentColor }}
                          >
                            {discountPct}% OFF
                          </span>
                          {product.badge && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-900/80 backdrop-blur text-white shadow-xs">
                              {product.badge}
                            </span>
                          )}
                        </div>

                        {/* Wishlist Heart */}
                        <button
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur shadow-xs transition ${
                            wishlist[product.id] ? 'text-[#e11d48]' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      {/* Title & Brand */}
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                          <span className="font-extrabold uppercase">{product.brand}</span>
                          <span className="font-medium text-emerald-600">{product.delivery_text}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 group-hover:text-slate-700 transition leading-snug">
                          {product.name}
                        </h4>
                      </div>

                      {/* Star Rating Badge */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                          <span>{product.rating}</span>
                          <Star className="w-2.5 h-2.5 fill-current" />
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {product.rating_count.toLocaleString('en-IN')} verified ratings
                        </span>
                      </div>

                      {/* Variant Size Pills / Color Dots */}
                      {product.variants && product.variants.length > 1 && (
                        <div className="pt-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1">
                            {product.variants.map((v) => {
                              const isSelected = activeVariant?.id === v.id;
                              return (
                                <button
                                  key={v.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectVariant(product.id, v);
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition border ${
                                    isSelected
                                      ? 'bg-slate-900 text-white border-slate-900'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  {v.size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Price Section */}
                      <div className="pt-1 flex items-baseline gap-2">
                        <span className="text-base font-black text-slate-900">
                          ₹{sellingPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{mrp.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          Save ₹{(mrp - sellingPrice).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {product.bank_offer && (
                        <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span className="line-clamp-1">{product.bank_offer}</span>
                        </div>
                      )}
                    </div>

                    {/* Dual Action Buttons (Add to Bag & Buy Now) */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-slate-100">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`py-2 text-xs transition flex items-center justify-center gap-1 ${theme.addToCartBtn}`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>

                      <button
                        onClick={(e) => handleBuyNow(product, e)}
                        className={`py-2 text-xs transition flex items-center justify-center gap-1 ${theme.buyNowBtn}`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Buy Now</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================================================================
            8. TRUST PAY GUARANTEE SECTION (POSITIONED RIGHT ABOVE FOOTER)
        ========================================================================== */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6 mt-8">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
              <span>100% BUYER &amp; PAYMENT PROTECTION</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black font-heading text-slate-900">
              {theme.guaranteeTitle}
            </h3>
            <p className="text-xs text-slate-500">
              Every order placed at {storeName} is backed by our direct merchant warranty, fast dispatch, and verified tax invoicing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3.5">
              <div 
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center flex-shrink-0 shadow-xs"
                style={{ backgroundColor: theme.accentColor }}
              >
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Free Express Delivery</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Free doorstep delivery on orders above ₹499 with real-time SMS tracking updates.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">7-Day Easy Replacement</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hassle-free doorstep returns and instant replacements with zero questions asked.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">100% Genuine Products</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Direct brand-authorized inventory with valid manufacturer warranty and GST tax invoices.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Instant UPI &amp; COD</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Zero payment surcharge on Google Pay, PhonePe, Cards, Netbanking, or Cash on Delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* =========================================================================
          9. OFFICIAL FOOTER (Omnichannel Storefront Footer)
      ========================================================================== */}
      <footer className="bg-[#0f172a] text-white mt-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-black text-base shadow-xs"
                style={{ backgroundColor: theme.accentColor }}
              >
                {storeName ? storeName[0] : 'S'}
              </div>
              <span className="text-lg font-black text-white">{storeName}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's trusted omnichannel retail store powered by Shoppy Cloud ERP. Authentic brand products, fast dispatch, and instant GST invoices.
            </p>
            <div className="pt-2 text-slate-400 text-xs space-y-1">
              <p>Store Code: <span className="font-mono text-white font-bold">{shopCode || 'SP-LIVE'}</span></p>
              <p>Helpline: <span className="text-emerald-400 font-bold">+91 95460 42639</span></p>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Customer Service</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#track" onClick={(e) => { e.preventDefault(); alert('Order tracking SMS sent to your registered mobile number upon dispatch.'); }} className="hover:text-white transition">Track Order</a></li>
              <li><a href="#returns" onClick={(e) => { e.preventDefault(); alert('7-day doorstep return policy applies to all orders.'); }} className="hover:text-white transition">Return Policy</a></li>
              <li><a href="#shipping" onClick={(e) => { e.preventDefault(); alert('Free shipping on all orders above ₹499.'); }} className="hover:text-white transition">Shipping Terms</a></li>
              <li><a href="/store" className="hover:text-white transition">Merchant POS Login</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Payment Modes Accepted</h4>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700 font-medium">Google Pay</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700 font-medium">PhonePe</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700 font-medium">Paytm UPI</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700 font-medium">Visa / MasterCard</span>
              <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700 font-medium">Cash on Delivery</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-2">
              All transactions encrypted with 256-bit bank-grade SSL security.
            </p>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Shoppy Cloud Technology</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Multi-tenant high-speed retail platform engineered by Enexa IT Solutions Private Limited.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-slate-800 text-emerald-400 font-mono text-[10px] rounded-lg border border-slate-700">
                SSL Secured • ISO Certified
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 py-4 px-4 text-center text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {storeName}. All Rights Reserved. Built on Shoppy Omnichannel ERP.</p>
        </div>
      </footer>

      {/* =========================================================================
          10. SLIDE-OVER CART DRAWER (Smooth right-to-left slide, NO backdrop fade)
      ========================================================================== */}
      <div 
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 ${
          cartOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Transparent Click-away layer: NO dark overlay, background remains 100% visible */}
        {cartOpen && (
          <div
            className="fixed inset-0 pointer-events-auto bg-black/10 transition-colors"
            onClick={() => setCartOpen(false)}
          />
        )}

        {/* Slide-in Cart Panel (moves from right to left) */}
        <div
          className={`pointer-events-auto fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg bg-white shadow-[-15px_0_40px_rgba(0,0,0,0.18)] border-l border-slate-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
            cartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-black font-heading">
                My Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
              </h3>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-[#e11d48] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Your Bag is Empty!</h4>
                <p className="text-xs text-slate-500">Explore lightning deals and add items to your cart.</p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.cartItemId} className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg bg-slate-50 flex-shrink-0"
                    />
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
                      <button
                        onClick={() => removeCartItem(item.cartItemId)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Voucher Code Box */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-slate-800">Have a Promotional Voucher?</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SHOPPY150"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 uppercase font-mono font-bold focus:outline-none"
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] text-emerald-600 font-bold">{couponSuccess}</p>}
                </div>

                {/* Price Breakdown */}
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
                      <span>Voucher ({appliedCoupon?.code}):</span>
                      <span>- ₹{voucherDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Doorstep Shipping:</span>
                    <span>{shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Amount:</span>
                    <span style={{ color: theme.accentColor }}>₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout Bar */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">TOTAL PAYABLE</span>
                  <span className="text-lg font-black text-slate-900">₹{grandTotal.toFixed(0)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-600 font-bold block">TOTAL SAVINGS</span>
                  <span className="text-xs font-black text-emerald-600">₹{totalSavings.toFixed(0)} SAVED</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className={`w-full py-3 text-white text-xs font-black tracking-wider shadow-lg transition active:scale-95 flex items-center justify-center gap-2 ${theme.buyNowBtn}`}
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          11. ONE-PAGE EXPRESS CHECKOUT MODAL
      ========================================================================== */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black font-heading">
                  Express Checkout • Verified GST Invoice
                </h3>
              </div>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Order Summary Strip */}
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

              {/* Delivery Address */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <MapPin className="w-4 h-4 text-[#e11d48]" />
                  <span>Doorstep Delivery Address</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">10-Digit Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      placeholder="e.g. 9829012345"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-bold mb-1">Street Address, Flat / Shop No *</label>
                    <input
                      type="text"
                      required
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      placeholder="e.g. Flat 304, Green Park Enclave, Main Road"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={customerForm.pincode}
                      onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Choose Payment Mode</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setSelectedPayment('cod')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                      selectedPayment === 'cod' ? 'border-[#e11d48] bg-rose-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedPayment === 'cod'}
                        onChange={() => setSelectedPayment('cod')}
                        className="text-[#e11d48] focus:ring-0"
                      />
                      <span className="font-bold text-slate-900">Cash on Delivery</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 pl-5">Pay cash at doorstep upon delivery</p>
                  </div>

                  <div
                    onClick={() => setSelectedPayment('upi')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                      selectedPayment === 'upi' ? 'border-[#e11d48] bg-rose-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedPayment === 'upi'}
                        onChange={() => setSelectedPayment('upi')}
                        className="text-[#e11d48] focus:ring-0"
                      />
                      <span className="font-bold text-slate-900">Instant UPI QR</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 pl-5">GPay / PhonePe / Paytm / BHIM</p>
                  </div>

                  <div
                    onClick={() => setSelectedPayment('card')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                      selectedPayment === 'card' ? 'border-[#e11d48] bg-rose-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedPayment === 'card'}
                        onChange={() => setSelectedPayment('card')}
                        className="text-[#e11d48] focus:ring-0"
                      />
                      <span className="font-bold text-slate-900">Debit / Credit Card</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 pl-5">Visa, Mastercard, RuPay &amp; Netbanking</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-white text-xs font-black tracking-wider shadow-lg transition active:scale-95 flex items-center justify-center gap-2 ${theme.buyNowBtn}`}
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{loading ? 'CONFIRMING ORDER...' : `PLACE ORDER • ₹${grandTotal.toFixed(0)}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          12. WELCOME OFFER MODAL (SHOPPY150 VOUCHER POPUP)
      ========================================================================== */}
      {welcomePopupOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setWelcomePopupOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div 
              className="w-14 h-14 rounded-2xl text-white flex items-center justify-center mx-auto shadow-lg"
              style={{ backgroundColor: theme.accentColor }}
            >
              <Gift className="w-8 h-8" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-50 text-[#e11d48]">
                WELCOME TO {storeName.toUpperCase()}
              </span>
              <h3 className="text-xl font-black font-heading text-slate-900 mt-1">
                Flat ₹150 OFF On 1st Order!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Use voucher code <span className="font-mono font-bold text-slate-800">SHOPPY150</span> at checkout on orders above ₹499.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-700">Your Exclusive Coupon</span>
              <div className="font-mono text-base font-black text-slate-900 tracking-wider mt-0.5">SHOPPY150</div>
            </div>

            <button
              onClick={() => handleApplyCoupon('SHOPPY150')}
              className={`w-full py-2.5 text-white text-xs font-bold shadow-md transition ${theme.buyNowBtn}`}
            >
              Apply Voucher &amp; Shop Now
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          13. PINCODE CHECKER MODAL
      ========================================================================== */}
      {pincodeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black font-heading text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#e11d48]" />
                <span>Choose Delivery Location</span>
              </h3>
              <button onClick={() => setPincodeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter your 6-digit Indian PIN code to check express delivery availability and doorstep COD status.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-sm focus:outline-none focus:border-rose-500"
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
                className={`w-full py-2.5 text-white text-xs font-bold rounded-lg shadow-sm transition ${theme.buyNowBtn}`}
              >
                Update Delivery Pincode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          14. LIVE SOCIAL PROOF TOAST
      ========================================================================== */}
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

      {/* =========================================================================
          14B. MIDDLE CENTER NOTIFICATION TOAST (Item Added to Bag)
      ========================================================================== */}
      {addedToCartNotification && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
          <div className="pointer-events-auto bg-slate-900/95 text-white backdrop-blur-md px-5 py-4 rounded-2xl shadow-2xl border border-slate-700 max-w-sm w-full mx-auto animate-in zoom-in-95 fade-in duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 fill-emerald-500/20 text-emerald-400" />
                <span>Added to Bag Successfully!</span>
              </div>
              <button
                onClick={() => setAddedToCartNotification(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={addedToCartNotification.image}
                alt={addedToCartNotification.name}
                className="w-12 h-12 rounded-xl object-cover bg-white/10 border border-white/10 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">{addedToCartNotification.brand}</span>
                <h4 className="text-xs font-bold text-white truncate">{addedToCartNotification.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-black text-white">
                    ₹{addedToCartNotification.price?.toLocaleString('en-IN')}
                  </span>
                  {addedToCartNotification.mrp && addedToCartNotification.mrp > addedToCartNotification.price && (
                    <span className="text-[10px] text-slate-400 line-through">
                      ₹{addedToCartNotification.mrp?.toLocaleString('en-IN')}
                    </span>
                  )}
                  {addedToCartNotification.size && addedToCartNotification.size !== 'Standard' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                      {addedToCartNotification.size}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setAddedToCartNotification(null)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition text-center"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  setAddedToCartNotification(null);
                  setCartOpen(true);
                }}
                className="py-2 px-3 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                style={{ backgroundColor: theme.accentColor }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>View Bag ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          15. ORDER CONFIRMED MODAL
      ========================================================================== */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black font-heading text-slate-900">
                🎉 Order Placed Successfully!
              </h3>
              <p className="text-xs text-slate-500">
                Thank you for shopping at {storeName}. Your order is confirmed and scheduled for dispatch.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-mono font-bold text-slate-900">{orderSuccess.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST Tax Invoice:</span>
                <span className="font-mono font-bold text-emerald-600">{orderSuccess.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold text-slate-900">₹{orderSuccess.grand_total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold text-slate-900">{orderSuccess.payment_method}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Total Savings:</span>
                <span>₹{orderSuccess.savings} Saved</span>
              </div>
            </div>

            <button
              onClick={() => setOrderSuccess(null)}
              className="w-full py-3 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold shadow-md transition"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          16. FLOATING LIVE THEME SWITCHER BAR (5 Marketplace Themes)
      ========================================================================== */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="relative">
          {themeSwitcherOpen ? (
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 p-4 w-72 space-y-3 animate-in zoom-in-95 duration-150 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-black text-slate-900">
                  <Palette className="w-4 h-4 text-cyan-600" />
                  <span>5 Marketplace Themes</span>
                </div>
                <button
                  onClick={() => setThemeSwitcherOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {Object.values(MARKETPLACE_THEMES).map((thm) => {
                  const isCur = activeThemeId === thm.id;
                  return (
                    <button
                      key={thm.id}
                      onClick={() => {
                        setActiveThemeId(thm.id);
                        try {
                          const url = new URL(window.location.href);
                          url.searchParams.set('theme', thm.id);
                          window.history.replaceState({}, '', url.toString());
                        } catch (e) {}
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition ${
                        isCur
                          ? 'bg-slate-900 text-white border-slate-900 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/40"
                          style={{ backgroundColor: thm.accentColor }}
                        />
                        <span className="text-[11px] font-bold">{thm.name}</span>
                      </div>
                      {isCur && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Configure in Store Settings</span>
                <a href="/shop-admin/store-settings" className="text-cyan-600 font-bold hover:underline">Admin</a>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setThemeSwitcherOpen(true)}
              className="px-3 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 backdrop-blur flex items-center gap-2 transition hover:scale-105"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Theme: {theme.name}</span>
              <span 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
              />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Storefront />);
}
