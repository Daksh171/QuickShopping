import mongoose from 'mongoose';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

// Load env manually for seed script
import dotenv from 'dotenv';
dotenv.config();

const categories = [
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', imageKey: 'categories/fruits-vegetables.webp' },
  { name: 'Dairy & Bakery', slug: 'dairy-bakery', imageKey: 'categories/dairy-bakery.webp' },
  { name: 'Snacks & Chips', slug: 'snacks-chips', imageKey: 'categories/snacks-chips.webp' },
  { name: 'Cold Drinks & Juices', slug: 'cold-drinks-juices', imageKey: 'categories/cold-drinks-juices.webp' },
  { name: 'Instant Food', slug: 'instant-food', imageKey: 'categories/instant-food.webp' },
  { name: 'Chocolates & Sweets', slug: 'chocolates-sweets', imageKey: 'categories/chocolates-sweets.webp' },
  { name: 'Tea & Coffee', slug: 'tea-coffee', imageKey: 'categories/tea-coffee.webp' },
  { name: 'Personal Care', slug: 'personal-care', imageKey: 'categories/personal-care.webp' },
  { name: 'Household Essentials', slug: 'household-essentials', imageKey: 'categories/household-essentials.webp' },
];

interface ProductSeed {
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageKey: string;
  packageSize: string;
  stock: number;
}

