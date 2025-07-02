'use client'
import { useState, useEffect } from 'react';

interface Product {
  _id: string;
  name?: string;
  imgUrl?: string;
  familyImgUrl?: string;
  category?: string;
  sku?: string;
  pn?: string;
  family?: string;
  processor?: string;
  platform?: string;
  tops?: string | number;
  ai_accelerator?: string;
  memory?: string;
  storage?: string;
  os?: string;
  wireless?: string;
  bluetooth?: string;
  I_O?: string;
  button?: string;
  ethernet?: string;
  hdmi?: string;
  power?: string;
  cooling_fan?: string;
  operating_temperature?: string;
  mechanical_dimension?: string;
  weight?: string;
  di_do?: string;
  display?: string;
  audio?: string;
  camera?: string;
  battery?: string;
  certification?: string;
  tag?: string;
  status?: string;
  downloadUrl?: string;
}

export default function CreateProductPage() {
  // Required fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [pn, setPn] = useState('');
  const [family, setFamily] = useState('');
  const [status, setStatus] = useState('enable');

  // Optional fields
  const [imgUrl, setImgUrl] = useState('');
  const [familyImgUrl, setFamilyImgUrl] = useState('');
  const [processor, setProcessor] = useState('');
  const [platform, setPlatform] = useState('');
  const [tops, setTops] = useState('');
  const [ai_accelerator, setAiAccelerator] = useState('');
  const [memory, setMemory] = useState('');
  const [storage, setStorage] = useState('');
  const [os, setOs] = useState('');
  const [wireless, setWireless] = useState('');
  const [io, setIo] = useState('');
  const [ethernet, setEthernet] = useState('');
  const [hdmi, setHdmi] = useState('');
  const [power, setPower] = useState('');
  const [cooling_fan, setCoolingFan] = useState('');
  const [operating_temperature, setOperatingTemperature] = useState('');
  const [mechanical_dimension, setMechanicalDimension] = useState('');
  const [weight, setWeight] = useState('');
  const [di_do, setDiDo] = useState('');
  const [display, setDisplay] = useState('');
  const [audio, setAudio] = useState('');
  const [camera, setCamera] = useState('');
  const [battery, setBattery] = useState('');
  const [certification, setCertification] = useState('');
  const [tag, setTag] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [bluetooth, setBluetooth] = useState('');
  const [button, setButton] = useState('');

  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/product');
      if (res.ok) {
        const data: Product[] = await res.json();
        setProducts(data);
      }
    } catch {
      // Silent error handling
    }
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setCreating(true);
    setError(false);
    setCreated(false);

    const body = {
      name,
      category,
      sku,
      pn,
      family,
      status,
      imgUrl,
      familyImgUrl,
      processor,
      platform,
      tops: tops ? Number(tops) : undefined,
      ai_accelerator,
      memory,
      storage,
      os,
      wireless,
      bluetooth,
      I_O: io,
      button,
      ethernet,
      hdmi,
      power,
      cooling_fan: cooling_fan || '',
      operating_temperature,
      mechanical_dimension,
      weight,
      di_do,
      display,
      audio,
      camera,
      battery,
      certification,
      tag,
      downloadUrl,
    };

    console.log('Submitting product data:', body);
    console.log('Cooling & Fan value:', cooling_fan);
    console.log('JSON stringified body:', JSON.stringify(body));

    try {
      let response: Response;
      if (editingId) {
        console.log('Updating product with ID:', editingId);
        const requestBody = JSON.stringify(body);
        console.log('PUT request body:', requestBody);
        response = await fetch(`/api/product?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        });
      } else {
        console.log('Creating new product');
        const requestBody = JSON.stringify(body);
        console.log('POST request body:', requestBody);
        response = await fetch('/api/product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('API response:', result);
        setCreated(true);
        resetForm();
        fetchProducts();
      } else {
        console.error('API error:', response.status, response.statusText);
        setError(true);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(true);
    }

    setCreating(false);
  }

  function resetForm() {
    setName('');
    setCategory('');
    setSku('');
    setPn('');
    setFamily('');
    setStatus('enable');
    setImgUrl('');
    setFamilyImgUrl('');
    setProcessor('');
    setPlatform('');
    setTops('');
    setAiAccelerator('');
    setMemory('');
    setStorage('');
    setOs('');
    setWireless('');
    setIo('');
    setEthernet('');
    setHdmi('');
    setPower('');
    setCoolingFan('');
    setOperatingTemperature('');
    setMechanicalDimension('');
    setWeight('');
    setDiDo('');
    setDisplay('');
    setAudio('');
    setCamera('');
    setBattery('');
    setCertification('');
    setTag('');
    setDownloadUrl('');
    setBluetooth('');
    setButton('');
    setEditingId(null);
    setIsEditing(false);
  }

  function handleEdit(prod: Product) {
    setEditingId(prod._id);
    setName(prod.name || '');
    setCategory(prod.category || '');
    setSku(prod.sku || '');
    setPn(prod.pn || '');
    setFamily(prod.family || '');
    setStatus(prod.status || 'enable');
    setImgUrl(prod.imgUrl || '');
    setFamilyImgUrl(prod.familyImgUrl || '');
    setProcessor(prod.processor || '');
    setPlatform(prod.platform || '');
    setTops(prod.tops?.toString() || '');
    setAiAccelerator(prod.ai_accelerator || '');
    setMemory(prod.memory || '');
    setStorage(prod.storage || '');
    setOs(prod.os || '');
    setWireless(prod.wireless || '');
    setIo(prod.I_O || '');
    setEthernet(prod.ethernet || '');
    setHdmi(prod.hdmi || '');
    setPower(prod.power || '');
    setCoolingFan(prod.cooling_fan || '');
    setOperatingTemperature(prod.operating_temperature || '');
    setMechanicalDimension(prod.mechanical_dimension || '');
    setWeight(prod.weight || '');
    setDiDo(prod.di_do || '');
    setDisplay(prod.display || '');
    setAudio(prod.audio || '');
    setCamera(prod.camera || '');
    setBattery(prod.battery || '');
    setCertification(prod.certification || '');
    setTag(prod.tag || '');
    setDownloadUrl(prod.downloadUrl || '');
    setBluetooth(prod.bluetooth || '');
    setButton(prod.button || '');
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(productId: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/product?id=${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchProducts();
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      alert("An error occurred while deleting.");
    }
  }

  return (
    <section className="mt-12 max-w-4xl mx-auto bg-white shadow-lg p-8 rounded-2xl">
      <h1 className="text-center text-3xl font-bold text-primary mb-6">
        {isEditing ? 'Edit Product' : 'Create New Product'}
      </h1>

      {(created && !isEditing) && (
        <div className="mb-4 p-3 text-green-700 bg-green-100 rounded-lg text-center">
          ✅ Product created successfully!
        </div>
      )}
      {(created && isEditing) && (
        <div className="mb-4 p-3 text-blue-700 bg-blue-100 rounded-lg text-center">
          ✏️ Product updated successfully!
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-lg text-center">
          ❌ Failed to {isEditing ? 'update' : 'create'} product. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required Fields */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-4">Required Fields</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Product Name *" value={name} disabled={creating} onChange={e => setName(e.target.value)} required className="w-full border rounded-xl p-3" />
            <select value={category} onChange={e => setCategory(e.target.value)} disabled={creating} required className="w-full border rounded-xl p-3">
              <option value="">Select Category</option>
              <option value="Server">Server</option>
              <option value="Edge Server">Edge Server</option>
              <option value="Edge">Edge</option>
              <option value="Parts">Parts</option>
              <option value="Other">Other</option>
            </select>
            <input type="text" placeholder="SKU *" value={sku} disabled={creating} onChange={e => setSku(e.target.value)} required className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Part Number (pn) *" value={pn} disabled={creating} onChange={e => setPn(e.target.value)} required className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Family *" value={family} disabled={creating} onChange={e => setFamily(e.target.value)} required className="w-full border rounded-xl p-3" />
            <select value={status} onChange={e => setStatus(e.target.value)} disabled={creating} required className="w-full border rounded-xl p-3">
              <option value="enable">Enable</option>
              <option value="disable">Disable</option>
            </select>
          </div>
        </div>

        {/* Product Image */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Product Image</h2>
          <input type="text" placeholder="Image URL" value={imgUrl} disabled={creating} onChange={e => setImgUrl(e.target.value)} className="w-full border rounded-xl p-3" />
          {imgUrl && (
            <div className="w-full mt-2">
              <img src={imgUrl} alt="Preview" className="max-h-48 object-contain rounded mx-auto" />
            </div>
          )}
        </div>

        {/* Family Image */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Family Image (Optional)</h2>
          <p className="text-sm text-gray-600 mb-2">This image will be displayed on the product family page. If not provided, the product image will be used.</p>
          <input type="text" placeholder="Family Image URL" value={familyImgUrl} disabled={creating} onChange={e => setFamilyImgUrl(e.target.value)} className="w-full border rounded-xl p-3" />
          {familyImgUrl && (
            <div className="w-full mt-2">
              <img src={familyImgUrl} alt="Family Preview" className="max-h-48 object-contain rounded mx-auto" />
            </div>
          )}
        </div>

        {/* Specifications */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Processor" value={processor} disabled={creating} onChange={e => setProcessor(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Platform" value={platform} disabled={creating} onChange={e => setPlatform(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="number" placeholder="TOPS" value={tops} disabled={creating} onChange={e => setTops(e.target.value)} min={0} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="AI Accelerator" value={ai_accelerator} disabled={creating} onChange={e => setAiAccelerator(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Memory" value={memory} disabled={creating} onChange={e => setMemory(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Storage" value={storage} disabled={creating} onChange={e => setStorage(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Operating System" value={os} disabled={creating} onChange={e => setOs(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Wireless" value={wireless} disabled={creating} onChange={e => setWireless(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Bluetooth" value={bluetooth} disabled={creating} onChange={e => setBluetooth(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="I/O" value={io} disabled={creating} onChange={e => setIo(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Button" value={button} disabled={creating} onChange={e => setButton(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Ethernet" value={ethernet} disabled={creating} onChange={e => setEthernet(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="HDMI" value={hdmi} disabled={creating} onChange={e => setHdmi(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Power" value={power} disabled={creating} onChange={e => setPower(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Operating Temperature" value={operating_temperature} disabled={creating} onChange={e => setOperatingTemperature(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Mechanical Dimension" value={mechanical_dimension} disabled={creating} onChange={e => setMechanicalDimension(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Weight" value={weight} disabled={creating} onChange={e => setWeight(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="DI/DO" value={di_do} disabled={creating} onChange={e => setDiDo(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Display" value={display} disabled={creating} onChange={e => setDisplay(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Audio" value={audio} disabled={creating} onChange={e => setAudio(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Camera" value={camera} disabled={creating} onChange={e => setCamera(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Battery" value={battery} disabled={creating} onChange={e => setBattery(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Cooling & Fan" value={cooling_fan} disabled={creating} onChange={e => setCoolingFan(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Certification" value={certification} disabled={creating} onChange={e => setCertification(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Tag (e.g., Best Seller)" value={tag} disabled={creating} onChange={e => setTag(e.target.value)} className="w-full border rounded-xl p-3" />
            <input type="text" placeholder="Download URL" value={downloadUrl} disabled={creating} onChange={e => setDownloadUrl(e.target.value)} className="w-full border rounded-xl p-3" />
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={creating} className="w-full text-white bg-primary hover:bg-opacity-90 transition px-6 py-3 rounded-xl font-semibold">
            {creating ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Product' : 'Create Product')}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-300 rounded-xl font-semibold">
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-primary text-center">All Products</h2>
        {products.length === 0 && <p className="text-center text-gray-500">No products found.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map(prod => (
            <div key={prod._id} className="border rounded-xl p-4 shadow hover:shadow-md transition relative">
              {prod.imgUrl && (
                <img
                  src={prod.imgUrl}
                  alt={prod.name}
                  className="mb-4 w-full max-h-48 object-contain rounded"
                />
              )}
              <h3 className="text-lg font-bold mb-2">{prod.name}</h3>
              <ul className="text-sm text-gray-800 space-y-1 mb-4">
                <li><strong>Category:</strong> {prod.category}</li>
                <li><strong>SKU:</strong> {prod.sku}</li>
                <li><strong>Platform:</strong> {prod.platform}</li>
                <li><strong>TOPS:</strong> {prod.tops}</li>
                <li><strong>Status:</strong> {prod.status}</li>
              </ul>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(prod)}
                  className="text-sm text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(prod._id)}
                  className="text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
