import JetpackCommon from "../../../components/layout/JetpackCommon";

export default function NCON_NCOX_61Page() {
  return (
    <>
    <JetpackCommon />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">NCON/NCOX Reflash Guide (Jetpack 6.1)</h1>
        <p className="mb-4">
          To reflash the NCON and NCOX devices, please follow the respective methods below:
        </p>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. USB Reflash Method</h2>
          <p className="mb-2">
            Refer to the user manual:
            <a
              href="/download/imagereflash/ncon_ncox/6_1/usb/AIM-Edge ncox_ncon Developer Image Refresh Manual V2.1.pdf"
              className="text-blue-600 underline ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              AIM-Edge ncox_ncon Developer Image Refresh Manual V2.1
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Files can be found on the SFTP server at: <code>/Files/ncox_ncon/JP6.1/O1_dev_6.1_V01_USB</code>
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Ethernet (OTA) Reflash Method</h2>
          <p className="mb-2">
            Refer to the user manual:
            <a
              href="/download/imagereflash/ncon_ncox/6_1/ota/AIM-Edge ncox_ncon Image Refresh over Ethernet Manual V2.1.pdf"
              className="text-blue-600 underline ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              AIM-Edge ncox_ncon Image Refresh over Ethernet Manual V2.1
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Files can be found on the SFTP server at: <code>/Files/ncox_ncon/JP6.1/O1_dev_6.1_V01_OTA</code>
          </p>
        </div>
      </div>
      </>
  );
}
