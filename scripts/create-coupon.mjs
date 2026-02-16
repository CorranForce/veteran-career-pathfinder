#!/usr/bin/env node
/**
 * Script to create a Stripe coupon for the exit-intent 20% discount offer
 * Run with: node scripts/create-coupon.mjs
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function createExitIntentCoupon() {
  try {
    console.log('Creating 20% discount coupon for exit-intent offer...\n');

    const coupon = await stripe.coupons.create({
      percent_off: 20,
      duration: 'once',
      name: 'Exit Intent Special - 20% Off',
      max_redemptions: 1000, // Limit to 1000 uses
      metadata: {
        campaign: 'exit-intent-popup',
        created_by: 'pathfinder-script',
      },
    });

    console.log('✅ Coupon created successfully!\n');
    console.log('Coupon Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Coupon ID: ${coupon.id}`);
    console.log(`Discount: ${coupon.percent_off}% off`);
    console.log(`Duration: ${coupon.duration}`);
    console.log(`Max Redemptions: ${coupon.max_redemptions}`);
    console.log(`Times Redeemed: ${coupon.times_redeemed}`);
    console.log(`Valid: ${coupon.valid ? 'Yes' : 'No'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('💡 Usage Instructions:');
    console.log(`1. Add this coupon ID to your checkout flow: "${coupon.id}"`);
    console.log(`2. Update the pricing page to apply this coupon automatically`);
    console.log(`3. Original price: $29.00 → Discounted price: $23.20\n`);

    return coupon;
  } catch (error) {
    if (error.code === 'resource_already_exists') {
      console.error('❌ Error: A coupon with this ID already exists.');
      console.error('   You can either:');
      console.error('   1. Use the existing coupon');
      console.error('   2. Delete the old coupon and run this script again');
      console.error('   3. Modify the coupon ID in this script\n');
    } else {
      console.error('❌ Error creating coupon:', error.message);
    }
    process.exit(1);
  }
}

createExitIntentCoupon();
