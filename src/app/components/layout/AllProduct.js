'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductComparison from '../ProductComparison';

export default function AllProductMenu({ platform }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('guest');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/product');
        if (res.ok) {
          const data = await res.json();
          // Filter out disabled products
          const enabledProducts = data.filter(product => product.status === 'enable');
          setProducts(enabledProducts);
        } else {
          console.error('Failed to fetch products');
          setError('Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Error loading products');
      } finally {
        setLoading(false);
      }
    }

    // Check user role
    async function checkUserRole() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const session = await res.json();
          if (session.user) {
            setUserRole(session.user.role || 'customer');
          } else {
            setUserRole('guest');
          }
        } else {
          setUserRole('guest');
        }
      } catch (err) {
        console.error('Error checking user role:', err);
        setUserRole('guest');
      }
    }

    fetchProducts();
    checkUserRole();
  }, []);

  const handleFilterClick = (platform) => {
    const path = platform === 'All' ? '/product' : `/product/${platform}`;
    router.push(path);
  };

  const handleProductSelect = (product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.find(p => p._id === product._id);
      if (isSelected) {
        return prev.filter(p => p._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleCompare = () => {
    if (selectedProducts.length >= 2) {
      setShowComparison(true);
    } else {
      alert('Please select at least 2 products to compare');
    }
  };

  const closeComparison = () => {
    setShowComparison(false);
  };

  const handleDeselectAll = () => {
    setSelectedProducts([]);
  };

  const filteredProducts = platform
    ? products.filter((p) => p.platform === platform)
    : products;

  // Sort products: Best Sellers first, then alphabetically
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aIsBestSeller = a.tag && a.tag.toLowerCase().includes('best seller');
    const bIsBestSeller = b.tag && b.tag.toLowerCase().includes('best seller');
    
    if (aIsBestSeller && !bIsBestSeller) return -1;
    if (!aIsBestSeller && bIsBestSeller) return 1;
    return a.family.localeCompare(b.family);
  });

  // Get unique families and sort them (Best Sellers first)
  const uniqueFamilies = [...new Set(sortedProducts.map(product => product.family))];

  // Create family objects with representative images and Best Seller info
  const familyData = uniqueFamilies.map(family => {
    // Find all products in this family
    const familyProducts = sortedProducts.filter(product => product.family === family);
    const representativeProduct = familyProducts[0];
    const isBestSeller = representativeProduct?.tag && representativeProduct.tag.toLowerCase().includes('best seller');
    
    // Use familyImgUrl if available, otherwise use the first product's imgUrl
    let familyImage = '/placeholder-product.jpg';
    if (representativeProduct?.familyImgUrl) {
      familyImage = representativeProduct.familyImgUrl;
    } else if (representativeProduct?.imgUrl) {
      familyImage = representativeProduct.imgUrl;
    }
    
    return {
      name: family,
      image: familyImage,
      platform: representativeProduct?.platform || 'N/A',
      processor: representativeProduct?.processor || 'N/A',
      tops: representativeProduct?.tops || 'N/A',
      isBestSeller: isBestSeller
    };
  });

  if (loading) {
    return (
      <section className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="uppercase text-gray-600 font-semibold text-2xl italic mb-6">
              Our Products
            </h3>
            <div className="text-gray-500">Loading products...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="uppercase text-gray-600 font-semibold text-2xl italic mb-6">
              Our Products
            </h3>
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="uppercase text-gray-600 font-semibold text-2xl italic mb-6">
            Our Products
          </h3>

          {/* Platform Filter Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            {['All', 'Intel', 'Qualcomm', 'Nvidia'].map((p) => (
              <button
                key={p}
                onClick={() => handleFilterClick(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  (platform === p) || (p === 'All' && !platform)
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {uniqueFamilies.length === 0 ? (
          <div className="text-center text-gray-500">
            {platform ? `No product families found for ${platform} platform.` : 'No product families found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {familyData.map((family) => {
              // Find all products in this family for comparison
              const familyProducts = sortedProducts.filter(product => product.family === family.name);
              
              return (
                <div key={family.name} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                  {/* Best Seller Badge */}
                  {family.isBestSeller && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Best Seller
                      </span>
                    </div>
                  )}
                  
                  {/* Checkbox for comparison - Only show for admin and customer */}
                  {(userRole === 'admin' || userRole === 'customer') && (
                    <div className="absolute top-2 right-2 z-10">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                        onChange={() => handleProductSelect(familyProducts[0])}
                        checked={selectedProducts.some(p => p._id === familyProducts[0]?._id)}
                      />
                    </div>
                  )}
                
                <div className="h-full flex flex-col">
                  {/* Image container */}
                  <div className="overflow-hidden bg-gray-100 flex items-center justify-center" style={{ height: '200px' }}>
                    <img 
                      src={family.image} 
                      alt={family.name}
                      className="object-contain h-full w-full max-h-[200px] transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>

                  {/* Family Name and Button */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="text-center text-xl font-semibold text-gray-900 mb-3">
                        {family.name}
                      </h3>
                      
                      {/* Platform and Processor Info */}
                      <div className="text-center space-y-1 mb-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Platform:</span> {family.platform}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Processor:</span> {family.processor}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">TOPS:</span> {family.tops}
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-6">
                      {userRole === 'admin' || userRole === 'customer' ? (
                        <Link
                          href={`/productDetail/family/${family.name}`}
                          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                          View Details
                          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-gray-200 text-gray-500 px-4 py-2 text-sm font-medium cursor-not-allowed"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Become Our Partner to View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
        
        {/* Compare and Deselect Buttons - Sticky position at bottom right */}
        {(userRole === 'admin' || userRole === 'customer') && (
          <div className="sticky bottom-4 right-4 flex justify-end gap-3 mt-8 mb-4 z-30">
            {selectedProducts.length > 0 && (
              <button
                onClick={handleDeselectAll}
                className="px-4 py-3 rounded-lg font-medium transition-colors shadow-lg bg-gray-500 text-white hover:bg-gray-600"
              >
                Deselect All
              </button>
            )}
            <button
              onClick={handleCompare}
              disabled={selectedProducts.length < 2}
              className={`px-6 py-3 rounded-lg font-medium transition-colors shadow-lg ${
                selectedProducts.length >= 2
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Compare ({selectedProducts.length} selected)
            </button>
          </div>
        )}
      </div>
      
      {/* Product Comparison Modal */}
      <ProductComparison
        isOpen={showComparison}
        onClose={closeComparison}
        selectedProducts={selectedProducts}
      />
    </section>
  );
}
