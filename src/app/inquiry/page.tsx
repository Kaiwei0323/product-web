import InquiryForm from "../components/InquiryForm";

export default function InquiryPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Product Inquiry</h1>
      <InquiryForm />
    </div>
  );
}
