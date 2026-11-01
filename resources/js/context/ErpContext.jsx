import React, { createContext, useContext, useState, useEffect } from 'react';

const ErpContext = createContext();

export const INITIAL_TOP_CATEGORIES = [
  { id: 'TOP-1', name: "Men's Fashion", slug: 'mens-fashion', icon: '👔', description: 'Men apparel, footwear, innerwear and accessories', isActive: true },
  { id: 'TOP-2', name: "Women's Ethnic & Western", slug: 'womens-fashion', icon: '👗', description: 'Kurtis, sarees, lehengas, dresses and fusion wear', isActive: true },
  { id: 'TOP-3', name: "Electronics & Gadgets", slug: 'electronics-gadgets', icon: '⚡', description: 'Audio devices, smart chargers, cables & accessories', isActive: true },
  { id: 'TOP-4', name: "Grocery & Gourmet Foods", slug: 'grocery-gourmet', icon: '🌾', description: 'Daily food grains, oils, ghee, dry fruits and spices', isActive: true },
  { id: 'TOP-5', name: "Footwear & Accessories", slug: 'footwear-accessories', icon: '👟', description: 'Casual shoes, formal footwear, belts and wallets', isActive: true }
];

export const INITIAL_MID_CATEGORIES = [
  { id: 'MID-101', topCategoryId: 'TOP-1', name: "Men's Topwear", slug: 'mens-topwear', isActive: true },
  { id: 'MID-102', topCategoryId: 'TOP-1', name: "Men's Bottomwear", slug: 'mens-bottomwear', isActive: true },
  { id: 'MID-201', topCategoryId: 'TOP-2', name: "Ethnic Wear & Kurtas", slug: 'ethnic-wear', isActive: true },
  { id: 'MID-202', topCategoryId: 'TOP-2', name: "Western Tops & Dresses", slug: 'western-wear', isActive: true },
  { id: 'MID-301', topCategoryId: 'TOP-3', name: "Audio & Headphones", slug: 'audio-headphones', isActive: true },
  { id: 'MID-302', topCategoryId: 'TOP-3', name: "Mobile Charging & Adapters", slug: 'chargers-adapters', isActive: true },
  { id: 'MID-401', topCategoryId: 'TOP-4', name: "Staples & Grains", slug: 'staples-grains', isActive: true },
  { id: 'MID-402', topCategoryId: 'TOP-4', name: "Organic & Dairy", slug: 'organic-dairy', isActive: true }
];

export const INITIAL_END_CATEGORIES = [
  { id: 'END-1001', midCategoryId: 'MID-101', name: "Casual Shirts", slug: 'casual-shirts', isActive: true },
  { id: 'END-1002', midCategoryId: 'MID-101', name: "Formal Shirts", slug: 'formal-shirts', isActive: true },
  { id: 'END-1003', midCategoryId: 'MID-101', name: "Polo T-Shirts", slug: 'polo-tshirts', isActive: true },
  { id: 'END-1004', midCategoryId: 'MID-102', name: "Stretch Denim Jeans", slug: 'stretch-denim-jeans', isActive: true },
  { id: 'END-1005', midCategoryId: 'MID-102', name: "Chinos & Trousers", slug: 'chinos-trousers', isActive: true },
  { id: 'END-2001', midCategoryId: 'MID-201', name: "Handcrafted Kurtas", slug: 'handcrafted-kurtas', isActive: true },
  { id: 'END-2002', midCategoryId: 'MID-201', name: "Anarkali Suits", slug: 'anarkali-suits', isActive: true },
  { id: 'END-3001', midCategoryId: 'MID-301', name: "TWS Wireless Earbuds", slug: 'tws-earbuds', isActive: true },
  { id: 'END-3002', midCategoryId: 'MID-302', name: "GaN Fast Chargers", slug: 'gan-chargers', isActive: true },
  { id: 'END-4001', midCategoryId: 'MID-401', name: "Basmati Rice & Grains", slug: 'basmati-rice', isActive: true },
  { id: 'END-4002', midCategoryId: 'MID-402', name: "Pure Cow Ghee & Oils", slug: 'cow-ghee', isActive: true }
];

export const INITIAL_SIZES = [
  { id: 'sz-1', group: 'Apparel Standard', code: 'XS', label: 'Extra Small (XS)' },
  { id: 'sz-2', group: 'Apparel Standard', code: 'S', label: 'Small (S)' },
  { id: 'sz-3', group: 'Apparel Standard', code: 'M', label: 'Medium (M)' },
  { id: 'sz-4', group: 'Apparel Standard', code: 'L', label: 'Large (L)' },
  { id: 'sz-5', group: 'Apparel Standard', code: 'XL', label: 'Extra Large (XL)' },
  { id: 'sz-6', group: 'Apparel Standard', code: 'XXL', label: 'Double XL (XXL)' },
  { id: 'sz-7', group: 'Apparel Standard', code: '3XL', label: 'Triple XL (3XL)' },
  { id: 'sz-8', group: 'Waist / Bottoms', code: '28', label: 'Waist 28"' },
  { id: 'sz-9', group: 'Waist / Bottoms', code: '30', label: 'Waist 30"' },
  { id: 'sz-10', group: 'Waist / Bottoms', code: '32', label: 'Waist 32"' },
  { id: 'sz-11', group: 'Waist / Bottoms', code: '34', label: 'Waist 34"' },
  { id: 'sz-12', group: 'Waist / Bottoms', code: '36', label: 'Waist 36"' },
  { id: 'sz-13', group: 'Waist / Bottoms', code: '38', label: 'Waist 38"' },
  { id: 'sz-14', group: 'Packaging / Weights', code: '250g', label: '250 Grams' },
  { id: 'sz-15', group: 'Packaging / Weights', code: '500g', label: '500 Grams' },
  { id: 'sz-16', group: 'Packaging / Weights', code: '1kg', label: '1 Kilogram' },
  { id: 'sz-17', group: 'Packaging / Weights', code: '5kg', label: '5 Kilograms' },
  { id: 'sz-18', group: 'Packaging / Weights', code: '1L', label: '1 Litre' }
];

export const INITIAL_COLORS = [
  { id: 'clr-1', name: 'Navy Blue', hex: '#1e3a8a', code: 'NAVY' },
  { id: 'clr-2', name: 'Sky Blue', hex: '#38bdf8', code: 'SKY' },
  { id: 'clr-3', name: 'Pure White', hex: '#ffffff', code: 'WHT' },
  { id: 'clr-4', name: 'Charcoal Black', hex: '#0f172a', code: 'BLK' },
  { id: 'clr-5', name: 'Crimson Red', hex: '#dc2626', code: 'RED' },
  { id: 'clr-6', name: 'Emerald Green', hex: '#059669', code: 'GRN' },
  { id: 'clr-7', name: 'Mustard Yellow', hex: '#eab308', code: 'YEL' },
  { id: 'clr-8', name: 'Wine Maroon', hex: '#881337', code: 'WNE' },
  { id: 'clr-9', name: 'Slate Grey', hex: '#64748b', code: 'GRY' },
  { id: 'clr-10', name: 'Beige Cream', hex: '#f5f5dc', code: 'BGE' }
];

export const INITIAL_SHIPPING_RULES = {
  defaultShippingType: 'flat',
  flatRate: 50.0,
  freeShippingThreshold: 999.0,
  isFreeShippingEnabled: true,
  codFee: 40.0,
  isCodEnabled: true,
  estimatedDeliveryDays: '3 - 5 Business Days',
  expressShippingRate: 120.0,
  isExpressEnabled: true,
  weightSlabs: [
    { id: 'ws-1', minWeight: 0, maxWeight: 0.5, rate: 50, label: 'Up to 500g' },
    { id: 'ws-2', minWeight: 0.5, maxWeight: 1.0, rate: 80, label: '500g - 1kg' },
    { id: 'ws-3', minWeight: 1.0, maxWeight: 3.0, rate: 140, label: '1kg - 3kg' },
    { id: 'ws-4', minWeight: 3.0, maxWeight: 10.0, rate: 250, label: '3kg - 10kg (Bulk)' }
  ]
};

