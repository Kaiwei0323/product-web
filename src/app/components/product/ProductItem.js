import Right from "../icons/Right";
import Link from "next/link";

export default function ProductItem({ _id, name, image, description, downloadUrl, detailPage, features = [], isGuest = false }) {
  return (
    <div className="h-full p-6 flex flex-col">
      {/* Image container */}
      <div className="overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center" style={{ maxHeight: '200px', maxWidth: '100%' }}>
        <img 
          src={image} 
          alt={name}
          className="object-contain h-full w-full max-h-[200px] transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="mt-6 flex-grow">
        <h3 className="text-center text-xl font-semibold text-gray-900">{name}</h3>
        <p className="mt-3 text-base text-gray-500">
          {description.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
        </p>

        {/* Features list */}
        {features && features.length > 0 && (
          <ul className="mt-4 space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-500">{feature}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-3">
        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
          >
            Download Specifications
            <svg className="ml-2 -mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        )}
        
        {/* Show View Details button only for non-guest users */}
        {!isGuest && (detailPage || _id) && (
          <Link
            href={detailPage || `/productDetail/${_id}`}
            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
          >
            View Details
            <Right className="ml-2 h-4 w-4" />
          </Link>
        )}
        
        {/* Show disabled button for guest users */}
        {isGuest && (detailPage || _id) && (
          <button
            disabled
            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-400 shadow-sm cursor-not-allowed transition-colors duration-200"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Become Our Partner to View Details
          </button>
        )}
      </div>
    </div>
  );
}
