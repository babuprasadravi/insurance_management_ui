import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM9 7h6m-6 4h6m-6 4h6" />
          </svg>
          <span className="font-bold text-2xl text-gray-800">SecureWheel</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">
            Features
          </a>
          <button className="px-6 py-2 text-indigo-600 hover:text-indigo-700 font-semibold" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold shadow-lg hover:shadow-indigo-500/30" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};