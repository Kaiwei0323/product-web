export default function ContactPage() {
  return (
    <div className="p-10 bg-gradient-to-b from-white to-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-gray-600 text-lg mb-8">
          Have questions or interested in our AI edge solutions? Reach out to our sales team —
          we’re here to help.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sales Contacts</h2>
        <div className="space-y-4">
          <ContactCard name="King Edward" email="king.edward@inventec.com" />
          <ContactCard name="Alex Lin" email="lin.alexh@inventec.com" />
          <ContactCard name="Carlos Marty" email="carlos.marty@inventec.com" />
        </div>
      </div>
    </div>
  );
}

type ContactCardProps = {
  name: string;
  email: string;
};

function ContactCard( { name, email }: ContactCardProps ) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
      <p className="text-gray-700 font-medium">{name}</p>
      <a
        href={`mailto:${email}`}
        className="text-primary hover:underline break-all"
      >
        {email}
      </a>
    </div>
  );
}
