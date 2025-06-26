'use client';
import Link from 'next/link';
import DeveloperCommon from '../../components/layout/DeveloperCommon'

export default function NvidiaJetsonDeveloperPage() {
  const nconSupport = [
    { version: "6.2", note: "Added Super Mode for 2× faster AI, updated to Ubuntu 22.04 with kernel 5.15, and included the latest CUDA 12.6, TensorRT 10.3, and cuDNN 9.3." },
    { version: "6.1", note: "Improved camera efficiency with 40% lower CPU usage, added fTPM for security, and updated the AI stack with CUDA 12.6, TensorRT 10.3, and Ubuntu 22.04 support." },
    { version: "6.0", note: "Introduced a production-ready AI stack with CUDA 12.2, TensorRT 8.6, and Ubuntu 22.04, offering kernel flexibility, OTA updates, and an upgradable compute stack for Jetson Orin devices." },
    { version: "5.1.2", note: "Introduced support for the Jetson AGX Orin Industrial module, enhanced camera synchronization and security features, and updated VPI to version 2.2, while maintaining the same compute stack as JetPack 5.1.1." },
  ];

  const pconSupport = [
    { version: "6.1", note: "Improved camera efficiency with 40% lower CPU usage, added fTPM for security, and updated the AI stack with CUDA 12.6, TensorRT 10.3, and Ubuntu 22.04 support." },
    { version: "5.1.2", note: "Introduced support for the Jetson AGX Orin Industrial module, enhanced camera synchronization and security features, and updated VPI to version 2.2, while maintaining the same compute stack as JetPack 5.1.1." },
  ];

  return (

    <div className="max-w-5xl mx-auto px-6 py-10 text-gray-900">
      <DeveloperCommon />
      <h1 className="text-3xl font-bold text-center mb-10">Nvidia Jetson Developer Support</h1>

      {/* Table of Contents */}
      <nav className="mb-12 border p-4 rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Table of Contents</h2>
        <ul className="list-disc list-inside space-y-2 text-red-600 text-sm">
          <li><a href="#user-manual" className="hover:underline">User Manual</a></li>
          <li><a href="#ncon-support" className="hover:underline">NCON/NCOX Support</a></li>
          <li><a href="#pcon-support" className="hover:underline">PSON/PSOX Support</a></li>
        </ul>
      </nav>

      {/* User Manual Section */}
      <section id="user-manual" className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">User Manual</h2>
        <a
          href="/download/userguide/nvidia/ncon_ncox/AIM-Edge%20ncox_ncon%20User%20Manual%20V1.3.pdf?download=true"
          target="_blank"
          rel="noopener noreferrer"
          download
          className="rounded-full text-sm bg-red-600 text-white rounded px-5 py-2 hover:bg-red-800 transition"
        >
          Download NCON/NCOX User Manual (PDF)
        </a>
      </section>

      {/* NCON Section */}
      <section id="ncon-support" className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">NCON/NCOX Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nconSupport.map(({ version, note }) => (
            <div key={version} className="border rounded p-5 shadow-sm bg-white">
              <Link
                href={`/jetpack/ncon_ncox/${version}`}
                className="text-lg font-medium text-red-600 hover:underline mb-2 block"
              >
                JetPack {version}
              </Link>
              <p className="text-sm text-gray-700">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PCON Section */}
      <section id="pcon-support">
        <h2 className="text-2xl font-semibold mb-4">PSON/PSOX Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pconSupport.map(({ version, note }) => (
            <div key={version} className="border rounded p-5 shadow-sm bg-white">
              <Link
                href={`/jetpack/pson_psox/${version}`}
                className="text-lg font-medium text-red-600 hover:underline mb-2 block"
              >
                JetPack {version}
              </Link>
              <p className="text-sm text-gray-700">{note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
