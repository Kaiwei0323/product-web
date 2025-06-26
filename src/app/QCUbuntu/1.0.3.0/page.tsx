import QCUbuntuImageCommon from "../../components/layout/QCUbuntuImageCommon";

export default function QCLinux_1_0_3_0_Page() {
  return (
    <>
    <QCUbuntuImageCommon />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">QCUbuntu Image Reflash Guide (v1.0.3.0)</h1>
        <p className="mb-4">
          Files can be found on the SFTP server at: <code>/Files/QC01W/QCUbuntu/image/v1.0.3.0/QC01_LU_1.0.3.0.zip</code>
        </p>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">Ubuntu Minimal Installation</h1>
        <p className="mb-4">
          Files can be found on the SFTP server at: <code>/Files/QC01W/QCUbuntu/ubuntu/ubuntu-desktop-minimal.zip</code>
        </p>
      </div>
      </>
  );
}
