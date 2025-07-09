import Inventory from "../../models/Inventory";
import Shipment from "../../models/Shipment";
import mongoose from "mongoose";
import { withRateLimit } from "../../models/RateLimiter";

async function getInventory(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grouped = searchParams.get('grouped');
    const location = searchParams.get('location');
    
    await mongoose.connect(process.env.MONGO_URL);
    
    // Try to get data using the new schema
    let inventory = [];
    try {
      let query = {};
      if (location) {
        query.location = location;
      }
      
      inventory = await Inventory.find(query).sort({ createtimestamp: -1 });
    } catch (error) {
      console.log('Error with new schema, trying to get raw data:', error.message);
      // If new schema fails, try to get raw data
      const db = mongoose.connection.db;
      let query = {};
      if (location) {
        query.location = location;
      }
      const rawData = await db.collection('inventories').find(query).toArray();
      
      // Transform old data to new format
      inventory = rawData.map(item => ({
        _id: item._id,
        name: item.name || 'Unknown',
        sku: item.sku || 'Unknown',
        family: item.family || 'Unknown',
        pn: item.pn || 'Unknown',
        sn: item.sn || '',
        quantity: item.quantity || 1,
        location: item.location || 'ISV',
        createtimestamp: item.createdAt || item.createtimestamp || new Date(),
        updatetimestamp: item.updatedAt || item.updatetimestamp || new Date()
      }));
    }
    
    // If grouped is requested, group by name and SKU
    if (grouped === 'true') {
      const groupedInventory = {};
      
      inventory.forEach(item => {
        const key = `${item.name}-${item.sku}`;
        if (!groupedInventory[key]) {
          groupedInventory[key] = {
            name: item.name,
            sku: item.sku,
            family: item.family,
            pn: item.pn,
            location: item.location,
            totalQuantity: 0,
            items: [],
            hasSerialNumbers: false,
            serialNumbers: []
          };
        }
        
        groupedInventory[key].totalQuantity += item.quantity;
        
        // Only add items with quantity > 0 to the items array for display
        if (item.quantity > 0) {
          groupedInventory[key].items.push(item);
          
          // Check if any items have serial numbers
          if (item.sn && item.sn.trim() !== '') {
            groupedInventory[key].hasSerialNumbers = true;
            groupedInventory[key].serialNumbers.push(item.sn);
          }
        }
      });
      
      // Convert to array, include all items (even with 0 quantity) and sort by total quantity (descending)
      const groupedArray = Object.values(groupedInventory)
        .sort((a, b) => b.totalQuantity - a.totalQuantity);
      
      return Response.json(groupedArray);
    }
    
    return Response.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return Response.json(
      { error: 'Failed to fetch inventory data' },
      { status: 500 }
    );
  }
}

