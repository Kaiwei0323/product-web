import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    trim: true,
  },
  family: {
    type: String,
    required: [true, 'Family is required'],
    trim: true,
  },
  pn: {
    type: String,
    required: [true, 'Part Number is required'],
    trim: true,
  },
  sn: {
    type: String,
    required: false, // Made optional
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be at least 0'],
    default: 0,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    enum: ['ISV', 'Houston'], // Updated to remove HRDC since it's the same as Houston
  },
  createtimestamp: {
    type: Date,
    default: Date.now,
  },
  updatetimestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false, // Disable automatic timestamps since we're using custom ones
  strict: true,
  collection: 'inventories' // Explicitly specify collection name
});

// Update the updatetimestamp before saving
InventorySchema.pre('save', function(next) {
  this.updatetimestamp = new Date();
  if (this.isNew) {
    this.createtimestamp = new Date();
  }
  next();
});

// Update the updatetimestamp before updating
InventorySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatetimestamp: new Date() });
  next();
});

InventorySchema.pre('findByIdAndUpdate', function(next) {
  this.set({ updatetimestamp: new Date() });
  next();
});

// Index for unique combination of name, sku, pn, sn, and location
// Note: If sn is empty, it will still be unique per location
InventorySchema.index({ name: 1, sku: 1, pn: 1, sn: 1, location: 1 }, { unique: true });

// Delete any existing model to ensure fresh schema
if (mongoose.models.Inventory) {
  delete mongoose.models.Inventory;
}

const Inventory = mongoose.model('Inventory', InventorySchema);
export default Inventory; 