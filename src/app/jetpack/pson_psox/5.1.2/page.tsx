import JetpackCommon from "../../../components/layout/JetpackCommon";

export default function PSON_PSOX_512Page() {
  return (
    <>
    <JetpackCommon />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">PSON/PSOX Reflash Guide (Jetpack 5.1.2)</h1>
        <p className="mb-4">
          To reflash the PSON and PSOX devices, please follow the respective methods below:
        </p>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. USB Reflash Method</h2>
          <p className="mb-2">
            Refer to the user manual:
            <a
              href="/download/imagereflash/pson_psox/5_1_2/usb/AIM-Edge psox_pson Developer Image Refresh Manual V2.0.pdf"
              className="text-blue-600 underline ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              AIM-Edge psox_pson Developer Image Refresh Manual V2.0
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Files can be found on the SFTP server at: <code>/Files/psox_pson/JP5.1.2/O2_dev_5.1.2_V06_USB</code>
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Ethernet (OTA) Reflash Method</h2>
          <p className="mb-2">
            Refer to the user manual:
            <a
              href="/download/imagereflash/pson_psox/5_1_2/ota/AIM-Edge psox_pson Image Refresh over Ethernet Manual V2.0.pdf"
              className="text-blue-600 underline ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              AIM-Edge psox_pson Image Refresh over Ethernet Manual V2.0
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Files can be found on the SFTP server at: <code>/Files/psox_pson/JP5.1.2/O2_dev_5.1.2_V06_OTA</code>
          </p>
        </div>
      </div>
      </>
  );
}
