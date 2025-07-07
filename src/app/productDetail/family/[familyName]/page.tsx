'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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

export default function FamilyDetailPage() {
  const params = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [familyName, setFamilyName] = useState('');
  const { data: session } = useSession();
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/product');
        if (res.ok) {
          const data = await res.json();
          const decodedFamilyName = decodeURIComponent(params.familyName as string);
          setFamilyName(decodedFamilyName);
          
          // Filter products by family
          const familyProducts = data.filter((product: Product) => 
            product.family === decodedFamilyName
          );
          
          setProducts(familyProducts);
        } else {
          console.error('Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    if (params.familyName) {
      fetchProducts();
    }
  }, [params.familyName]);

  // Get all unique specification fields across all products
  const getAllSpecFields = () => {
    const fields = new Set<string>();
    products.forEach(product => {
      Object.keys(product).forEach(key => {
        if (key !== '_id' && key !== 'name' && key !== 'sku' && key !== 'pn' && 
            key !== 'family' && key !== 'imgUrl' && key !== 'familyImgUrl' && key !== 'downloadUrl' && 
            key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
          fields.add(key);
        }
      });
    });
    
    // Define custom order for fields
    const fieldOrder = [
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
    
    // Always include cooling_fan in the ordered fields, even if it doesn't exist in current products
    const finalOrderedFields = orderedFields.includes('cooling_fan') 
      ? orderedFields 
      : [...orderedFields.slice(0, orderedFields.findIndex(f => f === 'power') + 1), 'cooling_fan', ...orderedFields.slice(orderedFields.findIndex(f => f === 'power') + 1)];
    
    return [...finalOrderedFields, ...remainingFields];
  };

  // Check if all products have the same value for a field
  const isFieldSame = (field: string) => {
    if (products.length <= 1) return true;
    const firstValue = products[0][field as keyof Product];
    return products.every(product => product[field as keyof Product] === firstValue);
  };

  // Get the common value for a field
  const getCommonValue = (field: string) => {
    if (products.length === 0) return '';
    return products[0][field as keyof Product] || '';
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
      'cooling_fan': 'Cooling & Fan'
    };
    
    if (fieldMappings[field]) {
      return fieldMappings[field];
    }
    
    // Default formatting: capitalize and replace underscores with spaces
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl mb-4">No products found for this family</div>
        <Link 
          href="/product" 
          className="text-red-600 hover:text-red-800 underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const specFields = getAllSpecFields();

  const handleDownloadWithWatermark = async (product: Product) => {
    if (!session?.user) {
      alert('Please log in to download specifications');
      return;
    }

    setDownloading(product._id);
    
    try {
      // Get company name from user session
      const companyName = (session.user as any).companyname || (session.user as any).company || session.user.name || 'Unknown Company';
      
      console.log('Downloading PDF:', {
        pdfUrl: product.downloadUrl,
        productName: product.name,
        companyName: companyName
      });
      
      // Call the watermark API
      const response = await fetch('/api/watermark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfUrl: product.downloadUrl,
          productName: product.name,
          companyName: companyName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process watermark');
      }

      // Check if response is PDF (watermarked) or JSON (error)
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/pdf')) {
        // Get the PDF blob
        const pdfBlob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${product.name}_${companyName}_specs.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        window.URL.revokeObjectURL(url);
        
        // Download completed silently - no alert needed
      } else {
        // Handle error response
        const data = await response.json();
        console.error('Watermark API error:', data);
        throw new Error(data.error || 'Failed to process watermark');
      }
    } catch (error) {
      console.error('Download error:', error);
      
      // Offer fallback to download original PDF
      const useOriginal = confirm(
        `Watermarking failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nWould you like to download the original PDF without watermark?`
      );
      
      if (useOriginal) {
        try {
          const link = document.createElement('a');
          link.href = product.downloadUrl;
          link.download = `${product.name}_specs.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          alert('Downloading original PDF without watermark.');
        } catch (fallbackError) {
          console.error('Fallback download error:', fallbackError);
          alert('Failed to download specifications. Please try again.');
        }
      } else {
        alert('Download cancelled.');
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/product" 
            className="inline-flex items-center text-red-600 hover:text-red-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {familyName} Family
          </h1>
          <p className="text-gray-600 mb-6">
            {products.length} SKU{products.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Comparison Table View */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 border-b">
                    Specification
                  </th>
                  {products.map((product) => (
                    <th key={product._id} className="px-6 py-4 text-left text-sm font-medium text-gray-900 border-b min-w-[200px]">
                      <div className="flex items-center space-x-3">
                        {product.imgUrl && (
                          <img 
                            src={product.imgUrl} 
                            alt={product.name}
                            className="w-12 h-12 object-contain"
                          />
                        )}
                        <div>
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                          <div className="text-xs text-gray-500">PN: {product.pn}</div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {specFields.map((field) => {
                  const isSame = isFieldSame(field);
                  const commonValue = getCommonValue(field);
                  
                  return (
                    <tr key={field} className={isSame ? 'bg-green-50' : 'bg-white'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                        <div className="flex items-center">
                          <span className="capitalize">{formatFieldName(field)}</span>
                          {isSame && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Same
                            </span>
                          )}
                        </div>
                      </td>
                      {products.map((product) => {
                        const value = product[field as keyof Product] || '';
                        const isDifferent = !isSame && value !== commonValue;
                        
                        return (
                          <td key={product._id} className={`px-6 py-4 text-sm text-gray-900 ${
                            isDifferent ? 'bg-yellow-50 font-medium' : ''
                          }`}>
                            <div className="flex items-center justify-between">
                              <span>{value || 'N/A'}</span>
                              {isDifferent && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Different
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                
                {/* Action Row */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r">
                    Source
                  </td>
                  {products.map((product) => (
                    <td key={product._id} className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {product.downloadUrl && (
                          <button
                            onClick={() => handleDownloadWithWatermark(product)}
                            disabled={downloading === product._id}
                            className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloading === product._id ? (
                              <>
                                Processing...
                                <svg className="ml-1 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </>
                            ) : (
                              <>
                                Download Specs
                                <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
                <span>Same across all SKUs</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 rounded mr-2"></div>
                <span>Different between SKUs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 