export const INITIAL_PRODUCTS = [
  {
    "id": "PRD-101",
    "name": "Premium Cotton Slim Fit Shirt",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-SHIRT-01",
    "barcode": "890123400101",
    "purchasePrice": 650,
    "sellingPrice": 1299,
    "mrp": 1999,
    "gstRate": 5,
    "hsnCode": "6205",
    "unit": "pcs",
    "stock": 52,
    "batchNo": "BAT-2026-01",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Premium Cotton Slim Fit Shirt",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-101-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-SHIRT-01-STD",
        "barcode": "890123400101",
        "purchasePrice": 650,
        "sellingPrice": 1299,
        "mrp": 1999,
        "stock": 52,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-102",
    "name": "Dark Indigo Stretch Denim Jeans",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-JEANS-01",
    "barcode": "890123400102",
    "purchasePrice": 950,
    "sellingPrice": 1899,
    "mrp": 2499,
    "gstRate": 12,
    "hsnCode": "6203",
    "unit": "pcs",
    "stock": 34,
    "batchNo": "BAT-2026-02",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Dark Indigo Stretch Denim Jeans",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-102-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-JEANS-01-STD",
        "barcode": "890123400102",
        "purchasePrice": 950,
        "sellingPrice": 1899,
        "mrp": 2499,
        "stock": 34,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-103",
    "name": "Royal Basmati Rice 5kg Aged Pack",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-RICE-05",
    "barcode": "890123400103",
    "purchasePrice": 380,
    "sellingPrice": 480,
    "mrp": 550,
    "gstRate": 0,
    "hsnCode": "1006",
    "unit": "pack",
    "stock": 120,
    "batchNo": "BAT-2026-R09",
    "expiryDate": "2028-07-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Royal Basmati Rice 5kg Aged Pack",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-103-1",
        "size": "pack",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-RICE-05-STD",
        "barcode": "890123400103",
        "purchasePrice": 380,
        "sellingPrice": 480,
        "mrp": 550,
        "stock": 120,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-104",
    "name": "Pure Desi Cow Ghee 1L Tin",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-GHEE-01",
    "barcode": "890123400104",
    "purchasePrice": 520,
    "sellingPrice": 650,
    "mrp": 720,
    "gstRate": 12,
    "hsnCode": "0405",
    "unit": "tin",
    "stock": 45,
    "batchNo": "BAT-2026-G42",
    "expiryDate": "2027-03-10",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Pure Desi Cow Ghee 1L Tin",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-104-1",
        "size": "tin",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-GHEE-01-STD",
        "barcode": "890123400104",
        "purchasePrice": 520,
        "sellingPrice": 650,
        "mrp": 720,
        "stock": 45,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-105",
    "name": "True Wireless Stereo Earbuds v5.3",
    "category": "Electronics & Gadgets",
    "businessCategory": "electronics",
    "sku": "ELEC-BUDS-01",
    "barcode": "890123400105",
    "purchasePrice": 850,
    "sellingPrice": 1499,
    "mrp": 2999,
    "gstRate": 18,
    "hsnCode": "8518",
    "unit": "pcs",
    "stock": 24,
    "batchNo": "BAT-2026-05",
    "expiryDate": "2028-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Electronics & Gadgets",
    "endCategoryId": "END-1001",
    "endCategoryName": "True Wireless Stereo Earbuds v5.3",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-105-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ELEC-BUDS-01-STD",
        "barcode": "890123400105",
        "purchasePrice": 850,
        "sellingPrice": 1499,
        "mrp": 2999,
        "stock": 24,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-106",
    "name": "GaN 65W Fast Wall Charger (Type-C + USB)",
    "category": "Electronics & Gadgets",
    "businessCategory": "electronics",
    "sku": "ELEC-CHRG-65",
    "barcode": "890123400106",
    "purchasePrice": 620,
    "sellingPrice": 1199,
    "mrp": 1899,
    "gstRate": 18,
    "hsnCode": "8504",
    "unit": "pcs",
    "stock": 35,
    "batchNo": "BAT-2026-06",
    "expiryDate": "2028-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Electronics & Gadgets",
    "endCategoryId": "END-1001",
    "endCategoryName": "GaN 65W Fast Wall Charger (Type-C + USB)",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-106-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ELEC-CHRG-65-STD",
        "barcode": "890123400106",
        "purchasePrice": 620,
        "sellingPrice": 1199,
        "mrp": 1899,
        "stock": 35,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-107",
    "name": "Pure Organic Wild Forest Honey 500g",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-HNY-500",
    "barcode": "890123400107",
    "purchasePrice": 220,
    "sellingPrice": 340,
    "mrp": 410,
    "gstRate": 5,
    "hsnCode": "0409",
    "unit": "jar",
    "stock": 60,
    "batchNo": "BAT-2026-07",
    "expiryDate": "2027-09-30",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Pure Organic Wild Forest Honey 500g",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-107-1",
        "size": "jar",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-HNY-500-STD",
        "barcode": "890123400107",
        "purchasePrice": 220,
        "sellingPrice": 340,
        "mrp": 410,
        "stock": 60,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-108",
    "name": "Handcrafted Festive Linen Kurta",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-KURTA-09",
    "barcode": "890123400108",
    "purchasePrice": 850,
    "sellingPrice": 1699,
    "mrp": 2299,
    "gstRate": 5,
    "hsnCode": "6205",
    "unit": "pcs",
    "stock": 45,
    "batchNo": "BAT-2026-08",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Handcrafted Festive Linen Kurta",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-108-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-KURTA-09-STD",
        "barcode": "890123400108",
        "purchasePrice": 850,
        "sellingPrice": 1699,
        "mrp": 2299,
        "stock": 45,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-109",
    "name": "Classic Oxford Formal Cotton Shirt",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-SHIRT-09",
    "barcode": "890123400109",
    "purchasePrice": 580,
    "sellingPrice": 1149,
    "mrp": 1799,
    "gstRate": 5,
    "hsnCode": "6205",
    "unit": "pcs",
    "stock": 40,
    "batchNo": "BAT-2026-09",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Classic Oxford Formal Cotton Shirt",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-109-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-SHIRT-09-STD",
        "barcode": "890123400109",
        "purchasePrice": 580,
        "sellingPrice": 1149,
        "mrp": 1799,
        "stock": 40,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-110",
    "name": "Pure Combed Cotton Polo T-Shirt",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-POLO-10",
    "barcode": "890123400110",
    "purchasePrice": 350,
    "sellingPrice": 699,
    "mrp": 999,
    "gstRate": 5,
    "hsnCode": "6109",
    "unit": "pcs",
    "stock": 85,
    "batchNo": "BAT-2026-10",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Pure Combed Cotton Polo T-Shirt",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-110-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-POLO-10-STD",
        "barcode": "890123400110",
        "purchasePrice": 350,
        "sellingPrice": 699,
        "mrp": 999,
        "stock": 85,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-111",
    "name": "Slim Tapered Khaki Casual Chinos",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-CHINO-11",
    "barcode": "890123400111",
    "purchasePrice": 750,
    "sellingPrice": 1499,
    "mrp": 2199,
    "gstRate": 12,
    "hsnCode": "6203",
    "unit": "pcs",
    "stock": 32,
    "batchNo": "BAT-2026-11",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Slim Tapered Khaki Casual Chinos",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-111-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-CHINO-11-STD",
        "barcode": "890123400111",
        "purchasePrice": 750,
        "sellingPrice": 1499,
        "mrp": 2199,
        "stock": 32,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-112",
    "name": "Banarasi Silk Embroidered Saree",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-SAREE-12",
    "barcode": "890123400112",
    "purchasePrice": 1800,
    "sellingPrice": 3499,
    "mrp": 4999,
    "gstRate": 5,
    "hsnCode": "5007",
    "unit": "pcs",
    "stock": 20,
    "batchNo": "BAT-2026-12",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Banarasi Silk Embroidered Saree",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-112-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-SAREE-12-STD",
        "barcode": "890123400112",
        "purchasePrice": 1800,
        "sellingPrice": 3499,
        "mrp": 4999,
        "stock": 20,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-113",
    "name": "Floral Print Festive Anarkali Gown",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-ANAR-13",
    "barcode": "890123400113",
    "purchasePrice": 1100,
    "sellingPrice": 2199,
    "mrp": 2999,
    "gstRate": 12,
    "hsnCode": "6204",
    "unit": "pcs",
    "stock": 25,
    "batchNo": "BAT-2026-13",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Floral Print Festive Anarkali Gown",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-113-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-ANAR-13-STD",
        "barcode": "890123400113",
        "purchasePrice": 1100,
        "sellingPrice": 2199,
        "mrp": 2999,
        "stock": 25,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-114",
    "name": "Cotton 4-Way Stretch Leggings",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-LEGG-14",
    "barcode": "890123400114",
    "purchasePrice": 210,
    "sellingPrice": 449,
    "mrp": 699,
    "gstRate": 5,
    "hsnCode": "6115",
    "unit": "pcs",
    "stock": 90,
    "batchNo": "BAT-2026-14",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Cotton 4-Way Stretch Leggings",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-114-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-LEGG-14-STD",
        "barcode": "890123400114",
        "purchasePrice": 210,
        "sellingPrice": 449,
        "mrp": 699,
        "stock": 90,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-115",
    "name": "Braided 60W Type-C to Type-C Cable",
    "category": "Electronics & Gadgets",
    "businessCategory": "electronics",
    "sku": "ELEC-CABL-15",
    "barcode": "890123400115",
    "purchasePrice": 120,
    "sellingPrice": 299,
    "mrp": 499,
    "gstRate": 18,
    "hsnCode": "8544",
    "unit": "pcs",
    "stock": 150,
    "batchNo": "BAT-2026-15",
    "expiryDate": "2029-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Electronics & Gadgets",
    "endCategoryId": "END-1001",
    "endCategoryName": "Braided 60W Type-C to Type-C Cable",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-115-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ELEC-CABL-15-STD",
        "barcode": "890123400115",
        "purchasePrice": 120,
        "sellingPrice": 299,
        "mrp": 499,
        "stock": 150,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-116",
    "name": "20000mAh Power Bank 22.5W Fast Charge",
    "category": "Electronics & Gadgets",
    "businessCategory": "electronics",
    "sku": "ELEC-PWR-16",
    "barcode": "890123400116",
    "purchasePrice": 950,
    "sellingPrice": 1899,
    "mrp": 2699,
    "gstRate": 18,
    "hsnCode": "8507",
    "unit": "pcs",
    "stock": 40,
    "batchNo": "BAT-2026-16",
    "expiryDate": "2028-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Electronics & Gadgets",
    "endCategoryId": "END-1001",
    "endCategoryName": "20000mAh Power Bank 22.5W Fast Charge",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-116-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ELEC-PWR-16-STD",
        "barcode": "890123400116",
        "purchasePrice": 950,
        "sellingPrice": 1899,
        "mrp": 2699,
        "stock": 40,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-117",
    "name": "Bluetooth Calling Smartwatch 1.96\" HD",
    "category": "Electronics & Gadgets",
    "businessCategory": "electronics",
    "sku": "ELEC-SMWT-17",
    "barcode": "890123400117",
    "purchasePrice": 1250,
    "sellingPrice": 2499,
    "mrp": 3999,
    "gstRate": 18,
    "hsnCode": "8517",
    "unit": "pcs",
    "stock": 28,
    "batchNo": "BAT-2026-17",
    "expiryDate": "2028-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Electronics & Gadgets",
    "endCategoryId": "END-1001",
    "endCategoryName": "Bluetooth Calling Smartwatch 1.96\" HD",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-117-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ELEC-SMWT-17-STD",
        "barcode": "890123400117",
        "purchasePrice": 1250,
        "sellingPrice": 2499,
        "mrp": 3999,
        "stock": 28,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-118",
    "name": "Active Noise Cancelling Over-Ear Headphones",
    "category": "Electronics & Gadgets",
    "businessCategory": "electronics",
    "sku": "ELEC-HEAD-18",
    "barcode": "890123400118",
    "purchasePrice": 1650,
    "sellingPrice": 3299,
    "mrp": 4999,
    "gstRate": 18,
    "hsnCode": "8518",
    "unit": "pcs",
    "stock": 18,
    "batchNo": "BAT-2026-18",
    "expiryDate": "2028-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Electronics & Gadgets",
    "endCategoryId": "END-1001",
    "endCategoryName": "Active Noise Cancelling Over-Ear Headphones",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-118-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ELEC-HEAD-18-STD",
        "barcode": "890123400118",
        "purchasePrice": 1650,
        "sellingPrice": 3299,
        "mrp": 4999,
        "stock": 18,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-119",
    "name": "Cold Pressed Kachi Ghani Mustard Oil 1L",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-OIL-19",
    "barcode": "890123400119",
    "purchasePrice": 140,
    "sellingPrice": 185,
    "mrp": 215,
    "gstRate": 5,
    "hsnCode": "1514",
    "unit": "bottle",
    "stock": 75,
    "batchNo": "BAT-2026-19",
    "expiryDate": "2027-10-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Cold Pressed Kachi Ghani Mustard Oil 1L",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-119-1",
        "size": "bottle",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-OIL-19-STD",
        "barcode": "890123400119",
        "purchasePrice": 140,
        "sellingPrice": 185,
        "mrp": 215,
        "stock": 75,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-120",
    "name": "Premium California Whole Almonds 500g",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-ALMD-20",
    "barcode": "890123400120",
    "purchasePrice": 380,
    "sellingPrice": 490,
    "mrp": 599,
    "gstRate": 5,
    "hsnCode": "0802",
    "unit": "pack",
    "stock": 80,
    "batchNo": "BAT-2026-20",
    "expiryDate": "2027-08-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Premium California Whole Almonds 500g",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-120-1",
        "size": "pack",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-ALMD-20-STD",
        "barcode": "890123400120",
        "purchasePrice": 380,
        "sellingPrice": 490,
        "mrp": 599,
        "stock": 80,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-121",
    "name": "Jumbo Whole Cashews W320 500g",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-CASH-21",
    "barcode": "890123400121",
    "purchasePrice": 410,
    "sellingPrice": 520,
    "mrp": 650,
    "gstRate": 5,
    "hsnCode": "0801",
    "unit": "pack",
    "stock": 65,
    "batchNo": "BAT-2026-21",
    "expiryDate": "2027-08-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Jumbo Whole Cashews W320 500g",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-121-1",
        "size": "pack",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-CASH-21-STD",
        "barcode": "890123400121",
        "purchasePrice": 410,
        "sellingPrice": 520,
        "mrp": 650,
        "stock": 65,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-122",
    "name": "Organic Green Tea Detox 100 Tea Bags",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-TEA-22",
    "barcode": "890123400122",
    "purchasePrice": 260,
    "sellingPrice": 380,
    "mrp": 450,
    "gstRate": 5,
    "hsnCode": "0902",
    "unit": "box",
    "stock": 55,
    "batchNo": "BAT-2026-22",
    "expiryDate": "2028-04-30",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Organic Green Tea Detox 100 Tea Bags",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-122-1",
        "size": "box",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-TEA-22-STD",
        "barcode": "890123400122",
        "purchasePrice": 260,
        "sellingPrice": 380,
        "mrp": 450,
        "stock": 55,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-123",
    "name": "Italian Extra Virgin Olive Oil 500ml",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-OLIV-23",
    "barcode": "890123400123",
    "purchasePrice": 490,
    "sellingPrice": 690,
    "mrp": 850,
    "gstRate": 12,
    "hsnCode": "1509",
    "unit": "bottle",
    "stock": 35,
    "batchNo": "BAT-2026-23",
    "expiryDate": "2028-06-30",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Italian Extra Virgin Olive Oil 500ml",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-123-1",
        "size": "bottle",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-OLIV-23-STD",
        "barcode": "890123400123",
        "purchasePrice": 490,
        "sellingPrice": 690,
        "mrp": 850,
        "stock": 35,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-124",
    "name": "Sharbati Whole Wheat MP Atta 10kg",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-ATTA-24",
    "barcode": "890123400124",
    "purchasePrice": 370,
    "sellingPrice": 440,
    "mrp": 490,
    "gstRate": 0,
    "hsnCode": "1101",
    "unit": "pack",
    "stock": 110,
    "batchNo": "BAT-2026-24",
    "expiryDate": "2027-05-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Sharbati Whole Wheat MP Atta 10kg",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-124-1",
        "size": "pack",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-ATTA-24-STD",
        "barcode": "890123400124",
        "purchasePrice": 370,
        "sellingPrice": 440,
        "mrp": 490,
        "stock": 110,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-125",
    "name": "Kashmiri Saffron Mogra Grade A 1g",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-SAFF-25",
    "barcode": "890123400125",
    "purchasePrice": 280,
    "sellingPrice": 390,
    "mrp": 499,
    "gstRate": 5,
    "hsnCode": "0910",
    "unit": "box",
    "stock": 40,
    "batchNo": "BAT-2026-25",
    "expiryDate": "2029-01-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Kashmiri Saffron Mogra Grade A 1g",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-125-1",
        "size": "box",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-SAFF-25-STD",
        "barcode": "890123400125",
        "purchasePrice": 280,
        "sellingPrice": 390,
        "mrp": 499,
        "stock": 40,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-126",
    "name": "Genuine Leather Formal Reversible Belt",
    "category": "Footwear & Accessories",
    "businessCategory": "footwear",
    "sku": "ACC-BELT-26",
    "barcode": "890123400126",
    "purchasePrice": 390,
    "sellingPrice": 799,
    "mrp": 1299,
    "gstRate": 18,
    "hsnCode": "4203",
    "unit": "pcs",
    "stock": 45,
    "batchNo": "BAT-2026-26",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Footwear & Accessories",
    "endCategoryId": "END-1001",
    "endCategoryName": "Genuine Leather Formal Reversible Belt",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-126-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ACC-BELT-26-STD",
        "barcode": "890123400126",
        "purchasePrice": 390,
        "sellingPrice": 799,
        "mrp": 1299,
        "stock": 45,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-127",
    "name": "RFID Protected Bi-Fold Leather Wallet",
    "category": "Footwear & Accessories",
    "businessCategory": "footwear",
    "sku": "ACC-WALL-27",
    "barcode": "890123400127",
    "purchasePrice": 320,
    "sellingPrice": 649,
    "mrp": 999,
    "gstRate": 18,
    "hsnCode": "4202",
    "unit": "pcs",
    "stock": 50,
    "batchNo": "BAT-2026-27",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Footwear & Accessories",
    "endCategoryId": "END-1001",
    "endCategoryName": "RFID Protected Bi-Fold Leather Wallet",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-127-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ACC-WALL-27-STD",
        "barcode": "890123400127",
        "purchasePrice": 320,
        "sellingPrice": 649,
        "mrp": 999,
        "stock": 50,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-128",
    "name": "Breathable Mesh Lightweight Running Shoes",
    "category": "Footwear & Accessories",
    "businessCategory": "footwear",
    "sku": "FOOT-SHOE-28",
    "barcode": "890123400128",
    "purchasePrice": 850,
    "sellingPrice": 1799,
    "mrp": 2599,
    "gstRate": 12,
    "hsnCode": "6404",
    "unit": "pair",
    "stock": 30,
    "batchNo": "BAT-2026-28",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Footwear & Accessories",
    "endCategoryId": "END-1001",
    "endCategoryName": "Breathable Mesh Lightweight Running Shoes",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-128-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FOOT-SHOE-28-STD",
        "barcode": "890123400128",
        "purchasePrice": 850,
        "sellingPrice": 1799,
        "mrp": 2599,
        "stock": 30,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-129",
    "name": "Handcrafted Traditional Leather Mojari",
    "category": "Footwear & Accessories",
    "businessCategory": "footwear",
    "sku": "FOOT-MOJA-29",
    "barcode": "890123400129",
    "purchasePrice": 620,
    "sellingPrice": 1299,
    "mrp": 1899,
    "gstRate": 12,
    "hsnCode": "6403",
    "unit": "pair",
    "stock": 26,
    "batchNo": "BAT-2026-29",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Footwear & Accessories",
    "endCategoryId": "END-1001",
    "endCategoryName": "Handcrafted Traditional Leather Mojari",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-129-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FOOT-MOJA-29-STD",
        "barcode": "890123400129",
        "purchasePrice": 620,
        "sellingPrice": 1299,
        "mrp": 1899,
        "stock": 26,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-130",
    "name": "Cotton Rich Ankle Length Socks (Pack of 3)",
    "category": "Footwear & Accessories",
    "businessCategory": "footwear",
    "sku": "FOOT-SOCK-30",
    "barcode": "890123400130",
    "purchasePrice": 110,
    "sellingPrice": 249,
    "mrp": 399,
    "gstRate": 5,
    "hsnCode": "6115",
    "unit": "pack",
    "stock": 120,
    "batchNo": "BAT-2026-30",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Footwear & Accessories",
    "endCategoryId": "END-1001",
    "endCategoryName": "Cotton Rich Ankle Length Socks (Pack of 3)",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-130-1",
        "size": "pack",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FOOT-SOCK-30-STD",
        "barcode": "890123400130",
        "purchasePrice": 110,
        "sellingPrice": 249,
        "mrp": 399,
        "stock": 120,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-131",
    "name": "Polarized UV400 Protection Sunglasses",
    "category": "Footwear & Accessories",
    "businessCategory": "footwear",
    "sku": "ACC-SUNG-31",
    "barcode": "890123400131",
    "purchasePrice": 450,
    "sellingPrice": 999,
    "mrp": 1599,
    "gstRate": 18,
    "hsnCode": "9004",
    "unit": "pcs",
    "stock": 35,
    "batchNo": "BAT-2026-31",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Footwear & Accessories",
    "endCategoryId": "END-1001",
    "endCategoryName": "Polarized UV400 Protection Sunglasses",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-131-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ACC-SUNG-31-STD",
        "barcode": "890123400131",
        "purchasePrice": 450,
        "sellingPrice": 999,
        "mrp": 1599,
        "stock": 35,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-132",
    "name": "Stainless Steel Vacuum Insulated Flask 750ml",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "HOME-FLSK-32",
    "barcode": "890123400132",
    "purchasePrice": 340,
    "sellingPrice": 699,
    "mrp": 999,
    "gstRate": 18,
    "hsnCode": "9617",
    "unit": "pcs",
    "stock": 45,
    "batchNo": "BAT-2026-32",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Stainless Steel Vacuum Insulated Flask 750ml",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-132-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "HOME-FLSK-32-STD",
        "barcode": "890123400132",
        "purchasePrice": 340,
        "sellingPrice": 699,
        "mrp": 999,
        "stock": 45,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-133",
    "name": "Men Formal Single Breasted Notch Blazer",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-BLAZ-33",
    "barcode": "890123400133",
    "purchasePrice": 1950,
    "sellingPrice": 3899,
    "mrp": 5499,
    "gstRate": 12,
    "hsnCode": "6203",
    "unit": "pcs",
    "stock": 15,
    "batchNo": "BAT-2026-33",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Men Formal Single Breasted Notch Blazer",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-133-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-BLAZ-33-STD",
        "barcode": "890123400133",
        "purchasePrice": 1950,
        "sellingPrice": 3899,
        "mrp": 5499,
        "stock": 15,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-134",
    "name": "Winter Quilted Hooded Bomber Jacket",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-JACK-34",
    "barcode": "890123400134",
    "purchasePrice": 1350,
    "sellingPrice": 2699,
    "mrp": 3899,
    "gstRate": 12,
    "hsnCode": "6201",
    "unit": "pcs",
    "stock": 22,
    "batchNo": "BAT-2026-34",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Winter Quilted Hooded Bomber Jacket",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-134-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-JACK-34-STD",
        "barcode": "890123400134",
        "purchasePrice": 1350,
        "sellingPrice": 2699,
        "mrp": 3899,
        "stock": 22,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-135",
    "name": "Pure Cotton Modal Boxer Shorts (Pack of 2)",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-BOXR-35",
    "barcode": "890123400135",
    "purchasePrice": 260,
    "sellingPrice": 549,
    "mrp": 799,
    "gstRate": 5,
    "hsnCode": "6107",
    "unit": "pack",
    "stock": 70,
    "batchNo": "BAT-2026-35",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Pure Cotton Modal Boxer Shorts (Pack of 2)",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-135-1",
        "size": "pack",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-BOXR-35-STD",
        "barcode": "890123400135",
        "purchasePrice": 260,
        "sellingPrice": 549,
        "mrp": 799,
        "stock": 70,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-136",
    "name": "Women Rayon Printed Daily Straight Kurti",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-KURT-36",
    "barcode": "890123400136",
    "purchasePrice": 380,
    "sellingPrice": 799,
    "mrp": 1199,
    "gstRate": 5,
    "hsnCode": "6204",
    "unit": "pcs",
    "stock": 55,
    "batchNo": "BAT-2026-36",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Women Rayon Printed Daily Straight Kurti",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-136-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-KURT-36-STD",
        "barcode": "890123400136",
        "purchasePrice": 380,
        "sellingPrice": 799,
        "mrp": 1199,
        "stock": 55,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-137",
    "name": "Bandhani Print Traditional Chiffon Dupatta",
    "category": "Fashion & Apparel",
    "businessCategory": "fashion",
    "sku": "FSH-DUPA-37",
    "barcode": "890123400137",
    "purchasePrice": 160,
    "sellingPrice": 349,
    "mrp": 549,
    "gstRate": 5,
    "hsnCode": "6214",
    "unit": "pcs",
    "stock": 65,
    "batchNo": "BAT-2026-37",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Fashion & Apparel",
    "endCategoryId": "END-1001",
    "endCategoryName": "Bandhani Print Traditional Chiffon Dupatta",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-137-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "FSH-DUPA-37-STD",
        "barcode": "890123400137",
        "purchasePrice": 160,
        "sellingPrice": 349,
        "mrp": 549,
        "stock": 65,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-138",
    "name": "Wireless Optical Ergonomic Mouse 2.4GHz",
    "category": "Electronics & Gadgets",
    "businessCategory": "electronics",
    "sku": "ELEC-MOUS-38",
    "barcode": "890123400138",
    "purchasePrice": 230,
    "sellingPrice": 499,
    "mrp": 799,
    "gstRate": 18,
    "hsnCode": "8471",
    "unit": "pcs",
    "stock": 60,
    "batchNo": "BAT-2026-38",
    "expiryDate": "2029-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Electronics & Gadgets",
    "endCategoryId": "END-1001",
    "endCategoryName": "Wireless Optical Ergonomic Mouse 2.4GHz",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-138-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ELEC-MOUS-38-STD",
        "barcode": "890123400138",
        "purchasePrice": 230,
        "sellingPrice": 499,
        "mrp": 799,
        "stock": 60,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-139",
    "name": "Compact Mechanical Keyboard RGB Backlit",
    "category": "Electronics & Gadgets",
    "businessCategory": "electronics",
    "sku": "ELEC-KEYB-39",
    "barcode": "890123400139",
    "purchasePrice": 980,
    "sellingPrice": 1999,
    "mrp": 2999,
    "gstRate": 18,
    "hsnCode": "8471",
    "unit": "pcs",
    "stock": 25,
    "batchNo": "BAT-2026-39",
    "expiryDate": "2029-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Electronics & Gadgets",
    "endCategoryId": "END-1001",
    "endCategoryName": "Compact Mechanical Keyboard RGB Backlit",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-139-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ELEC-KEYB-39-STD",
        "barcode": "890123400139",
        "purchasePrice": 980,
        "sellingPrice": 1999,
        "mrp": 2999,
        "stock": 25,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-140",
    "name": "1080p Full HD USB Webcam with Dual Mic",
    "category": "Electronics & Gadgets",
    "businessCategory": "electronics",
    "sku": "ELEC-WEBC-40",
    "barcode": "890123400140",
    "purchasePrice": 620,
    "sellingPrice": 1249,
    "mrp": 1899,
    "gstRate": 18,
    "hsnCode": "8525",
    "unit": "pcs",
    "stock": 30,
    "batchNo": "BAT-2026-40",
    "expiryDate": "2029-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Electronics & Gadgets",
    "endCategoryId": "END-1001",
    "endCategoryName": "1080p Full HD USB Webcam with Dual Mic",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-140-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "ELEC-WEBC-40-STD",
        "barcode": "890123400140",
        "purchasePrice": 620,
        "sellingPrice": 1249,
        "mrp": 1899,
        "stock": 30,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-141",
    "name": "Ayurvedic Pure Aloe Vera Skin Gel 200ml",
    "category": "Personal Care & Beauty",
    "businessCategory": "cosmetics",
    "sku": "CARE-ALOE-41",
    "barcode": "890123400141",
    "purchasePrice": 95,
    "sellingPrice": 199,
    "mrp": 260,
    "gstRate": 12,
    "hsnCode": "3304",
    "unit": "bottle",
    "stock": 95,
    "batchNo": "BAT-2026-41",
    "expiryDate": "2027-11-30",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Personal Care & Beauty",
    "endCategoryId": "END-1001",
    "endCategoryName": "Ayurvedic Pure Aloe Vera Skin Gel 200ml",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-141-1",
        "size": "bottle",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "CARE-ALOE-41-STD",
        "barcode": "890123400141",
        "purchasePrice": 95,
        "sellingPrice": 199,
        "mrp": 260,
        "stock": 95,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-142",
    "name": "Anti-Dandruff Organic Tea Tree Shampoo 300ml",
    "category": "Personal Care & Beauty",
    "businessCategory": "cosmetics",
    "sku": "CARE-SHMP-42",
    "barcode": "890123400142",
    "purchasePrice": 165,
    "sellingPrice": 349,
    "mrp": 450,
    "gstRate": 18,
    "hsnCode": "3305",
    "unit": "bottle",
    "stock": 70,
    "batchNo": "BAT-2026-42",
    "expiryDate": "2027-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Personal Care & Beauty",
    "endCategoryId": "END-1001",
    "endCategoryName": "Anti-Dandruff Organic Tea Tree Shampoo 300ml",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-142-1",
        "size": "bottle",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "CARE-SHMP-42-STD",
        "barcode": "890123400142",
        "purchasePrice": 165,
        "sellingPrice": 349,
        "mrp": 450,
        "stock": 70,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-143",
    "name": "SPF 50 PA+++ Ultra Matte Sunscreen Gel 100ml",
    "category": "Personal Care & Beauty",
    "businessCategory": "cosmetics",
    "sku": "CARE-SUNS-43",
    "barcode": "890123400143",
    "purchasePrice": 210,
    "sellingPrice": 420,
    "mrp": 550,
    "gstRate": 18,
    "hsnCode": "3304",
    "unit": "tube",
    "stock": 80,
    "batchNo": "BAT-2026-43",
    "expiryDate": "2028-02-28",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Personal Care & Beauty",
    "endCategoryId": "END-1001",
    "endCategoryName": "SPF 50 PA+++ Ultra Matte Sunscreen Gel 100ml",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-143-1",
        "size": "tube",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "CARE-SUNS-43-STD",
        "barcode": "890123400143",
        "purchasePrice": 210,
        "sellingPrice": 420,
        "mrp": 550,
        "stock": 80,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-144",
    "name": "Activated Charcoal Deep Clean Face Wash 150ml",
    "category": "Personal Care & Beauty",
    "businessCategory": "cosmetics",
    "sku": "CARE-WASH-44",
    "barcode": "890123400144",
    "purchasePrice": 120,
    "sellingPrice": 249,
    "mrp": 349,
    "gstRate": 18,
    "hsnCode": "3304",
    "unit": "tube",
    "stock": 85,
    "batchNo": "BAT-2026-44",
    "expiryDate": "2027-10-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Personal Care & Beauty",
    "endCategoryId": "END-1001",
    "endCategoryName": "Activated Charcoal Deep Clean Face Wash 150ml",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-144-1",
        "size": "tube",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "CARE-WASH-44-STD",
        "barcode": "890123400144",
        "purchasePrice": 120,
        "sellingPrice": 249,
        "mrp": 349,
        "stock": 85,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-145",
    "name": "Cocoa Butter Ultra Hydrating Body Lotion 400ml",
    "category": "Personal Care & Beauty",
    "businessCategory": "cosmetics",
    "sku": "CARE-LOTN-45",
    "barcode": "890123400145",
    "purchasePrice": 190,
    "sellingPrice": 399,
    "mrp": 520,
    "gstRate": 18,
    "hsnCode": "3304",
    "unit": "bottle",
    "stock": 60,
    "batchNo": "BAT-2026-45",
    "expiryDate": "2028-01-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Personal Care & Beauty",
    "endCategoryId": "END-1001",
    "endCategoryName": "Cocoa Butter Ultra Hydrating Body Lotion 400ml",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-145-1",
        "size": "bottle",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "CARE-LOTN-45-STD",
        "barcode": "890123400145",
        "purchasePrice": 190,
        "sellingPrice": 399,
        "mrp": 520,
        "stock": 60,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-146",
    "name": "Raw Organic High Fiber Chia Seeds 250g",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-CHIA-46",
    "barcode": "890123400146",
    "purchasePrice": 105,
    "sellingPrice": 190,
    "mrp": 260,
    "gstRate": 5,
    "hsnCode": "1207",
    "unit": "pack",
    "stock": 90,
    "batchNo": "BAT-2026-46",
    "expiryDate": "2028-05-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Raw Organic High Fiber Chia Seeds 250g",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-146-1",
        "size": "pack",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-CHIA-46-STD",
        "barcode": "890123400146",
        "purchasePrice": 105,
        "sellingPrice": 190,
        "mrp": 260,
        "stock": 90,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-147",
    "name": "Roasted Pumpkin & Sunflower Super Seeds 200g",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-SEED-47",
    "barcode": "890123400147",
    "purchasePrice": 115,
    "sellingPrice": 210,
    "mrp": 299,
    "gstRate": 5,
    "hsnCode": "2008",
    "unit": "pack",
    "stock": 85,
    "batchNo": "BAT-2026-47",
    "expiryDate": "2028-03-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Roasted Pumpkin & Sunflower Super Seeds 200g",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-147-1",
        "size": "pack",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-SEED-47-STD",
        "barcode": "890123400147",
        "purchasePrice": 115,
        "sellingPrice": 210,
        "mrp": 299,
        "stock": 85,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-148",
    "name": "Natural Himalayan Rock Salt (Sendha Namak) 1kg",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "GROC-SALT-48",
    "barcode": "890123400148",
    "purchasePrice": 42,
    "sellingPrice": 75,
    "mrp": 99,
    "gstRate": 0,
    "hsnCode": "2501",
    "unit": "pack",
    "stock": 160,
    "batchNo": "BAT-2026-48",
    "expiryDate": "2029-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Natural Himalayan Rock Salt (Sendha Namak) 1kg",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-148-1",
        "size": "pack",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "GROC-SALT-48-STD",
        "barcode": "890123400148",
        "purchasePrice": 42,
        "sellingPrice": 75,
        "mrp": 99,
        "stock": 160,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-149",
    "name": "Chef Grade Stainless Steel Kitchen Knife Set (5 Pcs)",
    "category": "Grocery & Supermarket",
    "businessCategory": "grocery",
    "sku": "HOME-KNIF-49",
    "barcode": "890123400149",
    "purchasePrice": 420,
    "sellingPrice": 850,
    "mrp": 1299,
    "gstRate": 18,
    "hsnCode": "8211",
    "unit": "set",
    "stock": 40,
    "batchNo": "BAT-2026-49",
    "expiryDate": "",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Grocery & Supermarket",
    "endCategoryId": "END-1001",
    "endCategoryName": "Chef Grade Stainless Steel Kitchen Knife Set (5 Pcs)",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": false,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-149-1",
        "size": "set",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "HOME-KNIF-49-STD",
        "barcode": "890123400149",
        "purchasePrice": 420,
        "sellingPrice": 850,
        "mrp": 1299,
        "stock": 40,
        "isActive": true
      }
    ]
  },
  {
    "id": "PRD-150",
    "name": "Ultrasonic Cool Mist Aroma Diffuser & Humidifier",
    "category": "Electronics & Gadgets",
    "businessCategory": "electronics",
    "sku": "HOME-DIFF-50",
    "barcode": "890123400150",
    "purchasePrice": 580,
    "sellingPrice": 1150,
    "mrp": 1699,
    "gstRate": 18,
    "hsnCode": "8509",
    "unit": "pcs",
    "stock": 35,
    "batchNo": "BAT-2026-50",
    "expiryDate": "2029-12-31",
    "topCategoryId": "TOP-1",
    "topCategoryName": "Retail Goods",
    "midCategoryId": "MID-101",
    "midCategoryName": "Electronics & Gadgets",
    "endCategoryId": "END-1001",
    "endCategoryName": "Ultrasonic Cool Mist Aroma Diffuser & Humidifier",
    "reorderLevel": 10,
    "branch": "Main Branch (Downtown)",
    "weightKg": 0.5,
    "dimensions": "20x15x5 cm",
    "isFreeShipping": true,
    "status": "In Stock",
    "variants": [
      {
        "id": "v-PRD-150-1",
        "size": "Standard",
        "color": "Classic",
        "colorHex": "#1e3a8a",
        "sku": "HOME-DIFF-50-STD",
        "barcode": "890123400150",
        "purchasePrice": 580,
        "sellingPrice": 1150,
        "mrp": 1699,
        "stock": 35,
        "isActive": true
      }
    ]
  }
];

