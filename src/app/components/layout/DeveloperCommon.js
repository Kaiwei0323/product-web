import Link from "next/link";

export default function DeveloperCommon() {
  return (
    <div className="pt-3">
      {/* Back Button */}
      <Link
        href="/developer"
        className="inline-block text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full mb-4"
      >
        ← Back to Developer Overview
      </Link>
    </div>
  );
}
