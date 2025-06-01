export const Footer = () => {
  return (
    <>
      <footer className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM9 7h6m-6 4h6m-6 4h6"
                  />
                </svg>
                <span className="font-bold text-xl text-gray-800">
                  SecureWheel
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Protecting your journey with reliable vehicle insurance
                solutions since 2020.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-gray-600 hover:text-indigo-600 text-sm"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-600 hover:text-indigo-600 text-sm"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-600 hover:text-indigo-600 text-sm"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-gray-600 hover:text-indigo-600 text-sm"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/privacy"
                    className="text-gray-600 hover:text-indigo-600 text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-gray-600 hover:text-indigo-600 text-sm"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/claims"
                    className="text-gray-600 hover:text-indigo-600 text-sm"
                  >
                    Claims Process
                  </a>
                </li>
                <li>
                  <a
                    href="/licenses"
                    className="text-gray-600 hover:text-indigo-600 text-sm"
                  >
                    Insurance Licenses
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="text-gray-600 text-sm">
                  📞 24/7 Support: 1-800-INSURE
                </li>
                <li className="text-gray-600 text-sm">
                  📧 support@securewheel.com
                </li>
                <li className="text-gray-600 text-sm">
                  📍 123 Insurance Ave, CA 90210
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} SecureWheel. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-indigo-600">
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-600">
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-600">
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