export const INITIAL_ORDERS = [
  {
  "id": "ORD-2026-3500",
  "customerName": "Rameshwar Sharma & Sons (Wholesale & Retailers)",
  "phone": "+91 98290 88776",
  "city": "Shop 18, Johari Bazar, Jaipur, RJ",
  "customerGstin": "08AABCR9912D1Z4",
  "itemsCount": 32,
  "subtotal": 72286,
  "gstTotal": 8525.6,
  "total": 80811.6,
  "paidAmount": 80811.6,
  "duesAmount": 0,
  "costTotal": 38420,
  "grossProfit": 42391.6,
  "profitMarginPercent": "52.5",
  "paymentMethod": "Bank Transfer / NEFT",
  "paymentRef": "NEFT-HDFC-9920148102",
  "paymentStatus": "Paid",
  "billType": "pakka",
  "channel": "POS Counter 01",
  "channelType": "offline",
  "fulfillment": "Delivered (Store Counter)",
  "awb": "POS-FULL-2P",
  "date": "2026-10-31 08:30 PM",
  "items": [
    {
      "productId": "PRD-101",
      "name": "Premium Cotton Slim Fit Shirt",
      "qty": 2,
      "price": 1299,
      "costPrice": 650,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "6205",
      "unit": "pcs",
      "batchNo": "BAT-2026-01",
      "expiryDate": ""
    },
    {
      "productId": "PRD-102",
      "name": "Dark Indigo Stretch Denim Jeans",
      "qty": 2,
      "price": 1899,
      "costPrice": 950,
      "gst": "12%",
      "gstRate": 12,
      "hsn": "6203",
      "unit": "pcs",
      "batchNo": "BAT-2026-02",
      "expiryDate": ""
    },
    {
      "productId": "PRD-103",
      "name": "Royal Basmati Rice 5kg Aged Pack",
      "qty": 2,
      "price": 480,
      "costPrice": 380,
      "gst": "0%",
      "gstRate": 0,
      "hsn": "1006",
      "unit": "pack",
      "batchNo": "BAT-2026-R09",
      "expiryDate": "2028-07-31"
    },
    {
      "productId": "PRD-104",
      "name": "Pure Desi Cow Ghee 1L Tin",
      "qty": 2,
      "price": 650,
      "costPrice": 520,
      "gst": "12%",
      "gstRate": 12,
      "hsn": "0405",
      "unit": "tin",
      "batchNo": "BAT-2026-G42",
      "expiryDate": "2027-03-10"
    },
    {
      "productId": "PRD-105",
      "name": "True Wireless Stereo Earbuds v5.3",
      "qty": 2,
      "price": 1499,
      "costPrice": 850,
      "gst": "18%",
      "gstRate": 18,
      "hsn": "8518",
      "unit": "pcs",
      "batchNo": "BAT-2026-05",
      "expiryDate": "2028-12-31"
    },
    {
      "productId": "PRD-106",
      "name": "GaN 65W Fast Wall Charger (Type-C + USB)",
      "qty": 2,
      "price": 1199,
      "costPrice": 620,
      "gst": "18%",
      "gstRate": 18,
      "hsn": "8504",
      "unit": "pcs",
      "batchNo": "BAT-2026-06",
      "expiryDate": "2028-12-31"
    },
    {
      "productId": "PRD-107",
      "name": "Pure Organic Wild Forest Honey 500g",
      "qty": 2,
      "price": 340,
      "costPrice": 220,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "0409",
      "unit": "jar",
      "batchNo": "BAT-2026-07",
      "expiryDate": "2027-09-30"
    },
    {
      "productId": "PRD-108",
      "name": "Handcrafted Festive Linen Kurta",
      "qty": 2,
      "price": 1699,
      "costPrice": 850,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "6205",
      "unit": "pcs",
      "batchNo": "BAT-2026-08",
      "expiryDate": ""
    },
    {
      "productId": "PRD-109",
      "name": "Classic Oxford Formal Cotton Shirt",
      "qty": 2,
      "price": 1149,
      "costPrice": 580,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "6205",
      "unit": "pcs",
      "batchNo": "BAT-2026-09",
      "expiryDate": ""
    },
    {
      "productId": "PRD-110",
      "name": "Pure Combed Cotton Polo T-Shirt",
      "qty": 2,
      "price": 699,
      "costPrice": 350,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "6109",
      "unit": "pcs",
      "batchNo": "BAT-2026-10",
      "expiryDate": ""
    },
    {
      "productId": "PRD-111",
      "name": "Slim Tapered Khaki Casual Chinos",
      "qty": 2,
      "price": 1499,
      "costPrice": 750,
      "gst": "12%",
      "gstRate": 12,
      "hsn": "6203",
      "unit": "pcs",
      "batchNo": "BAT-2026-11",
      "expiryDate": ""
    },
    {
      "productId": "PRD-112",
      "name": "Banarasi Silk Embroidered Saree",
      "qty": 2,
      "price": 3499,
      "costPrice": 1800,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "5007",
      "unit": "pcs",
      "batchNo": "BAT-2026-12",
      "expiryDate": ""
    },
    {
      "productId": "PRD-113",
      "name": "Floral Print Festive Anarkali Gown",
      "qty": 2,
      "price": 2199,
      "costPrice": 1100,
      "gst": "12%",
      "gstRate": 12,
      "hsn": "6204",
      "unit": "pcs",
      "batchNo": "BAT-2026-13",
      "expiryDate": ""
    },
    {
      "productId": "PRD-114",
      "name": "Cotton 4-Way Stretch Leggings",
      "qty": 2,
      "price": 449,
      "costPrice": 210,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "6115",
      "unit": "pcs",
      "batchNo": "BAT-2026-14",
      "expiryDate": ""
    },
    {
      "productId": "PRD-115",
      "name": "Braided 60W Type-C to Type-C Cable",
      "qty": 2,
      "price": 299,
      "costPrice": 120,
      "gst": "18%",
      "gstRate": 18,
      "hsn": "8544",
      "unit": "pcs",
      "batchNo": "BAT-2026-15",
      "expiryDate": "2029-12-31"
    },
    {
      "productId": "PRD-116",
      "name": "20000mAh Power Bank 22.5W Fast Charge",
      "qty": 2,
      "price": 1899,
      "costPrice": 950,
      "gst": "18%",
      "gstRate": 18,
      "hsn": "8507",
      "unit": "pcs",
      "batchNo": "BAT-2026-16",
      "expiryDate": "2028-12-31"
    },
    {
      "productId": "PRD-117",
      "name": "Bluetooth Calling Smartwatch 1.96\" HD",
      "qty": 2,
      "price": 2499,
      "costPrice": 1250,
      "gst": "18%",
      "gstRate": 18,
      "hsn": "8517",
      "unit": "pcs",
      "batchNo": "BAT-2026-17",
      "expiryDate": "2028-12-31"
    },
    {
      "productId": "PRD-118",
      "name": "Active Noise Cancelling Over-Ear Headphones",
      "qty": 2,
      "price": 3299,
      "costPrice": 1650,
      "gst": "18%",
      "gstRate": 18,
      "hsn": "8518",
      "unit": "pcs",
      "batchNo": "BAT-2026-18",
      "expiryDate": "2028-12-31"
    },
    {
      "productId": "PRD-119",
      "name": "Cold Pressed Kachi Ghani Mustard Oil 1L",
      "qty": 2,
      "price": 185,
      "costPrice": 140,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "1514",
      "unit": "bottle",
      "batchNo": "BAT-2026-19",
      "expiryDate": "2027-10-31"
    },
    {
      "productId": "PRD-120",
      "name": "Premium California Whole Almonds 500g",
      "qty": 2,
      "price": 490,
      "costPrice": 380,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "0802",
      "unit": "pack",
      "batchNo": "BAT-2026-20",
      "expiryDate": "2027-08-31"
    },
    {
      "productId": "PRD-121",
      "name": "Jumbo Whole Cashews W320 500g",
      "qty": 2,
      "price": 520,
      "costPrice": 410,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "0801",
      "unit": "pack",
      "batchNo": "BAT-2026-21",
      "expiryDate": "2027-08-31"
    },
    {
      "productId": "PRD-122",
      "name": "Organic Green Tea Detox 100 Tea Bags",
      "qty": 2,
      "price": 380,
      "costPrice": 260,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "0902",
      "unit": "box",
      "batchNo": "BAT-2026-22",
      "expiryDate": "2028-04-30"
    },
    {
      "productId": "PRD-123",
      "name": "Italian Extra Virgin Olive Oil 500ml",
      "qty": 2,
      "price": 690,
      "costPrice": 490,
      "gst": "12%",
      "gstRate": 12,
      "hsn": "1509",
      "unit": "bottle",
      "batchNo": "BAT-2026-23",
      "expiryDate": "2028-06-30"
    },
    {
      "productId": "PRD-124",
      "name": "Sharbati Whole Wheat MP Atta 10kg",
      "qty": 2,
      "price": 440,
      "costPrice": 370,
      "gst": "0%",
      "gstRate": 0,
      "hsn": "1101",
      "unit": "pack",
      "batchNo": "BAT-2026-24",
      "expiryDate": "2027-05-31"
    },
    {
      "productId": "PRD-125",
      "name": "Kashmiri Saffron Mogra Grade A 1g",
      "qty": 2,
      "price": 390,
      "costPrice": 280,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "0910",
      "unit": "box",
      "batchNo": "BAT-2026-25",
      "expiryDate": "2029-01-31"
    },
    {
      "productId": "PRD-126",
      "name": "Genuine Leather Formal Reversible Belt",
      "qty": 2,
      "price": 799,
      "costPrice": 390,
      "gst": "18%",
      "gstRate": 18,
      "hsn": "4203",
      "unit": "pcs",
      "batchNo": "BAT-2026-26",
      "expiryDate": ""
    },
    {
      "productId": "PRD-127",
      "name": "RFID Protected Bi-Fold Leather Wallet",
      "qty": 2,
      "price": 649,
      "costPrice": 320,
      "gst": "18%",
      "gstRate": 18,
      "hsn": "4202",
      "unit": "pcs",
      "batchNo": "BAT-2026-27",
      "expiryDate": ""
    },
    {
      "productId": "PRD-128",
      "name": "Breathable Mesh Lightweight Running Shoes",
      "qty": 2,
      "price": 1799,
      "costPrice": 850,
      "gst": "12%",
      "gstRate": 12,
      "hsn": "6404",
      "unit": "pair",
      "batchNo": "BAT-2026-28",
      "expiryDate": ""
    },
    {
      "productId": "PRD-129",
      "name": "Handcrafted Traditional Leather Mojari",
      "qty": 2,
      "price": 1299,
      "costPrice": 620,
      "gst": "12%",
      "gstRate": 12,
      "hsn": "6403",
      "unit": "pair",
      "batchNo": "BAT-2026-29",
      "expiryDate": ""
    },
    {
      "productId": "PRD-130",
      "name": "Cotton Rich Ankle Length Socks (Pack of 3)",
      "qty": 2,
      "price": 249,
      "costPrice": 110,
      "gst": "5%",
      "gstRate": 5,
      "hsn": "6115",
      "unit": "pack",
      "batchNo": "BAT-2026-30",
      "expiryDate": ""
    },
    {
      "productId": "PRD-131",
      "name": "Polarized UV400 Protection Sunglasses",
      "qty": 2,
      "price": 999,
      "costPrice": 450,
      "gst": "18%",
      "gstRate": 18,
      "hsn": "9004",
      "unit": "pcs",
      "batchNo": "BAT-2026-31",
      "expiryDate": ""
    },
    {
      "productId": "PRD-132",
      "name": "Stainless Steel Vacuum Insulated Flask 750ml",
      "qty": 2,
      "price": 699,
      "costPrice": 340,
      "gst": "18%",
      "gstRate": 18,
      "hsn": "9617",
      "unit": "pcs",
      "batchNo": "BAT-2026-32",
      "expiryDate": ""
    }
  ]
},
  {
    id: 'ORD-2026-9041',
    customerName: 'Vikramaditya Rathore',
    phone: '+91 98290 11234',
    city: 'Jaipur, RJ',
    itemsCount: 3,
    subtotal: 3198.0,
    gstTotal: 184.0,
    total: 3382.0,
    paidAmount: 3382.0,
    duesAmount: 0.0,
    costTotal: 2150.0,
    grossProfit: 1232.0,
    profitMarginPercent: '36.4',
    paymentMethod: 'PhonePe UPI',
    paymentStatus: 'Paid',
    billType: 'pakka',
    channel: 'Storefront Online',
    channelType: 'online',
    fulfillment: 'Shiprocket Dispatched',
    awb: 'SR-9920148102',
    date: '2026-10-21 02:45 PM',
    items: [
      { productId: 'PRD-101', name: 'Premium Cotton Slim Fit Shirt (L)', qty: 1, price: 1299.0, costPrice: 650.0, gst: '5%', hsn: '6205', unit: 'pcs', batchNo: 'RAY-SH-2026', expiryDate: '2029-10-31' },
      { productId: 'PRD-102', name: 'Dark Indigo Stretch Denim Jeans (34)', qty: 1, price: 1899.0, costPrice: 950.0, gst: '12%', hsn: '6203', unit: 'pcs', batchNo: 'RAY-JN-902', expiryDate: '' }
    ]
  },
  {
    id: 'ORD-2026-9040',
    customerName: 'Ananya Deshmukh',
    phone: '+91 97412 88451',
    city: 'Mumbai, MH',
    itemsCount: 2,
    subtotal: 1130.0,
    gstTotal: 78.0,
    total: 1208.0,
    paidAmount: 1000.0,
    duesAmount: 208.0,
    costTotal: 900.0,
    grossProfit: 308.0,
    profitMarginPercent: '25.5',
    paymentMethod: 'Cash Counter (POS)',
    paymentStatus: 'Partial Dues',
    billType: 'pakka',
    channel: 'POS Counter 01',
    channelType: 'offline',
    fulfillment: 'Completed (Handover)',
    awb: 'POS-WALK-IN',
    date: '2026-10-21 01:20 PM',
    items: [
      { productId: 'PRD-104', name: 'Pure Desi Cow Ghee 1L Tin', qty: 1, price: 650.0, costPrice: 520.0, gst: '12%', hsn: '0405', unit: 'tin', batchNo: 'BAT-2026-G42', expiryDate: '2027-03-10' },
      { productId: 'PRD-103', name: 'Royal Basmati Rice 5kg Aged Pack', qty: 1, price: 480.0, costPrice: 380.0, gst: '0%', hsn: '1006', unit: 'pack', batchNo: 'BAT-2026-R09', expiryDate: '2028-07-31' }
    ]
  },
  {
    id: 'ORD-2026-9039',
    customerName: 'Gaurav Kulkarni',
    phone: '+91 99200 44102',
    city: 'Pune, MH',
    itemsCount: 1,
    subtotal: 1499.0,
    gstTotal: 228.66,
    total: 1499.0,
    paidAmount: 1499.0,
    duesAmount: 0.0,
    costTotal: 850.0,
    grossProfit: 649.0,
    profitMarginPercent: '43.3',
    paymentMethod: 'Razorpay Cards',
    paymentStatus: 'Paid',
    billType: 'pakka',
    channel: 'Storefront Online',
    channelType: 'online',
    fulfillment: 'NimbusPost In-Transit',
    awb: 'NP-4481092811',
    date: '2026-10-20 06:15 PM',
    items: [
      { productId: 'PRD-105', name: 'True Wireless Stereo Earbuds v5.3', qty: 1, price: 1499.0, costPrice: 850.0, gst: '18%', hsn: '8518', unit: 'pcs', batchNo: 'ALP-TWS-01', expiryDate: '2028-12-31' }
    ]
  },
  {
    id: 'ORD-2026-9038',
    customerName: 'Rajesh Meena',
    phone: '+91 94140 22910',
    city: 'Jaipur, RJ',
    itemsCount: 1,
    subtotal: 1699.0,
    gstTotal: 0.0,
    total: 1699.0,
    paidAmount: 1000.0,
    duesAmount: 699.0,
    costTotal: 850.0,
    grossProfit: 849.0,
    profitMarginPercent: '50.0',
    paymentMethod: 'Cash Counter (POS)',
    paymentStatus: 'Partial Dues',
    billType: 'kachha',
    channel: 'POS Counter 01',
    channelType: 'offline',
    fulfillment: 'Completed (Handover)',
    awb: 'POS-WALK-IN',
    date: '2026-10-20 03:10 PM',
    items: [
      { productId: 'PRD-108', name: 'Handcrafted Festive Linen Kurta (L)', qty: 1, price: 1699.0, costPrice: 850.0, gst: '0%', hsn: '6205', unit: 'pcs', batchNo: 'KT-2026-09', expiryDate: '' }
    ]
  }
];

