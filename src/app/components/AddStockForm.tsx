'use client';
import { useState } from 'react';

export default function AddStockForm({ onStockAdded }: { onStockAdded: () => void }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    family: "",
    pn: "",
    location: "ISV",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: 0,
          sn: "",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add inventory item");
      } else {
        setSuccess("Product added! Now add quantity and serial numbers in the detail view.");
        setForm({ name: "", sku: "", family: "", pn: "", location: "ISV" });
        onStockAdded();
      }
    } catch (err) {
      setError("Failed to add inventory item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow max-w-lg mx-auto">
      <h2 className="text-lg font-semibold mb-2">Add New Inventory Product</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SKU</label>
          <input
            name="sku"
            value={form.sku}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Family</label>
          <input
            name="family"
            value={form.family}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Part Number (PN)</label>
          <input
            name="pn"
            value={form.pn}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded focus:outline-none"
            required
          >
            <option value="ISV">ISV</option>
            <option value="Houston">Houston</option>
          </select>
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
} 