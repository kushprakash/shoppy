import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { 
  ShoppingBag, ShoppingCart, ShieldCheck, Truck, ArrowRight, CheckCircle2, 
  CreditCard, Sparkles, AlertCircle, Search, Tag, X, User, MapPin, Phone,
  Layers, Palette, Maximize2, Check, ChevronRight, ChevronLeft, PackageCheck, Zap,
  Star, Heart, Eye, Clock, Flame, Percent, RotateCcw, BadgeCheck, Gift,
  Filter, HelpCircle, Headphones, Share2, ThumbsUp, ChevronDown, CheckCheck
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
// UNIQUE HYBRID E-COMMERCE CATALOG (RICH PRODUCT MASTER)
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
    rating_count: 5120,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    badge: 'Shoppy Certified',
    is_deal_of_day: true,
    bank_offer: 'Instant ₹2,000 Off on Prepaid Orders',
    delivery_text: 'Free Delivery by Thursday',
    stock: 30,
    specs: ['Industry Leading ANC with 8 Mics', '30 Hours Battery with Quick Charge', 'Speak-to-Chat & Multipoint Pairing'],
    variants: [
      { id: 'v1', size: 'Over-Ear', color: 'Midnight Black', colorHex: '#18181b', sellingPrice: 26990, mrp: 34990, sku: 'SNY-XM5-BLK' },
      { id: 'v2', size: 'Over-Ear', color: 'Silver Sand', colorHex: '#e4e4e7', sellingPrice: 26990, mrp: 34990, sku: 'SNY-XM5-SLV' },
    ]
  },
  {
    id: 'AUD-105',
    name: 'boAt Airdopes 141 Bluetooth True Wireless Earbuds with 42H Playtime',
    category: 'Electronics',
    topCategoryId: 'CAT-ELECTRONICS',
    brand: 'boAt',
    selling_price: 999,
    mrp: 4490,
    rating: 4.3,
    rating_count: 88400,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    badge: 'Hot Deal',
    is_deal_of_day: true,
    bank_offer: 'Special Price: 77% Off Today',
    delivery_text: 'Free Delivery by Tomorrow',
    stock: 120,
    specs: ['42 Hours Total Playback', 'ENx Environmental Noise Cancellation', 'ASAP Fast Charge (5 mins = 75 mins)'],
    variants: [
      { id: 'v1', size: 'Standard', color: 'Active Black', colorHex: '#09090b', sellingPrice: 999, mrp: 4490, sku: 'BOAT-141-BLK' },
      { id: 'v2', size: 'Standard', color: 'Cyan Cider', colorHex: '#06b6d4', sellingPrice: 999, mrp: 4490, sku: 'BOAT-141-CYN' },
      { id: 'v3', size: 'Standard', color: 'Bold White', colorHex: '#f4f4f5', sellingPrice: 999, mrp: 4490, sku: 'BOAT-141-WHT' },
    ]
  },

  // 2. FASHION & APPAREL
  {
    id: 'FSH-201',
    name: "Men's Premium Slim Fit Casual Denim Shirt - 100% Breathable Cotton",
    category: 'Fashion',
    topCategoryId: 'CAT-FASHION',
    brand: 'Roadster',
    selling_price: 699,
    mrp: 1999,
    rating: 4.3,
    rating_count: 14210,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    badge: 'Popular Pick',
    is_deal_of_day: true,
    bank_offer: 'Buy 2 Get Extra 10% Off',
    delivery_text: 'Free Delivery by Tomorrow',
    stock: 80,
    specs: ['100% Cotton Denim Weave', 'Double Chest Pockets with Flap', 'Curve Hemline for Smart Casual Tuck'],
    variants: [
      { id: 'v1', size: 'M (38)', color: 'Washed Indigo Blue', colorHex: '#2563eb', sellingPrice: 699, mrp: 1999, sku: 'DNM-SH-M-IND' },
      { id: 'v2', size: 'L (40)', color: 'Washed Indigo Blue', colorHex: '#2563eb', sellingPrice: 699, mrp: 1999, sku: 'DNM-SH-L-IND' },
      { id: 'v3', size: 'XL (42)', color: 'Washed Indigo Blue', colorHex: '#2563eb', sellingPrice: 699, mrp: 1999, sku: 'DNM-SH-XL-IND' },
      { id: 'v4', size: 'XXL (44)', color: 'Charcoal Black', colorHex: '#3f3f46', sellingPrice: 749, mrp: 2199, sku: 'DNM-SH-XXL-BLK' },
    ]
  },
  {
    id: 'FSH-202',
    name: "Levi's Men 511 Mid Rise Slim Fit Stretchable Jeans",
    category: 'Fashion',
    topCategoryId: 'CAT-FASHION',
    brand: "Levi's",
    selling_price: 1799,
    mrp: 3999,
    rating: 4.6,
    rating_count: 18940,
    image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80',
    badge: 'Brand Original',
    is_deal_of_day: false,
    bank_offer: 'Flat ₹200 Coupon Auto-Applied',
    delivery_text: 'Free Delivery by Thursday',
    stock: 55,
    specs: ['98% Cotton, 2% Elastane Stretch', 'Original 5-Pocket Styling', 'Machine Washable Durable Denim'],
    variants: [
      { id: 'v1', size: '30 Waist', color: 'Dark Stone Wash', colorHex: '#1e3a8a', sellingPrice: 1799, mrp: 3999, sku: 'LEV-511-30-DSW' },
      { id: 'v2', size: '32 Waist', color: 'Dark Stone Wash', colorHex: '#1e3a8a', sellingPrice: 1799, mrp: 3999, sku: 'LEV-511-32-DSW' },
      { id: 'v3', size: '34 Waist', color: 'Dark Stone Wash', colorHex: '#1e3a8a', sellingPrice: 1799, mrp: 3999, sku: 'LEV-511-34-DSW' },
      { id: 'v4', size: '36 Waist', color: 'Vintage Blue', colorHex: '#3b82f6', sellingPrice: 1899, mrp: 4199, sku: 'LEV-511-36-VNT' },
    ]
  },
  {
    id: 'FSH-203',
    name: "Women's Embroidered Pure Cotton Anarkali Kurta with Pant & Dupatta Set",
    category: 'Fashion',
    topCategoryId: 'CAT-FASHION',
    brand: 'Libas',
    selling_price: 1299,
    mrp: 3499,
    rating: 4.5,
    rating_count: 24150,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    badge: 'Festive Special',
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
      { id: 'v1', size: '1 Litre Pouch', color: 'Standard', colorHex: '#eab308', sellingPrice: 135, mrp: 175, sku: 'FRT-SUN-1L' },
      { id: 'v2', size: '5 Litre Jar', color: 'Standard', colorHex: '#eab308', sellingPrice: 649, mrp: 850, sku: 'FRT-SUN-5L' },
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
// SNAPDEAL-STYLE LEFT SIDEBAR CATEGORIES
// ============================================================================
const SIDEBAR_CATEGORIES = [
  { id: 'ALL', name: 'All Departments', icon: '⚡', count: '1,200+' },
  { id: 'CAT-MOBILES', name: 'Mobiles & Tablets', icon: '📱', count: '140+ Deals' },
  { id: 'CAT-FASHION', name: "Men & Women's Fashion", icon: '👔', count: '450+ Styles' },
  { id: 'CAT-ELECTRONICS', name: 'Electronics & Audio', icon: '💻', count: '280+ Items' },
  { id: 'CAT-HOME', name: 'Home & Kitchenware', icon: '🛋️', count: '190+ Items' },
  { id: 'CAT-APPLIANCES', name: 'TV & Home Appliances', icon: '📺', count: '90+ Models' },
  { id: 'CAT-GROCERY', name: 'Grocery & Supermarket', icon: '🛒', count: '320+ Staples' },
  { id: 'CAT-TRAVEL', name: 'Luggage & Backpacks', icon: '✈️', count: '75+ Styles' },
  { id: 'CAT-BEAUTY', name: 'Beauty & Personal Care', icon: '🧸', count: '160+ Products' },
];

// ============================================================================
// DYNAMIC PROMOTIONAL HERO BANNERS (SHOPPY HYBRID)
// ============================================================================
const HERO_BANNERS = [
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
    title: 'Next-Gen Smartphones & Audio',
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
// LIVE SOCIAL PROOF TICKER
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

  // Active Category & Search Filters
  const [activeCategory, setActiveCategory] = useState('ALL');
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
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [customerForm, setCustomerForm] = useState(() => {
    try {
      const saved = localStorage.getItem('shoppy_customer_checkout_info');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
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
        setStoreInfo(infoRes.data.store);
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
          brand: item.brand || 'Shoppy Certified',
          selling_price: parseFloat(item.selling_price || item.price || 499),
          mrp: parseFloat(item.mrp || (item.selling_price * 1.4) || 699),
          rating: 4.5,
          rating_count: 1200 + (idx * 350),
          image: item.image || SHOPPY_PRODUCTS[idx % SHOPPY_PRODUCTS.length].image,
          badge: 'Shoppy Certified',
          is_deal_of_day: idx % 2 === 0,
          delivery_text: 'Free Delivery by Tomorrow',
          stock: item.stock ?? 50,
          specs: [item.description || 'Premium Authenticated Product', 'GST Compliant Tax Invoice Included'],
          variants: [
            { id: 'v1', size: 'Standard', color: 'Default', colorHex: '#2563eb', sellingPrice: parseFloat(item.selling_price || 499), mrp: parseFloat(item.mrp || 699), sku: item.sku || `SKU-${idx}` }
          ]
        }));
        setProducts([...dbProducts, ...SHOPPY_PRODUCTS]);
      }
    } catch (err) {
      setStoreInfo({
        name: shopCode ? `Shoppy Store (${shopCode})` : 'Shoppy ERP Official Store',
        shop_code: shopCode || 'SP-LIVE'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const params = shopCode ? { code: shopCode } : {};
      const res = await axios.get('/api/storefront/payment-methods', { params });
      if (res.data?.success && res.data.payment_methods?.length > 0) {
        setPaymentMethods(res.data.payment_methods);
        setSelectedPayment(res.data.payment_methods[0].code);
      } else {
        setPaymentMethods([
          { code: 'cod', name: 'Cash on Delivery (COD)', description: 'Pay cash or UPI upon delivery at your doorstep.', type: 'offline' },
          { code: 'phonepe', name: 'PhonePe / Paytm UPI QR', description: 'Instant Zero-Fee QR and UPI payment.', type: 'online' },
          { code: 'card', name: 'Credit / Debit Card & NetBanking', description: 'Secure 128-bit Encrypted Card Gateway.', type: 'online' },
        ]);
      }
    } catch (e) {
      setPaymentMethods([
        { code: 'cod', name: 'Cash on Delivery (COD)', description: 'Pay cash or UPI upon delivery at your doorstep.', type: 'offline' },
        { code: 'phonepe', name: 'PhonePe / Paytm UPI QR', description: 'Instant Zero-Fee QR and UPI payment.', type: 'online' },
        { code: 'card', name: 'Credit / Debit Card & NetBanking', description: 'Secure 128-bit Encrypted Card Gateway.', type: 'online' },
      ]);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [shopCode]);

  // Variant Selection Handlers
  const handleSelectColor = (productId, colorName) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.variants) return;
    const current = selectedVariants[productId] || product.variants[0];
    const match = product.variants.find((v) => v.color === colorName && v.size === current.size) ||
                  product.variants.find((v) => v.color === colorName) ||
                  product.variants[0];
    setSelectedVariants((prev) => ({ ...prev, [productId]: match }));
  };

  const handleSelectSize = (productId, sizeCode) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.variants) return;
    const current = selectedVariants[productId] || product.variants[0];
    const match = product.variants.find((v) => v.size === sizeCode && v.color === current.color) ||
                  product.variants.find((v) => v.size === sizeCode) ||
                  product.variants[0];
    setSelectedVariants((prev) => ({ ...prev, [productId]: match }));
  };

  // Cart Add & Update
  const addToCart = (product, openDrawer = true) => {
    const activeVar = selectedVariants[product.id] || (product.variants && product.variants[0]) || {
      id: 'default',
      size: 'Standard',
      color: 'Default',
      colorHex: '#2563eb',
      sku: product.sku || product.id,
      sellingPrice: product.selling_price,
      mrp: product.mrp,
    };

    const cartItemId = `${product.id}-${activeVar.sku || activeVar.size}`;

    setCart((prev) => {
      const exists = prev.find((i) => i.cartItemId === cartItemId);
      if (exists) {
        return prev.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          name: product.name,
          image: product.image,
          brand: product.brand,
          variantId: activeVar.id,
          variantSku: activeVar.sku,
          size: activeVar.size,
          color: activeVar.color,
          selling_price: parseFloat(activeVar.sellingPrice || product.selling_price || 0),
          mrp: parseFloat(activeVar.mrp || product.mrp || 0),
          quantity: 1,
        }
      ];
    });

    if (openDrawer) {
      setCartOpen(true);
    }
  };

  const buyNow = (product) => {
    addToCart(product, false);
    fetchPaymentMethods();
    setCheckoutOpen(true);
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  // Cart Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.selling_price * item.quantity), 0);
  const totalMrp = cart.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);
  const totalProductDiscount = Math.max(0, totalMrp - subtotal);

  // Coupon Calculation
  let couponDiscount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = (subtotal * parseFloat(appliedCoupon.discountValue || 0)) / 100;
      if (appliedCoupon.maxDiscountAmount && couponDiscount > parseFloat(appliedCoupon.maxDiscountAmount)) {
        couponDiscount = parseFloat(appliedCoupon.maxDiscountAmount);
      }
    } else {
      couponDiscount = Math.min(subtotal, parseFloat(appliedCoupon.discountValue || 0));
    }
  }
  couponDiscount = Math.round(couponDiscount);
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);

  // Delivery Calculation
  const isFreeDelivery = discountedSubtotal >= 499 || cart.length === 0;
  const shippingFee = (cart.length === 0 || isFreeDelivery) ? 0 : 50;
  const grandTotal = discountedSubtotal + shippingFee;
  const totalSavings = totalProductDiscount + couponDiscount + (isFreeDelivery && cart.length > 0 ? 50 : 0);

  const handleApplyCoupon = (codeParam) => {
    setCouponError('');
    setCouponSuccess('');
    const code = (codeParam || couponCodeInput || '').trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    if (code === 'SHOPPY150' || code === 'WELCOME10' || code === 'FLAT200' || code === 'FESTIVE25') {
      const discountVal = code === 'SHOPPY150' ? 150 : (code === 'FLAT200' ? 200 : 10);
      const isPct = (code === 'WELCOME10' || code === 'FESTIVE25');
      setAppliedCoupon({
        code,
        discountType: isPct ? 'percentage' : 'fixed',
        discountValue: discountVal,
      });
      setCouponCodeInput(code);
      setCouponSuccess(`🎉 Coupon "${code}" successfully applied! You saved ₹${isPct ? discountVal + '%' : discountVal}.`);
      return;
    }

    setCouponError(`Invalid promo code "${code}". Try: SHOPPY150, WELCOME10, or FLAT200`);
  };

  const handlePlaceOrder = async () => {
    if (!customerForm.name?.trim() || !customerForm.phone?.trim() || !customerForm.address?.trim()) {
      alert('Please fill in your Full Name, Mobile Phone, and Delivery Address to place your order.');
      return;
    }

    try {
      localStorage.setItem('shoppy_customer_checkout_info', JSON.stringify(customerForm));
    } catch (e) {}

    const orderNumber = `SHP-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceNumber = `INV-GST-${Math.floor(10000 + Math.random() * 90000)}`;
    const isCod = selectedPayment === 'cod';

    try {
      const params = shopCode ? { code: shopCode } : {};
      await axios.post('/api/storefront/order', {
        customer_name: customerForm.name,
        customer_phone: customerForm.phone,
        customer_email: customerForm.email,
        address_line_1: customerForm.address,
        city: customerForm.city,
        state: customerForm.state,
        pincode: customerForm.pincode,
        payment_method: selectedPayment,
        coupon_code: appliedCoupon?.code,
        coupon_discount: couponDiscount,
        shipping_fee: shippingFee,
        items: cart.map((i) => ({ product_id: i.productId || 101, quantity: i.quantity, variant_sku: i.variantSku })),
      }, { params });
    } catch (err) {}

    setOrderSuccess({
      order_number: orderNumber,
      invoice_number: invoiceNumber,
      grand_total: grandTotal.toFixed(2),
      couponCode: appliedCoupon?.code,
      couponDiscount,
      savings: totalSavings.toFixed(0),
      payment_method: isCod ? 'Cash on Delivery (Pay ₹' + grandTotal.toFixed(2) + ' at Doorstep)' : selectedPayment.toUpperCase() + ' (Prepaid Verified)',
    });
    setCart([]);
    setAppliedCoupon(null);
    setCheckoutOpen(false);
    setCartOpen(false);
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (activeCategory !== 'ALL' && p.topCategoryId !== activeCategory) return false;
      if (searchCategoryFilter !== 'ALL' && p.topCategoryId !== searchCategoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = (p.brand || '').toLowerCase().includes(q);
        const matchesCat = (p.category || '').toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCat) return false;
      }
      return true;
    });

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.selling_price - b.selling_price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.selling_price - a.selling_price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => ((b.mrp - b.selling_price) / b.mrp) - ((a.mrp - a.selling_price) / a.mrp));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [products, activeCategory, searchCategoryFilter, searchQuery, sortBy]);

  const dealProducts = useMemo(() => {
    return products.filter((p) => p.is_deal_of_day);
  }, [products]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col antialiased selection:bg-[#e11d48] selection:text-white pb-20 md:pb-8">
      
      {/* =========================================================================
          1. TOP SNAPDEAL-STYLE UTILITY STRIP (Dark Luxury Navy #0f172a)
      ========================================================================== */}
      <div className="bg-[#0f172a] text-slate-300 text-[11px] py-1.5 px-4 font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>India&apos;s Smart Retail Hub • Brand Waali Quality, Wholesale Rates</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Free Delivery Above ₹499 • 100% Cash on Delivery</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="font-mono text-amber-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
              Store ID: {shopCode || 'SP-LIVE'}
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <a href="tel:+919546042639" className="hidden sm:flex items-center gap-1 hover:text-white transition">
              <Headphones className="w-3 h-3 text-emerald-400" />
              <span>Help: +91 95460 42639</span>
            </a>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN UNIQUE BRAND HEADER (Snapdeal Crimson + Royal Navy Fusion)
      ========================================================================== */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
            className="flex items-center gap-2.5 cursor-pointer flex-shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#e11d48] to-[#f43f5e] text-white flex items-center justify-center font-black text-xl shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              {storeInfo?.name ? storeInfo.name[0] : 'S'}
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-xl md:text-2xl font-black font-heading text-slate-900 tracking-tight">
                  {storeInfo?.name ? storeInfo.name : 'Shoppy'}
                </span>
                <span className="text-xl md:text-2xl font-black text-[#e11d48]">
                  Store
                </span>
              </div>
              <div className="flex items-center gap-1 pt-0.5">
                <BadgeCheck className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-slate-500">Official Merchant Portal</span>
              </div>
            </div>
          </div>

          {/* Snapdeal-Style Search Bar with Left Category Dropdown + Search Button */}
          <div className="flex-1 max-w-2xl relative">
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg overflow-hidden focus-within:border-[#e11d48] focus-within:ring-2 focus-within:ring-rose-500/10 transition">
              
              {/* Category Dropdown */}
              <div className="hidden sm:flex items-center gap-1 pl-3 pr-2 py-2 text-xs font-bold text-slate-700 border-r border-slate-200 bg-slate-100 flex-shrink-0">
                <select
                  value={searchCategoryFilter}
                  onChange={(e) => setSearchCategoryFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="CAT-MOBILES">Mobiles</option>
                  <option value="CAT-FASHION">Fashion</option>
                  <option value="CAT-ELECTRONICS">Electronics</option>
                  <option value="CAT-GROCERY">Grocery</option>
                  <option value="CAT-HOME">Home &amp; Kitchen</option>
                </select>
              </div>

              {/* Input */}
              <input
                type="text"
                placeholder="Search products, brands, or daily essentials (e.g. Denim, iPhone, Saree, Oil)..."
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

              {/* Snapdeal Search CTA Button */}
              <button 
                onClick={() => {}}
                className="px-4 md:px-5 py-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white flex items-center gap-1.5 text-xs font-black transition flex-shrink-0"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Search</span>
              </button>
            </div>
          </div>

          {/* Delivery Pincode */}
          <button 
            onClick={() => setPincodeModalOpen(true)}
            className="hidden lg:flex items-center gap-2 text-xs text-slate-700 hover:text-[#e11d48] px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 transition"
          >
            <MapPin className="w-4 h-4 text-[#e11d48]" />
            <div className="text-left leading-tight">
              <span className="text-[10px] text-slate-400 block font-semibold">Deliver to</span>
              <span className="font-extrabold text-slate-800">{deliveryPincode} • Change</span>
            </div>
          </button>

          {/* Actions: Merchant Terminal & Cart */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <a
              href="/store"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#e11d48] px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Merchant Terminal</span>
            </a>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 md:px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs md:text-sm font-extrabold rounded-lg shadow-sm transition active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-rose-400" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#e11d48] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
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
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 md:px-4 space-y-4 w-full mt-3">

        {/* =========================================================================
            3. SNAPDEAL SIGNATURE 3-COLUMN HERO SECTION
            (Left Categories Sidebar + Center Dynamic Banner + Right Spotlight Perks)
        ========================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          
          {/* 3A. Left Categories Sidebar (Snapdeal Signature Feature) */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-3 overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#e11d48]" />
                <span>TOP CATEGORIES</span>
              </h3>
              <span className="text-[10px] bg-rose-50 text-[#e11d48] font-bold px-1.5 py-0.5 rounded">Live</span>
            </div>

            <ul className="space-y-1">
              {SIDEBAR_CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition group ${
                        isSelected 
                          ? 'bg-rose-50 text-[#e11d48] font-black shadow-sm' 
                          : 'text-slate-700 hover:bg-slate-50 hover:text-[#e11d48]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <span className="line-clamp-1">{cat.name}</span>
                      </span>
                      <span className={`text-[10px] font-semibold transition ${isSelected ? 'text-[#e11d48]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                        {cat.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 p-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-center space-y-1">
              <span className="text-[10px] uppercase font-black text-amber-800 tracking-wider block">Special Coupon</span>
              <p className="text-xs font-black text-slate-900">Use Code: <span className="font-mono text-[#e11d48]">SHOPPY150</span></p>
              <button
                onClick={() => handleApplyCoupon('SHOPPY150')}
                className="text-[10px] font-black text-[#e11d48] hover:underline"
              >
                Click to Apply ₹150 Off
              </button>
            </div>
          </aside>

          {/* 3B. Center Dynamic Hero Carousel */}
          <div className="lg:col-span-6 relative rounded-xl overflow-hidden shadow-sm flex flex-col justify-between min-h-[280px] md:min-h-[340px]">
            <div className={`w-full h-full p-6 md:p-8 bg-gradient-to-br ${HERO_BANNERS[activeBanner].bgGradient} text-white flex flex-col justify-between transition-all duration-700 relative`}>
              
              <div className="space-y-2 max-w-lg z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-[10px] font-black tracking-wider uppercase text-amber-300">
                  <Flame className="w-3 h-3 fill-current" />
                  {HERO_BANNERS[activeBanner].tag}
                </span>

                <h2 className="text-2xl md:text-3xl font-black font-heading leading-tight tracking-tight text-white drop-shadow">
                  {HERO_BANNERS[activeBanner].title}
                </h2>

                <p className="text-xs md:text-sm text-slate-200 line-clamp-2 font-medium">
                  {HERO_BANNERS[activeBanner].subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 z-10">
                <div className="bg-black/30 backdrop-blur px-3 py-1.5 rounded-md text-[11px] font-bold text-amber-300 border border-white/10 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>{HERO_BANNERS[activeBanner].badgeText}</span>
                </div>

                <button
                  onClick={() => {
                    if (HERO_BANNERS[activeBanner].categoryTarget !== 'ALL') {
                      setActiveCategory(HERO_BANNERS[activeBanner].categoryTarget);
                    }
                    window.scrollTo({ top: 480, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-black shadow-lg shadow-black/20 transition active:scale-95 flex items-center gap-1.5"
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
                    className={`h-2 rounded-full transition-all ${activeBanner === idx ? 'w-6 bg-[#e11d48]' : 'w-2 bg-white/50'}`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next controls */}
              <button
                onClick={() => setActiveBanner((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur transition z-20"
                aria-label="Previous Banner"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveBanner((prev) => (prev + 1) % HERO_BANNERS.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur transition z-20"
                aria-label="Next Banner"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          </div>

          {/* 3C. Right Column (Snapdeal Quick Perks & Trust Widget) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">Trust Pay Guarantee</h4>
                  <p className="text-[10px] text-slate-500">100% Payment &amp; Item Protection</p>
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-rose-50 text-[#e11d48] flex items-center justify-center flex-shrink-0">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">Free Doorstep Shipping</p>
                    <p className="text-[10px] text-slate-500">On all prepaid &amp; COD orders above ₹499</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">7-Day Easy Replacement</p>
                    <p className="text-[10px] text-slate-500">No questions asked doorstep return</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">Instant UPI &amp; COD</p>
                    <p className="text-[10px] text-slate-500">Zero surcharge on all payment modes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Spotlight Deal Preview */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
              <img
                src={dealProducts[0]?.image}
                alt="Spotlight"
                className="w-14 h-14 object-cover rounded-md bg-white border border-slate-200"
              />
              <div className="flex-1 space-y-0.5">
                <span className="text-[9px] font-black uppercase text-[#e11d48] bg-rose-50 px-1.5 py-0.5 rounded">Hot Spotlight</span>
                <p className="text-[11px] font-bold text-slate-800 line-clamp-1">{dealProducts[0]?.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-900">₹{dealProducts[0]?.selling_price}</span>
                  <span className="text-[10px] text-slate-400 line-through">₹{dealProducts[0]?.mrp}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* =========================================================================
            4. SNAPDEAL VALUE STRIP (Bank Cards & UPI Offers)
        ========================================================================== */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 text-[#e11d48] flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">10% Bank Discount</p>
              <p className="text-[10px] text-slate-500">HDFC, SBI &amp; ICICI Cards</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Instant UPI Cashback</p>
              <p className="text-[10px] text-slate-500">PhonePe, Paytm &amp; Google Pay</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Free Express Delivery</p>
              <p className="text-[10px] text-slate-500">On all orders above ₹499</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Voucher: SHOPPY150</p>
              <p className="text-[10px] text-slate-500">Flat ₹150 OFF on first order</p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. LIGHTNING FLASH DEALS WITH LIVE COUNTDOWN TIMER
        ========================================================================== */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#e11d48] text-white">
                  <Flame className="w-4 h-4 fill-current" />
                </span>
                <span className="text-base md:text-lg font-black font-heading text-slate-900">
                  Lightning Deals of the Day
                </span>
              </div>

              {/* Live Ticking Countdown */}
              <div className="flex items-center gap-1.5 bg-rose-50 text-[#e11d48] px-2.5 py-1 rounded-md text-xs font-bold border border-rose-200">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s Left
                </span>
              </div>
            </div>

            <button 
              onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
              className="text-xs font-black text-white bg-[#e11d48] hover:bg-[#be123c] px-4 py-2 rounded-lg shadow-sm transition"
            >
              VIEW ALL DEALS
            </button>
          </div>

          {/* Horizontal Deal Cards Slider */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4">
            {dealProducts.slice(0, 6).map((deal) => {
              const discount = Math.round(((deal.mrp - deal.selling_price) / deal.mrp) * 100);
              return (
                <div
                  key={deal.id}
                  onClick={() => setQuickViewProduct(deal)}
                  className="group flex flex-col justify-between p-2.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:shadow-md transition cursor-pointer bg-white"
                >
                  <div className="relative aspect-square overflow-hidden rounded-md bg-slate-50 flex items-center justify-center mb-2">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-1 left-1 bg-[#e11d48] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                      {discount}% OFF
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#e11d48]">
                      {deal.name}
                    </h3>
                    <p className="text-[11px] font-black text-[#e11d48]">
                      Min {discount}% Off
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-900">₹{deal.selling_price.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 line-through">₹{deal.mrp.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            6. MAIN CURATED CATALOG WITH MODERN SNAPDEAL-STYLE CARDS
        ========================================================================== */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          
          {/* Header & Sort Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg md:text-xl font-black font-heading text-slate-900 flex items-center gap-2">
                <span>{activeCategory === 'ALL' ? 'All Handpicked Products' : SIDEBAR_CATEGORIES.find(c => c.id === activeCategory)?.name || 'Products'}</span>
                <span className="text-xs font-medium text-slate-500">
                  ({filteredProducts.length} items available)
                </span>
              </h2>
              {searchQuery && (
                <p className="text-xs text-[#e11d48] font-medium">
                  Showing search matches for &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>

            {/* Sorting Tabs */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-500 hidden sm:inline">Sort:</span>
              <button 
                onClick={() => setSortBy('relevance')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${sortBy === 'relevance' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Popular
              </button>
              <button 
                onClick={() => setSortBy('price_asc')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${sortBy === 'price_asc' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Price: Low to High
              </button>
              <button 
                onClick={() => setSortBy('price_desc')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${sortBy === 'price_desc' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Price: High to Low
              </button>
              <button 
                onClick={() => setSortBy('discount')}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${sortBy === 'discount' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Discount
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No products found matching your filter.</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Try resetting your search query or department filter.</p>
              <button
                onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); setSearchCategoryFilter('ALL'); }}
                className="px-4 py-2 bg-[#e11d48] text-white text-xs font-bold rounded-lg shadow transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
              {filteredProducts.map((product) => {
                const currentVar = selectedVariants[product.id] || (product.variants && product.variants[0]) || {
                  size: 'Standard',
                  color: 'Default',
                  sellingPrice: product.selling_price,
                  mrp: product.mrp
                };

                const sellingPrice = parseFloat(currentVar.sellingPrice || product.selling_price);
                const mrp = parseFloat(currentVar.mrp || product.mrp);
                const discount = Math.round(((mrp - sellingPrice) / mrp) * 100);
                const isWished = !!wishlist[product.id];

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-xl border border-slate-200 hover:border-rose-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                  >
                    {/* Top Action Icons: Wishlist & Quick View */}
                    <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                        className="p-2 rounded-full bg-white/95 shadow-md hover:bg-white text-slate-400 hover:text-rose-500 transition"
                        title="Add to Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isWished ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                        className="p-2 rounded-full bg-white/95 shadow-md hover:bg-white text-slate-600 hover:text-[#e11d48] transition"
                        title="Quick View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Area with Zoom */}
                    <div 
                      onClick={() => setQuickViewProduct(product)}
                      className="relative aspect-[4/3] bg-slate-50 flex items-center justify-center p-3 cursor-pointer overflow-hidden"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {discount > 0 && (
                        <span className="absolute bottom-2 left-2 bg-[#e11d48] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            {product.brand || product.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <BadgeCheck className="w-3 h-3 text-emerald-600" />
                            <span>Shoppy Verified</span>
                          </span>
                        </div>

                        <h3 
                          onClick={() => setQuickViewProduct(product)}
                          className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2 hover:text-[#e11d48] cursor-pointer transition leading-snug"
                        >
                          {product.name}
                        </h3>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-[11px] font-black px-1.5 py-0.5 rounded">
                            <span>{product.rating}</span>
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            ({product.rating_count.toLocaleString('en-IN')})
                          </span>
                        </div>
                      </div>

                      {/* Variant Selector Pills (Size & Color) */}
                      {product.variants && product.variants.length > 1 && (
                        <div className="pt-2 space-y-1.5 border-t border-slate-100">
                          {/* Color dots */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-500">Color:</span>
                            <div className="flex items-center gap-1">
                              {[...new Set(product.variants.map((v) => v.color))].map((col) => {
                                const vObj = product.variants.find((v) => v.color === col);
                                const isSelected = currentVar.color === col;
                                return (
                                  <button
                                    key={col}
                                    onClick={() => handleSelectColor(product.id, col)}
                                    className={`w-3.5 h-3.5 rounded-full border transition ${isSelected ? 'ring-2 ring-[#e11d48] ring-offset-1 scale-110' : 'border-slate-300'}`}
                                    style={{ backgroundColor: vObj?.colorHex || '#2563eb' }}
                                    title={col}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          {/* Size Pills */}
                          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                            <span className="text-[10px] font-bold text-slate-500">Size:</span>
                            {[...new Set(product.variants.map((v) => v.size))].map((sz) => {
                              const isSelected = currentVar.size === sz;
                              return (
                                <button
                                  key={sz}
                                  onClick={() => handleSelectSize(product.id, sz)}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded border transition ${
                                    isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                                  }`}
                                >
                                  {sz}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Price & Delivery Row */}
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base md:text-lg font-black text-slate-900">
                            ₹{sellingPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{mrp.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-black text-[#e11d48]">
                            {discount}% OFF
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                          <Truck className="w-3 h-3 text-emerald-600" />
                          <span>{product.delivery_text || 'Free Delivery by Tomorrow'}</span>
                        </p>
                      </div>

                      {/* Action Buttons: Add to Bag & Buy Now */}
                      <div className="pt-2 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => addToCart(product)}
                          className="py-2.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-extrabold shadow-sm transition active:scale-95 flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </button>
                        <button
                          onClick={() => buyNow(product)}
                          className="py-2.5 px-2.5 rounded-lg bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-black shadow-md shadow-rose-500/20 transition active:scale-95 flex items-center justify-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>Buy Now</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* =========================================================================
          7. SHOPPY + SNAPDEAL FOOTER
      ========================================================================== */}
      <footer className="bg-[#0f172a] text-white mt-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <h4 className="text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">ABOUT SHOPPY STORE</h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {storeInfo?.name || 'Shoppy ERP Store'} is India&apos;s leading verified omnichannel retail marketplace powered by Enexa IT Solutions Private Limited.
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Payment &amp; Authentic Seller Guarantee</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">HELP &amp; CUSTOMER CARE</h4>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li><a href="#" className="hover:text-white transition">Payments &amp; UPI Assistance</a></li>
              <li><a href="#" className="hover:text-white transition">Shipping &amp; Delivery Tracking</a></li>
              <li><a href="#" className="hover:text-white transition">7-Day Cancellation &amp; Returns</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ &amp; Report Issue</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">CONSUMER POLICY</h4>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li><a href="#" className="hover:text-white transition">Terms Of Use &amp; Service</a></li>
              <li><a href="#" className="hover:text-white transition">Security &amp; 128-bit Encryption</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">GST Tax Invoice Policy</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-slate-400 font-extrabold uppercase tracking-wider text-[11px]">REGISTERED OFFICE</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Enexa IT Solutions Private Limited<br />
              Patna, Bihar, India<br />
              Helpline: +91 95460 42639<br />
              Email: contact@enexa.in
            </p>
            <div className="pt-2 text-amber-300 font-bold text-[10px]">
              Store Identifier: {shopCode}
            </div>
          </div>

        </div>

        {/* Bottom Rights & Payment Icons */}
        <div className="border-t border-slate-800 py-4 px-4 bg-[#0a0f1d]">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} {storeInfo?.name || 'Shoppy ERP'} • Enexa IT Solutions Private Limited. All Rights Reserved.
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">100% Payment Protection:</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold text-[10px]">UPI</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold text-[10px]">RuPay</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold text-[10px]">VISA</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold text-[10px]">MasterCard</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold text-[10px]">COD</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          8. MOBILE BOTTOM NAVIGATION BAR
      ========================================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 py-2 px-4 flex items-center justify-around shadow-lg">
        <button 
          onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
          className="flex flex-col items-center gap-1 text-[#e11d48]"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button 
          onClick={() => {
            const nextCat = activeCategory === 'CAT-MOBILES' ? 'CAT-FASHION' : 'CAT-MOBILES';
            setActiveCategory(nextCat);
          }}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-[#e11d48]"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold">Departments</span>
        </button>
        <button 
          onClick={() => {
            const dealSec = document.querySelector('section');
            if (dealSec) dealSec.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-[#e11d48]"
        >
          <Flame className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] font-bold">Deals</span>
        </button>
        <button 
          onClick={() => setCartOpen(true)}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-[#e11d48] relative"
        >
          <ShoppingBag className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-[#e11d48] text-white text-[9px] font-bold flex items-center justify-center">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          )}
          <span className="text-[10px] font-bold">Bag</span>
        </button>
      </div>

      {/* =========================================================================
          9. SLIDE-OVER CART DRAWER
      ========================================================================== */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-black font-heading">
                  My Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
                </h3>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 transition"
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
                    className="px-5 py-2.5 bg-[#e11d48] text-white text-xs font-bold rounded-lg shadow"
                  >
                    START SHOPPING
                  </button>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="p-3 rounded-xl border border-slate-200 bg-white shadow-sm flex gap-3">
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
                          <span className="text-[10px] text-slate-400 line-through">₹{item.mrp.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex flex-col items-end justify-between">
                        <button 
                          onClick={() => updateCartQty(item.cartItemId, -item.quantity)}
                          className="text-[11px] text-rose-500 font-bold hover:underline"
                        >
                          Remove
                        </button>
                        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => updateCartQty(item.cartItemId, -1)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-black">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQty(item.cartItemId, 1)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Promo Coupon Box */}
                  <div className="p-3.5 rounded-xl border border-dashed border-[#e11d48] bg-rose-50/50 space-y-2">
                    <span className="text-xs font-black text-[#e11d48] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Apply Voucher Coupon</span>
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter SHOPPY150 or WELCOME10"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-rose-200 uppercase font-mono font-bold focus:outline-none"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        className="px-4 py-2 bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-black rounded-lg shadow-sm transition"
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && <p className="text-[11px] text-rose-600 font-bold">{couponError}</p>}
                    {couponSuccess && <p className="text-[11px] text-emerald-600 font-bold">{couponSuccess}</p>}

                    {/* Quick Coupon Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button 
                        onClick={() => handleApplyCoupon('SHOPPY150')}
                        className="text-[10px] px-2 py-1 rounded-md bg-white border border-rose-300 font-bold text-[#e11d48] hover:bg-rose-100"
                      >
                        SHOPPY150 (Flat ₹150 Off)
                      </button>
                      <button 
                        onClick={() => handleApplyCoupon('WELCOME10')}
                        className="text-[10px] px-2 py-1 rounded-md bg-white border border-rose-300 font-bold text-[#e11d48] hover:bg-rose-100"
                      >
                        WELCOME10 (10% Off)
                      </button>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                    <h5 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5">
                      PRICE DETAILS
                    </h5>
                    <div className="flex justify-between text-slate-600">
                      <span>Total MRP ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                      <span>₹{totalMrp.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Product Discount</span>
                      <span>- ₹{totalProductDiscount.toLocaleString('en-IN')}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Voucher Discount ({appliedCoupon?.code})</span>
                        <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Charges</span>
                      <span className={isFreeDelivery ? 'text-emerald-600 font-bold' : ''}>
                        {isFreeDelivery ? 'FREE' : `₹${shippingFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 border-t border-dashed border-slate-300 pt-2">
                      <span>Total Payable</span>
                      <span>₹{grandTotal.toFixed(0)}</span>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-600 pt-1">
                      🎉 You will save ₹{totalSavings.toFixed(0)} on this order!
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Checkout Button */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-4 shadow-lg">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Grand Total</span>
                  <span className="text-lg font-black text-slate-900">₹{grandTotal.toFixed(0)}</span>
                </div>
                <button
                  onClick={() => {
                    fetchPaymentMethods();
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  className="flex-1 py-3 px-6 bg-[#e11d48] hover:bg-[#be123c] text-white text-sm font-black rounded-xl shadow-lg shadow-rose-500/20 transition active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* =========================================================================
          10. ONE-PAGE CHECKOUT MODAL
      ========================================================================== */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black font-heading">
                  100% Secure Checkout • {storeInfo?.name || 'Shoppy Store'}
                </h3>
              </div>
              <button 
                onClick={() => setCheckoutOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* Step 1: Delivery Address */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                  <MapPin className="w-4 h-4 text-[#e11d48]" />
                  <span>1. Delivery Address</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#e11d48]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Phone (10 Digits) *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#e11d48]"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Street Address / House No. *</label>
                    <input
                      type="text"
                      placeholder="Flat/House No., Building, Street Name, Landmark"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#e11d48]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">City / Town</label>
                    <input
                      type="text"
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#e11d48]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Pincode *</label>
                    <input
                      type="text"
                      value={customerForm.pincode}
                      onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#e11d48]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
                  <CreditCard className="w-4 h-4 text-[#e11d48]" />
                  <span>2. Select Payment Option</span>
                </h4>

                <div className="space-y-2">
                  {paymentMethods.map((pm) => {
                    const isSelected = selectedPayment === pm.code;
                    return (
                      <label
                        key={pm.code}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                          isSelected ? 'bg-rose-50/70 border-[#e11d48] ring-1 ring-[#e11d48]' : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_opt"
                          checked={isSelected}
                          onChange={() => setSelectedPayment(pm.code)}
                          className="mt-1 text-[#e11d48]"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-black text-slate-900">{pm.name}</p>
                          <p className="text-[11px] text-slate-500">{pm.description}</p>
                        </div>
                        {pm.code === 'cod' && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Zero Advance Required
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Order Summary Review */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Total Amount Payable:</span>
                  <span className="text-base font-black text-slate-900">₹{grandTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-600 font-bold">
                  <span>Total Savings on this Order:</span>
                  <span>₹{totalSavings.toFixed(0)}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={handlePlaceOrder}
                className="w-full py-3.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-sm font-black rounded-xl shadow-lg shadow-rose-500/20 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CONFIRM ORDER (₹{grandTotal.toFixed(0)})</span>
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          11. EXCLUSIVE WELCOME OFFER MODAL (POPUP)
      ========================================================================== */}
      {welcomePopupOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 border-2 border-rose-300">
            <button
              onClick={() => setWelcomePopupOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Banner Header */}
            <div className="bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#e11d48] p-6 text-white text-center space-y-2 relative">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider">
                🎉 EXCLUSIVE STORE GIFT
              </span>
              <h3 className="text-2xl font-black font-heading">
                Flat ₹150 OFF On Your 1st Order!
              </h3>
              <p className="text-xs text-slate-200">
                Welcome to {storeInfo?.name || 'Shoppy Store'}! Valid on all Mobiles, Fashion, Audio &amp; Groceries.
              </p>
            </div>

            {/* Voucher Body */}
            <div className="p-6 text-center space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border-2 border-dashed border-[#e11d48] space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">Use Promo Code</span>
                <span className="font-mono text-2xl font-black text-slate-900 tracking-widest block">
                  SHOPPY150
                </span>
                <span className="text-[11px] text-rose-800 font-semibold block">
                  ⏳ Limited Time First-Visit Voucher
                </span>
              </div>

              <button
                onClick={() => {
                  handleApplyCoupon('SHOPPY150');
                  setWelcomePopupOpen(false);
                }}
                className="w-full py-3 bg-[#e11d48] hover:bg-[#be123c] text-white text-sm font-black rounded-xl shadow-md shadow-rose-500/20 transition active:scale-95"
              >
                APPLY VOUCHER &amp; SHOP NOW
              </button>

              <button
                onClick={() => setWelcomePopupOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Continue browsing store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          12. QUICK VIEW PRODUCT MODAL
      ========================================================================== */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image */}
              <div className="p-6 bg-slate-50 flex items-center justify-center">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="max-h-72 object-contain rounded-xl"
                />
              </div>

              {/* Product Details */}
              <div className="p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">{quickViewProduct.brand}</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-full border border-emerald-200">
                      Shoppy Certified
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {quickViewProduct.name}
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-900 text-xs font-black px-1.5 py-0.5 rounded">
                      <span>{quickViewProduct.rating}</span>
                      <Star className="w-3 h-3 fill-current" />
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {quickViewProduct.rating_count.toLocaleString('en-IN')} Verified Reviews
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{quickViewProduct.selling_price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      ₹{quickViewProduct.mrp.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm font-black text-[#e11d48]">
                      {Math.round(((quickViewProduct.mrp - quickViewProduct.selling_price) / quickViewProduct.mrp) * 100)}% OFF
                    </span>
                  </div>

                  {/* Highlights/Specs */}
                  {quickViewProduct.specs && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-700 mb-1">Key Specifications:</p>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                        {quickViewProduct.specs.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 grid grid-cols-2 gap-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black transition"
                  >
                    Add to Bag
                  </button>
                  <button
                    onClick={() => {
                      buyNow(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-black shadow-md shadow-rose-500/20 transition"
                  >
                    Buy Now
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          13. PINCODE DELIVERY SELECTOR MODAL
      ========================================================================== */}
      {pincodeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#e11d48]" />
                <span>Check Delivery Pincode</span>
              </h4>
              <button onClick={() => setPincodeModalOpen(false)}>
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter your 6-digit postal pincode to check instant doorstep delivery timelines and express courier availability.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono font-bold focus:outline-none focus:border-[#e11d48]"
                placeholder="e.g. 800001"
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
                className="px-4 py-2 bg-[#e11d48] text-white text-xs font-bold rounded-lg shadow"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          14. LIVE SOCIAL PROOF TOAST (Bottom-Left)
      ========================================================================== */}
      {socialProof && (
        <div className="fixed bottom-16 md:bottom-6 left-4 z-40 bg-white/95 backdrop-blur rounded-xl shadow-xl border border-slate-200 p-3 max-w-xs animate-in slide-in-from-bottom duration-300 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-50 text-[#e11d48] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-[11px] leading-snug">
            <p className="text-slate-800 font-bold">
              <span className="text-[#e11d48]">{socialProof.name}</span> from {socialProof.city}
            </p>
            <p className="text-slate-500 line-clamp-1">Ordered {socialProof.item}</p>
            <span className="text-[10px] text-emerald-600 font-medium">{socialProof.time}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          15. ORDER CONFIRMED MODAL
      ========================================================================== */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black font-heading text-slate-900">
                🎉 Order Placed Successfully!
              </h3>
              <p className="text-xs text-slate-500">
                Thank you for shopping at {storeInfo?.name || 'Shoppy Store'}. Your order is confirmed and scheduled for dispatch.
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

    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Storefront />);
}