export const INITIAL_SUPPLIERS = [
  {
    id: 'SUP-101',
    name: 'Raymond Textiles & Garments Ltd',
    contactPerson: 'Sanjay Kapoor',
    phone: '+91 98201 55678',
    email: 'b2b@raymondapparel.com',
    gstin: '27AAACR1290M1ZP',
    city: 'Bhiwandi, Maharashtra',
    category: 'Fabrics & Apparel',
    balancePayable: 42500.0,
    status: 'Active',
    repaymentHistory: [
      { id: 'SPAY-01', date: '2026-10-15', amount: 15000.0, paymentMode: 'Bank Transfer / NEFT', refNumber: 'NEFT-8891024', note: 'Advance against Diwali fabric order', remainingBalance: 42500.0 }
    ]
  },
  {
    id: 'SUP-102',
    name: 'ITC Agri & Foods Distribution',
    contactPerson: 'Manoj Bajpai',
    phone: '+91 99340 77123',
    email: 'supply@itcagri.in',
    gstin: '19AAACI2210K1ZV',
    city: 'Kolkata, WB',
    category: 'Grains, Ghee & Agro',
    balancePayable: 18200.0,
    status: 'Active',
    repaymentHistory: []
  },
  {
    id: 'SUP-103',
    name: 'Alpha Gadgets & Wireless Importers',
    contactPerson: 'Nitin Singhania',
    phone: '+91 98110 33490',
    email: 'sales@alphagadgets.co.in',
    gstin: '07AAACA9910J1ZU',
    city: 'Nehru Place, New Delhi',
    category: 'TWS & Fast Chargers',
    balancePayable: 65400.0,
    status: 'Active',
    repaymentHistory: []
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-801',
    name: 'Vikramaditya Rathore',
    mobile: '+91 98290 11234',
    email: 'vikram.rathore@outlook.com',
    city: 'Jaipur, RJ',
    totalOrders: 14,
    lifetimeSpend: 42800.0,
    loyaltyPoints: 428,
    gstin: '08ABCDE1234F1Z5',
    category: 'B2B Wholesale',
    balanceDue: 2400.0,
    repaymentHistory: [
      { id: 'CPAY-01', date: '2026-10-18', amount: 5000.0, paymentMode: 'PhonePe UPI', refNumber: 'UPI-9920141', note: 'Partial dues clearance', remainingDue: 2400.0 }
    ]
  },
  {
    id: 'CUST-802',
    name: 'Ananya Deshmukh',
    mobile: '+91 97412 88451',
    email: 'ananya.d@gmail.com',
    city: 'Mumbai, MH',
    totalOrders: 6,
    lifetimeSpend: 9450.0,
    loyaltyPoints: 94,
    gstin: 'N/A',
    category: 'Retail Walk-in',
    balanceDue: 208.0,
    repaymentHistory: []
  },
  {
    id: 'CUST-803',
    name: 'Gaurav Kulkarni',
    mobile: '+91 99200 44102',
    email: 'gaurav.k@tcs.com',
    city: 'Pune, MH',
    totalOrders: 4,
    lifetimeSpend: 7850.0,
    loyaltyPoints: 78,
    gstin: 'N/A',
    category: 'Online Direct',
    balanceDue: 0.0,
    repaymentHistory: []
  },
  {
    id: 'CUST-804',
    name: 'Rajesh Meena',
    mobile: '+91 94140 22910',
    email: 'rajesh.meena@gmail.com',
    city: 'Jaipur, RJ',
    totalOrders: 2,
    lifetimeSpend: 3100.0,
    loyaltyPoints: 31,
    gstin: 'N/A',
    category: 'Retail Walk-in',
    balanceDue: 699.0,
    repaymentHistory: []
  }
];

export const INITIAL_PURCHASE_BILLS = [
  {
    id: 'PB-2026-101',
    billNumber: 'INV-RAY-8841',
    supplierId: 'SUP-101',
    supplierName: 'Raymond Textiles & Garments Ltd',
    supplierPhone: '+91 98201 55678',
    billDate: '2026-10-18',
    billType: 'pakka',
    subtotal: 42500.0,
    gstTotal: 2125.0,
    total: 44625.0,
    paidAmount: 35000.0,
    duesAmount: 9625.0,
    paymentMode: 'Bank Transfer / NEFT',
    status: 'Payment Due',
    notes: 'Inward shipment received at Main Branch store room',
    items: [
      { productId: 'PRD-101', name: 'Premium Cotton Slim Fit Shirt', batchNo: 'RAY-SH-2026', expiryDate: '2029-10-31', qty: 50, unit: 'pcs', purchasePrice: 650.0, mrp: 1999.0, sellingPrice: 1299.0, gstRate: 5, amount: 32500.0 },
      { productId: 'PRD-102', name: 'Dark Indigo Stretch Denim Jeans', batchNo: 'RAY-JN-902', expiryDate: '', qty: 10, unit: 'pcs', purchasePrice: 950.0, mrp: 2499.0, sellingPrice: 1899.0, gstRate: 12, amount: 9500.0 }
    ]
  },
  {
    id: 'PB-2026-102',
    billNumber: 'ITC-AGR-4019',
    supplierId: 'SUP-102',
    supplierName: 'ITC Agri & Foods Distribution',
    supplierPhone: '+91 99340 77123',
    billDate: '2026-10-14',
    billType: 'pakka',
    subtotal: 18200.0,
    gstTotal: 910.0,
    total: 19110.0,
    paidAmount: 19110.0,
    duesAmount: 0.0,
    paymentMode: 'PhonePe UPI',
    status: 'Inward Completed',
    notes: 'Organic Dairy & Grains delivery verified with weigh scale',
    items: [
      { productId: 'PRD-104', name: 'Pure Desi Cow Ghee 1L Tin', batchNo: 'BAT-2026-G42', expiryDate: '2027-03-10', qty: 25, unit: 'tin', purchasePrice: 520.0, mrp: 720.0, sellingPrice: 650.0, gstRate: 12, amount: 13000.0 }
    ]
  },
  {
    id: 'PB-2026-103',
    billNumber: 'ALP-ELEC-771',
    supplierId: 'SUP-103',
    supplierName: 'Alpha Gadgets & Wireless Importers',
    supplierPhone: '+91 98110 33490',
    billDate: '2026-10-10',
    billType: 'kachha',
    subtotal: 65400.0,
    gstTotal: 0.0,
    total: 65400.0,
    paidAmount: 40000.0,
    duesAmount: 25400.0,
    paymentMode: 'Cash',
    status: 'Payment Due',
    notes: 'Direct import lot from Delhi electronic hub',
    items: [
      { productId: 'PRD-105', name: 'True Wireless Stereo Earbuds v5.3', batchNo: 'ALP-TWS-01', expiryDate: '2028-12-31', qty: 40, unit: 'pcs', purchasePrice: 850.0, mrp: 2999.0, sellingPrice: 1499.0, gstRate: 18, amount: 34000.0 }
    ]
  }
];

