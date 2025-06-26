'use client';
import Head from 'next/head';
import Link from 'next/link';
import QC01DeveloperCommon from '../../../../components/layout/QC01DeveloperCommon';

export default function QCUbuntuDeveloperPage() {
  const qcubuntuImage = [
    { version: "1.0.8.2", note: "Added HDMI 640x480 support, enhanced emmc flashing tools with ADB integration, python-based git control, PSN disablement for multi-OS swap, and improved boot control for PM8350C and QPS615. Fixed USB path boot issue, added MAC info to oemdata, enabled QPS615 & uPD720201 power in xbl, and supported OEMVariantID. Additional improvements include NFS kernel config, MAC/Bluetooth address handling via OEM-data, fakeroot_1.24, board serial handling, and serial number range expansion." },
    { version: "1.0.3.0", note: "Fixed Ethernet issues (no internet on eth0, phantom IPs, high CPU in interrupt mode), adjusted eth LED status, improved ADB hot-plug stability, disabled QCMAP_ConnectionManagerd.service, enabled polling mode fallback, and added .ack_interrupt API in qca-phy. Added Docker remote control image, RTC sync fix, USB-C handling improvements, AQR113C PHY enablement, AXIS88179 PHY reset, and user 'havana' for Docker builds." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 text-gray-900">
      <Head>
        <title>QCUbuntu Image Support - Developer Portal</title>
        <meta name="description" content="Download and view different versions of QCLinux images for Nvidia Jetson development." />
      </Head>

      <QC01DeveloperCommon />

      <h1 className="text-3xl font-bold text-center mb-10">QCUbuntu Image Support</h1>

      {/* QCLinux Image Section */}
      <section id="ncon-support" className="mb-16">
        <h2 className="text-2xl font-semibold mb-4">QCUbuntu Image</h2>

        {qcubuntuImage.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {qcubuntuImage.map(({ version, note }) => (
              <div key={version} className="border rounded p-5 shadow-sm bg-white">
                <Link
                  href={`/QCUbuntu/${version}`}
                  aria-label={`View QCUbuntu version ${version}`}
                  className="text-lg font-medium text-red-600 hover:underline mb-2 block"
                >
                  QCUbuntu {version}
                </Link>
                <p className="text-sm text-gray-700">{note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No QCUbuntu images available at the moment. Please check back later.</p>
        )}
      </section>
    </div>
  );
}
