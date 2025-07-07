"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface InquiryItem {
  productId: string;
  quantity: number;
  family?: string;
}

interface Inquiry {
  _id: string;
  company: string;
  contact: string;
  items: InquiryItem[];
  createdAt: string;
  submitter?: string;
  status: 'requested' | 'processing' | 'complete';
}

export default function InquiryForm() {
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [items, setItems] = useState<InquiryItem[]>([{ productId: "", quantity: 1, family: "" }]);
  const [products, setProducts] = useState<any[]>([]);
  const [families, setFamilies] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const { data: session } = useSession();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/product")
      .then((res) => res.json())
      .then((data) => {
        const productList = Array.isArray(data) ? data : (data.products || []);
        productList.sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name));
        setProducts(productList);
        
        // Extract unique families
        const uniqueFamilies = [...new Set(productList.map((p: any) => p.family))].filter((family): family is string => typeof family === 'string').sort();
        setFamilies(uniqueFamilies);
      });
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    const res = await fetch("/api/inquiry");
    if (res.ok) {
      const data = await res.json();
      setInquiries(data);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, family: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InquiryItem, value: string | number) => {
    const newItems = [...items];
    if (field === "quantity") {
      const numValue = typeof value === 'number' ? value : parseInt(value, 10);
      newItems[index] = {
        ...newItems[index],
        quantity: isNaN(numValue) || numValue < 1 ? 1 : numValue,
      };
    } else if (field === "family") {
      // When family changes, reset productId
      newItems[index] = { 
        ...newItems[index], 
        [field]: String(value),
        productId: "" // Reset product selection when family changes
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: String(value) };
    }
    setItems(newItems);
  };

  // Get products filtered by family
  const getProductsByFamily = (family: string) => {
    return products.filter(p => p.family === family);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, contact, items, submitter: session?.user?.email }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit inquiry");
      }
      setCompany("");
      setContact("");
      setItems([{ productId: "", quantity: 1, family: "" }]);
      setSuccess("Inquiry submitted successfully! You will receive a confirmation email shortly.");
      fetchInquiries();
    } catch (err: any) {
      setError(err.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter inquiries to only those submitted by the current user
  const userInquiries = session?.user?.email ? inquiries.filter(inq => inq.submitter === session?.user?.email) : [];

  // Add a type guard for productId
  function isPopulatedProduct(productId: unknown): productId is { _id: string; name?: string; sku?: string } {
    return typeof productId === 'object' && productId !== null && '_id' in productId;
  }

  const handleCancelInquiry = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/inquiry?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel inquiry');
      setInquiries(inquiries.filter(inq => inq._id !== id));
    } catch (err) {
      // Optionally show error
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Inquiry</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Enter your company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Email or phone number"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Product Details</h3>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
            >
              Add Product
            </button>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-md bg-gray-50 items-start"
            >
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Family</label>
                <select
                  value={item.family || ""}
                  onChange={(e) => updateItem(index, "family", e.target.value)}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="">Select family</option>
                  {families.map((family) => (
                    <option key={family} value={family}>{family}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(index, "productId", e.target.value)}
                  required
                  disabled={!item.family}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select product</option>
                  {item.family && getProductsByFamily(item.family).map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (SKU: {p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              {items.length > 1 && (
                <div className="md:col-span-1 flex items-center pt-6">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-green-600">{success}</div>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Inquiry"}
          </button>
        </div>
      </form>
      {/* Show user's own inquiries */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">Your Inquiries</h3>
        {userInquiries.length === 0 ? (
          <div className="text-gray-500">No inquiries found.</div>
        ) : (
          <ul className="space-y-4">
            {userInquiries.map((inq) => {
              const status = inq.status || 'requested';
              return (
                <li key={inq._id} className="border rounded p-4 bg-gray-50">
                  <div><span className="font-medium">Company:</span> {inq.company}</div>
                  <div><span className="font-medium">Contact:</span> {inq.contact}</div>
                  <div><span className="font-medium">Submitted:</span> {new Date(inq.createdAt).toLocaleString()}</div>
                  <div>
                    <span className="font-medium">Products:</span>
                    <ul className="ml-4 list-disc">
                      {inq.items.map((item, idx) => (
                        <li key={idx}>
                          Product: {isPopulatedProduct(item.productId) ? item.productId.name || item.productId._id : item.productId},
                          Quantity: {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={
                    status === 'requested' ? 'mt-4 text-yellow-600 font-semibold' :
                    status === 'processing' ? 'mt-4 text-blue-600 font-semibold' :
                    'mt-4 text-green-600 font-semibold'
                  }>
                    Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                  {status === 'requested' && (
                    <button
                      onClick={() => handleCancelInquiry(inq._id)}
                      disabled={cancellingId === inq._id}
                      className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {cancellingId === inq._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
