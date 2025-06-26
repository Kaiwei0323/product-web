'use client';

import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4 px-6">
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium text-gray-900">{question}</h3>
        {isOpen ? (
          <FaChevronUp className="text-gray-500" />
        ) : (
          <FaChevronDown className="text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-4 prose prose-sm max-w-none text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function QC01QA() {
  const faqs = [
    {
      question: "Why is the device showing log errors and unable to install any packages?",
      answer: "You may have accidentally run `apt upgrade`, which can cause system issues. Please reflash the image and reinstall the Ubuntu minimal."
    },
    {
      question: "Why does my Firefox browser keep crashing?",
      answer: "Try launching Firefox with Wayland support by running `MOZ_ENABLE_WAYLAND=1 firefox` in the terminal."
    },
    {
      question: "Does the QC01 support Bluetooth? The settings show 'No Bluetooth Found'.",
      answer: "Yes, the QC01 does support Bluetooth. Please refer to Section 8 of the user manual for instructions on enabling and managing Bluetooth."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            QC01 Development Q&A
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Find answers to common questions about QC01 development
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-base text-gray-600">
            Can't find what you're looking for?{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-500">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 