import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Effective Date: 05/25/2025</p>

      <p className="mb-4">
        Inventec ("we", "us", or "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you visit our website https://inventec.com or use our services.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Personal Information (e.g., name, email address)</li>
        <li>Usage Data (e.g., IP address, browser type)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc list-inside mb-4">
        <li>To provide and improve our services</li>
        <li>To respond to your inquiries</li>
        <li>To send updates (if you opt in)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Cookies and Tracking</h2>
      <p className="mb-4">
        We use cookies to improve your experience and analyze usage. You can control cookies through your browser settings.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Sharing Your Information</h2>
      <p className="mb-4">
        We do not sell your personal data. We may share information with service providers or when required by law.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
      <p className="mb-4">
        You may have rights to access, correct, or delete your data. Contact us at <a href="/contact" className="text-blue-600">Our Contact</a>.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Data Security</h2>
      <p className="mb-4">
        We take reasonable measures to protect your data but cannot guarantee complete security.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Children's Privacy</h2>
      <p className="mb-4">
        Our services are not intended for children under 13. We do not knowingly collect their data.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this policy. Check back for the latest version.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">9. Contact Us</h2>
      <p className="mb-4">
        Questions? Reach out at: <a href="/contact" className="text-blue-600">Our Contact</a>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
