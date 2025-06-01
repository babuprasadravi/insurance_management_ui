import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="pt-28 pb-16 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-8">
              <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-semibold">
                Trusted by 10,000+ vehicle owners
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Smart Insurance for the
                <span className="text-indigo-600"> Digital Age</span>
              </h1>
              <p className="text-xl text-gray-600">
                Experience hassle-free vehicle insurance with our modern digital
                platform. Get instant quotes, manage your policies online, and
                process claims quickly with our user-friendly system.
              </p>
              <div className="flex items-center space-x-4">
                <button
                  className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold shadow-lg hover:shadow-indigo-500/30"
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                </button>
                <button className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition duration-300 font-semibold">
                  Learn More
                </button>
              </div>
              <div className="flex items-center space-x-8 pt-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900">98%</span>
                  <span className="text-gray-600">Claims Approved</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900">24/7</span>
                  <span className="text-gray-600">Support</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900">5M+</span>
                  <span className="text-gray-600">Users</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="absolute -inset-4 bg-indigo-50 rounded-lg blur-lg"></div>
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000"
                alt="Vehicle Insurance"
                className="relative rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
