import Shipment from "../../models/Shipment";
import Inventory from "../../models/Inventory";
import mongoose from "mongoose";
import { withRateLimit } from "../../models/RateLimiter";

async function getShipments(req) {
  try {
    const { searchParams } = new URL(req.url);
    const poNumber = searchParams.get('poNumber');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    await mongoose.connect(process.env.MONGO_URL);
    
    let query = {};
    if (poNumber) query.poNumber = poNumber;
    if (status) query.status = status;
    if (from) query.from = from;
    if (to) query.to = to;
    
    const shipments = await Shipment.find(query)
      .sort({ createtimestamp: -1 })
      .populate('inventory.inventoryId', 'name sku family pn sn quantity location');
    
    return Response.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return Response.json(
      { error: 'Failed to fetch shipment data' },
      { status: 500 }
    );
  }
}

async function createShipment(req) {
  try {
    const body = await req.json();
    console.log('Received shipment request body:', body);
    
    const { 
      poNumber, 
      from, 
      to, 
      inventory, 
      invoice, 
      carrier, 
      freight, 
      mpf_vat, 
      duties, 
      ttl_incidental, 
      end_user_shipping_fee, 
      note 
    } = body;

    // Validate required fields
    if (!poNumber || !from || !to || !inventory || !Array.isArray(inventory) || inventory.length === 0) {
      console.log('Missing or invalid required fields:', { 
        poNumber: !!poNumber, 
        from: !!from, 
        to: !!to, 
        inventory: Array.isArray(inventory) && inventory.length > 0
      });
      return Response.json(
        { error: 'Missing required fields: poNumber, from, to, and inventory are required' },
        { status: 400 }
      );
    }

    // Validate inventory items structure
    for (const item of inventory) {
      if (!item.inventoryId || !item.name || !item.sku || !item.family || !item.pn || !item.quantity || item.amount === undefined) {
        console.log('Invalid inventory item structure:', item);
        return Response.json(
          { error: 'Each inventory item must have inventoryId, name, sku, family, pn, quantity, and amount' },
          { status: 400 }
        );
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        console.log('Invalid quantity:', item);
        return Response.json(
          { error: 'Quantity must be a positive number' },
          { status: 400 }
        );
      }
      if (typeof item.amount !== 'number' || item.amount < 0) {
        console.log('Invalid amount:', item);
        return Response.json(
          { error: 'Amount must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    console.log('Attempting to connect to MongoDB...');
    try {
      await mongoose.connect(process.env.MONGO_URL);
      console.log('MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return Response.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Start a transaction
    console.log('Starting transaction...');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check and update inventory quantities
      for (const item of inventory) {
        console.log(`Checking inventory for item: ${item.name} (${item.sku})`);
        const inventoryDoc = await Inventory.findById(item.inventoryId).session(session);

        if (!inventoryDoc) {
          console.log(`Inventory not found for ID: ${item.inventoryId}`);
          throw new Error(`Inventory not found for product: ${item.name} (SKU: ${item.sku})`);
        }

        console.log(`Current inventory quantity: ${inventoryDoc.quantity}, Requested: ${item.quantity}`);
        if (inventoryDoc.quantity < item.quantity) {
          throw new Error(`Insufficient inventory for product: ${item.name} (SKU: ${item.sku}). Available: ${inventoryDoc.quantity}, Requested: ${item.quantity}`);
        }

        // Update inventory quantity
        console.log(`Updating inventory quantity for: ${item.name}`);
        await Inventory.findByIdAndUpdate(
          inventoryDoc._id,
          { $inc: { quantity: -item.quantity } },
          { session }
        );
      }

      // Create shipment
      const shipmentData = {
        poNumber,
        from,
        to,
        inventory,
        invoice,
        carrier,
        freight: freight || 0,
        mpf_vat: mpf_vat || 0,
        duties: duties || 0,
        ttl_incidental: ttl_incidental || 0,
        end_user_shipping_fee: end_user_shipping_fee || 0,
        note,
        status: 'requested'
      };
      
      console.log('Creating shipment with data:', shipmentData);
      
      const createdShipment = await Shipment.create([shipmentData], { session });
      
      // Commit the transaction
      console.log('Committing transaction...');
      await session.commitTransaction();
      console.log('Created shipment:', createdShipment[0].toObject());
      
      return Response.json(createdShipment[0], { status: 201 });
    } catch (error) {
      // Rollback the transaction on error
      console.error('Transaction error:', error);
      await session.abortTransaction();
      throw error;
    } finally {
      console.log('Ending session...');
      session.endSession();
    }
  } catch (error) {
    console.error('Error creating shipment:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return Response.json(
      { error: error.message || 'Failed to create shipment' },
      { status: 500 }
    );
  }
}

async function updateShipment(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return Response.json(
        { error: 'Shipment ID is required' },
        { status: 400 }
      );
    }

    await mongoose.connect(process.env.MONGO_URL);
    
    // Get the current shipment
    const currentShipment = await Shipment.findById(id);
    if (!currentShipment) {
      return Response.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Validate status if provided
    if (body.status && !['requested', 'processing', 'in_transit', 'delivered', 'canceled'].includes(body.status)) {
      return Response.json(
        { error: 'Valid status is required (requested, processing, in_transit, delivered, or canceled)' },
        { status: 400 }
      );
    }

    // Handle cancellation - return items to inventory
    if (body.status === 'canceled' && currentShipment.status !== 'canceled') {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Return all items to inventory
        for (const item of currentShipment.inventory) {
          await Inventory.findByIdAndUpdate(
            item.inventoryId,
            { $inc: { quantity: item.quantity } },
            { session }
          );
        }

        // Update shipment status to canceled
        const updatedShipment = await Shipment.findByIdAndUpdate(
          id,
          { status: 'canceled' },
          { new: true, session }
        ).populate('inventory.inventoryId', 'name sku family pn sn quantity location');

        await session.commitTransaction();
        console.log('Shipment canceled and items returned to inventory:', updatedShipment.toObject());
        return Response.json(updatedShipment);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    // Handle inventory changes if inventory is being updated
    if (body.inventory && Array.isArray(body.inventory)) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // First, return all current items to inventory
        for (const item of currentShipment.inventory) {
          await Inventory.findByIdAndUpdate(
            item.inventoryId,
            { $inc: { quantity: item.quantity } },
            { session }
          );
        }

        // Then, deduct the new items from inventory
        for (const item of body.inventory) {
          const inventoryDoc = await Inventory.findById(item.inventoryId).session(session);
          
          if (!inventoryDoc) {
            throw new Error(`Inventory not found for product: ${item.name} (SKU: ${item.sku})`);
          }

          if (inventoryDoc.quantity < item.quantity) {
            throw new Error(`Insufficient inventory for product: ${item.name} (SKU: ${item.sku}). Available: ${inventoryDoc.quantity}, Requested: ${item.quantity}`);
          }

          // Update inventory quantity
          await Inventory.findByIdAndUpdate(
            item.inventoryId,
            { $inc: { quantity: -item.quantity } },
            { session }
          );
        }

        // Update the shipment
        const updateData = { ...body };
        delete updateData._id; // Remove _id if present
        
        const updatedShipment = await Shipment.findByIdAndUpdate(
          id,
          updateData,
          { new: true, session }
        ).populate('inventory.inventoryId', 'name sku family pn sn quantity location');

        await session.commitTransaction();
        console.log('Updated shipment with inventory changes:', updatedShipment.toObject());
        return Response.json(updatedShipment);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      // Update the shipment without inventory changes
      const updateData = { ...body };
      delete updateData._id; // Remove _id if present
      
      const updatedShipment = await Shipment.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('inventory.inventoryId', 'name sku family pn sn quantity location');

      if (!updatedShipment) {
        return Response.json(
          { error: 'Shipment not found' },
          { status: 404 }
        );
      }

      console.log('Updated shipment:', updatedShipment.toObject());
      return Response.json(updatedShipment);
    }
  } catch (error) {
    console.error('Error updating shipment:', error);
    return Response.json(
      { error: 'Failed to update shipment' },
      { status: 500 }
    );
  }
}

async function deleteShipment(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const body = await req.json();
    const { updateStock } = body;
    
    if (!id) {
      return Response.json(
        { error: 'Shipment ID is required' },
        { status: 400 }
      );
    }

    await mongoose.connect(process.env.MONGO_URL);
    
    // Get the current shipment
    const currentShipment = await Shipment.findById(id);
    if (!currentShipment) {
      return Response.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Start a transaction if we need to update stock
    if (updateStock && currentShipment.status === 'requested') {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Return items to inventory
        for (const item of currentShipment.inventory) {
          await Inventory.findByIdAndUpdate(
            item.inventoryId,
            { $inc: { quantity: item.quantity } },
            { session }
          );
        }

        // Delete the shipment
        await Shipment.findByIdAndDelete(id, { session });
        
        await session.commitTransaction();
        console.log('Deleted shipment and returned items to inventory');
        return Response.json({ message: 'Shipment deleted and items returned to inventory' });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      // Just delete the shipment without updating stock
      await Shipment.findByIdAndDelete(id);
      console.log('Deleted shipment without updating inventory');
      return Response.json({ message: 'Shipment deleted' });
    }
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return Response.json(
      { error: 'Failed to delete shipment' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  return withRateLimit(getShipments, { limit: 100, windowMs: 1000 })(req);
}

export async function POST(req) {
  return withRateLimit(createShipment, { limit: 50, windowMs: 1000 })(req);
}

export async function PUT(req) {
  return withRateLimit(updateShipment, { limit: 100, windowMs: 1000 })(req);
}

export async function DELETE(req) {
  return withRateLimit(deleteShipment, { limit: 50, windowMs: 1000 })(req);
} 