export const INITIAL_BRANCHES = [
  { id: 'BR-01', name: 'Main Branch (Downtown)', code: 'HQ-MAIN', city: 'Jaipur', type: 'Retail Store + POS', skus: 142, activeTill: 'POS-01 (Online)' },
  { id: 'BR-02', name: 'Outlet #2 (Mall Road)', code: 'OUT-MALL', city: 'Jaipur', type: 'Retail Store + POS', skus: 98, activeTill: 'POS-02 (Online)' },
  { id: 'BR-03', name: 'Central Warehouse & Hub', code: 'WH-CENTRAL', city: 'Sanganer', type: 'Central Fulfillment', skus: 210, activeTill: 'No Till (Dispatches Only)' }
];

export const INITIAL_COUPONS = [
  {
    id: 'CPN-101',
    code: 'WELCOME10',
    title: 'New Customer Welcome 10% OFF',
    description: 'Get 10% instant discount up to ₹300 on orders above ₹499',
    discountType: 'percentage', // 'percentage' | 'flat'
    discountValue: 10,
    maxDiscountAmount: 300,
    minOrderAmount: 499,
    expiryDate: '2028-12-31',
    usageLimit: 500,
    usedCount: 24,
    isActive: true
  },
  {
    id: 'CPN-102',
    code: 'FLAT200',
    title: 'Flat ₹200 Super Saver',
    description: 'Flat ₹200 OFF on high-value cart orders above ₹1,499',
    discountType: 'flat',
    discountValue: 200,
    maxDiscountAmount: 200,
    minOrderAmount: 1499,
    expiryDate: '2028-12-31',
    usageLimit: 250,
    usedCount: 42,
    isActive: true
  },
  {
    id: 'CPN-103',
    code: 'FESTIVE25',
    title: 'Festive Season 25% Mega OFF',
    description: '25% discount up to ₹750 on festival shopping above ₹1,999',
    discountType: 'percentage',
    discountValue: 25,
    maxDiscountAmount: 750,
    minOrderAmount: 1999,
    expiryDate: '2028-11-30',
    usageLimit: 1000,
    usedCount: 110,
    isActive: true
  }
];

export const INITIAL_LEADS = [
  {
    id: 'LD-101',
    clientName: 'Apex Infotech Solutions',
    contactPerson: 'Rahul Mehta',
    phone: '9829011223',
    email: 'purchase@apexinfo.com',
    city: 'Jaipur, RJ',
    source: 'Website Inquiry',
    status: 'Proposal Sent',
    expectedValue: 85000,
    notes: 'Inquiry for 100 sets of corporate slim shirts & indigo denim for annual employee kits.',
    nextFollowUpDate: '2026-11-05',
    nextFollowUpTime: '11:30',
    createdAt: '2026-10-22',
    followUps: [
      {
        id: 'FLP-1',
        date: '2026-10-24 10:30 AM',
        remarks: 'Spoke with Mr. Mehta. Shared catalog PDF & requested sample fabric swatches.',
        nextAction: 'Send formal quotation with 5% corporate discount.',
        recordedBy: 'Ramesh Verma'
      }
    ]
  },
  {
    id: 'LD-102',
    clientName: 'Sharma Wedding Events',
    contactPerson: 'Sunil Sharma',
    phone: '9414022334',
    email: 'sharma.sunil@gmail.com',
    city: 'Jaipur, RJ',
    source: 'Walk-in Store',
    status: 'Follow-up Scheduled',
    expectedValue: 42000,
    notes: 'Family sangeet matching Kurtas (15 pcs) and Anarkali suits (8 pcs).',
    nextFollowUpDate: '2026-11-02',
    nextFollowUpTime: '16:00',
    createdAt: '2026-10-26',
    followUps: [
      {
        id: 'FLP-2',
        date: '2026-10-27 05:00 PM',
        remarks: 'Client visited showroom, selected Handcrafted Kurta design, requested estimate.',
        nextAction: 'Finalize measurements and share quotation.',
        recordedBy: 'Priya Sharma'
      }
    ]
  },
  {
    id: 'LD-103',
    clientName: "St. Xavier's Athletic Club",
    contactPerson: 'Coach Joseph',
    phone: '9828133445',
    email: 'sports@xaviers.edu',
    city: 'Jaipur, RJ',
    source: 'Referral',
    status: 'New Lead',
    expectedValue: 65000,
    notes: '250 pcs Polo T-Shirts for annual sports meet.',
    nextFollowUpDate: '2026-11-04',
    nextFollowUpTime: '10:00',
    createdAt: '2026-10-30',
    followUps: []
  }
];

export const INITIAL_QUOTATIONS = [
  {
    id: 'QTN-2026-001',
    quotationNumber: 'QTN-2026-001',
    leadId: 'LD-101',
    customerName: 'Apex Infotech Solutions',
    contactPerson: 'Rahul Mehta',
    phone: '9829011223',
    email: 'purchase@apexinfo.com',
    address: 'E-42, Malviya Industrial Area',
    city: 'Jaipur, RJ',
    date: '2026-10-25',
    validUntil: '2026-11-20',
    billType: 'pakka',
    channelType: 'offline',
    items: [
      {
        productId: 'PRD-101',
        name: 'Premium Cotton Slim Fit Shirt',
        sku: 'FSH-SHIRT-01',
        hsn: '6205',
        qty: 50,
        price: 1150,
        costPrice: 650,
        gstRate: 5,
        unit: 'pcs'
      },
      {
        productId: 'PRD-102',
        name: 'Dark Indigo Stretch Denim Jeans',
        sku: 'FSH-JEANS-01',
        hsn: '6203',
        qty: 20,
        price: 1750,
        costPrice: 950,
        gstRate: 12,
        unit: 'pcs'
      }
    ],
    subtotal: 92500,
    discount: 2500,
    taxTotal: 4975,
    grandTotal: 94975,
    terms: '1. 100% payment upon delivery or approved credit terms. 2. Price includes GST & transit packaging. 3. Valid for 30 days.',
    status: 'Sent',
    convertedInvoiceId: null,
    convertedAt: null,
    createdAt: '2026-10-25'
  },
  {
    id: 'QTN-2026-002',
    quotationNumber: 'QTN-2026-002',
    leadId: null,
    customerName: 'Rajputana Heritage Club',
    contactPerson: 'Col. R. S. Rathore',
    phone: '9829144556',
    email: 'club@rajputana.org',
    address: 'Civil Lines, Jaipur',
    city: 'Jaipur, RJ',
    date: '2026-10-18',
    validUntil: '2026-11-10',
    billType: 'pakka',
    channelType: 'offline',
    items: [
      {
        productId: 'PRD-101',
        name: 'Premium Cotton Slim Fit Shirt',
        sku: 'FSH-SHIRT-01',
        hsn: '6205',
        qty: 30,
        price: 1200,
        costPrice: 650,
        gstRate: 5,
        unit: 'pcs'
      }
    ],
    subtotal: 36000,
    discount: 1000,
    taxTotal: 1750,
    grandTotal: 36750,
    terms: '1. Net 15 days payment credit. 2. Standard manufacturer warranty applies.',
    status: 'Bill Generated',
    convertedInvoiceId: 'ORD-2026-1022-01',
    convertedAt: '2026-10-22, 11:45 AM',
    createdAt: '2026-10-18'
  }
];

// ============================================================================
// GRANULAR ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION CATALOG
// Every menu, route, and in-page action (print, dues, courier, status, bill, etc.)
// ============================================================================
export const PERMISSION_MODULES = [
  {
    moduleId: 'overview',
    moduleName: 'Dashboard & Financials',
    permissions: [
      { key: 'overview.dashboard', label: 'View ERP Dashboard', description: 'Access main dashboard KPI stats, sales counters, and live widgets' },
      { key: 'overview.profit_loss', label: 'View Profit & Loss (P&L)', description: 'Inspect real-time revenue, COGS, expenses, and net profit statement' },
      { key: 'overview.print_pnl', label: 'Print P&L Statement', description: 'Export and print audit-ready P&L financial document' }
    ]
  },
  {
    moduleId: 'catalog',
    moduleName: 'Products & Master Catalog',
    permissions: [
      { key: 'catalog.view_products', label: 'View Products Catalog', description: 'Browse and search master product inventory catalog' },
      { key: 'catalog.create_product', label: '+ Add New Product', description: 'Create and add new product SKU, barcodes, and pricing' },
      { key: 'catalog.edit_product', label: 'Edit Product Details', description: 'Modify selling prices, MRP, HSN, and GST rates' },
      { key: 'catalog.delete_product', label: 'Delete Product', description: 'Remove products from the active store catalog' },
      { key: 'catalog.categories_setup', label: 'Categories & Shipping Setup', description: 'Configure 3-tier categories, sizes, colors, and shipping rules' },
      { key: 'catalog.barcode_desk', label: 'Barcode Print Desk', description: 'Generate barcode labels and print sticker sheets' }
    ]
  },
  {
    moduleId: 'inventory',
    moduleName: 'Inventory & Stock Control',
    permissions: [
      { key: 'inventory.view_stock', label: 'View Multi-Branch Stock', description: 'Inspect branch-wise available inventory stock' },
      { key: 'inventory.adjust_stock', label: 'Stock Adjustments (In/Out)', description: 'Perform manual inventory corrections and discrepancy adjustments' },
      { key: 'inventory.low_stock_alerts', label: 'Low Stock Alerts', description: 'Monitor reorder level thresholds and restock alerts' }
    ]
  },
  {
    moduleId: 'sales',
    moduleName: 'Sales & POS Billing',
    permissions: [
      { key: 'sales.pos_billing', label: '+ POS Fast Billing Counter', description: 'Punch sales bills, barcode scan items, and collect counter payments' },
      { key: 'sales.view_orders', label: 'View Orders & Receipts', description: 'Access order history and sales transaction ledger' },
      { key: 'sales.view_gst_invoices', label: 'View GST Tax Invoices', description: 'Inspect B2B and B2C GST compliant invoices' },
      { key: 'sales.print_invoice', label: 'Print Invoices & Receipts', description: 'Print Thermal POS slips, standard A4 invoices, and dot matrix rolls' },
      { key: 'sales.manage_coupons', label: 'Manage Discount Coupons', description: 'Create, edit, and activate discount promo codes' },
      { key: 'sales.courier_post', label: 'Courier Post & Dispatch', description: 'Post orders to Shiprocket with parcel dimensions and weight' },
      { key: 'sales.track_shipment', label: 'Live Shipment Tracking & Cron', description: 'Fetch live transit status milestones and control sync cron' },
      { key: 'sales.eway_bill', label: 'E-Way Bill Generation', description: 'Access NIC E-Way Bill portal and generate transport IRN' }
    ]
  },
  {
    moduleId: 'crm',
    moduleName: 'Customers & CRM Quotations',
    permissions: [
      { key: 'crm.view_customers', label: 'View Customer Directory', description: 'Access customer profiles, purchase history, and contact list' },
      { key: 'crm.repay_dues', label: 'Collect / Repay Customer Dues', description: 'Accept customer udhaar balance repayments and update dues ledger' },
      { key: 'crm.manage_leads', label: 'Leads & Follow-up Desk', description: 'Generate leads, log client call remarks, and schedule follow-ups' },
      { key: 'crm.view_quotations', label: 'View Quotations & Estimates', description: 'Browse and inspect proforma price quotations' },
      { key: 'crm.create_quotation', label: '+ Create / Edit Quotation', description: 'Draft new quotations with product line items and discounts' },
      { key: 'crm.quotation_convert', label: 'Confirm Quotation to Final Bill', description: 'Convert accepted quotation into real order with auto stock deduction' },
      { key: 'crm.print_quotation', label: 'Print Proforma Quotation', description: 'Generate and print client quotation estimate PDF' }
    ]
  },
  {
    moduleId: 'purchase',
    moduleName: 'Suppliers & Purchase (Inward)',
    permissions: [
      { key: 'purchase.view_suppliers', label: 'View Supplier Directory', description: 'Inspect onboarded vendors and trade creditor accounts' },
      { key: 'purchase.create_supplier', label: '+ Onboard New Supplier', description: 'Register new vendor profile, GSTIN, and payment terms' },
      { key: 'purchase.repay_dues', label: 'Settle / Repay Supplier Dues', description: 'Record payment vouchers against outstanding supplier dues' },
      { key: 'purchase.view_bills', label: 'View Purchase Invoices', description: 'Browse inward purchase invoices and supplier bills' },
      { key: 'purchase.create_bill', label: '+ Create Inward Purchase Bill', description: 'Log purchase bill and automatically increment product inventory stock' }
    ]
  },
  {
    moduleId: 'hrm',
    moduleName: 'Human Resource (HRM) & Payroll',
    permissions: [
      { key: 'hrm.view_employees', label: 'View Staff & Employees', description: 'Browse store staff directory and role assignments' },
      { key: 'hrm.manage_employees', label: 'Onboard & Edit Employees', description: 'Define salary structures (Basic, HRA, PF/ESI) and bank details' },
      { key: 'hrm.delete_employee', label: 'Remove Employee Profile', description: 'Deactivate and delete employee accounts' },
      { key: 'hrm.attendance_punch', label: 'Punch & Mark Daily Attendance', description: 'Record daily staff in/out timings, present, half-day, and leave' },
      { key: 'hrm.manage_leaves', label: 'Manage Leave Applications', description: 'Apply and approve or reject staff leave requests' },
      { key: 'hrm.view_payroll', label: 'View Monthly Payroll Sheet', description: 'Access monthly wage computation and payout status' },
      { key: 'hrm.salary_pay', label: 'Disburse Salary (Auto Expense)', description: 'Pay employee wages with UTR and auto-log to company expenses' },
      { key: 'hrm.print_payslip', label: 'Print Staff Payslip', description: 'Generate and print formal salary payslip vouchers' }
    ]
  },
  {
    moduleId: 'expenses',
    moduleName: 'Business Expense Management',
    permissions: [
      { key: 'expenses.view', label: 'View Business Expense Ledger', description: 'Inspect store overhead vouchers and category expenditures' },
      { key: 'expenses.create', label: '+ Record New Expense', description: 'Add new expense voucher (Rent, Electricity, Tea, Marketing, etc.)' },
      { key: 'expenses.edit_delete', label: 'Edit & Delete Expenses', description: 'Modify or remove recorded expense vouchers' }
    ]
  },
  {
    moduleId: 'settings',
    moduleName: 'Integrations & Store Config',
    permissions: [
      { key: 'settings.payment_gateways', label: 'Configure Payment Gateways', description: 'Manage PhonePe, Razorpay, Cashfree API credentials' },
      { key: 'settings.courier_logistics', label: 'Configure Courier Providers', description: 'Manage Shiprocket, NimbusPost, iThink credentials' },
      { key: 'settings.store_config', label: 'Store Settings & Branding', description: 'Update store address, GSTIN, invoice logos, and policies' }
    ]
  },
  {
    moduleId: 'roles_permissions',
    moduleName: 'Roles & Access Control (RBAC)',
    permissions: [
      { key: 'roles.manage', label: 'Manage Roles & Permissions', description: 'Create custom roles, edit role permissions, and assign staff' },
      { key: 'roles.user_custom_permissions', label: 'Customize User Specific Permissions', description: 'Assign extra permissions or overrides to individual employees' }
    ]
  }
];

export const ALL_PERMISSION_KEYS = PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.key));

