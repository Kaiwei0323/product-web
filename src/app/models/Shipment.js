import mongoose from 'mongoose';

// Schema for individual inventory items in a shipment
const ShipmentInventoryItemSchema = new mongoose.Schema({
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: [true, 'Inventory ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
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
    required: false,
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be non-negative'],
  },
}, {
  _id: true, // Ensure each item has its own ID
});

// Main Shipment Schema
const ShipmentSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: [true, 'PO Number is required'],
    trim: true,
    index: true, // Index for efficient querying by PO number
  },
  from: {
    type: String,
    required: [true, 'From location is required'],
    trim: true,
    enum: ['ISV', 'Houston'],
  },
  to: {
    type: String,
    required: [true, 'To location is required'],
    trim: true,
  },
  inventory: {
    type: [ShipmentInventoryItemSchema],
    required: [true, 'At least one inventory item is required'],
    validate: [
      {
        validator: function(items) {
          return items && items.length > 0;
        },
        message: 'Shipment must contain at least one inventory item'
      }
    ]
  },
  invoice: {
    type: Number,
    required: false,
    min: [0, 'Invoice number must be non-negative'],
  },
  carrier: {
    type: String,
    required: false,
    trim: true,
  },
  freight: {
    type: Number,
    required: false,
    min: [0, 'Freight must be non-negative'],
    default: 0,
  },
  mpf_vat: {
    type: Number,
    required: false,
    min: [0, 'MPF/VAT must be non-negative'],
    default: 0,
  },
  duties: {
    type: Number,
    required: false,
    min: [0, 'Duties must be non-negative'],
    default: 0,
  },
  ttl_incidental: {
    type: Number,
    required: false,
    min: [0, 'Total incidental must be non-negative'],
    default: 0,
  },
  end_user_shipping_fee: {
    type: Number,
    required: false,
    min: [0, 'End user shipping fee must be non-negative'],
    default: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ['requested', 'processing', 'in_transit', 'delivered', 'canceled'],
    default: 'requested',
    index: true, // Index for efficient status filtering
  },
  note: {
    type: String,
    required: false,
    trim: true,
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
  collection: 'shipments'
});

// Update the updatetimestamp before saving
ShipmentSchema.pre('save', function(next) {
  this.updatetimestamp = new Date();
  if (this.isNew) {
    this.createtimestamp = new Date();
  }
  next();
});

// Update the updatetimestamp before updating
ShipmentSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatetimestamp: new Date() });
  next();
});

ShipmentSchema.pre('findByIdAndUpdate', function(next) {
  this.set({ updatetimestamp: new Date() });
  next();
});

// Indexes for efficient querying
ShipmentSchema.index({ poNumber: 1, status: 1 });
ShipmentSchema.index({ from: 1, status: 1 });
ShipmentSchema.index({ to: 1, status: 1 });
ShipmentSchema.index({ createtimestamp: -1 });

// Virtual for total amount (sum of all inventory items)
ShipmentSchema.virtual('totalAmount').get(function() {
  return this.inventory.reduce((sum, item) => sum + item.amount, 0);
});

// Virtual for total shipping cost
ShipmentSchema.virtual('totalShippingCost').get(function() {
  return (this.freight || 0) + (this.mpf_vat || 0) + (this.duties || 0) + (this.ttl_incidental || 0);
});

// Virtual for grand total
ShipmentSchema.virtual('grandTotal').get(function() {
  return this.totalAmount + this.totalShippingCost + (this.end_user_shipping_fee || 0);
});

// Ensure virtuals are included when converting to JSON
ShipmentSchema.set('toJSON', { virtuals: true });
ShipmentSchema.set('toObject', { virtuals: true });

// Delete any existing model to ensure fresh schema
if (mongoose.models.Shipment) {
  delete mongoose.models.Shipment;
}

const Shipment = mongoose.model('Shipment', ShipmentSchema);
export default Shipment;
