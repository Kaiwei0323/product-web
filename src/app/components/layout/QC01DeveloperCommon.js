import Link from "next/link";

export default function QCLinuxDeveloperCommon() {
  return (
    <div className="pt-6">
      {/* Back Button */}
      <Link
        href="/developer/qc01"
        className="inline-block text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full mb-4"
      >
        ← Back to QCS6490 Developer Overview
      </Link>
    </div>
  );
}
