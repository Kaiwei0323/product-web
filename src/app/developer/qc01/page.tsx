'use client';
import Link from 'next/link';
import DeveloperCommon from '../../components/layout/DeveloperCommon'

export default function QC01DeveloperPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 text-gray-900">
      {/* Page Header */}
      <DeveloperCommon />
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-center">QC01 Developer Portal</h1>
        <p className="text-lg text-gray-600 mt-5">Your all-in-one hub for development, deployment, and optimization.</p>
      </header>

      <div className="mt-4 p-4 bg-gray-100 border rounded">
        <h2 className="text-xl font-semibold mb-2">SFTP Developer Access</h2>
        <p className="text-gray-800 mb-1"><strong>Host:</strong> 99.64.152.69</p>
        <p className="text-gray-800 mb-1"><strong>User:</strong> qcs6490</p>
        <p className="text-gray-800"><strong>Password:</strong> Great#525Inventec</p>
      </div>

      {/* Table of Contents */}
      <nav className="bg-gray-50 border border-gray-200 p-6 rounded-xl shadow-sm mt-8">
        <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
        <ul className="list-decimal list-inside text-gray-700 space-y-2 text-left">
          <li><a href="#user-manual" className="text-[#f60d0d] hover:underline">User Manual</a></li>
          <li><a href="#image-reflash" className="text-[#f60d0d] hover:underline">Image Reflash</a></li>
          <li><a href="#demo-app" className="text-[#f60d0d] hover:underline">Demo Application</a></li>
          <li><a href="#conversion-tool" className="text-[#f60d0d] hover:underline">Model Conversion Toolkit</a></li>
        </ul>
      </nav>

      {/* User Manual */}
      <section id="user-manual">
        <h2 className="text-2xl font-semibold text-[#f60d0d] mb-3 mt-5">1. User Manual</h2>
        <p className="text-gray-700 mb-4">
          Access our user guide for step-by-step instructions on setting up your QC01 system, flashing firmware,
          and preparing the development environment.
        </p>
        <li>
          <Link
            href="/download/userguide/qualcomm/qc01/QC01W-UserGuide-v1.0.pdf"
            download
            className="text-[#f60d0d] hover:underline"
          >
            Download QC01 User Manual
          </Link>
        </li>
      </section>

      {/* Image Reflash */}
      <section id="image-reflash">
        <h2 className="text-2xl font-semibold text-[#f60d0d] mb-3 mt-5">2. Image Reflash</h2>
        <p className="text-gray-700 mb-4">
          Please refer to Section 5 & 6 in the user manual for detailed reflashing instructions.
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 text-left">
          <li>
            <Link
              href="/developer/qc01/imageReflash/qclinux"
              className="text-[#f60d0d] hover:underline"
            >
              QCLinux Image
            </Link>
          </li>
          <li>
            <Link
              href="/developer/qc01/imageReflash/ubuntu"
              className="text-[#f60d0d] hover:underline"
            >
              Ubuntu Image
            </Link>
          </li>
        </ul>
      </section>

      {/* Demo App */}
      <section id="demo-app">
        <h2 className="text-2xl font-semibold text-[#f60d0d] mb-3 mt-8">3. Demo Application</h2>
        <p className="text-gray-700 mb-4">
          Run real-time inference with our SNPE Flask demo. This includes applications like:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4 text-left">
          <li>Safety Monitoring</li>
          <li>Medical PPE Detection</li>
          <li>Brain Tumor Detection</li>
          <li>Fall Detection</li>
          <li>Voice Recognition</li>
        </ul>
        <p className="text-gray-700 mb-4">
          The AI model we have validated and integrated in our demo app:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4 text-left">
          <li>YOLOv8 (Vision)</li>
          <li>YOLO11 (Vision)</li>
          <li>YOLO12 (Vision)</li>
          <li>DETR (Vision)</li>
          <li>Wav2Vec2 (Voice)</li>
        </ul>
        <p className="text-gray-700 mb-2">
          Explore our GitHub repo:
        </p>
        <li>
          <Link
            href="https://github.com/Kaiwei0323/SNPE_Flask/tree/demo"
            target="_blank"
            className="text-[#f60d0d] hover:underline"
          >
            SNPE Flask Demo Repository
          </Link>
        </li>
      </section>

      {/* Model Conversion Tool */}
      <section id="conversion-tool">
        <h2 className="text-2xl font-semibold text-[#f60d0d] mb-3 mt-8">4. Model Conversion Toolkit</h2>
        <p className="text-gray-700 mb-4">
          Convert your ONNX/TFLite models into SNPE-compatible DLC format using our open-source toolkit.
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4 text-left">
          <li>
            <Link
              href="https://github.com/Kaiwei0323/qc_model_conversion_flask"
              target="_blank"
              className="text-[#f60d0d] hover:underline"
            >
              Conversion Toolkit GitHub Repo
            </Link>
          </li>
          <li>
            <Link
              href="http://99.64.152.69:5000"
              target="_blank"
              className="text-[#f60d0d] hover:underline"
            >
              Try the Online Conversion Tool
            </Link>
          </li>
        </ul>
        <p className="text-gray-700 mb-4">
          Please refer to <strong>"Deploy your own model"</strong> in the demo app README to try your own model.
        </p>
      </section>
    </div>
  );
}
