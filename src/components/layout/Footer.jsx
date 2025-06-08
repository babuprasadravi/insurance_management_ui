export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6">
      <div className="text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} SecureWheel. All rights reserved.
      </div>
    </footer>
  );
};