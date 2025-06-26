// src/app/developer/page.tsx

import Link from 'next/link';
import { FaCode, FaMicrochip, FaQuestionCircle } from 'react-icons/fa';

export default function DeveloperHomePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Developer Portal</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Nvidia Jetson Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaMicrochip className="text-green-600 text-2xl mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Nvidia Jetson</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Explore development resources, documentation, and Q&A for Nvidia Jetson platform integration.
            </p>
            <div className="space-y-3">
              <Link 
                href="/developer/nvidia-jetson"
                className="block w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-center"
              >
                Documentation & Guides
              </Link>
              <Link 
                href="/developer/nvidia-jetson/qa"
                className="block w-full border border-green-600 text-green-600 py-2 px-4 rounded hover:bg-green-50 transition-colors text-center"
              >
                Q&A Section
              </Link>
            </div>
          </div>

          {/* QC01 Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <FaCode className="text-blue-600 text-2xl mr-3" />
              <h2 className="text-2xl font-semibold text-gray-800">Qualcomm QC01</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Access development tools, technical documentation, and Q&A for Qualcomm QC01 platform.
            </p>
            <div className="space-y-3">
              <Link 
                href="/developer/qc01"
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center"
              >
                Documentation & Guides
              </Link>
              <Link 
                href="/developer/qc01/qa"
                className="block w-full border border-blue-600 text-blue-600 py-2 px-4 rounded hover:bg-blue-50 transition-colors text-center"
              >
                Q&A Section
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <FaQuestionCircle className="text-purple-600 text-2xl mr-3" />
            <h2 className="text-2xl font-semibold text-gray-800">Need Help?</h2>
          </div>
          <p className="text-gray-600">
            Can't find what you're looking for? Check out our Q&A sections for each platform or contact our support team for assistance.
          </p>
        </div>
      </div>
    </main>
  );
}
