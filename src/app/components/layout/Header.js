'use client'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

const MobileMenuItem = ({ href, onClick, children }) => (
  <Link
    href={href}
    className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary rounded-md transition-colors duration-200"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default function Header() {
  const session = useSession();
  const status = session.status;
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = useMemo(() => 
    status === "authenticated" && session.data?.user?.role === "admin",
    [status, session.data?.user?.role]
  );

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session.data);
  }, [status, session.data]);

  const linkStyle = useMemo(() => 
    "hover:text-primary hover:underline transition-colors duration-200 text-gray-600 font-medium",
    []
  );

  const handleMobileMenuClick = () => setIsMobileMenuOpen(false);
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const navigationLinks = useMemo(() => [
    { href: "/", label: "Home" },
    { href: "/product", label: "Products" },
    ...(isAdmin ? [
      { href: "/createproduct", label: "Create Product" },
      { href: "/inventory", label: "Inventory" },
      { href: "/shipments", label: "Shipments" }
    ] : []),
    { href: "/developer", label: "Developer" },
    ...(status === "authenticated" ? [
      { href: "/inquiry", label: "Inquiry" }
    ] : []),
    { href: "/contact", label: "Contact" },
  ], [isAdmin, status]);

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
        <Link className="flex items-center space-x-2" href="/" aria-label="Inventec Home">
          <Image
            src="/logo.png"
            alt="Inventec Logo"
            width={200}
            height={200}
          />
        </Link>


          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
            {navigationLinks.map(({ href, label }) => (
              <Link key={href} className={linkStyle} href={href}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "authenticated" ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome, {session.data?.user?.name || session.data?.user?.email}</span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                  aria-label="Sign out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className={linkStyle}>Sign in</Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle mobile menu"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigationLinks.map(({ href, label }) => (
              <MobileMenuItem key={href} href={href} onClick={handleMobileMenuClick}>
                {label}
              </MobileMenuItem>
            ))}
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
            {status === "authenticated" ? (
              <div className="space-y-1 px-2">
                <div className="px-3 py-2 text-sm text-gray-500">Welcome, {session.data?.user?.name || session.data?.user?.email}</div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-primary rounded-md transition-colors duration-200"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-1 px-2">
                <MobileMenuItem href="/login" onClick={handleMobileMenuClick}>Sign in</MobileMenuItem>
                <MobileMenuItem href="/register" onClick={handleMobileMenuClick}>Sign up</MobileMenuItem>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