export const INITIAL_ROLES = [
  {
    id: 'role-superadmin',
    name: 'Super Admin',
    description: 'Unrestricted full administrative access across all ERP operations and settings',
    isSystem: true,
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200',
    permissions: ['*']
  },
  {
    id: 'role-manager',
    name: 'Store Manager',
    description: 'Complete operational management: sales, catalog, stock, CRM, staff attendance & overhead expenses',
    isSystem: false,
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200',
    permissions: [
      'overview.dashboard',
      'overview.profit_loss',
      'overview.print_pnl',
      'catalog.view_products',
      'catalog.create_product',
      'catalog.edit_product',
      'catalog.categories_setup',
      'catalog.barcode_desk',
      'inventory.view_stock',
      'inventory.adjust_stock',
      'inventory.low_stock_alerts',
      'sales.pos_billing',
      'sales.view_orders',
      'sales.view_gst_invoices',
      'sales.print_invoice',
      'sales.manage_coupons',
      'sales.courier_post',
      'sales.track_shipment',
      'sales.eway_bill',
      'crm.view_customers',
      'crm.repay_dues',
      'crm.manage_leads',
      'crm.view_quotations',
      'crm.create_quotation',
      'crm.quotation_convert',
      'crm.print_quotation',
      'purchase.view_suppliers',
      'purchase.create_supplier',
      'purchase.repay_dues',
      'purchase.view_bills',
      'purchase.create_bill',
      'hrm.view_employees',
      'hrm.attendance_punch',
      'hrm.manage_leaves',
      'expenses.view',
      'expenses.create'
    ]
  },
  {
    id: 'role-cashier',
    name: 'POS Cashier & Billing',
    description: 'Front-desk POS counter fast billing, invoice printing, customer dues collection, and attendance punch',
    isSystem: false,
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
    permissions: [
      'overview.dashboard',
      'catalog.view_products',
      'sales.pos_billing',
      'sales.view_orders',
      'sales.print_invoice',
      'sales.manage_coupons',
      'crm.view_customers',
      'crm.repay_dues',
      'hrm.attendance_punch'
    ]
  },
  {
    id: 'role-inventory',
    name: 'Warehouse & Stock Clerk',
    description: 'Stock inward/outward inspection, barcode printing, low stock alerts, courier packaging and dispatch tracking',
    isSystem: false,
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200',
    permissions: [
      'catalog.view_products',
      'catalog.barcode_desk',
      'inventory.view_stock',
      'inventory.adjust_stock',
      'inventory.low_stock_alerts',
      'sales.courier_post',
      'sales.track_shipment',
      'purchase.view_bills',
      'purchase.create_bill',
      'hrm.attendance_punch'
    ]
  },
  {
    id: 'role-accountant',
    name: 'Chief Accountant',
    description: 'Financial ledger audits, GST tax invoicing, customer/supplier dues settlements, payroll payouts, and P&L statements',
    isSystem: false,
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200',
    permissions: [
      'overview.dashboard',
      'overview.profit_loss',
      'overview.print_pnl',
      'sales.view_orders',
      'sales.view_gst_invoices',
      'sales.print_invoice',
      'crm.view_customers',
      'crm.repay_dues',
      'purchase.view_suppliers',
      'purchase.repay_dues',
      'purchase.view_bills',
      'hrm.view_employees',
      'hrm.view_payroll',
      'hrm.salary_pay',
      'hrm.print_payslip',
      'expenses.view',
      'expenses.create',
      'expenses.edit_delete'
    ]
  },
  {
    id: 'role-sales',
    name: 'Sales & CRM Representative',
    description: 'Customer inquiries, lead follow-ups, quotation creation, and POS counter billing',
    isSystem: false,
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200',
    permissions: [
      'overview.dashboard',
      'catalog.view_products',
      'sales.pos_billing',
      'sales.view_orders',
      'crm.view_customers',
      'crm.manage_leads',
      'crm.view_quotations',
      'crm.create_quotation',
      'hrm.attendance_punch'
    ]
  }
];

export const INITIAL_EMPLOYEES = [
  {
    id: 'EMP-101',
    name: 'Ramesh Verma',
    designation: 'Store Manager & Head of Sales',
    department: 'Operations',
    roleId: 'role-manager',
    extraPermissions: [],
    phone: '9829044551',
    email: 'ramesh.verma@shoppy.in',
    joiningDate: '2023-01-15',
    basicSalary: 32000,
    hra: 8000,
    allowances: 4000,
    pfDeduction: 1800,
    esiDeduction: 1000,
    netSalary: 41200,
    status: 'Active',
    bankName: 'HDFC Bank',
    accountNo: '5010049281923',
    ifsc: 'HDFC0001234',
    panNo: 'ABCDE1234F',
    aadhaarNo: '4928-1923-8192',
    address: 'Mansarovar, Jaipur, RJ'
  },
  {
    id: 'EMP-102',
    name: 'Priya Sharma',
    designation: 'Senior POS Cashier & Billing',
    department: 'Accounts',
    roleId: 'role-cashier',
    extraPermissions: ['crm.view_quotations', 'sales.courier_post'],
    phone: '9829044552',
    email: 'priya.sharma@shoppy.in',
    joiningDate: '2023-08-01',
    basicSalary: 20000,
    hra: 4000,
    allowances: 2000,
    pfDeduction: 1200,
    esiDeduction: 600,
    netSalary: 24200,
    status: 'Active',
    bankName: 'State Bank of India',
    accountNo: '30918293812',
    ifsc: 'SBIN0004567',
    panNo: 'PQXYZ9876K',
    aadhaarNo: '8192-3847-1928',
    address: 'Vaishali Nagar, Jaipur, RJ'
  },
  {
    id: 'EMP-103',
    name: 'Vikram Rathore',
    designation: 'Warehouse & Logistics Executive',
    department: 'Inventory',
    roleId: 'role-inventory',
    extraPermissions: [],
    phone: '9829044553',
    email: 'vikram.rathore@shoppy.in',
    joiningDate: '2024-03-10',
    basicSalary: 18000,
    hra: 3000,
    allowances: 1500,
    pfDeduction: 1000,
    esiDeduction: 500,
    netSalary: 21000,
    status: 'Active',
    bankName: 'ICICI Bank',
    accountNo: '002301928371',
    ifsc: 'ICIC0000023',
    panNo: 'RSTUV5678L',
    aadhaarNo: '1029-4829-5719',
    address: 'C-Scheme, Jaipur, RJ'
  },
  {
    id: 'EMP-104',
    name: 'Mohan Lal',
    designation: 'Master Tailor & Alterations Head',
    department: 'Production',
    roleId: 'role-sales',
    extraPermissions: [],
    phone: '9829044554',
    email: 'mohan.lal@shoppy.in',
    joiningDate: '2024-06-15',
    basicSalary: 16000,
    hra: 2500,
    allowances: 1000,
    pfDeduction: 800,
    esiDeduction: 400,
    netSalary: 18300,
    status: 'Active',
    bankName: 'Punjab National Bank',
    accountNo: '182938472918',
    ifsc: 'PUNB0123456',
    panNo: 'DEFGH4321M',
    aadhaarNo: '9381-0294-8172',
    address: 'Sanganer, Jaipur, RJ'
  }
];

export const INITIAL_ATTENDANCE = [
  { id: 'ATT-1', date: '2026-10-31', employeeId: 'EMP-101', employeeName: 'Ramesh Verma', status: 'Present', inTime: '09:15 AM', outTime: '07:45 PM', shift: 'General Store Shift', notes: 'On-time' },
  { id: 'ATT-2', date: '2026-10-31', employeeId: 'EMP-102', employeeName: 'Priya Sharma', status: 'Present', inTime: '09:25 AM', outTime: '07:30 PM', shift: 'Billing Register Shift', notes: 'Counter 1' },
  { id: 'ATT-3', date: '2026-10-31', employeeId: 'EMP-103', employeeName: 'Vikram Rathore', status: 'Present', inTime: '09:00 AM', outTime: '07:00 PM', shift: 'Warehouse Shift', notes: 'Stock inward inspection' },
  { id: 'ATT-4', date: '2026-10-31', employeeId: 'EMP-104', employeeName: 'Mohan Lal', status: 'Half Day', inTime: '09:30 AM', outTime: '02:00 PM', shift: 'Tailoring Shift', notes: 'Personal doctor appointment' }
];

export const INITIAL_LEAVES = [
  {
    id: 'LV-101',
    employeeId: 'EMP-104',
    employeeName: 'Mohan Lal',
    leaveType: 'Casual Leave',
    fromDate: '2026-11-06',
    toDate: '2026-11-07',
    days: 2,
    reason: 'Family wedding ceremony out of town.',
    status: 'Approved',
    approvedBy: 'Ramesh Verma (Manager)',
    appliedOn: '2026-10-28'
  },
  {
    id: 'LV-102',
    employeeId: 'EMP-102',
    employeeName: 'Priya Sharma',
    leaveType: 'Sick Leave',
    fromDate: '2026-11-10',
    toDate: '2026-11-10',
    days: 1,
    reason: 'Medical checkup.',
    status: 'Pending',
    approvedBy: '',
    appliedOn: '2026-10-30'
  }
];

export const INITIAL_PAYROLL = [
  {
    id: 'PAY-2026-09-01',
    employeeId: 'EMP-101',
    employeeName: 'Ramesh Verma',
    month: 'September',
    year: '2026',
    basicSalary: 32000,
    hra: 8000,
    allowances: 4000,
    bonus: 2000,
    deductions: 2800,
    netSalary: 43200,
    paidAmount: 43200,
    paidDate: '2026-10-01',
    paymentMode: 'Bank Transfer (NEFT)',
    refNumber: 'NEFT-HDFC-991823-SAL',
    status: 'Paid',
    notes: 'September 2026 Salary with festive sales bonus'
  },
  {
    id: 'PAY-2026-09-02',
    employeeId: 'EMP-102',
    employeeName: 'Priya Sharma',
    month: 'September',
    year: '2026',
    basicSalary: 20000,
    hra: 4000,
    allowances: 2000,
    bonus: 0,
    deductions: 1800,
    netSalary: 24200,
    paidAmount: 24200,
    paidDate: '2026-10-01',
    paymentMode: 'Bank Transfer (NEFT)',
    refNumber: 'NEFT-SBI-481928-SAL',
    status: 'Paid',
    notes: 'September 2026 Salary'
  }
];

export const INITIAL_EXPENSES = [
  {
    id: 'EXP-2026-01',
    date: '2026-10-01',
    category: 'Shop Rent',
    amount: 45000,
    paymentMode: 'Bank Transfer (NEFT)',
    refNumber: 'NEFT-HDFC-991823',
    paidTo: 'Jaipur Commercial Properties Ltd',
    description: 'Main showroom retail space rent for October 2026',
    receiptNo: 'RENT-OCT-2026-01'
  },
  {
    id: 'EXP-2026-02',
    date: '2026-10-05',
    category: 'Electricity & Utilities',
    amount: 8450,
    paymentMode: 'PhonePe / UPI',
    refNumber: 'UPI-429182749102',
    paidTo: 'JVVNL (Jaipur Vidyut Vitran Nigam)',
    description: 'Monthly electricity bill for air conditioning & showroom lighting',
    receiptNo: 'JVVNL-KNO-81928'
  },
  {
    id: 'EXP-2026-03',
    date: '2026-10-10',
    category: 'Packaging & Bags',
    amount: 4200,
    paymentMode: 'Cash',
    refNumber: 'CASH-REC-102',
    paidTo: 'Shree Ganesh Packaging House',
    description: '500 pcs branded shopping bags and courier packing boxes',
    receiptNo: 'BILL-SGP-912'
  },
  {
    id: 'EXP-2026-04',
    date: '2026-10-14',
    category: 'Tea & Refreshments',
    amount: 1850,
    paymentMode: 'Cash',
    refNumber: 'CASH-REC-108',
    paidTo: 'Sharma Ji Chai & Refreshments',
    description: 'Bi-weekly chai, biscuits & water cans for staff and retail clients',
    receiptNo: 'VCH-TEA-41'
  },
  {
    id: 'EXP-2026-05',
    date: '2026-10-18',
    category: 'Marketing & Promotions',
    amount: 6500,
    paymentMode: 'PhonePe / UPI',
    refNumber: 'UPI-428172635190',
    paidTo: 'Meta Ads & Local Leaflet Distribution',
    description: 'Festive season Instagram campaign & local newspaper flyer insert',
    receiptNo: 'ADV-META-192'
  },
  {
    id: 'EXP-2026-06',
    date: '2026-10-22',
    category: 'Staff Salary & Wages',
    amount: 41200,
    paymentMode: 'Bank Transfer (NEFT)',
    refNumber: 'NEFT-SAL-EMP101',
    paidTo: 'Ramesh Verma',
    description: 'Salary Payout for Ramesh Verma (October 2026)',
    receiptNo: 'VOUCHER-PAY-2026-09-01'
  }
];

