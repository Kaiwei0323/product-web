'use client';
import Head from 'next/head';
import Link from 'next/link';
import QC01DeveloperCommon from '../../../../components/layout/QC01DeveloperCommon';

export default function QCLinuxDeveloperPage() {
  const qclinuxImage = [
    { version: "0.1.1.0", note: "Enabled PWR ON LED (GPIO 43), added support for TI TCA9534 via gpio-pca950x driver and device tree, enabled CAN-mcp2518fd and SYSVIPC, fixed PCIe crash and RTC access issues, reserved OEM serial and AIM HWID, modified USB serials and Bluetooth COD, added mdio-tools, libgpiod, μPD720201 firmware, UEFI logo delay, and applied multiple QCLinux boot and RESIN-related fixes." },
    { version: "0.0.0.1", note: "Initial QCLinux Image with firmware (Non-HLOS), base image (HLOS with QIMP SDK), Docker environment, nanopb integration, CAN controller support, GPIO enhancements, PCIe crash fix, RTC access fix, and system utilities improvements." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 text-gray-900">
      <Head>
        <title>QCLinux Image Support - Developer Portal</title>
        <meta name="description" content="Download and view different versions of QCLinux images for Nvidia Jetson development." />
      </Head>

      <QC01DeveloperCommon />

      <h1 className="text-3xl font-bold text-center mb-10">QCLinux Image Support</h1>

      {/* QCLinux Image Section */}
      <section id="ncon-support" className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">QCLinux Image</h2>

        {qclinuxImage.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {qclinuxImage.map(({ version, note }) => (
              <div key={version} className="border rounded p-5 shadow-sm bg-white">
                <Link
                  href={`/QCLinux/${version}`}
                  aria-label={`View QCLinux version ${version}`}
                  className="text-lg font-medium text-red-600 hover:underline mb-2 block"
                >
                  QCLinux {version}
                </Link>
                <p className="text-sm text-gray-700">{note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No QCLinux images available at the moment. Please check back later.</p>
        )}
      </section>
    </div>
  );
}
