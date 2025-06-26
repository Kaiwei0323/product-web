import Link from "next/link";

export default function ProductCommon() {
  return (
    <div className="mt-8 pt-6">
      {/* Back Button */}
      <Link
        href="/product"
        className="inline-block text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full mb-4"
      >
        ← Back to All Product
      </Link>
    </div>
  );
}
