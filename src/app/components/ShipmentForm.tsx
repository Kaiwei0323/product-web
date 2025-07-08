'use client';
import { useState, useEffect } from 'react';
import SimpleLoading from './Loading';

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  family: string;
  pn: string;
  sn: string;
  quantity: number;
  location: string;
}

interface ShipmentInventoryItem {
  inventoryId: string | { _id: string; [key: string]: any };
  name: string;
  sku: string;
  family: string;
  pn: string;
  sn: string;
  quantity: number;
  amount: number;
}

interface Shipment {
  _id: string;
  poNumber: string;
  from: string;
  to: string;
  inventory: ShipmentInventoryItem[];
  invoice?: number;
  carrier?: string;
  freight: number;
  mpf_vat: number;
  duties: number;
  ttl_incidental: number;
  end_user_shipping_fee: number;
  status: 'requested' | 'processing' | 'in_transit' | 'delivered' | 'complete' | 'canceled';
  note?: string;
  createtimestamp: string;
  updatetimestamp: string;
  totalAmount: number;
  totalShippingCost: number;
  grandTotal: number;
}

interface Inquiry {
  _id: string;
  company: string;
  contact: string;
  items: {
    productId: { name: string; sku?: string; chip?: string; platform?: string; pn?: string } | string;
    quantity: number;
    sku?: string;
  }[];
  createdAt: string;
  submitter?: string;
  status: 'requested' | 'processing' | 'complete';
}

interface ShipmentFormProps {
  onShipmentCreated: () => void;
  shipment?: Shipment | null;
  isEditing?: boolean;
}

