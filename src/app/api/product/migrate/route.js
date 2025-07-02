import mongoose from "mongoose";
import Product from "../../../models/Product";
import { withRateLimit } from "../../../models/RateLimiter";

async function migrateProducts(req) {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    
    // Get all products
    const products = await Product.find({});
    console.log('Found', products.length, 'products to migrate');
    
    let updatedCount = 0;
    
    // Update each product to add familyImgUrl field if it doesn't exist
    for (const product of products) {
      if (product.familyImgUrl === undefined) {
        // Set familyImgUrl to null/empty for existing products
        // This will make them fall back to using imgUrl on the product page
        await Product.findByIdAndUpdate(product._id, {
          $set: { familyImgUrl: '' }
        });
        updatedCount++;
      }
    }
    
    console.log('Updated', updatedCount, 'products with familyImgUrl field');
    
    return Response.json({ 
      message: 'Product migration completed successfully',
      totalProducts: products.length,
      updatedProducts: updatedCount
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return Response.json(
      { error: 'Migration failed: ' + error.message },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(migrateProducts, { limit: 10, windowMs: 60000 }); 