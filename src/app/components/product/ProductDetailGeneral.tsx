import React from 'react';
import Link from 'next/link';

interface ProductDetailGeneralProps {
  product: { [key: string]: any };
}

const FIELD_LABELS: { [key: string]: string } = {
  name: 'Product Name',
  category: 'Category',
  sku: 'SKU',
  pn: 'Part Number',
  family: 'Family',
  processor: 'Processor',
  platform: 'Platform',
  tops: 'TOPS',
  ai_accelerator: 'AI Accelerator',
  memory: 'Memory',
  storage: 'Storage',
  os: 'Operating System',
  wireless: 'Wireless',
  I_O: 'I/O',
  ethernet: 'Ethernet',
  hdmi: 'HDMI',
  power: 'Power',
  cooling_fan: 'Cooling & Fan',
  operating_temperature: 'Operating Temperature',
  mechanical_dimension: 'Mechanical Dimension',
  weight: 'Weight',
  di_do: 'DI/DO',
  display: 'Display',
  audio: 'Audio',
  camera: 'Camera',
  battery: 'Battery',
  certification: 'Certification',
  product_url: 'Product URL',
};

const FIELD_ORDER = [
  'name',
  'category',
  'sku',
  'pn',
  'family',
  'processor',
  'platform',
  'tops',
  'ai_accelerator',
  'memory',
  'storage',
  'os',
  'wireless',
  'I_O',
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
  'product_url',
];

export default function ProductDetailGeneral({ product }: ProductDetailGeneralProps) {
  if (!product) return <div>No product found.</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-md shadow-lg mt-8">
      {/* Back to All SKUs Button */}
      {product.family && (
        <div className="mb-6">
          <Link 
            href={`/productDetail/family/${encodeURIComponent(product.family)}`}
            className="inline-flex items-center text-red-600 hover:text-red-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back to All SKUs
          </Link>
        </div>
      )}

      <h1 className="text-center text-3xl font-bold mb-4">{product.name}</h1>
      {product.imgUrl && (
        <div className="relative w-full max-w-md mx-auto my-6">
          <img
            src={product.imgUrl}
            alt={product.name}
            className="object-contain rounded-lg w-full max-h-80 mx-auto"
          />
        </div>
      )}
      <table className="w-full border-collapse border border-gray-300 text-sm mt-6">
        <tbody>
          {FIELD_ORDER.filter(
            (key) => product[key] !== undefined && product[key] !== null && product[key] !== ''
          ).map((key) => (
            <tr key={key} className="even:bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold w-48">
                {FIELD_LABELS[key] || key}
              </th>
              <td className="border border-gray-300 px-4 py-2">
                {product[key]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 