export default function ShipmentForm({ onShipmentCreated, shipment, isEditing = false }: ShipmentFormProps) {
  const [form, setForm] = useState({
    poNumber: '',
    from: 'ISV',
    to: '',
    invoice: 0,
    carrier: '',
    freight: 0,
    mpf_vat: 0,
    duties: 0,
    ttl_incidental: 0,
    end_user_shipping_fee: 0,
    note: '',
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ShipmentInventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<'ISV' | 'Houston'>('ISV');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<string>('');
  const [showInquiryReference, setShowInquiryReference] = useState(false);

  // Initialize form with shipment data if editing
  useEffect(() => {
    if (shipment && isEditing) {
      setForm({
        poNumber: shipment.poNumber,
        from: shipment.from,
        to: shipment.to,
        invoice: shipment.invoice || 0,
        carrier: shipment.carrier || '',
        freight: shipment.freight || 0,
        mpf_vat: shipment.mpf_vat || 0,
        duties: shipment.duties || 0,
        ttl_incidental: shipment.ttl_incidental || 0,
        end_user_shipping_fee: shipment.end_user_shipping_fee || 0,
        note: shipment.note || '',
      });
      setSelectedItems(shipment.inventory || []);
      setSelectedLocation(shipment.from as 'ISV' | 'Houston');
    }
  }, [shipment, isEditing]);

  useEffect(() => {
    fetchInventory();
    if (!isEditing) {
      fetchInquiries();
    }
  }, [selectedLocation, isEditing]);

  async function fetchInventory() {
    try {
      const params = new URLSearchParams();
      params.append('grouped', 'false');
      params.append('location', selectedLocation);
      
      const res = await fetch(`/api/inventory?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      
      // Filter out items with quantity 0
      const availableItems = data.filter((item: InventoryItem) => item.quantity > 0);
      setInventory(availableItems);
    } catch (err) {
      setError('Failed to load inventory data');
    }
  }

  async function fetchInquiries() {
    try {
      const res = await fetch('/api/inquiry');
      if (!res.ok) throw new Error('Failed to fetch inquiries');
      const data = await res.json();
      // Only show inquiries that are not complete
      const activeInquiries = data.filter((inq: Inquiry) => inq.status !== 'complete');
      setInquiries(activeInquiries);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    }
  }

  const handleInquirySelect = (inquiryId: string) => {
    setSelectedInquiry(inquiryId);
    if (inquiryId) {
      const inquiry = inquiries.find(inq => inq._id === inquiryId);
      if (inquiry) {
        // Pre-fill form with inquiry data
        setForm(prev => ({
          ...prev,
          to: inquiry.company, // Use company as destination
          note: `Reference: Inquiry from ${inquiry.contact} (${inquiry.company})`
        }));
        
        // Clear selected items to start fresh
        setSelectedItems([]);
      }
    }
  };

  const loadInquiryItems = () => {
    if (!selectedInquiry) return;
    
    const inquiry = inquiries.find(inq => inq._id === selectedInquiry);
    if (!inquiry) return;

    // Find matching inventory items for the inquiry
    const inquiryItems: ShipmentInventoryItem[] = [];
    
    inquiry.items.forEach(inquiryItem => {
      const productName = typeof inquiryItem.productId === 'object' ? inquiryItem.productId.name : inquiryItem.productId;
      const productSku = typeof inquiryItem.productId === 'object' ? inquiryItem.productId.sku : '';
      
      // Find matching inventory item
      const matchingInventory = inventory.find(inv => 
        inv.name === productName || inv.sku === productSku
      );
      
      if (matchingInventory && matchingInventory.quantity >= inquiryItem.quantity) {
        inquiryItems.push({
          inventoryId: matchingInventory._id,
          name: matchingInventory.name,
          sku: matchingInventory.sku,
          family: matchingInventory.family,
          pn: matchingInventory.pn,
          sn: matchingInventory.sn,
          quantity: inquiryItem.quantity,
          amount: 0,
        });
      }
    });
    
    setSelectedItems(inquiryItems);
    setSuccess(`Loaded ${inquiryItems.length} items from inquiry`);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setForm(prev => ({ ...prev, [name]: numValue }));
    }
    setError('');
    setSuccess('');
  };

  const handleAddItem = (item: InventoryItem) => {
    const existingItem = selectedItems.find(selected => {
      const selectedId = typeof selected.inventoryId === 'string' ? selected.inventoryId : selected.inventoryId._id;
      return selectedId === item._id;
    });
    
    if (existingItem) {
      setError('Item already added to shipment');
      return;
    }

    const newItem: ShipmentInventoryItem = {
      inventoryId: item._id,
      name: item.name,
      sku: item.sku,
      family: item.family,
      pn: item.pn,
      sn: item.sn,
      quantity: 1,
      amount: 0,
    };

    setSelectedItems(prev => [...prev, newItem]);
    setError('');
  };

  const handleRemoveItem = (inventoryId: string | { _id: string; [key: string]: any }) => {
    const idString = typeof inventoryId === 'string' ? inventoryId : inventoryId._id;
    setSelectedItems(prev => prev.filter(item => {
      const itemId = typeof item.inventoryId === 'string' ? item.inventoryId : item.inventoryId._id;
      return itemId !== idString;
    }));
  };

  const handleItemQuantityChange = (inventoryId: string | { _id: string; [key: string]: any }, quantity: number) => {
    if (quantity < 1) return;
    
    const idString = typeof inventoryId === 'string' ? inventoryId : inventoryId._id;
    const inventoryItem = inventory.find(item => item._id === idString);
    if (inventoryItem && quantity > inventoryItem.quantity) {
      setError(`Quantity cannot exceed available inventory (${inventoryItem.quantity})`);
      return;
    }

    setSelectedItems(prev => 
      prev.map(item => {
        const itemId = typeof item.inventoryId === 'string' ? item.inventoryId : item.inventoryId._id;
        return itemId === idString 
          ? { ...item, quantity } 
          : item;
      })
    );
    setError('');
  };

  const handleItemAmountChange = (inventoryId: string | { _id: string; [key: string]: any }, amount: number) => {
    if (amount < 0) return;
    
    const idString = typeof inventoryId === 'string' ? inventoryId : inventoryId._id;
    setSelectedItems(prev => 
      prev.map(item => {
        const itemId = typeof item.inventoryId === 'string' ? item.inventoryId : item.inventoryId._id;
        return itemId === idString 
          ? { ...item, amount } 
          : item;
      })
    );
  };

  const filteredInventory = inventory.filter(item =>
    // Filter out items that are already selected
    !selectedItems.some(selected => {
      const selectedId = typeof selected.inventoryId === 'string' ? selected.inventoryId : selected.inventoryId._id;
      return selectedId === item._id;
    }) &&
    // Apply search filter
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.pn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.amount, 0);
  const totalShippingCost = form.freight + form.mpf_vat + form.duties + form.ttl_incidental;
  const grandTotal = totalAmount + totalShippingCost + form.end_user_shipping_fee;

  // Helper function to get a unique key for inventory items
  const getItemKey = (item: ShipmentInventoryItem, index: number): string => {
    if (typeof item.inventoryId === 'string') {
      return item.inventoryId;
    } else if (item.inventoryId && typeof item.inventoryId === 'object' && '_id' in item.inventoryId) {
      return item.inventoryId._id;
    } else {
      return `item_${index}`;
    }
  };

  // Helper function to get inventoryId as string
  const getInventoryIdString = (item: ShipmentInventoryItem): string => {
    if (typeof item.inventoryId === 'string') {
      return item.inventoryId;
    } else if (item.inventoryId && typeof item.inventoryId === 'object' && '_id' in item.inventoryId) {
      return item.inventoryId._id;
    } else {
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      setError('Please add at least one item to the shipment');
      return;
    }

    if (!form.poNumber.trim()) {
      setError('PO Number is required');
      return;
    }

    if (!form.to.trim()) {
      setError('Destination is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = isEditing && shipment ? `/api/shipment?id=${shipment._id}` : '/api/shipment';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          inventory: selectedItems,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || `Failed to ${isEditing ? 'update' : 'create'} shipment`);
      } else {
        setSuccess(`Shipment ${isEditing ? 'updated' : 'created'} successfully!`);
        if (!isEditing) {
          setForm({
            poNumber: '',
            from: 'ISV',
            to: '',
            invoice: 0,
            carrier: '',
            freight: 0,
            mpf_vat: 0,
            duties: 0,
            ttl_incidental: 0,
            end_user_shipping_fee: 0,
            note: '',
          });
          setSelectedItems([]);
        }
        onShipmentCreated();
      }
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} shipment`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Shipment' : 'Create New Shipment'}</h2>
      
      {/* Customer Inquiry Reference Section - Only show when creating new shipment */}
      {!isEditing && (
        <div className="mb-8 border rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-800">Customer Inquiry Reference</h3>
            <button
              type="button"
              onClick={() => setShowInquiryReference(!showInquiryReference)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showInquiryReference ? 'Hide' : 'Show'} Inquiry Reference
            </button>
          </div>
          
          {showInquiryReference && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Inquiry</label>
                  <select
                    value={selectedInquiry}
                    onChange={(e) => handleInquirySelect(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an inquiry to reference...</option>
                    {inquiries.map((inquiry) => (
                      <option key={inquiry._id} value={inquiry._id}>
                        {inquiry.company} - {inquiry.contact} ({inquiry.items.length} items)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={loadInquiryItems}
                    disabled={!selectedInquiry}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Load Items from Inquiry
                  </button>
                </div>
              </div>
              
              {selectedInquiry && (
                <div className="bg-white rounded p-3 border">
                  <h4 className="font-medium text-gray-800 mb-2">Inquiry Details:</h4>
                  {(() => {
                    const inquiry = inquiries.find(inq => inq._id === selectedInquiry);
                    if (!inquiry) return null;
                    
                    return (
                      <div className="text-sm text-gray-600">
                        <p><strong>Company:</strong> {inquiry.company}</p>
                        <p><strong>Contact:</strong> {inquiry.contact}</p>
                        <p><strong>Submitted:</strong> {new Date(inquiry.createdAt).toLocaleString()}</p>
                        <p><strong>Items:</strong></p>
                        <div className="mt-2">
                          <table className="min-w-full text-xs border border-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-2 py-1 text-left border-r">Product</th>
                                <th className="px-2 py-1 text-left border-r">SKU</th>
                                <th className="px-2 py-1 text-left border-r">Part Number</th>
                                <th className="px-2 py-1 text-left">Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inquiry.items.map((item, idx) => {
                                const productName = typeof item.productId === 'object' ? item.productId.name : item.productId;
                                const productSku = typeof item.productId === 'object' ? item.productId.sku : (item.sku || 'N/A');
                                
                                // Find matching inventory item to get the actual part number
                                const matchingInventory = inventory.find(inv => 
                                  inv.name === productName || inv.sku === productSku
                                );
                                const productPn = matchingInventory ? matchingInventory.pn : 'N/A';
                                
                                return (
                                  <tr key={idx} className="border-t">
                                    <td className="px-2 py-1 border-r">{productName}</td>
                                    <td className="px-2 py-1 border-r font-mono">{productSku}</td>
                                    <td className="px-2 py-1 border-r font-mono">{productPn}</td>
                                    <td className="px-2 py-1">{item.quantity}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">PO Number *</label>
            <input
              name="poNumber"
              value={form.poNumber}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              readOnly={isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From *</label>
            <select
              name="from"
              value={form.from}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isEditing}
            >
              <option value="ISV">ISV</option>
              <option value="Houston">Houston</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To *</label>
            <input
              name="to"
              value={form.to}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Destination"
              required
            />
          </div>
        </div>

        {/* Inventory Selection - Only show if not editing */}
        {!isEditing && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Select Inventory Items</h3>
            
            {/* Selected Items Summary */}
            {selectedItems.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </span>
                  <span className="text-sm text-blue-600">
                    Total Amount: ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Search Inventory</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by name, SKU, family, or PN..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value as 'ISV' | 'Houston')}
                    className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ISV">ISV</option>
                    <option value="Houston">Houston</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Available Inventory */}
            <div className="max-h-60 overflow-y-auto border rounded">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Family</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">PN</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SN</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm">{item.name}</td>
                        <td className="px-3 py-2 text-sm font-mono">{item.sku}</td>
                        <td className="px-3 py-2 text-sm">{item.family}</td>
                        <td className="px-3 py-2 text-sm font-mono">{item.pn}</td>
                        <td className="px-3 py-2 text-sm font-mono">{item.sn || 'No SN'}</td>
                        <td className="px-3 py-2 text-sm">{item.quantity}</td>
                        <td className="px-3 py-2 text-sm">
                          <button
                            type="button"
                            onClick={() => handleAddItem(item)}
                            className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                          >
                            Add
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-sm text-gray-500 text-center">
                        {searchQuery ? 'No items match your search' : 'No available items'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Selected Items */}
        {selectedItems.length > 0 && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Selected Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SN</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount ($)</th>
                    {!isEditing && (
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedItems.map((item, index) => (
                    <tr key={getItemKey(item, index)}>
                      <td className="px-3 py-2 text-sm">{item.name}</td>
                      <td className="px-3 py-2 text-sm font-mono">{item.sku}</td>
                      <td className="px-3 py-2 text-sm font-mono">{item.sn || 'No SN'}</td>
                      <td className="px-3 py-2 text-sm">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(getInventoryIdString(item), parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border rounded text-sm"
                          readOnly={isEditing}
                        />
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) => handleItemAmountChange(getInventoryIdString(item), parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border rounded text-sm"
                        />
                      </td>
                      {!isEditing && (
                        <td className="px-3 py-2 text-sm">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(getInventoryIdString(item))}
                            className="text-red-600 hover:text-red-900 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Invoice</label>
                <input
                  name="invoice"
                  type="number"
                  min="0"
                  value={form.invoice}
                  onChange={handleNumberChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Carrier</label>
                <input
                  name="carrier"
                  value={form.carrier}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DHL, FedEx, etc."
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Costs & Fees</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Freight ($)</label>
                <input
                  name="freight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.freight}
                  onChange={handleNumberChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">MPF/VAT ($)</label>
                <input
                  name="mpf_vat"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.mpf_vat}
                  onChange={handleNumberChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duties ($)</label>
                <input
                  name="duties"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.duties}
                  onChange={handleNumberChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Incidental ($)</label>
                <input
                  name="ttl_incidental"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.ttl_incidental}
                  onChange={handleNumberChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End User Shipping Fee ($)</label>
                <input
                  name="end_user_shipping_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.end_user_shipping_fee}
                  onChange={handleNumberChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleFormChange}
            rows={3}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional notes or internal messages..."
          />
        </div>

        {/* Summary */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Shipment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Items: {selectedItems.length}</p>
              <p className="text-sm text-gray-600">Total Amount: ${totalAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Shipping Cost: ${totalShippingCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">End User Fee: ${form.end_user_shipping_fee.toFixed(2)}</p>
              <p className="text-lg font-semibold text-gray-900">Grand Total: ${grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            disabled={loading || selectedItems.length === 0}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Shipment' : 'Create Shipment')}
          </button>
        </div>
      </form>
    </div>
  );
} 