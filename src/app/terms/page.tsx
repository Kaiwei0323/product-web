import React from "react";

const TermsOfService: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">Effective Date: 05/25/2025</p>

      <p className="mb-4">
        Welcome to Inventec! These Terms of Service ("Terms") govern your use of our website located at https://inventec.com (the "Site") and any related services (the "Services") provided by Inventec ("we", "us", or "our").
      </p>

      <p className="mb-4">
        By accessing or using our Site or Services, you agree to be bound by these Terms. If you do not agree, please do not use the Site or Services.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Use of the Site</h2>
      <p className="mb-4">
        You agree to use the Site and Services only for lawful purposes and in accordance with these Terms. You must not use our Site:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>In any way that violates applicable laws or regulations.</li>
        <li>To send spam or unauthorized advertising.</li>
        <li>To harm or attempt to harm others.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Intellectual Property</h2>
      <p className="mb-4">
        All content on this Site, including text, graphics, logos, images, and software, is the property of Inventec or its licensors and is protected by intellectual property laws.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. User Accounts</h2>
      <p className="mb-4">
        You are responsible for maintaining the confidentiality of your account information and for all activities under your account.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Termination</h2>
      <p className="mb-4">
        We reserve the right to suspend or terminate your access to our Site or Services if you violate these Terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Disclaimers</h2>
      <p className="mb-4">
        Our Services are provided "as is" and "as available." We make no warranties regarding accuracy or reliability.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Limitation of Liability</h2>
      <p className="mb-4">
        Inventec is not liable for any indirect or consequential damages arising from the use of our Site or Services.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Third-Party Links</h2>
      <p className="mb-4">
        We are not responsible for the content or practices of third-party websites linked from our Site.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Changes to Terms</h2>
      <p className="mb-4">
        We may update these Terms at any time. Continued use of our Site constitutes acceptance of the new Terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">9. Contact Us</h2>
      <p className="mb-4">
        If you have any questions, contact us at: <a href="/contact" className="text-blue-600">Our Contact</a>
      </p>
    </div>
  );
};

export default TermsOfService;
