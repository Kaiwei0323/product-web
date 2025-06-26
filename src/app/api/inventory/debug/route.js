import mongoose from "mongoose";
import { withRateLimit } from "../../../models/RateLimiter";

async function debugInventory(req) {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    
    // Get the raw database connection
    const db = mongoose.connection.db;
    
    // Check all collections
    const collections = await db.listCollections().toArray();
    
    // Get sample data from inventories collection
    let sampleData = [];
    try {
      sampleData = await db.collection('inventories').find({}).limit(3).toArray();
    } catch (error) {
      console.log('Error reading inventories collection:', error.message);
    }
    
    // Check if there are any other inventory-related collections
    const inventoryCollections = collections.filter(col => 
      col.name.includes('inventory') || col.name.includes('stock')
    );
    
    return Response.json({
      collections: collections.map(c => c.name),
      inventoryCollections: inventoryCollections.map(c => c.name),
      sampleData: sampleData,
      sampleDataFields: sampleData.length > 0 ? Object.keys(sampleData[0]) : [],
      databaseName: db.databaseName
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return Response.json(
      { error: 'Debug failed: ' + error.message },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(debugInventory, { limit: 10, windowMs: 60000 }); 