export function ErpProvider({ children }) {
  const shopCode = document.getElementById('root')?.dataset?.shopCode || 'SHP-A4IFYK';

  // 3-Tier Hierarchy Categories, Sizes, Colors & Shipping Rules
  const [topCategories, setTopCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_top_categories');
      return stored ? JSON.parse(stored) : INITIAL_TOP_CATEGORIES;
    } catch (e) {
      return INITIAL_TOP_CATEGORIES;
    }
  });

  const [midCategories, setMidCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_mid_categories');
      return stored ? JSON.parse(stored) : INITIAL_MID_CATEGORIES;
    } catch (e) {
      return INITIAL_MID_CATEGORIES;
    }
  });

  const [endCategories, setEndCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_end_categories');
      return stored ? JSON.parse(stored) : INITIAL_END_CATEGORIES;
    } catch (e) {
      return INITIAL_END_CATEGORIES;
    }
  });

  const [sizes, setSizes] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_sizes');
      return stored ? JSON.parse(stored) : INITIAL_SIZES;
    } catch (e) {
      return INITIAL_SIZES;
    }
  });

  const [colors, setColors] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_colors');
      return stored ? JSON.parse(stored) : INITIAL_COLORS;
    } catch (e) {
      return INITIAL_COLORS;
    }
  });

  const [shippingRules, setShippingRules] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_shipping_rules');
      return stored ? JSON.parse(stored) : INITIAL_SHIPPING_RULES;
    } catch (e) {
      return INITIAL_SHIPPING_RULES;
    }
  });

  const addTopCategory = (cat) => {
    const newCat = { ...cat, id: cat.id || `TOP-${Date.now().toString().slice(-4)}` };
    setTopCategories((prev) => [newCat, ...prev]);
    showToast(`Top Category "${cat.name}" added`);
  };
  const updateTopCategory = (id, updated) => {
    setTopCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('Top Category updated');
  };
  const deleteTopCategory = (id) => {
    setTopCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Top Category deleted');
  };

  const addMidCategory = (cat) => {
    const newCat = { ...cat, id: cat.id || `MID-${Date.now().toString().slice(-4)}` };
    setMidCategories((prev) => [newCat, ...prev]);
    showToast(`Mid Category "${cat.name}" added`);
  };
  const updateMidCategory = (id, updated) => {
    setMidCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('Mid Category updated');
  };
  const deleteMidCategory = (id) => {
    setMidCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Mid Category deleted');
  };

  const addEndCategory = (cat) => {
    const newCat = { ...cat, id: cat.id || `END-${Date.now().toString().slice(-4)}` };
    setEndCategories((prev) => [newCat, ...prev]);
    showToast(`End Category "${cat.name}" added`);
  };
  const updateEndCategory = (id, updated) => {
    setEndCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('End Category updated');
  };
  const deleteEndCategory = (id) => {
    setEndCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('End Category deleted');
  };

  const addSize = (sz) => {
    const newSz = { ...sz, id: sz.id || `sz-${Date.now().toString().slice(-4)}` };
    setSizes((prev) => [...prev, newSz]);
    showToast(`Size "${sz.label}" added`);
  };
  const deleteSize = (id) => {
    setSizes((prev) => prev.filter((s) => s.id !== id));
    showToast('Size option removed');
  };

  const addColor = (clr) => {
    const newClr = { ...clr, id: clr.id || `clr-${Date.now().toString().slice(-4)}` };
    setColors((prev) => [...prev, newClr]);
    showToast(`Color "${clr.name}" added`);
  };
  const deleteColor = (id) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
    showToast('Color option removed');
  };

  const updateShippingRules = (rules) => {
    setShippingRules(rules);
    try {
      localStorage.setItem('shoppy_shipping_rules', JSON.stringify(rules));
    } catch (e) {}
    showToast('Shipping & courier policies updated');
  };

  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_products_v3');
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_orders_v3');
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch (e) {
      return INITIAL_ORDERS;
    }
  });

  const [coupons, setCoupons] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_coupons');
      return stored ? JSON.parse(stored) : INITIAL_COUPONS;
    } catch (e) {
      return INITIAL_COUPONS;
    }
  });

  const [suppliers, setSuppliers] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_suppliers');
      return stored ? JSON.parse(stored) : INITIAL_SUPPLIERS;
    } catch (e) {
      return INITIAL_SUPPLIERS;
    }
  });

  const [customers, setCustomers] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_customers');
      return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
    } catch (e) {
      return INITIAL_CUSTOMERS;
    }
  });

  const [purchaseBills, setPurchaseBills] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_purchase_bills');
      return stored ? JSON.parse(stored) : INITIAL_PURCHASE_BILLS;
    } catch (e) {
      return INITIAL_PURCHASE_BILLS;
    }
  });

  const [branches, setBranches] = useState(INITIAL_BRANCHES);

  // CRM State
  const [leads, setLeads] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_crm_leads');
      return stored ? JSON.parse(stored) : INITIAL_LEADS;
    } catch (e) {
      return INITIAL_LEADS;
    }
  });

  const [quotations, setQuotations] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_crm_quotations');
      return stored ? JSON.parse(stored) : INITIAL_QUOTATIONS;
    } catch (e) {
      return INITIAL_QUOTATIONS;
    }
  });

  // HRM State
  const [employees, setEmployees] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_hrm_employees');
      return stored ? JSON.parse(stored) : INITIAL_EMPLOYEES;
    } catch (e) {
      return INITIAL_EMPLOYEES;
    }
  });

  const [attendance, setAttendance] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_hrm_attendance');
      return stored ? JSON.parse(stored) : INITIAL_ATTENDANCE;
    } catch (e) {
      return INITIAL_ATTENDANCE;
    }
  });

  const [leaves, setLeaves] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_hrm_leaves');
      return stored ? JSON.parse(stored) : INITIAL_LEAVES;
    } catch (e) {
      return INITIAL_LEAVES;
    }
  });

  const [payroll, setPayroll] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_hrm_payroll');
      return stored ? JSON.parse(stored) : INITIAL_PAYROLL;
    } catch (e) {
      return INITIAL_PAYROLL;
    }
  });

  // Expenses State
  const [expenses, setExpenses] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_expenses');
      return stored ? JSON.parse(stored) : INITIAL_EXPENSES;
    } catch (e) {
      return INITIAL_EXPENSES;
    }
  });

  // Roles & Permissions (RBAC) State
  const [roles, setRoles] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_rbac_roles');
      return stored ? JSON.parse(stored) : INITIAL_ROLES;
    } catch (e) {
      return INITIAL_ROLES;
    }
  });

  // Store Branding & Identity Settings
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const savedData = localStorage.getItem('shoppy_store_branding_data');
      if (savedData) return JSON.parse(savedData);
      const savedBranding = localStorage.getItem('shoppy_store_branding');
      if (savedBranding) {
        const parsed = JSON.parse(savedBranding);
        return {
          store_name: parsed.storeName || 'Ramesh Fashion Store',
          owner_name: parsed.ownerName || 'Ramesh Sundaram',
          meta_title: parsed.tagline || 'Retail & Multi-Tenant SaaS',
          contact_phone: parsed.phone || '+91 98290 12345',
          gst_number: parsed.gstin || '08AABCR1290M1Z5',
          theme_color: parsed.themeColor || '#00a2c7',
          footer_copyright: parsed.footerNote || '© 2026 Ramesh Fashion Store. All Rights Reserved. Powered by Shoppy ERP.'
        };
      }
    } catch (e) {}
    return {
      store_name: 'Ramesh Fashion Store',
      owner_name: 'Ramesh Sundaram',
      meta_title: 'Retail & Multi-Tenant SaaS',
      contact_phone: '+91 98290 12345',
      gst_number: '08AABCR1290M1Z5',
      theme_color: '#00a2c7',
      footer_copyright: '© 2026 Ramesh Fashion Store. All Rights Reserved. Powered by Shoppy ERP.'
    };
  });

  const updateStoreSettings = (newSettings) => {
    setStoreSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('shoppy_store_branding_data', JSON.stringify(updated));
        localStorage.setItem('shoppy_store_branding', JSON.stringify({
          storeName: updated.store_name || updated.storeName || 'Ramesh Fashion Store',
          tagline: updated.meta_title || updated.tagline || 'Retail & Multi-Tenant SaaS',
          ownerName: updated.owner_name || updated.ownerName || 'Ramesh Sundaram',
          phone: updated.contact_phone || updated.phone || '+91 98290 12345',
          gstin: updated.gst_number || updated.gstin || '08AABCR1290M1Z5',
          themeColor: updated.theme_color || updated.themeColor || '#00a2c7',
          footerNote: updated.footer_copyright || updated.footerNote || ''
        }));
      } catch (e) {}
      return updated;
    });
  };

  const storeName = storeSettings.store_name || storeSettings.storeName || 'Ramesh Fashion Store';

  // Modal States for I-Card, Profile and Password
  const [isICardOpen, setIsICardOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Active User / Switchable Employee Persona
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_active_user');
      return stored
        ? JSON.parse(stored)
        : {
            id: 'usr-admin',
            name: 'Ramesh Sundaram (Owner)',
            roleId: 'role-superadmin',
            roleName: 'Super Admin',
            isSuperAdmin: true,
            extraPermissions: [],
            email: 'admin@rameshfashion.com',
            phone: '9829012345',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            designation: 'Store Owner & General Manager',
            department: 'Operations',
            bloodGroup: 'B+',
            joiningDate: '2023-01-15',
            address: 'Shop #14-16, Fashion Plaza, Main M.I. Road, Jaipur, Rajasthan',
            emergencyContact: {
              name: 'Suresh Sundaram',
              phone: '+91 98290 99887'
            }
          };
    } catch (e) {
      return {
        id: 'usr-admin',
        name: 'Ramesh Sundaram (Owner)',
        roleId: 'role-superadmin',
        roleName: 'Super Admin',
        isSuperAdmin: true,
        extraPermissions: [],
        email: 'admin@rameshfashion.com',
        phone: '9829012345',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        designation: 'Store Owner & General Manager',
        department: 'Operations',
        bloodGroup: 'B+',
        joiningDate: '2023-01-15',
        address: 'Shop #14-16, Fashion Plaza, Main M.I. Road, Jaipur, Rajasthan',
        emergencyContact: {
          name: 'Suresh Sundaram',
          phone: '+91 98290 99887'
        }
      };
    }
  });

  // Update Current User Profile
  const updateCurrentUserProfile = (updatedData) => {
    setCurrentUser((prev) => {
      const merged = { ...prev, ...updatedData };
      try {
        localStorage.setItem('shoppy_active_user', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });

    // Also sync with employees list if matched
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === updatedData.id || emp.id === currentUser?.id) {
          return {
            ...emp,
            name: updatedData.name || emp.name,
            phone: updatedData.phone || emp.phone,
            email: updatedData.email || emp.email,
            avatar: updatedData.avatar || emp.avatar,
            designation: updatedData.designation || emp.designation,
            department: updatedData.department || emp.department,
            bloodGroup: updatedData.bloodGroup || emp.bloodGroup,
            address: updatedData.address || emp.address,
            emergencyContact: updatedData.emergencyContact || emp.emergencyContact
          };
        }
        return emp;
      })
    );
    showToast('Your profile details updated successfully!');
  };

  // Change Password Handler
  const changeUserPassword = (currentPassword, newPassword) => {
    try {
      const securityInfo = {
        lastChangedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || 'User',
        userId: currentUser?.id || 'usr-admin'
      };
      localStorage.setItem('shoppy_user_security', JSON.stringify(securityInfo));
    } catch (e) {}
    showToast('Password changed successfully! Keep your new credentials safe.');
    return { success: true };
  };

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('shoppy_products_v3', JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_orders_v3', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_suppliers', JSON.stringify(suppliers));
    } catch (e) {}
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_customers', JSON.stringify(customers));
    } catch (e) {}
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_purchase_bills', JSON.stringify(purchaseBills));
    } catch (e) {}
  }, [purchaseBills]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_coupons', JSON.stringify(coupons));
    } catch (e) {}
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_crm_leads', JSON.stringify(leads));
    } catch (e) {}
  }, [leads]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_crm_quotations', JSON.stringify(quotations));
    } catch (e) {}
  }, [quotations]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_hrm_employees', JSON.stringify(employees));
    } catch (e) {}
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_hrm_attendance', JSON.stringify(attendance));
    } catch (e) {}
  }, [attendance]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_hrm_leaves', JSON.stringify(leaves));
    } catch (e) {}
  }, [leaves]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_hrm_payroll', JSON.stringify(payroll));
    } catch (e) {}
  }, [payroll]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_expenses', JSON.stringify(expenses));
    } catch (e) {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_rbac_roles', JSON.stringify(roles));
    } catch (e) {}
  }, [roles]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_active_user', JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_top_categories', JSON.stringify(topCategories));
    } catch (e) {}
  }, [topCategories]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_mid_categories', JSON.stringify(midCategories));
    } catch (e) {}
  }, [midCategories]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_end_categories', JSON.stringify(endCategories));
    } catch (e) {}
  }, [endCategories]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_sizes', JSON.stringify(sizes));
    } catch (e) {}
  }, [sizes]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_colors', JSON.stringify(colors));
    } catch (e) {}
  }, [colors]);

  const markCouponAsUsed = (couponCode) => {
    if (!couponCode) return;
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.code.toUpperCase() === couponCode.toUpperCase()) {
          const newUsed = (c.usedCount || 0) + 1;
          return {
            ...c,
            usedCount: newUsed,
            status: c.usageLimit && newUsed >= c.usageLimit ? 'Exhausted' : c.status
          };
        }
        return c;
      })
    );
  };

  const hasPermission = (permissionKey) => {
    if (!permissionKey) return true;
    if (currentUser?.isSuperAdmin) return true;
    const userRole = (roles || []).find((r) => r.id === currentUser?.roleId);
    const rolePermissions = userRole?.permissions || [];
    if (rolePermissions.includes('*') || rolePermissions.includes(permissionKey)) {
      return true;
    }
    const extra = currentUser?.extraPermissions || [];
    return extra.includes(permissionKey);
  };

  const [gateways, setGateways] = useState([
    { gateway_code: 'phonepe', display_name: 'PhonePe PG (UPI & Cards)', is_active: true, is_test_mode: false, has_credentials: true },
    { gateway_code: 'payu', display_name: 'PayU Money & Enterprise', is_active: false, is_test_mode: true, has_credentials: false },
    { gateway_code: 'cashfree', display_name: 'Cashfree Payments & Subscriptions', is_active: true, is_test_mode: true, has_credentials: true },
    { gateway_code: 'easebuzz', display_name: 'Easebuzz Smart Checkout', is_active: false, is_test_mode: true, has_credentials: false },
    { gateway_code: 'razorpay', display_name: 'Razorpay Standard Checkout', is_active: true, is_test_mode: false, has_credentials: true }
  ]);

  const [shippingProviders, setShippingProviders] = useState([
    { provider_code: 'shiprocket', display_name: 'Shiprocket Multi-Carrier', is_active: true, pickup_pincode: '302001' },
    { provider_code: 'ithink', display_name: 'iThink Logistics Express', is_active: true, pickup_pincode: '302001' },
    { provider_code: 'nimbuspost', display_name: 'NimbusPost Smart Automation', is_active: true, pickup_pincode: '302001' },
    { provider_code: 'shipmozo', display_name: 'Shipmozo Aggregator', is_active: false, pickup_pincode: '302001' },
    { provider_code: 'shipway', display_name: 'Shipway Live Tracking', is_active: false, pickup_pincode: '302001' }
  ]);

  const [fallbackPolicy, setFallbackPolicy] = useState({
    has_active_online_gateway: true,
    active_checkout_mode: 'Online Gateways Active + COD Enabled'
  });

  const [shiftData, setShiftData] = useState({
    shiftId: 'SHT-2026-1021-01',
    cashier: 'Ramesh Verma (Store Manager)',
    openedAt: '2026-10-21 09:00 AM',
    openingFloat: 2500.0,
    cashSales: 18450.0,
    upiSales: 24300.0,
    cardSales: 5500.0,
    pettyCashOut: 450.0,
    expectedCashInDrawer: 20500.0,
    actualPhysicalCash: 20500.0
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_erp_theme');
      if (stored) return stored === 'dark';
      const cookieMatch = document.cookie.match(/(?:^|; )shoppy_erp_theme=([^;]*)/);
      return cookieMatch ? cookieMatch[1] === 'dark' : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('shoppy_erp_theme', 'dark');
        document.cookie = "shoppy_erp_theme=dark; path=/; max-age=31536000; SameSite=Lax";
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('shoppy_erp_theme', 'light');
        document.cookie = "shoppy_erp_theme=light; path=/; max-age=31536000; SameSite=Lax";
      }
    } catch (e) {}
  }, [isDarkMode]);

  const [toastMessage, setToastMessage] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState(null);
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const addProduct = (prod) => {
    setProducts((prev) => [prod, ...prev]);
    showToast(`Product ${prod.name} added to catalog!`);
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed from catalog');
  };

  const addSupplier = (sup) => {
    setSuppliers((prev) => [sup, ...prev]);
    showToast(`Supplier ${sup.name} onboarded!`);
  };

  // 1. ADD INWARD PURCHASE BILL (AUTO-INCREMENTS PRODUCT STOCK & UPDATES SUPPLIER DUES)
  const addPurchaseBill = (billData) => {
    const newBill = {
      ...billData,
      id: billData.id || `PB-${Date.now().toString().slice(-6)}`,
      status: (billData.duesAmount || 0) > 0 ? 'Payment Due' : 'Inward Completed',
      createdAt: new Date().toISOString()
    };

    // Update purchase bills state
    setPurchaseBills((prev) => [newBill, ...prev]);

    // INVENTORY STOCK INCREMENT: Automatically add stock for all inward items!
    if (Array.isArray(billData.items) && billData.items.length > 0) {
      setProducts((prevProducts) => {
        return prevProducts.map((p) => {
          const matchingItem = billData.items.find(
            (it) => (it.productId && it.productId === p.id) || (it.name && it.name.trim().toLowerCase() === p.name.trim().toLowerCase())
          );
          if (matchingItem) {
            const addedQty = parseFloat(matchingItem.qty || 0);
            const newStock = (parseFloat(p.stock) || 0) + addedQty;
            return {
              ...p,
              stock: newStock,
              purchasePrice: matchingItem.purchasePrice ? parseFloat(matchingItem.purchasePrice) : p.purchasePrice,
              sellingPrice: matchingItem.sellingPrice ? parseFloat(matchingItem.sellingPrice) : p.sellingPrice,
              mrp: matchingItem.mrp ? parseFloat(matchingItem.mrp) : p.mrp,
              batchNo: matchingItem.batchNo || p.batchNo,
              expiryDate: matchingItem.expiryDate || p.expiryDate,
              status: newStock > 0 ? (newStock <= (p.reorderLevel || 10) ? 'Low Stock' : 'In Stock') : 'Out of Stock'
            };
          }
          return p;
        });
      });
    }

    // SUPPLIER DUES: If dues amount > 0, update supplier's balancePayable
    if (billData.duesAmount > 0) {
      setSuppliers((prevSuppliers) => {
        return prevSuppliers.map((s) => {
          if (s.id === billData.supplierId || s.phone === billData.supplierPhone || s.name === billData.supplierName) {
            return {
              ...s,
              balancePayable: (parseFloat(s.balancePayable) || 0) + parseFloat(billData.duesAmount)
            };
          }
          return s;
        });
      });
    }

    showToast(`Purchase Bill ${newBill.id} created! Stock added to inventory.`);
    return newBill;
  };

  // 2. RE-PAY SUPPLIER DUES (SETTLE DUES FOR SUPPLIERS)
  const repaySupplierDues = ({ supplierId, amount, paymentMode = 'Cash', note = '', refNumber = '' }) => {
    const payAmt = parseFloat(amount || 0);
    if (payAmt <= 0) return;

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const newBalance = Math.max(0, (parseFloat(s.balancePayable) || 0) - payAmt);
          const historyEntry = {
            id: `SPAY-${Date.now().toString().slice(-5)}`,
            date: new Date().toISOString().split('T')[0],
            amount: payAmt,
            paymentMode,
            refNumber,
            note,
            remainingBalance: newBalance
          };
          return {
            ...s,
            balancePayable: newBalance,
            repaymentHistory: [historyEntry, ...(s.repaymentHistory || [])]
          };
        }
        return s;
      })
    );

    showToast(`Payment of ₹${payAmt.toFixed(2)} to supplier recorded! Dues updated.`);
  };

  // 3. RE-PAY CUSTOMER DUES (COLLECT DUES FROM CUSTOMERS)
  const repayCustomerDues = ({ customerId, amount, paymentMode = 'Cash', note = '', refNumber = '' }) => {
    const payAmt = parseFloat(amount || 0);
    if (payAmt <= 0) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newDue = Math.max(0, (parseFloat(c.balanceDue) || 0) - payAmt);
          const historyEntry = {
            id: `CPAY-${Date.now().toString().slice(-5)}`,
            date: new Date().toISOString().split('T')[0],
            amount: payAmt,
            paymentMode,
            refNumber,
            note,
            remainingDue: newDue
          };
          return {
            ...c,
            balanceDue: newDue,
            repaymentHistory: [historyEntry, ...(c.repaymentHistory || [])]
          };
        }
        return c;
      })
    );

    showToast(`Collected ₹${payAmt.toFixed(2)} from customer! Dues updated.`);
  };

  // 4. CREATE SALE BILL / POS INVOICE (DEDUCTS STOCK, AUTO-ADDS CUSTOMER BY MOBILE, COMPUTES PROFIT/LOSS, OPENS PRINT MODAL)
  const createSaleBill = (billData) => {
    let costTotal = 0;
    const processedItems = (billData.items || []).map((it) => {
      const prod = products.find((p) => p.id === it.productId || p.name === it.name);
      const costPrice = it.costPrice !== undefined ? it.costPrice : (prod ? prod.purchasePrice : it.price * 0.7);
      const lineCost = costPrice * it.qty;
      const lineTotal = it.price * it.qty;
      const lineProfit = lineTotal - lineCost;
      costTotal += lineCost;
      return {
        ...it,
        costPrice,
        grossProfit: lineProfit,
        hsn: it.hsn || (prod ? prod.hsnCode : '6205'),
        unit: it.unit || (prod ? prod.unit : 'pcs'),
        batchNo: it.batchNo || (prod ? prod.batchNo : ''),
        expiryDate: it.expiryDate || (prod ? prod.expiryDate : '')
      };
    });

    const grandTotal = parseFloat(billData.total || billData.grandTotal || 0);
    const paidAmount = billData.paidAmount !== undefined ? parseFloat(billData.paidAmount) : grandTotal;
    const duesAmount = billData.duesAmount !== undefined ? parseFloat(billData.duesAmount) : Math.max(0, grandTotal - paidAmount);
    const grossProfit = grandTotal - costTotal;
    const profitMarginPercent = grandTotal > 0 ? ((grossProfit / grandTotal) * 100).toFixed(1) : '0.0';

    const newOrder = {
      id: billData.id || `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      customerName: billData.customerName || 'Walk-in Customer',
      phone: billData.phone || '9988776655',
      city: billData.city || 'Jaipur, RJ',
      itemsCount: processedItems.reduce((acc, i) => acc + (parseFloat(i.qty) || 0), 0),
      subtotal: parseFloat(billData.subtotal || grandTotal),
      gstTotal: parseFloat(billData.gstTotal || 0),
      total: grandTotal,
      paidAmount,
      duesAmount,
      paymentMethod: billData.paymentMethod || 'Cash Counter (POS)',
      paymentStatus: duesAmount > 0 ? (paidAmount > 0 ? 'Partial Dues' : 'Unpaid Dues') : 'Paid',
      billType: billData.billType || 'pakka', // 'pakka' (GST Tax Invoice) | 'kachha' (Estimate/Challan)
      channel: billData.channel || 'POS Counter 01',
      channelType: billData.channelType || 'offline', // 'offline' | 'online'
      couponCode: billData.couponCode || null,
      couponDiscount: parseFloat(billData.couponDiscount || 0),
      fulfillment: 'Completed (Handover)',
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      items: processedItems,
      costTotal,
      grossProfit,
      profitMarginPercent
    };

    // Save order
    setOrders((prev) => [newOrder, ...prev]);

    // REDEEM COUPON: If single-use or promo coupon was used, increment usedCount
    if (billData.couponCode) {
      markCouponAsUsed(billData.couponCode);
    }

    // INVENTORY DEDUCTION: Deduct sold quantity from product stock
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const soldItem = processedItems.find((it) => it.productId === p.id || it.name === p.name);
        if (soldItem) {
          const newStock = Math.max(0, (parseFloat(p.stock) || 0) - (parseFloat(soldItem.qty) || 0));
          return {
            ...p,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : (newStock <= (p.reorderLevel || 10) ? 'Low Stock' : 'In Stock')
          };
        }
        return p;
      });
    });

    // CUSTOMER AUTO-ADD / UPDATE: If customer exists, update stats; else create customer on the fly
    if (newOrder.phone) {
      setCustomers((prevCustomers) => {
        const cleanPhone = newOrder.phone.replace(/[^0-9]/g, '');
        const existingCust = prevCustomers.find((c) => (c.mobile || '').replace(/[^0-9]/g, '') === cleanPhone);
        if (existingCust) {
          return prevCustomers.map((c) => {
            if (c.id === existingCust.id) {
              return {
                ...c,
                totalOrders: (c.totalOrders || 0) + 1,
                lifetimeSpend: (c.lifetimeSpend || 0) + grandTotal,
                loyaltyPoints: (c.loyaltyPoints || 0) + Math.floor(grandTotal / 100),
                balanceDue: (parseFloat(c.balanceDue) || 0) + duesAmount
              };
            }
            return c;
          });
        } else {
          const newCustomerObj = {
            id: `CUST-${Date.now().toString().slice(-4)}`,
            name: newOrder.customerName || 'Walk-in Customer',
            mobile: newOrder.phone,
            email: `${cleanPhone}@customer.shoppy.in`,
            city: newOrder.city || 'Jaipur, RJ',
            totalOrders: 1,
            lifetimeSpend: grandTotal,
            loyaltyPoints: Math.floor(grandTotal / 100),
            gstin: 'N/A',
            category: 'Retail Walk-in',
            balanceDue: duesAmount,
            createdAt: new Date().toISOString(),
            repaymentHistory: []
          };
          return [newCustomerObj, ...prevCustomers];
        }
      });
    }

    // Auto-open print modal with the generated bill
    setSelectedInvoice(newOrder);

    showToast(`Bill ${newOrder.id} generated! Profit: ₹${grossProfit.toFixed(2)} (${profitMarginPercent}%)`);
    return newOrder;
  };

  const toggleGateway = (gw) => {
    setGateways((prev) => {
      const updated = prev.map((g) => (g.gateway_code === gw.gateway_code ? { ...g, is_active: !g.is_active } : g));
      const hasActive = updated.some((g) => g.is_active);
      setFallbackPolicy({
        has_active_online_gateway: hasActive,
        active_checkout_mode: hasActive ? 'Online Gateways Active + COD Enabled' : 'Default Fallback Mode: COD Only'
      });
      return updated;
    });
    showToast(`Gateway ${gw.display_name} ${!gw.is_active ? 'Activated' : 'Deactivated'}`);
  };

  const toggleShipping = (provider) => {
    setShippingProviders((prev) =>
      prev.map((p) => (p.provider_code === provider.provider_code ? { ...p, is_active: !p.is_active } : p))
    );
    showToast(`Courier ${provider.display_name} ${!provider.is_active ? 'Activated' : 'Deactivated'}`);
  };

  // ===== COUPON CRUD =====
  const addCoupon = (coupon) => {
    const newCoupon = { ...coupon, id: coupon.id || `CPN-${Date.now().toString().slice(-5)}`, usedCount: 0, createdAt: new Date().toISOString() };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Coupon "${coupon.code}" created!`);
  };

  const addBulkCoupons = (couponsArray) => {
    const newCoupons = couponsArray.map((c, i) => ({
      ...c,
      id: c.id || `CPN-${Date.now().toString().slice(-5)}-${i}`,
      usedCount: 0,
      createdAt: new Date().toISOString()
    }));
    setCoupons((prev) => [...newCoupons, ...prev]);
    showToast(`${newCoupons.length} coupons created in bulk!`);
  };

  const updateCoupon = (id, updated) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('Coupon updated');
  };

  const deleteCoupon = (id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Coupon deleted');
  };

  // ===== ORDER STATUS & SHIPPING =====
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, fulfillment: newStatus } : o)));
    showToast(`Order ${orderId} status → ${newStatus}`);
  };

  const dispatchCourierOrder = (orderId, courierData) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          fulfillment: 'Dispatched',
          courierProvider: courierData?.provider || 'Shiprocket',
          trackingId: courierData?.trackingId || `TRK-${Date.now().toString().slice(-6)}`,
          dispatchedAt: new Date().toISOString()
        };
      }
      return o;
    }));
    showToast(`Order ${orderId} dispatched via ${courierData?.provider || 'Shiprocket'}!`);
  };

  const fetchShipmentStatus = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    return {
      orderId,
      status: order?.fulfillment || 'Unknown',
      trackingId: order?.trackingId || null,
      provider: order?.courierProvider || null,
      lastUpdated: new Date().toISOString()
    };
  };

  const syncAllActiveShipments = () => {
    showToast('All active shipment statuses synced!');
  };

  // ===== CRM: LEADS =====
  const addLead = (lead) => {
    const newLead = { ...lead, id: lead.id || `LEAD-${Date.now().toString().slice(-5)}`, createdAt: new Date().toISOString(), followUps: [] };
    setLeads((prev) => [newLead, ...prev]);
    showToast(`Lead "${lead.name}" added!`);
  };

  const updateLead = (id, updated) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
    showToast('Lead updated');
  };

  const deleteLead = (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    showToast('Lead deleted');
  };

  const addLeadFollowUp = (leadId, followUp) => {
    setLeads((prev) => prev.map((l) => {
      if (l.id === leadId) {
        return { ...l, followUps: [{ ...followUp, id: `FU-${Date.now().toString().slice(-5)}`, createdAt: new Date().toISOString() }, ...(l.followUps || [])] };
      }
      return l;
    }));
    showToast('Follow-up added to lead');
  };

  // ===== CRM: QUOTATIONS =====
  const addQuotation = (quotation) => {
    const newQ = { ...quotation, id: quotation.id || `QTN-${Date.now().toString().slice(-5)}`, status: 'Draft', createdAt: new Date().toISOString() };
    setQuotations((prev) => [newQ, ...prev]);
    showToast(`Quotation ${newQ.id} created!`);
  };

  const updateQuotation = (id, updated) => {
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
    showToast('Quotation updated');
  };

  const deleteQuotation = (id) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
    showToast('Quotation deleted');
  };

  const convertQuotationToInvoice = (quotationId) => {
    const quotation = quotations.find((q) => q.id === quotationId);
    if (!quotation) return null;
    const billData = {
      customerName: quotation.customerName || 'Walk-in Customer',
      phone: quotation.phone || '',
      items: quotation.items || [],
      total: quotation.total || 0,
      subtotal: quotation.subtotal || quotation.total || 0,
      gstTotal: quotation.gstTotal || 0,
      paymentMethod: 'Cash Counter (POS)',
      channel: 'POS Counter 01',
      channelType: 'offline',
      billType: 'pakka'
    };
    const newOrder = createSaleBill(billData);
    setQuotations((prev) => prev.map((q) => (q.id === quotationId ? { ...q, status: 'Converted', convertedOrderId: newOrder.id } : q)));
    showToast(`Quotation ${quotationId} converted to Invoice ${newOrder.id}!`);
    return newOrder;
  };

  // ===== HRM: EMPLOYEES =====
  const addEmployee = (emp) => {
    const newEmp = { ...emp, id: emp.id || `EMP-${Date.now().toString().slice(-5)}`, createdAt: new Date().toISOString() };
    setEmployees((prev) => [newEmp, ...prev]);
    showToast(`Employee "${emp.name}" onboarded!`);
  };

  const updateEmployee = (id, updated) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    showToast('Employee details updated');
  };

  const deleteEmployee = (id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast('Employee removed');
  };

  // ===== HRM: ATTENDANCE =====
  const markAttendance = (record) => {
    const newRecord = { ...record, id: record.id || `ATT-${Date.now().toString().slice(-5)}`, markedAt: new Date().toISOString() };
    setAttendance((prev) => [newRecord, ...prev]);
  };

  const bulkMarkAttendance = (records) => {
    const newRecords = records.map((r, i) => ({ ...r, id: r.id || `ATT-${Date.now().toString().slice(-5)}-${i}`, markedAt: new Date().toISOString() }));
    setAttendance((prev) => [...newRecords, ...prev]);
    showToast(`Attendance marked for ${records.length} employees`);
  };

  // ===== HRM: LEAVES =====
  const applyLeave = (leave) => {
    const newLeave = { ...leave, id: leave.id || `LV-${Date.now().toString().slice(-5)}`, status: 'Pending', appliedAt: new Date().toISOString() };
    setLeaves((prev) => [newLeave, ...prev]);
    showToast('Leave application submitted');
  };

  const updateLeaveStatus = (id, status) => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    showToast(`Leave ${status.toLowerCase()}`);
  };

  // ===== HRM: PAYROLL =====
  const processSalaryPayment = (paymentData) => {
    const newPayment = { ...paymentData, id: paymentData.id || `PAY-${Date.now().toString().slice(-5)}`, processedAt: new Date().toISOString() };
    setPayroll((prev) => [newPayment, ...prev]);
    showToast(`Salary ₹${paymentData.amount || paymentData.netPay || 0} processed for ${paymentData.employeeName || 'Employee'}`);
  };

  // ===== EXPENSES =====
  const addExpense = (expense) => {
    const newExp = { ...expense, id: expense.id || `EXP-${Date.now().toString().slice(-5)}`, createdAt: new Date().toISOString() };
    setExpenses((prev) => [newExp, ...prev]);
    showToast(`Expense ₹${expense.amount} recorded`);
  };

  const updateExpense = (id, updated) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    showToast('Expense updated');
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense deleted');
  };

  // ===== ROLES & PERMISSIONS =====
  const addRole = (role) => {
    const newRole = { ...role, id: role.id || `role-${Date.now().toString().slice(-5)}`, createdAt: new Date().toISOString() };
    setRoles((prev) => [newRole, ...prev]);
    showToast(`Role "${role.name}" created!`);
  };

  const updateRole = (id, updated) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    showToast('Role updated');
  };

  const deleteRole = (id) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    showToast('Role deleted');
  };

  const assignEmployeeRoleAndPermissions = (employeeId, roleId, extraPermissions = []) => {
    setEmployees((prev) => prev.map((e) => {
      if (e.id === employeeId) {
        return { ...e, roleId, extraPermissions };
      }
      return e;
    }));
    showToast('Employee role & permissions updated');
  };

  const switchUser = (employee) => {
    const userObj = {
      id: employee.id,
      name: employee.name,
      roleId: employee.roleId || 'role-staff',
      roleName: (roles || []).find((r) => r.id === employee.roleId)?.name || 'Staff',
      isSuperAdmin: employee.roleId === 'role-superadmin',
      extraPermissions: employee.extraPermissions || [],
      email: employee.email || '',
      phone: employee.phone || '',
      avatar: employee.avatar || '',
      designation: employee.designation || '',
      department: employee.department || '',
      bloodGroup: employee.bloodGroup || '',
      joiningDate: employee.joiningDate || '',
      address: employee.address || '',
      emergencyContact: employee.emergencyContact || {}
    };
    setCurrentUser(userObj);
    try { localStorage.setItem('shoppy_active_user', JSON.stringify(userObj)); } catch (e) {}
    showToast(`Switched to ${employee.name}`);
  };

  // ===== REPORTS: PROFIT & LOSS ANALYTICS =====
  const getProfitLossAnalytics = (filteredOrders, filteredExpenses) => {
    const ordersData = filteredOrders || orders;
    const expensesData = filteredExpenses || expenses;

    const totalRevenue = ordersData.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalCost = ordersData.reduce((sum, o) => sum + (parseFloat(o.costTotal) || 0), 0);
    const totalExpenses = expensesData.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalPayroll = payroll.reduce((sum, p) => sum + (parseFloat(p.amount || p.netPay) || 0), 0);
    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit - totalExpenses - totalPayroll;

    return {
      totalRevenue,
      totalCost,
      grossProfit,
      totalExpenses,
      totalPayroll,
      netProfit,
      grossMargin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0',
      netMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0',
      totalOrders: ordersData.length,
      averageOrderValue: ordersData.length > 0 ? (totalRevenue / ordersData.length).toFixed(2) : '0.00'
    };
  };

  return (
    <ErpContext.Provider
      value={{
        // Core
        shopCode,
        storeName,

        // Products / Catalog
        products,
        setProducts,
        addProduct,
        deleteProduct,
        topCategories,
        setTopCategories,
        addTopCategory,
        updateTopCategory,
        deleteTopCategory,
        midCategories,
        setMidCategories,
        addMidCategory,
        updateMidCategory,
        deleteMidCategory,
        endCategories,
        setEndCategories,
        addEndCategory,
        updateEndCategory,
        deleteEndCategory,
        sizes,
        addSize,
        deleteSize,
        colors,
        addColor,
        deleteColor,
        shippingRules,
        updateShippingRules,

        // Orders / Sales
        orders,
        setOrders,
        createSaleBill,
        updateOrderStatus,
        dispatchCourierOrder,
        fetchShipmentStatus,
        syncAllActiveShipments,

        // Coupons
        coupons,
        addCoupon,
        addBulkCoupons,
        updateCoupon,
        deleteCoupon,

        // Suppliers / Purchase
        suppliers,
        setSuppliers,
        addSupplier,
        repaySupplierDues,
        purchaseBills,
        setPurchaseBills,
        addPurchaseBill,

        // Customers
        customers,
        setCustomers,
        repayCustomerDues,

        // CRM: Leads
        leads,
        addLead,
        updateLead,
        deleteLead,
        addLeadFollowUp,

        // CRM: Quotations
        quotations,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        convertQuotationToInvoice,

        // HRM: Employees
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,

        // HRM: Attendance
        attendance,
        markAttendance,
        bulkMarkAttendance,

        // HRM: Leaves
        leaves,
        applyLeave,
        updateLeaveStatus,

        // HRM: Payroll
        payroll,
        processSalaryPayment,

        // Expenses
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,

        // Reports
        getProfitLossAnalytics,

        // Roles & Permissions
        roles,
        addRole,
        updateRole,
        deleteRole,
        hasPermission,
        assignEmployeeRoleAndPermissions,

        // Current User
        currentUser,
        setCurrentUser,
        switchUser,
        updateCurrentUserProfile,
        changeUserPassword,

        // Store Settings
        storeSettings,
        updateStoreSettings,

        // Infrastructure
        branches,
        gateways,
        toggleGateway,
        shippingProviders,
        toggleShipping,
        fallbackPolicy,
        shiftData,

        // UI State
        isDarkMode,
        toggleDarkMode,
        toastMessage,
        showToast,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        selectedInvoice,
        setSelectedInvoice,
        selectedBarcodeProduct,
        setSelectedBarcodeProduct,
        isZReportOpen,
        setIsZReportOpen,
        isStockAdjustmentOpen,
        setIsStockAdjustmentOpen,
        isICardOpen,
        setIsICardOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isChangePasswordOpen,
        setIsChangePasswordOpen
      }}
    >
      {children}
    </ErpContext.Provider>
  );
}

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
}
