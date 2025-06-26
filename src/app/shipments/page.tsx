'use client';
import { useState, useEffect } from 'react';
import ShipmentForm from '../components/ShipmentForm';
import InventoryChatBox from '../components/InventoryChatBox';

interface ShipmentInventoryItem {
  inventoryId: string;
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

interface InquiryItem {
  productId: { name: string; sku?: string; chip?: string; platform?: string } | string;
  quantity: number;
  sku?: string;
}

interface Inquiry {
  _id: string;
  company: string;
  contact: string;
  items: InquiryItem[];
  createdAt: string;
  submitter: string;
  status: 'requested' | 'processing' | 'complete';
  completedAt?: string;
}

// Status color mapping
function getStatusColor(status: string) {
  switch (status) {
    case 'requested':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'in_transit':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'complete':
      return 'bg-emerald-100 text-emerald-800';
    case 'canceled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Delete Confirmation Modal
function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  shipmentDetails 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  shipmentDetails: Shipment | null;
}) {
  if (!isOpen || !shipmentDetails) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {shipmentDetails.status === 'requested' 
            ? 'Confirm Shipment Deletion' 
            : shipmentDetails.status === 'canceled'
            ? 'Delete Canceled Shipment'
            : 'Delete Shipment History'}
        </h3>
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            {shipmentDetails.status === 'requested' 
              ? 'Are you sure you want to delete this shipment? This will return items to inventory.'
              : shipmentDetails.status === 'canceled'
              ? 'Are you sure you want to delete this canceled shipment? Items have already been returned to inventory.'
              : 'Are you sure you want to delete this shipment history? This will not affect inventory.'}
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-2">Shipment details:</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>PO Number: {shipmentDetails.poNumber}</p>
              <p>From: {shipmentDetails.from}</p>
              <p>To: {shipmentDetails.to}</p>
              <p>Status: <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(shipmentDetails.status)}`}>
                {shipmentDetails.status}
              </span></p>
              <p>Total Amount: ${shipmentDetails.grandTotal.toFixed(2)}</p>
              <div className="mt-2">
                <p className="font-medium mb-1">Items:</p>
                <ul className="list-disc list-inside">
                  {shipmentDetails.inventory.map((item, index) => (
                    <li key={index}>
                      {item.name} (SKU: {item.sku}) - Qty: {item.quantity} - ${item.amount.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            {shipmentDetails.status === 'requested' ? 'Delete Shipment' : 'Delete History'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<Shipment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [deletingInquiryId, setDeletingInquiryId] = useState<string | null>(null);
  const [fulfillingInquiryId, setFulfillingInquiryId] = useState<string | null>(null);
  const [processingInquiryId, setProcessingInquiryId] = useState<string | null>(null);
  const [inquirySearch, setInquirySearch] = useState('');
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showInquiryHistory, setShowInquiryHistory] = useState(false);

  useEffect(() => {
    fetchShipments();
    fetchInquiries();
  }, []);

  async function fetchShipments() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (fromFilter) params.append('from', fromFilter);
      
      const res = await fetch(`/api/shipment?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch shipments');
      const data = await res.json();
      setShipments(data);
    } catch (err) {
      setError('Failed to load shipment data');
    } finally {
      setLoading(false);
    }
  }

  async function fetchInquiries() {
    try {
      const res = await fetch('/api/inquiry');
      if (!res.ok) throw new Error('Failed to fetch inquiries');
      const data = await res.json();
      setInquiries(data);
    } catch (err) {
      // Optionally set error
    }
  }

  async function handleStatusUpdate(shipmentId: string, newStatus: string) {
    setUpdatingId(shipmentId);
    try {
      const res = await fetch(`/api/shipment?id=${shipmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update shipment status');
      
      // Update the shipment in the local state
      setShipments(prev => 
        prev.map(shipment => 
          shipment._id === shipmentId 
            ? { ...shipment, status: newStatus as any }
            : shipment
        )
      );
    } catch (err) {
      setError('Failed to update shipment status');
    } finally {
      setUpdatingId(null);
    }
  }

  function handleDeleteClick(shipment: Shipment) {
    setShipmentToDelete(shipment);
    setDeleteModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!shipmentToDelete) return;

    setUpdatingId(shipmentToDelete._id);
    try {
      const res = await fetch(`/api/shipment?id=${shipmentToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updateStock: shipmentToDelete.status === 'requested' // Only update stock if shipment is requested (not canceled)
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to delete shipment');
        return;
      }

      await fetchShipments();
      setDeleteModalOpen(false);
      setShipmentToDelete(null);
    } catch (err) {
      setError('Failed to delete shipment');
    } finally {
      setUpdatingId(null);
    }
  }

  function handleDeleteCancel() {
    setDeleteModalOpen(false);
    setShipmentToDelete(null);
  }

  async function handleDeleteInquiry(id: string) {
    setDeletingInquiryId(id);
    try {
      const res = await fetch(`/api/inquiry?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete inquiry');
      setInquiries(inquiries.filter(inq => inq._id !== id));
    } catch (err) {
      // Optionally show error
    } finally {
      setDeletingInquiryId(null);
    }
  }

  function handleEditClick(shipment: Shipment) {
    setEditingShipment(shipment);
    setIsEditing(true);
    setShowForm(true);
  }

  function handleEditComplete() {
    setEditingShipment(null);
    setIsEditing(false);
    setShowForm(false);
    fetchShipments(); // Refresh the shipments list
  }

  async function handleFulfillInquiry(id: string) {
    setFulfillingInquiryId(id);
    try {
      const res = await fetch(`/api/inquiry?id=${id}&action=fulfill`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to fulfill inquiry');
      setInquiries(inquiries.filter(inq => inq._id !== id));
    } catch (err) {
      // Optionally show error
    } finally {
      setFulfillingInquiryId(null);
    }
  }

  async function handleProcessInquiry(id: string) {
    setProcessingInquiryId(id);
    try {
      const res = await fetch(`/api/inquiry?id=${id}&action=process`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to set inquiry to processing');
      setInquiries(inquiries.map(inq => inq._id === id ? { ...inq, status: 'processing' } : inq));
    } catch (err) {
      // Optionally show error
    } finally {
      setProcessingInquiryId(null);
    }
  }

  // Filter inquiries by company or contact
  const filteredInquiries = inquiries.filter(inq => {
    if (!inquirySearch.trim()) return true;
    const q = inquirySearch.trim().toLowerCase();
    return (
      inq.company.toLowerCase().includes(q) ||
      inq.contact.toLowerCase().includes(q)
    );
  });

  // Separate active inquiries from history
  const activeInquiries = filteredInquiries.filter(inquiry => 
    inquiry.status !== 'complete'
  );
  
  const historyInquiries = filteredInquiries.filter(inquiry => 
    inquiry.status === 'complete'
  );

  const currentInquiries = showInquiryHistory ? historyInquiries : activeInquiries;

  const filteredShipments = shipments.filter(shipment =>
    shipment.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.invoice?.toString().includes(searchQuery.toLowerCase()) ||
    shipment.carrier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.inventory.some(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Separate active shipments from history
  const activeShipments = filteredShipments.filter(shipment => 
    !['canceled', 'complete'].includes(shipment.status)
  );
  
  const historyShipments = filteredShipments.filter(shipment => 
    ['canceled', 'complete'].includes(shipment.status)
  );

  const currentShipments = showHistory ? historyShipments : activeShipments;

  const ShipmentTable = ({ shipments, title }: { shipments: Shipment[], title: string }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <tr key={shipment._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {shipment.poNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shipment.from}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {shipment.to}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-xs">
                    {shipment.inventory.map((item, index) => (
                      <div key={index} className="text-xs">
                        {item.name} (Qty: {item.quantity})
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${shipment.grandTotal.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={shipment.status}
                    onChange={(e) => handleStatusUpdate(shipment._id, e.target.value)}
                    disabled={updatingId === shipment._id || ['complete', 'delivered', 'canceled'].includes(shipment.status)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)} border-0 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="requested">Requested</option>
                    <option value="processing">Processing</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="complete">Complete</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(shipment.createtimestamp).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {shipment.status === 'requested' && (
                      <button
                        onClick={() => handleEditClick(shipment)}
                        disabled={updatingId === shipment._id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(shipment)}
                      disabled={updatingId === shipment._id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading shipments...</div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Shipment' : 'Create New Shipment'}
            </h1>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingShipment(null);
                setIsEditing(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Shipments
            </button>
          </div>
          <ShipmentForm 
            onShipmentCreated={handleEditComplete}
            shipment={editingShipment}
            isEditing={isEditing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Shipments</h1>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Create New Shipment
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PO, destination, invoice, carrier, or items..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="requested">Requested</option>
                  <option value="processing">Processing</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="complete">Complete</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <select
                  value={fromFilter}
                  onChange={(e) => setFromFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  <option value="ISV">ISV</option>
                  <option value="Houston">Houston</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchShipments}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Toggle between Active and History */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowHistory(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  !showHistory
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active Shipments ({activeShipments.length})
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  showHistory
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Shipment History ({historyShipments.length})
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Shipments Table */}
          {currentShipments.length > 0 ? (
            <ShipmentTable shipments={currentShipments} title={`${showHistory ? 'Shipment History' : 'Active Shipments'} (${currentShipments.length})`} />
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">
                {showHistory 
                  ? 'No shipment history found.' 
                  : 'No active shipments found.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Customer Inquiries Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Inquiries</h2>
          
          <div className="mb-4 flex items-center">
            <input
              type="text"
              placeholder="Search by company or contact..."
              value={inquirySearch}
              onChange={e => setInquirySearch(e.target.value)}
              className="w-full md:w-96 px-4 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
            />
          </div>
          
          {/* Toggle between Active and History Inquiries */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowInquiryHistory(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  !showInquiryHistory
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active Inquiries ({activeInquiries.length})
              </button>
              <button
                onClick={() => setShowInquiryHistory(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  showInquiryHistory
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inquiry History ({historyInquiries.length})
              </button>
            </div>
          </div>
          
          {currentInquiries.length === 0 ? (
            <div className="text-gray-500">
              {showInquiryHistory 
                ? 'No inquiry history found.' 
                : 'No active inquiries found.'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitter</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentInquiries.map((inq) => {
                    const status = inq.status || 'requested';
                    return (
                      <tr key={inq._id}>
                        <td className="px-4 py-2 whitespace-nowrap">{inq.company}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{inq.contact}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{inq.submitter || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{new Date(inq.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <ul className="space-y-2">
                            {inq.items.map((item, idx) => (
                              <li key={idx} className="bg-gray-50 rounded p-2 border">
                                <div><span className="font-medium">Product:</span> {typeof item.productId === 'object' ? item.productId.name : item.productId}</div>
                                <div><span className="font-medium">SKU:</span> {item.sku || (typeof item.productId === 'object' ? item.productId.sku : '') || <span className="text-gray-400">N/A</span>}</div>
                                <div><span className="font-medium">Quantity:</span> {item.quantity}</div>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className={
                          status === 'requested' ? 'px-4 py-2 text-yellow-600 font-semibold' :
                          status === 'processing' ? 'px-4 py-2 text-blue-600 font-semibold' :
                          'px-4 py-2 text-green-600 font-semibold'
                        }>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {status === 'requested' && (
                            <button
                              onClick={() => handleProcessInquiry(inq._id)}
                              disabled={processingInquiryId === inq._id}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 mr-2"
                            >
                              {processingInquiryId === inq._id ? 'Processing...' : 'Mark Processing'}
                            </button>
                          )}
                          {(status === 'requested' || status === 'processing') && (
                            <button
                              onClick={() => handleFulfillInquiry(inq._id)}
                              disabled={fulfillingInquiryId === inq._id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 mr-2"
                            >
                              {fulfillingInquiryId === inq._id ? 'Completing...' : 'Mark Complete'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInquiry(inq._id)}
                            disabled={deletingInquiryId === inq._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deletingInquiryId === inq._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          shipmentDetails={shipmentToDelete}
        />
      </div>
      <InventoryChatBox />
    </div>
  );
} 