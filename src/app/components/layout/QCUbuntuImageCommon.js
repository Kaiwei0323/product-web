import Link from "next/link";

export default function QCUbuntuImageCommon() {
  return (
    <div className="mt-8 pt-6">
      {/* Back Button */}
      <Link
        href="/developer/qc01/imageReflash/ubuntu"
        className="inline-block text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full mb-4"
      >
        ← Back to QCUbuntu Version Overview
      </Link>

      {/* SFTP Credentials */}
      <div className="mt-4 p-4 bg-gray-100 border rounded">
        <h2 className="text-xl font-semibold mb-2">SFTP Developer Access</h2>
        <p className="text-gray-800 mb-1"><strong>Host:</strong> 99.64.152.69</p>
        <p className="text-gray-800 mb-1"><strong>User:</strong> qcs6490</p>
        <p className="text-gray-800"><strong>Password:</strong> Great#525Inventec</p>
      </div>
    </div>
  );
}