async function createInventory(req) {
  try {
    const body = await req.json();
    console.log('Received request body:', body);
    
    // Validate required fields
    if (!body.name || !body.sku || !body.family || !body.pn || !body.location) {
      console.log('Missing required fields:', { 
        name: !!body.name, 
        sku: !!body.sku, 
        family: !!body.family,
        pn: !!body.pn,
        sn: !!body.sn, // Optional
        location: !!body.location 
      });
      return Response.json(
        { error: 'Missing required fields: name, sku, family, pn, and location are required' },
        { status: 400 }
      );
    }

    // Default quantity to 0 if not provided
    const quantity = body.quantity !== undefined ? parseInt(body.quantity) : 0;
    if (isNaN(quantity) || quantity < 0) {
      return Response.json(
        { error: 'Quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    // Validate serial numbers if provided
    if (body.serialNumbers && Array.isArray(body.serialNumbers)) {
      // Filter out empty or null serial numbers
      const validSerialNumbers = body.serialNumbers.filter(sn => sn && sn.trim() !== '');
      if (validSerialNumbers.length !== body.serialNumbers.length) {
        return Response.json(
          { error: 'Serial numbers cannot be empty or null' },
          { status: 400 }
        );
      }
    }

    await mongoose.connect(process.env.MONGO_URL);
    
    // Check if serial numbers are provided
    const hasSerialNumbers = body.serialNumbers && Array.isArray(body.serialNumbers) && body.serialNumbers.length > 0;
    
    if (hasSerialNumbers) {
      // Validate that number of serial numbers matches quantity
      if (body.serialNumbers.length !== quantity) {
        return Response.json(
          { error: `Number of serial numbers (${body.serialNumbers.length}) must match quantity (${quantity})` },
          { status: 400 }
        );
      }

      // Check for duplicate serial numbers
      const uniqueSerialNumbers = new Set(body.serialNumbers);
      if (uniqueSerialNumbers.size !== body.serialNumbers.length) {
        return Response.json(
          { error: 'Duplicate serial numbers are not allowed' },
          { status: 400 }
        );
      }

      // Check if any serial numbers already exist in inventory
      const existingSNs = await Inventory.find({
        sn: { $in: body.serialNumbers },
        name: body.name,
        sku: body.sku,
        pn: body.pn,
        location: body.location
      });

      // Check if any serial numbers are currently in active shipments
      const shippedSNs = [];
      try {
        const activeShipments = await Shipment.find({
          status: { $nin: ['canceled', 'delivered'] }
        });

        for (const shipment of activeShipments) {
          for (const item of shipment.inventory) {
            // Only check against actual serial numbers, not empty ones
            if (item.sn && item.sn.trim() !== '' && 
                body.serialNumbers.includes(item.sn) && 
                item.name === body.name && 
                item.sku === body.sku && 
                item.pn === body.pn) {
              shippedSNs.push(item.sn);
            }
          }
        }
      } catch (shipmentError) {
        console.error('Error checking shipments for serial numbers:', shipmentError);
        // Continue without shipment validation if there's an error
      }

      // Combine existing inventory SNs and shipped SNs
      const allExistingSNs = [
        ...existingSNs.map(item => item.sn),
        ...shippedSNs
      ];

      if (allExistingSNs.length > 0) {
        const existingSNList = [...new Set(allExistingSNs)].join(', ');
        return Response.json(
          { error: `Serial numbers already exist or are currently shipped: ${existingSNList}` },
          { status: 400 }
        );
      }

      // Create separate records for each item with its serial number
      const createdItems = [];
      for (let i = 0; i < quantity; i++) {
        const inventoryData = {
          name: body.name,
          sku: body.sku,
          family: body.family,
          pn: body.pn,
          sn: body.serialNumbers[i],
          quantity: 1, // Each record represents one item
          location: body.location
        };
        
        const createdInventory = await Inventory.create(inventoryData);
        createdItems.push(createdInventory);
      }
      
      console.log(`Created ${quantity} inventory items with serial numbers`);
      return Response.json(createdItems);
      
    } else {
      // No serial numbers provided - check if item with same specs already exists
      const existingItem = await Inventory.findOne({
        name: body.name,
        sku: body.sku,
        family: body.family,
        pn: body.pn,
        sn: '', // Empty serial number
        location: body.location
      });

      if (existingItem) {
        // Update quantity of existing item
        const updatedItem = await Inventory.findByIdAndUpdate(
          existingItem._id,
          { $inc: { quantity: quantity } },
          { new: true }
        );
        console.log('Updated existing inventory item:', updatedItem.toObject());
        return Response.json(updatedItem);
      } else {
        // Create new inventory item without serial numbers
        const inventoryData = {
          name: body.name,
          sku: body.sku,
          family: body.family,
          pn: body.pn,
          sn: '', // Empty serial number
          quantity: quantity,
          location: body.location
        };
        
        console.log('Creating new inventory with data:', inventoryData);
        
        const createdInventory = await Inventory.create(inventoryData);
        console.log('Created inventory item:', createdInventory.toObject());
        
        return Response.json(createdInventory);
      }
    }
  } catch (error) {
    console.error('Error creating inventory:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    if (error.code === 11000) {
      return Response.json(
        { error: 'A product with the same name, SKU, part number, serial number, and location already exists.' },
        { status: 400 }
      );
    }
    
    // Return more specific error message
    return Response.json(
      { error: `Failed to create inventory item: ${error.message}` },
      { status: 500 }
    );
  }
}

async function updateInventory(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return Response.json(
        { error: 'Inventory ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields for update
    if (!body.name || !body.sku || !body.family || !body.pn || !body.quantity || !body.location) {
      return Response.json(
        { error: 'Required fields are: name, sku, family, pn, quantity, and location' },
        { status: 400 }
      );
    }

    // Validate quantity
    const quantity = parseInt(body.quantity);
    if (isNaN(quantity) || quantity < 0) {
      return Response.json(
        { error: 'Quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    // For items with serial numbers, quantity must be at least 1
    if (body.sn && body.sn.trim() !== '' && quantity < 1) {
      return Response.json(
        { error: 'Quantity must be at least 1 for items with serial numbers' },
        { status: 400 }
      );
    }

    await mongoose.connect(process.env.MONGO_URL);
    
    // Get the current item to check if serial number is being changed
    const currentItem = await Inventory.findById(id);
    if (!currentItem) {
      return Response.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // If serial number is being changed, check for conflicts
    const newSN = body.sn || '';
    if (currentItem.sn !== newSN) {
      // Check if the new serial number already exists in inventory for the same product and location
      const existingItem = await Inventory.findOne({
        name: body.name,
        sku: body.sku,
        pn: body.pn,
        sn: newSN,
        location: body.location,
        _id: { $ne: id } // Exclude the current item being updated
      });

      // Check if the new serial number is currently in active shipments
      let shippedItem = null;
      try {
        const activeShipments = await Shipment.find({
          status: { $nin: ['canceled', 'delivered'] }
        });

        for (const shipment of activeShipments) {
          for (const item of shipment.inventory) {
            // Only check against actual serial numbers, not empty ones
            if (item.sn && item.sn.trim() !== '' && 
                item.sn === newSN && 
                item.name === body.name && 
                item.sku === body.sku && 
                item.pn === body.pn) {
              shippedItem = item;
              break;
            }
          }
          if (shippedItem) break;
        }
      } catch (shipmentError) {
        console.error('Error checking shipments for serial number update:', shipmentError);
        // Continue without shipment validation if there's an error
      }

      if (existingItem || shippedItem) {
        return Response.json(
          { error: `Serial number "${newSN}" already exists or is currently shipped for this product in ${body.location}` },
          { status: 400 }
        );
      }
    }

    // If updating to sn: '' (empty) and quantity > 0, check for duplicate
    if (body && body.sn === "" && body.quantity > 0) {
      const existingNoSN = await Inventory.findOne({
        name: body.name,
        sku: body.sku,
        pn: body.pn,
        sn: "",
        location: body.location,
        _id: { $ne: id },
      });
      if (existingNoSN) {
        // Merge quantities and delete the current record
        await Inventory.findByIdAndDelete(id);
        await Inventory.findByIdAndUpdate(existingNoSN._id, { $inc: { quantity: body.quantity } });
        return Response.json({ message: 'Merged with existing No SN record' });
      }
    }

    const updatedInventory = await Inventory.findByIdAndUpdate(
      id,
      {
        name: body.name,
        sku: body.sku,
        family: body.family,
        pn: body.pn,
        sn: newSN,
        quantity: quantity,
        location: body.location
      },
      { new: true }
    );

    if (!updatedInventory) {
      return Response.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    console.log('Updated inventory item:', updatedInventory.toObject());
    return Response.json(updatedInventory);
  } catch (error) {
    console.error('Error updating inventory:', error);
    if (error.code === 11000) {
      return Response.json(
        { error: 'A product with the same name, SKU, part number, serial number, and location already exists.' },
        { status: 400 }
      );
    }
    return Response.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

async function deleteInventory(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    const sku = searchParams.get('sku');
    const location = searchParams.get('location');

    console.log('[DELETE] Request params:', { id, name, sku, location });
    await mongoose.connect(process.env.MONGO_URL);

    // If name, sku, and location are provided, delete all records for that group
    if (name && sku && location) {
      const result = await Inventory.deleteMany({ name, sku, location });
      console.log('[DELETE] Group delete result:', result);
      return Response.json({ message: 'Group deleted', deletedCount: result.deletedCount });
    }

    console.log('[DELETE] Delete request received for ID:', id);
    if (!id) {
      console.log('[DELETE] No ID provided in delete request');
      return Response.json(
        { error: 'Inventory ID is required' },
        { status: 400 }
      );
    }

    console.log('[DELETE] Connected to database');
    // Get the current item to check if it's the last one in the group
    const currentItem = await Inventory.findById(id);
    console.log('[DELETE] Current item found:', currentItem ? 'Yes' : 'No');
    if (!currentItem) {
      console.log('[DELETE] Inventory item not found for ID:', id);
      return Response.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    console.log('[DELETE] Current item details:', {
      name: currentItem.name,
      sku: currentItem.sku,
      location: currentItem.location,
      quantity: currentItem.quantity,
      sn: currentItem.sn
    });

    // Check if this is the last item in the group (same name, sku, location)
    const groupItems = await Inventory.find({
      name: currentItem.name,
      sku: currentItem.sku,
      location: currentItem.location
    });
    console.log('[DELETE] Total group items count:', groupItems.length);
    console.log('[DELETE] Group items:', groupItems.map(item => ({ id: item._id, quantity: item.quantity, sn: item.sn })));

    // Special handling for "No SN" items (empty serial number)
    if (currentItem.sn === '') {
      console.log('[DELETE] Handling No SN item deletion');
      
      // If quantity is 1, set it to 0 instead of deleting the entire record
      if (currentItem.quantity === 1) {
        const updatedInventory = await Inventory.findByIdAndUpdate(
          id,
          {
            quantity: 0,
            updatetimestamp: new Date()
          },
          { new: true }
        );
        console.log('[DELETE] Set No SN item quantity to 0:', updatedInventory ? updatedInventory.toObject() : 'null');
        return Response.json({ 
          message: 'No SN item quantity set to 0',
          deleted: false,
          item: updatedInventory
        });
      } else {
        // If quantity > 1, reduce quantity by 1
        const updatedInventory = await Inventory.findByIdAndUpdate(
          id,
          {
            $inc: { quantity: -1 },
            updatetimestamp: new Date()
          },
          { new: true }
        );
        console.log('[DELETE] Reduced No SN item quantity by 1:', updatedInventory ? updatedInventory.toObject() : 'null');
        return Response.json({ 
          message: 'No SN item quantity reduced by 1',
          deleted: false,
          item: updatedInventory
        });
      }
    }

    // For items with serial numbers
    // If this is the last item in the group, delete it completely
    if (groupItems.length === 1) {
      console.log('[DELETE] This is the last item in the group, deleting completely');
      const deletedInventory = await Inventory.findByIdAndDelete(id);
      console.log('[DELETE] Completely deleted inventory item:', deletedInventory ? deletedInventory.toObject() : 'null');
      return Response.json({ 
        message: 'Inventory item deleted completely',
        deleted: true,
        item: deletedInventory
      });
    } else {
      console.log('[DELETE] Other items exist in group, checking for No SN merge');
      // If this item has sn: '', check for another No SN record
      if (currentItem.sn === '') {
        const otherNoSN = await Inventory.findOne({
          _id: { $ne: id },
          name: currentItem.name,
          sku: currentItem.sku,
          pn: currentItem.pn,
          sn: '',
          location: currentItem.location
        });
        if (otherNoSN) {
          // Merge quantities and delete this record (delete first to avoid duplicate key)
          await Inventory.findByIdAndDelete(id);
          await Inventory.findByIdAndUpdate(otherNoSN._id, { $inc: { quantity: currentItem.quantity } });
          console.log('[DELETE] Merged with existing No SN record and deleted current');
          // Clean up: remove any items with quantity 0 from the database
          const cleanupResult = await Inventory.deleteMany({
            name: currentItem.name,
            sku: currentItem.sku,
            location: currentItem.location,
            quantity: 0
          });
          console.log('[DELETE] Cleaned up items with quantity 0:', cleanupResult.deletedCount);
          return Response.json({ 
            message: 'Merged with existing No SN record and deleted current',
            deleted: true
          });
        }
      }
      // Otherwise, delete the document if quantity is 0, instead of updating
      if (currentItem.quantity === 1) {
        // If quantity is 1, deleting this item means it should be removed
        const deletedInventory = await Inventory.findByIdAndDelete(id);
        console.log('[DELETE] Deleted inventory item with quantity 1:', deletedInventory ? deletedInventory.toObject() : 'null');
        return Response.json({ 
          message: 'Inventory item deleted completely',
          deleted: true,
          item: deletedInventory
        });
      } else {
        // If quantity > 1, reduce quantity by 1
        const updatedInventory = await Inventory.findByIdAndUpdate(
          id,
          {
            $inc: { quantity: -1 },
            updatetimestamp: new Date()
          },
          { new: true }
        );
        console.log('[DELETE] Reduced inventory item quantity by 1:', updatedInventory ? updatedInventory.toObject() : 'null');
        return Response.json({ 
          message: 'Inventory item quantity reduced by 1',
          deleted: false,
          item: updatedInventory
        });
      }
    }
  } catch (error) {
    console.error('[DELETE] Error deleting inventory item:', error);
    if (error && error.stack) {
      console.error('[DELETE] Stack trace:', error.stack);
    }
    return Response.json(
      { error: 'Failed to delete inventory item', details: error && error.message ? error.message : error },
      { status: 500 }
    );
  }
}

export const GET = withRateLimit(getInventory, { limit: 100, windowMs: 1000 });
export const POST = withRateLimit(createInventory, { limit: 100, windowMs: 1000 });
export const PUT = withRateLimit(updateInventory, { limit: 100, windowMs: 1000 });
export const DELETE = withRateLimit(deleteInventory, { limit: 100, windowMs: 1000 }); 