const products: ProductSeed[] = [
  // Fruits & Vegetables
  { categorySlug: 'fruits-vegetables', name: 'Fresh Bananas', slug: 'fresh-bananas', description: 'Farm-fresh ripe bananas, perfect for smoothies and snacking. Rich in potassium and natural energy.', price: 45, originalPrice: 55, imageKey: 'products/fresh-bananas.webp', packageSize: '1 dozen', stock: 100 },
  { categorySlug: 'fruits-vegetables', name: 'Red Tomatoes', slug: 'red-tomatoes', description: 'Vine-ripened red tomatoes, ideal for salads, curries, and sauces. Juicy and full of flavor.', price: 35, imageKey: 'products/red-tomatoes.webp', packageSize: '500 g', stock: 80 },
  { categorySlug: 'fruits-vegetables', name: 'Green Spinach', slug: 'green-spinach', description: 'Organic farm-fresh spinach leaves. Packed with iron and perfect for palak paneer or salads.', price: 30, imageKey: 'products/green-spinach.webp', packageSize: '250 g', stock: 60 },
  { categorySlug: 'fruits-vegetables', name: 'Shimla Apple', slug: 'shimla-apple', description: 'Crisp and juicy Shimla apples from Himachal Pradesh. Sweet, crunchy, and naturally delicious.', price: 180, originalPrice: 220, imageKey: 'products/shimla-apple.webp', packageSize: '1 kg', stock: 50 },

  // Dairy & Bakery
  { categorySlug: 'dairy-bakery', name: 'Amul Toned Milk', slug: 'amul-toned-milk', description: 'Fresh Amul toned milk, pasteurized and homogenized. Great for tea, coffee, and cooking.', price: 30, imageKey: 'products/amul-toned-milk.webp', packageSize: '500 ml', stock: 150 },
  { categorySlug: 'dairy-bakery', name: 'Amul Butter', slug: 'amul-butter', description: 'Creamy Amul butter made from fresh cream. Perfect for toast, parathas, and cooking.', price: 56, imageKey: 'products/amul-butter.webp', packageSize: '100 g', stock: 120 },
  { categorySlug: 'dairy-bakery', name: 'Britannia White Bread', slug: 'britannia-white-bread', description: 'Soft and fresh Britannia white bread. Ideal for sandwiches, toast, and breakfast.', price: 45, imageKey: 'products/britannia-white-bread.webp', packageSize: '400 g', stock: 90 },
  { categorySlug: 'dairy-bakery', name: 'Mother Dairy Paneer', slug: 'mother-dairy-paneer', description: 'Fresh, soft paneer made from pure cow milk. Perfect for curries, tikka, and snacks.', price: 90, originalPrice: 110, imageKey: 'products/mother-dairy-paneer.webp', packageSize: '200 g', stock: 70 },

  // Snacks & Chips
  { categorySlug: 'snacks-chips', name: "Lay's Classic Salted", slug: 'lays-classic-salted', description: "Crispy Lay's potato chips with classic salted flavor. The perfect snack for any occasion.", price: 20, imageKey: 'products/lays-classic-salted.webp', packageSize: '52 g', stock: 200 },
  { categorySlug: 'snacks-chips', name: 'Kurkure Masala Munch', slug: 'kurkure-masala-munch', description: 'Crunchy and spicy Kurkure with signature masala flavor. A beloved Indian snack.', price: 20, imageKey: 'products/kurkure-masala-munch.webp', packageSize: '75 g', stock: 180 },
  { categorySlug: 'snacks-chips', name: 'Haldiram Aloo Bhujia', slug: 'haldiram-aloo-bhujia', description: 'Traditional Haldiram aloo bhujia namkeen. Crispy, spicy, and perfect with tea.', price: 85, originalPrice: 99, imageKey: 'products/haldiram-aloo-bhujia.webp', packageSize: '200 g', stock: 100 },

  // Cold Drinks & Juices
  { categorySlug: 'cold-drinks-juices', name: 'Coca-Cola', slug: 'coca-cola', description: 'Refreshing Coca-Cola classic. Ice-cold happiness in every sip.', price: 40, imageKey: 'products/coca-cola.webp', packageSize: '750 ml', stock: 200 },
  { categorySlug: 'cold-drinks-juices', name: 'Tropicana Orange Juice', slug: 'tropicana-orange-juice', description: '100% pure squeezed orange juice by Tropicana. No added sugar, rich in Vitamin C.', price: 90, originalPrice: 110, imageKey: 'products/tropicana-orange-juice.webp', packageSize: '1 L', stock: 80 },
  { categorySlug: 'cold-drinks-juices', name: 'Paper Boat Aam Panna', slug: 'paper-boat-aam-panna', description: 'Refreshing raw mango drink by Paper Boat. Tangy, sweet, and perfect for summer.', price: 30, imageKey: 'products/paper-boat-aam-panna.webp', packageSize: '250 ml', stock: 120 },
  { categorySlug: 'cold-drinks-juices', name: 'Red Bull Energy Drink', slug: 'red-bull-energy-drink', description: 'Red Bull gives you wings. Premium energy drink with taurine and B-vitamins.', price: 125, imageKey: 'products/red-bull-energy-drink.webp', packageSize: '250 ml', stock: 90 },

  // Instant Food
  { categorySlug: 'instant-food', name: 'Maggi 2-Minute Noodles', slug: 'maggi-2-minute-noodles', description: 'India\'s favourite instant noodles. Ready in 2 minutes with the iconic masala taste.', price: 14, imageKey: 'products/maggi-2-minute-noodles.webp', packageSize: '70 g', stock: 300 },
  { categorySlug: 'instant-food', name: 'Knorr Tomato Soup', slug: 'knorr-tomato-soup', description: 'Rich and tangy instant tomato soup by Knorr. Just add hot water and enjoy.', price: 45, imageKey: 'products/knorr-tomato-soup.webp', packageSize: '53 g', stock: 100 },
  { categorySlug: 'instant-food', name: 'MTR Ready to Eat Rajma', slug: 'mtr-ready-to-eat-rajma', description: 'Authentic MTR rajma masala, ready to eat. Just heat and serve with rice or roti.', price: 85, originalPrice: 99, imageKey: 'products/mtr-rajma.webp', packageSize: '300 g', stock: 60 },

  // Chocolates & Sweets
  { categorySlug: 'chocolates-sweets', name: 'Cadbury Dairy Milk', slug: 'cadbury-dairy-milk', description: 'Rich and creamy Cadbury Dairy Milk chocolate. Made with a glass and a half of milk.', price: 50, imageKey: 'products/cadbury-dairy-milk.webp', packageSize: '50 g', stock: 200 },
  { categorySlug: 'chocolates-sweets', name: 'KitKat 4-Finger', slug: 'kitkat-4-finger', description: 'Have a break, have a KitKat. Crispy wafer fingers covered in smooth milk chocolate.', price: 40, imageKey: 'products/kitkat-4-finger.webp', packageSize: '37.3 g', stock: 180 },
  { categorySlug: 'chocolates-sweets', name: 'Haldiram Soan Papdi', slug: 'haldiram-soan-papdi', description: 'Traditional flaky Indian sweet by Haldiram. Light, airy, and melt-in-your-mouth.', price: 120, originalPrice: 150, imageKey: 'products/haldiram-soan-papdi.webp', packageSize: '250 g', stock: 50 },
  { categorySlug: 'chocolates-sweets', name: 'Ferrero Rocher (3 pcs)', slug: 'ferrero-rocher-3', description: 'Premium Ferrero Rocher chocolates. Crispy wafer shell, hazelnut center, and smooth filling.', price: 149, imageKey: 'products/ferrero-rocher.webp', packageSize: '37.5 g', stock: 70 },

  // Tea & Coffee
  { categorySlug: 'tea-coffee', name: 'Tata Tea Gold', slug: 'tata-tea-gold', description: 'Premium Tata Tea Gold blend with 15% long leaves. Rich aroma and perfect kadak chai.', price: 180, originalPrice: 210, imageKey: 'products/tata-tea-gold.webp', packageSize: '250 g', stock: 90 },
  { categorySlug: 'tea-coffee', name: 'Nescafé Classic Coffee', slug: 'nescafe-classic-coffee', description: 'Nescafé Classic instant coffee. Pure, aromatic, and ready in seconds.', price: 225, imageKey: 'products/nescafe-classic.webp', packageSize: '100 g', stock: 80 },
  { categorySlug: 'tea-coffee', name: 'Bru Instant Coffee', slug: 'bru-instant-coffee', description: 'Bru instant coffee with a smooth, rich taste. Perfect blend for your daily cup.', price: 160, originalPrice: 190, imageKey: 'products/bru-instant.webp', packageSize: '100 g', stock: 75 },

  // Personal Care
  { categorySlug: 'personal-care', name: 'Dove Soap Bar', slug: 'dove-soap-bar', description: 'Dove beauty bar with ¼ moisturizing cream. Gentle cleansing for softer, smoother skin.', price: 55, imageKey: 'products/dove-soap.webp', packageSize: '100 g', stock: 120 },
  { categorySlug: 'personal-care', name: 'Colgate MaxFresh', slug: 'colgate-maxfresh', description: 'Colgate MaxFresh toothpaste with cooling crystals. Fresh breath and cavity protection.', price: 85, originalPrice: 99, imageKey: 'products/colgate-maxfresh.webp', packageSize: '150 g', stock: 100 },
  { categorySlug: 'personal-care', name: 'Head & Shoulders Shampoo', slug: 'head-shoulders-shampoo', description: 'Head & Shoulders anti-dandruff shampoo. Clinically proven for flake-free scalp.', price: 200, imageKey: 'products/head-shoulders.webp', packageSize: '340 ml', stock: 60 },

  // Household Essentials
  { categorySlug: 'household-essentials', name: 'Vim Dishwash Gel', slug: 'vim-dishwash-gel', description: 'Vim dishwash liquid gel with lemon fragrance. Tough on grease, gentle on hands.', price: 99, originalPrice: 120, imageKey: 'products/vim-dishwash.webp', packageSize: '500 ml', stock: 80 },
  { categorySlug: 'household-essentials', name: 'Harpic Power Plus', slug: 'harpic-power-plus', description: 'Harpic Power Plus toilet cleaner. 10x better stain removal for a sparkling clean toilet.', price: 85, imageKey: 'products/harpic-power.webp', packageSize: '500 ml', stock: 70 },
  { categorySlug: 'household-essentials', name: 'Surf Excel Matic', slug: 'surf-excel-matic', description: 'Surf Excel Matic top load detergent. Tough stain removal designed for washing machines.', price: 299, originalPrice: 350, imageKey: 'products/surf-excel-matic.webp', packageSize: '1 kg', stock: 50 },
];

async function seed(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set. Create a .env file from .env.example');
    process.exit(1);
  }

  const mongoose = (await import('mongoose')).default;
  await mongoose.connect(uri, { dbName: 'quickbasket' });
  console.log('✅ Connected to MongoDB Atlas');

  // Upsert categories (safe to rerun)
  const categoryMap = new Map<string, mongoose.Types.ObjectId>();

  for (const cat of categories) {
    const result = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: cat },
      { upsert: true, new: true }
    );
    categoryMap.set(cat.slug, result._id);
    console.log(`  ✔ Category: ${cat.name}`);
  }

  // Upsert products (safe to rerun)
  for (const prod of products) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) {
      console.warn(`  ⚠ Skipping ${prod.name}: category ${prod.categorySlug} not found`);
      continue;
    }

    const { categorySlug: _categorySlug, ...productData } = prod;

    await Product.findOneAndUpdate(
      { slug: prod.slug },
      { $set: { ...productData, category: categoryId } },
      { upsert: true, new: true }
    );
    console.log(`  ✔ Product: ${prod.name}`);
  }

  console.log(`\n✅ Seeded ${categories.length} categories and ${products.length} products`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
