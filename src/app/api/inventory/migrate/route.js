import mongoose from "mongoose";
import { withRateLimit } from "../../../models/RateLimiter";

async function migrateInventory(req) {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    
    // Get the raw database connection
    const db = mongoose.connection.db;
    
    // Check if old inventory collection exists
    const collections = await db.listCollections().toArray();
    const oldCollectionExists = collections.some(col => col.name === 'inventories');
    const newCollectionExists = collections.some(col => col.name === 'inventories');
    
    console.log('Collections found:', collections.map(c => c.name));
    console.log('Old collection exists:', oldCollectionExists);
    console.log('New collection exists:', newCollectionExists);
    
    if (oldCollectionExists) {
      // Get old inventory data
      const oldInventory = await db.collection('inventories').find({}).toArray();
      console.log('Old inventory records found:', oldInventory.length);
      
      if (oldInventory.length > 0) {
        // Transform old data to new format
        const transformedData = oldInventory.map(item => ({
          name: item.name || 'Unknown',
          sku: item.sku || 'Unknown',
          family: item.family || 'Unknown',
          pn: item.pn || 'Unknown',
          sn: item.sn || '',
          quantity: item.quantity || 1,
          location: item.location || 'ISV',
          createtimestamp: item.createdAt || new Date(),
          updatetimestamp: item.updatedAt || new Date()
        }));
        
        // Insert transformed data into new collection
        if (transformedData.length > 0) {
          await db.collection('inventories').insertMany(transformedData);
          console.log('Migrated', transformedData.length, 'records to new schema');
        }
        
        // Optionally, you can drop the old collection
        // await db.collection('inventories').drop();
      }
    }
    
    return Response.json({ 
      message: 'Migration completed successfully',
      oldRecordsFound: oldCollectionExists ? 'Yes' : 'No',
      newCollectionExists: newCollectionExists
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return Response.json(
      { error: 'Migration failed: ' + error.message },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(migrateInventory, { limit: 10, windowMs: 60000 }); 