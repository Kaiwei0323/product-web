'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  pn: string;
  family: string;
  category: string;
  platform: string;
  processor: string;
  ai_accelerator: string;
  tops: number;
  memory: string;
  storage: string;
  os: string;
  wireless: string;
  bluetooth: string;
  I_O: string;
  button: string;
  ethernet: string;
  hdmi: string;
  power: string;
  cooling_fan: string;
  operating_temperature: string;
  mechanical_dimension: string;
  weight: string;
  di_do: string;
  display: string;
  audio: string;
  camera: string;
  battery: string;
  certification: string;
  tag: string;
  downloadUrl: string;
  imgUrl: string;
}

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: Product[];
}

export default function ProductComparison({ isOpen, onClose, selectedProducts }: ProductComparisonProps) {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedSKUs, setSelectedSKUs] = useState<{ [key: string]: string }>({});
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen && selectedProducts.length > 0) {
      setProducts(selectedProducts);
      
      // Fetch all products to get all available SKUs
      fetchAllProducts();
      
      // Initialize selected SKUs with the current products
      const initialSKUs: { [key: string]: string } = {};
      selectedProducts.forEach(product => {
        initialSKUs[product.family] = product._id;
      });
      setSelectedSKUs(initialSKUs);
    }
  }, [isOpen, selectedProducts]);

  const fetchAllProducts = async () => {
    try {
      const res = await fetch('/api/product');
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      }
    } catch (err) {
      console.error('Error fetching all products:', err);
    }
  };

  const handleSKUChange = (familyName: string, productId: string) => {
    const newProduct = allProducts.find(p => p._id === productId);
    if (newProduct) {
      setSelectedSKUs(prev => ({
        ...prev,
        [familyName]: productId
      }));
      
      setProducts(prev => {
        const updated = prev.map(p => 
          p.family === familyName ? newProduct : p
        );
        return updated;
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      
      // Get company name from user session (same as download functionality)
      const companyName = (session?.user as any)?.companyname || (session?.user as any)?.company || session?.user?.name || 'Unknown Company';
      
      console.log('Sending export request with:', {
        productsCount: products.length,
        companyName,
        products: products.map(p => ({ name: p.name, family: p.family }))
      });
      
      const response = await fetch('/api/compare/export/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: products,
          companyName: companyName
        }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('Blob received, size:', blob.size);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `product_comparison_${companyName}_${new Date().toLocaleDateString()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('PDF downloaded successfully');
      } else {
        const errorData = await response.json();
        console.error('Export failed:', errorData);
        alert(`Export failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  console.log('ProductComparison rendered with:', { 
    productsCount: products.length, 
    exporting, 
    isOpen 
  });

  // Get all unique specification fields across all products
  const getAllSpecFields = () => {
    const fields = new Set<string>();
    products.forEach(product => {
      Object.keys(product).forEach(key => {
        if (key !== '_id' && key !== 'imgUrl' && key !== 'familyImgUrl' && key !== 'downloadUrl' && 
            key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
          fields.add(key);
        }
      });
    });
    
    // Define custom order for fields
    const fieldOrder = [
      'name',
      'sku',
      'pn',
      'family',
      'category',
      'platform', 
      'processor',
      'ai_accelerator',
      'tops',
      'memory',
      'storage',
      'os',
      'wireless',
      'bluetooth',
      'ethernet',
      'hdmi',
      'power',
      'cooling_fan',
      'operating_temperature',
      'mechanical_dimension',
      'weight',
      'di_do',
      'display',
      'audio',
      'camera',
      'battery',
      'certification',
      'tag',
      'I_O',
      'button',
      'status'
    ];
    
    // Get all fields and sort them according to custom order
    const allFields = Array.from(fields);
    const orderedFields = fieldOrder.filter(field => allFields.includes(field));
    const remainingFields = allFields.filter(field => !fieldOrder.includes(field)).sort();
    
    return [...orderedFields, ...remainingFields];
  };

  // Format field name for display
  const formatFieldName = (field: string) => {
    const fieldMappings: { [key: string]: string } = {
      'os': 'OS',
      'hdmi': 'HDMI',
      'di_do': 'DI/DO',
      'I_O': 'I/O',
      'ai_accelerator': 'AI Accelerator',
      'operating_temperature': 'Operating Temperature',
      'mechanical_dimension': 'Mechanical Dimension',
      'cooling_fan': 'Cooling & Fan',
      'pn': 'Part Number',
      'sku': 'SKU'
    };
    
    if (fieldMappings[field]) {
      return fieldMappings[field];
    }
    
    // Default formatting: capitalize and replace underscores with spaces
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const specFields = getAllSpecFields();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Product Comparison ({products.length} products)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Use the dropdown menus below each product to switch between different SKUs within the same family
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-auto max-h-[calc(90vh-200px)]">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-900 min-w-[200px]">
                  Specification
                </th>
                {products.map((product, index) => {
                  // Get all products from the same family
                  const familyProducts = allProducts.filter(p => p.family === product.family);
                  
                  return (
                    <th key={product._id} className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-900 min-w-[200px]">
                      <div className="flex flex-col items-center">
                        <img 
                          src={product.imgUrl || '/placeholder-product.jpg'} 
                          alt={product.name}
                          className="w-16 h-16 object-contain mb-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500 mb-2">{product.family}</div>
                        
                        {/* SKU Dropdown */}
                        {familyProducts.length > 1 && (
                          <div className="w-full">
                            <select
                              value={selectedSKUs[product.family] || product._id}
                              onChange={(e) => handleSKUChange(product.family, e.target.value)}
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                              {familyProducts.map((familyProduct) => (
                                <option key={familyProduct._id} value={familyProduct._id}>
                                  {familyProduct.sku} - {familyProduct.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {specFields.map((field) => (
                <tr key={field} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900 bg-gray-50">
                    {formatFieldName(field)}
                  </td>
                  {products.map((product) => (
                    <td key={`${product._id}-${field}`} className="border border-gray-200 px-4 py-3 text-center text-sm">
                      {product[field as keyof Product] || 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {products.length} products selected for comparison
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 