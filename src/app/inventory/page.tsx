'use client';
import { useState, useEffect } from "react";
import AddStockForm from "../components/AddStockForm";
import InventoryChatBox from '../components/InventoryChatBox';

interface StockItem {
  _id: string;
  name: string;
  sku: string;
  family: string;
  pn: string;
  sn: string;
  quantity: number;
  location: string;
  createtimestamp: string;
  updatetimestamp: string;
}

interface GroupedInventoryItem {
  name: string;
  sku: string;
  family: string;
  pn: string;
  location: string;
  totalQuantity: number;
  items: StockItem[];
  hasSerialNumbers: boolean;
  serialNumbers: string[];
}

function DetailModal({ 
  isOpen, 
  onClose, 
  item,
  onItemUpdate,
  onItemDelete
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  item: GroupedInventoryItem | null;
  onItemUpdate: () => void;
  onItemDelete: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<{ 
    name: string; 
    sku: string; 
    family: string;
    pn: string;
    sn: string;
    quantity: string;
  }>({
    name: '',
    sku: '',
    family: '',
    pn: '',
    sn: '',
    quantity: ''
  });
  const [editError, setEditError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<GroupedInventoryItem | null>(item);
  const [addQty, setAddQty] = useState(1);
  const [serialInputs, setSerialInputs] = useState<string[]>([""]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [snEditInputs, setSnEditInputs] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);

  // Update currentItem when item prop changes
  useEffect(() => {
    setCurrentItem(item);
  }, [item]);

  if (!isOpen || !currentItem) return null;

  async function refreshModalData() {
    if (!currentItem) return;
    
    try {
      const params = new URLSearchParams();
      params.append('grouped', 'true');
      if (currentItem.location) {
        params.append('location', currentItem.location);
      }
      
      const res = await fetch(`/api/inventory?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      
      // Find the updated item in the fresh data
      const updatedItem = data.find((group: GroupedInventoryItem) => 
        group.name === currentItem.name && 
        group.sku === currentItem.sku && 
        group.location === currentItem.location
      );
      
      if (updatedItem) {
        setCurrentItem(updatedItem);
      }
    } catch (err) {
      console.error('Failed to refresh modal data:', err);
    }
  }

  function handleEditClick(stock: StockItem) {
    setEditingId(stock._id);
    setEditItem({
      name: stock.name,
      sku: stock.sku,
      family: stock.family,
      pn: stock.pn,
      sn: stock.sn,
      quantity: stock.quantity.toString(),
    });
    setEditError('');
    if (stock.sn === "" && stock.quantity > 1) {
      setSnEditInputs(Array(stock.quantity).fill(""));
    } else {
      setSnEditInputs([]);
    }
  }

  const handleSnEditInputChange = (idx: number, value: string) => {
    const arr = [...snEditInputs];
    arr[idx] = value;
    setSnEditInputs(arr);
  };

  const handleSaveSNs = async (stock: StockItem) => {
    setEditError("");
    setEditLoading(true);
    try {
      const filledSNs = snEditInputs.filter(sn => sn.trim() !== "");
      // 1. For each filled SN, create a new record
      for (const sn of filledSNs) {
        await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: stock.name,
            sku: stock.sku,
            family: stock.family,
            pn: stock.pn,
            location: stock.location,
            quantity: 1,
            serialNumbers: [sn.trim()],
          }),
        });
      }
      // 2. For blanks, update the original record's quantity
      const blanks = snEditInputs.filter(sn => sn.trim() === "").length;
      if (blanks === 0) {
        // All SNs were deleted - convert to "No SN" item with quantity 0
        await fetch(`/api/inventory?id=${stock._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: stock.name,
            sku: stock.sku,
            family: stock.family,
            pn: stock.pn,
            sn: "",
            quantity: 0,
            location: stock.location,
          }),
        });
      } else if (blanks !== stock.quantity) {
        // Update the original No SN record to new quantity
        await fetch(`/api/inventory?id=${stock._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: stock.name,
            sku: stock.sku,
            family: stock.family,
            pn: stock.pn,
            sn: "",
            quantity: blanks,
            location: stock.location,
          }),
        });
      }
      setEditingId(null);
      setSnEditInputs([]);
      await refreshModalData();
      onItemUpdate();
    } catch {
      setEditError("Failed to update serial numbers.");
    } finally {
      setEditLoading(false);
    }
  };

  async function handleItemUpdate(stockId: string) {
    const quantityNum = parseInt(editItem.quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      setEditError('Quantity must be a non-negative number');
      return;
    }
    
    // For items with serial numbers, quantity must be at least 1
    if (editItem.sn && editItem.sn.trim() !== '' && quantityNum < 1) {
      setEditError('Quantity must be at least 1 for items with serial numbers');
      return;
    }
    
    if (!editItem.name.trim() || !editItem.sku.trim() || !editItem.family.trim() || !editItem.pn.trim()) {
      setEditError('Name, SKU, Family, and Part Number are required');
      return;
    }

    if (!currentItem) return;

    try {
      const res = await fetch(`/api/inventory?id=${stockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editItem.name.trim(),
          sku: editItem.sku.trim(),
          family: editItem.family.trim(),
          pn: editItem.pn.trim(),
          sn: editItem.sn.trim(),
          quantity: quantityNum,
          location: currentItem.location
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update item');
      }

      setEditingId(null);
      setEditItem({ name: '', sku: '', family: '', pn: '', sn: '', quantity: '' });
      setEditError('');
      
      // Refresh modal data and notify parent
      await refreshModalData();
      onItemUpdate();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update item');
    }
  }

  function handleDeleteClick(stock: StockItem) {
    setItemToDelete(stock);
    setDeleteConfirmModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!itemToDelete) return;

    setDeletingId(itemToDelete._id);
    setEditError("");
    
    try {
      const res = await fetch(`/api/inventory?id=${itemToDelete._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        setEditError(
          (errorData.error ? errorData.error : 'Failed to delete inventory item') +
          (errorData.details ? ` (${errorData.details})` : '')
        );
        return;
      }
      const data = await res.json();
      await refreshModalData();
      if (!currentItem || !currentItem.items || currentItem.items.length <= 1) {
        onClose();
        onItemDelete();
      } else {
        onItemDelete();
      }
      
      // Close the confirmation modal
      setDeleteConfirmModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to delete inventory item');
    } finally {
      setDeletingId(null);
    }
  }

  function handleDeleteCancel() {
    setDeleteConfirmModalOpen(false);
    setItemToDelete(null);
  }

  const handleQtyChange = (qty: number) => {
    setAddQty(qty);
    setSerialInputs(Array(qty).fill("").map((_, i) => serialInputs[i] || ""));
  };

  const handleSerialInputChange = (idx: number, value: string) => {
    const arr = [...serialInputs];
    arr[idx] = value;
    setSerialInputs(arr);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    setAddSuccess("");
    try {
      const snFilled = serialInputs.filter(sn => sn.trim() !== "");
      if (snFilled.length > 0 && snFilled.length !== addQty) {
        setAddError("Please fill all serial number boxes or leave all empty.");
        setAddLoading(false);
        return;
      }
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentItem.name,
          sku: currentItem.sku,
          family: currentItem.family,
          pn: currentItem.pn,
          location: currentItem.location,
          quantity: snFilled.length === 0 ? addQty : snFilled.length,
          serialNumbers: snFilled.length === 0 ? undefined : serialInputs.map(sn => sn.trim()),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAddError(data.error || "Failed to add items");
      } else {
        setAddSuccess("Added successfully!");
        setAddQty(1);
        setSerialInputs([""]);
        await refreshModalData();
        onItemUpdate();
      }
    } catch {
      setAddError("Failed to add items");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Details for {currentItem.name} (SKU: {currentItem.sku})
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Product Information</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Name:</span> {currentItem.name}</div>
                <div><span className="font-medium">SKU:</span> {currentItem.sku}</div>
                <div><span className="font-medium">Family:</span> {currentItem.family}</div>
                <div><span className="font-medium">Part Number:</span> {currentItem.pn}</div>
                <div><span className="font-medium">Location:</span> {currentItem.location}</div>
                <div><span className="font-medium">Total Quantity:</span> {currentItem.totalQuantity}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Serial Numbers</h4>
              {currentItem.hasSerialNumbers ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-2">
                    {currentItem.serialNumbers.length} item{currentItem.serialNumbers.length !== 1 ? 's' : ''} with serial numbers:
                  </p>
                  <div className="max-h-40 overflow-y-auto">
                    {currentItem.serialNumbers.map((sn, index) => (
                      <div key={index} className="bg-white p-2 rounded border text-sm font-mono">
                        {sn}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No serial numbers assigned to these items.
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Individual Items</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItem.items.map((stock) => (
                    <tr key={stock._id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-mono">
                        {editingId === stock._id ? (
                          stock.sn === "" && stock.quantity > 1 ? (
                            <div className="px-3 py-2" style={{ background: '#f9fafb' }}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-2">
                                {snEditInputs.map((sn, idx) => (
                                  <input
                                    key={idx}
                                    type="text"
                                    value={sn}
                                    onChange={e => handleSnEditInputChange(idx, e.target.value)}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                    placeholder={`Serial #${idx + 1}`}
                                    disabled={editLoading}
                                  />
                                ))}
                              </div>
                              <button onClick={() => handleSaveSNs(stock)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs mr-2" disabled={editLoading}>Save</button>
                              <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-300 rounded text-xs" disabled={editLoading}>Cancel</button>
                              {editError && <div className="text-red-600 text-xs mt-1">{editError}</div>}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={editItem.sn}
                              onChange={(e) => setEditItem({ ...editItem, sn: e.target.value })}
                              className="w-full p-1 border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          )
                        ) : (
                          stock.sn || <span className="text-gray-400">No SN</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {editingId === stock._id ? (
                          <input
                            type="number"
                            value={editItem.quantity}
                            onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })}
                            className="w-full p-1 border rounded focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                            min={editItem.sn && editItem.sn.trim() !== '' ? "1" : "0"}
                          />
                        ) : (
                          stock.quantity
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {new Date(stock.createtimestamp).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {new Date(stock.updatetimestamp).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {editingId === stock._id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleItemUpdate(stock._id)}
                              className="text-green-600 hover:text-green-900 font-medium text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditItem({ name: '', sku: '', family: '', pn: '', sn: '', quantity: '' });
                                setEditError('');
                              }}
                              className="text-gray-600 hover:text-gray-900 font-medium text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditClick(stock)}
                              className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(stock)}
                              disabled={deletingId === stock._id}
                              className="text-red-600 hover:text-red-900 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === stock._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {editError && (
                <div className="mt-2 text-red-600 text-sm">
                  {editError}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2 bg-gray-50 p-3 rounded">
            <div className="flex gap-2 items-end">
              <div>
                <label className="block text-xs font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={addQty}
                  onChange={e => handleQtyChange(Number(e.target.value))}
                  className="w-20 px-2 py-1 border rounded"
                  disabled={addLoading}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Serial Numbers</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {Array.from({ length: addQty }).map((_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={serialInputs[idx] || ""}
                      onChange={e => handleSerialInputChange(idx, e.target.value)}
                      className="w-full px-2 py-1 border rounded text-xs"
                      placeholder={`Serial #${idx + 1}`}
                      disabled={addLoading}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Leave all boxes empty to add as non-serial-numbered items.
                </div>
              </div>
            </div>
            {addError && <div className="text-red-600 text-xs">{addError}</div>}
            {addSuccess && <div className="text-green-600 text-xs">{addSuccess}</div>}
            <button
              type="submit"
              className="self-end px-4 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
              disabled={addLoading}
            >
              {addLoading ? "Adding..." : "Add"}
            </button>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Inventory Item</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to permanently delete this inventory item? This action cannot be undone.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium text-red-800">Product:</span> {itemToDelete.name}</div>
                  <div><span className="font-medium text-red-800">SKU:</span> {itemToDelete.sku}</div>
                  <div><span className="font-medium text-red-800">Location:</span> {itemToDelete.location}</div>
                  <div><span className="font-medium text-red-800">Quantity:</span> {itemToDelete.quantity} items</div>
                  <div><span className="font-medium text-red-800">Serial Number:</span> {itemToDelete.sn || 'No SN'}</div>
                  <div><span className="font-medium text-red-800">Created:</span> {new Date(itemToDelete.createtimestamp).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === itemToDelete._id}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === itemToDelete._id ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function GroupedInventoryOverview({ onStockChange }: { onStockChange: () => void }) {
  const [groupedInventory, setGroupedInventory] = useState<GroupedInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'ISV' | 'Houston'>('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GroupedInventoryItem | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GroupedInventoryItem | null>(null);

  async function fetchGroupedInventory() {
    try {
      const params = new URLSearchParams();
      params.append('grouped', 'true');
      if (selectedLocation !== 'all') {
        params.append('location', selectedLocation);
      }
      
      const res = await fetch(`/api/inventory?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      setGroupedInventory(data);
    } catch (err) {
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroupedInventory();
  }, [onStockChange, selectedLocation]);

  function handleDetailClick(item: GroupedInventoryItem) {
    setSelectedItem(item);
    setDetailModalOpen(true);
  }

  function handleDeleteClick(item: GroupedInventoryItem) {
    setItemToDelete(item);
    setDeleteConfirmModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!itemToDelete) return;

    const groupKey = `${itemToDelete.name}-${itemToDelete.sku}-${itemToDelete.location}`;
    setDeletingGroup(groupKey);
    
    try {
      const params = new URLSearchParams();
      params.append('name', itemToDelete.name);
      params.append('sku', itemToDelete.sku);
      params.append('location', itemToDelete.location);
      
      const res = await fetch(`/api/inventory?${params.toString()}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Failed to delete group: ${errorData.error || 'Unknown error'}`);
        return;
      }
      
      const data = await res.json();
      console.log('Group deleted:', data);
      
      // Refresh the inventory data
      await fetchGroupedInventory();
      onStockChange();
      
      // Close the confirmation modal
      setDeleteConfirmModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting group:', err);
      alert('Failed to delete group. Please try again.');
    } finally {
      setDeletingGroup(null);
    }
  }

  function handleDeleteCancel() {
    setDeleteConfirmModalOpen(false);
    setItemToDelete(null);
  }

  function filterInventory(inventory: GroupedInventoryItem[], query: string) {
    if (!query) return inventory;
    const lowerQuery = query.toLowerCase();
    return inventory.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.sku.toLowerCase().includes(lowerQuery) ||
      item.family.toLowerCase().includes(lowerQuery) ||
      item.pn.toLowerCase().includes(lowerQuery) ||
      item.serialNumbers.some(sn => sn.toLowerCase().includes(lowerQuery))
    );
  }

  function renderGroupedTable(title: string, filteredInventory: GroupedInventoryItem[]) {
    const sortedInventory = [...filteredInventory].sort((a, b) => {
      // Sort by name (alphabetically), then by SKU (alphabetically)
      const nameCompare = a.name.localeCompare(b.name);
      if (nameCompare !== 0) {
        return nameCompare;
      }
      return a.sku.localeCompare(b.sku);
    });

    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title} Inventory</h2>
        </div>
        {sortedInventory.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            {searchQuery ? 'No matching items found.' : 'No inventory items in this location.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Family</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Numbers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedInventory.map((item, index) => {
                  const groupKey = `${item.name}-${item.sku}-${item.location}`;
                  const isDeleting = deletingGroup === groupKey;
                  
                  return (
                    <tr key={`${item.name}-${item.sku}-${item.location}-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.family}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.pn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-semibold text-lg">{item.totalQuantity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.totalQuantity === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Empty
                          </span>
                        ) : item.hasSerialNumbers ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.serialNumbers.length} SN{item.serialNumbers.length !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            No SN
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDetailClick(item)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                            disabled={isDeleting}
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading inventory data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const filteredInventory = filterInventory(groupedInventory, searchQuery);
  const isvInventory = filteredInventory.filter(item => item.location === 'ISV');
  const houstonInventory = filteredInventory.filter(item => item.location === 'Houston');

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, SKU, family, PN, or SN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80 px-4 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
                />
              </div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as 'all' | 'ISV' | 'Houston')}
                className="w-full sm:w-32 px-1 py-0.5 text-sm text-gray-700 bg-gray-50 rounded focus:outline-none focus:ring-0 transition-colors duration-200"
              >
                <option value="all">All Locations</option>
                <option value="ISV">ISV Only</option>
                <option value="Houston">Houston Only</option>
              </select>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              {searchQuery && (
                <div className="flex items-center space-x-2">
                  <span>
                    Found: {filteredInventory.length} product groups
                  </span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {renderGroupedTable('ISV', isvInventory)}
      {renderGroupedTable('Houston', houstonInventory)}

      <DetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onItemUpdate={() => {
          fetchGroupedInventory();
        }}
        onItemDelete={() => {
          fetchGroupedInventory();
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Inventory Group</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to permanently delete this inventory group? This action cannot be undone.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium text-red-800">Product:</span> {itemToDelete.name}</div>
                  <div><span className="font-medium text-red-800">SKU:</span> {itemToDelete.sku}</div>
                  <div><span className="font-medium text-red-800">Location:</span> {itemToDelete.location}</div>
                  <div><span className="font-medium text-red-800">Total Quantity:</span> {itemToDelete.totalQuantity} items</div>
                  <div><span className="font-medium text-red-800">Serial Numbers:</span> {itemToDelete.hasSerialNumbers ? `${itemToDelete.serialNumbers.length} items` : 'None'}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingGroup === `${itemToDelete.name}-${itemToDelete.sku}-${itemToDelete.location}`}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingGroup === `${itemToDelete.name}-${itemToDelete.sku}-${itemToDelete.location}` ? 'Deleting...' : 'Delete Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStockChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
          >
            {showAddForm ? 'Hide Add Form' : 'Add Product Category'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-8">
          <AddStockForm onStockAdded={handleStockChange} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <GroupedInventoryOverview onStockChange={() => handleStockChange()} />
      </div>
      <InventoryChatBox />
    </div>
  );
} 