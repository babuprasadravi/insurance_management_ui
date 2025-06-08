import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormInput } from "../components/FormInput";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";

// Validation schema for the login form
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const redirectPath = user?.role === 'AGENT' ? '/agentDashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    const result = await login(values.email, values.password);
    if (!result.success) resetForm();
    setSubmitting(false);
  };

  return (
    <>
      {/* Main container */}
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            
            {/* Left side - Login Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Logo and title */}
              <div className="flex items-center justify-center mb-6 cursor-pointer" onClick={() => navigate("/")}>
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM9 7h6m-6 4h6m-6 4h6" />
                </svg>
                <span className="text-xl font-bold text-gray-800">SecureWheel</span>
              </div>

              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome Back</h2>

              {/* Login Form */}
              <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <FormInput label="Email" name="email" type="email" placeholder="john@example.com" />
                    <FormInput label="Password" name="password" type="password" placeholder="••••••••" />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </Form>
                )}
              </Formik>

              {/* Signup link */}
              <p className="mt-4 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign up</Link>
              </p>

              {/* Demo credentials */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Customer:</strong> customer@gmail.com / customer123</p>
                  <p><strong>Agent:</strong> agent@gmail.com / babu1234</p>
                </div>
              </div>
            </div>

            {/* Right side - Informational Content */}
            <div className="hidden md:block space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">Welcome to SecureWheel</h3>
              <p className="text-gray-600">Log in to manage your vehicle insurance and access exclusive features.</p>

              {/* Features */}
              <div className="space-y-4">
                {[
                  { icon: "📱", title: "Easy Access", desc: "Manage your policy anytime, anywhere" },
                  { icon: "⚡", title: "Quick Claims", desc: "File and track claims with just a few clicks" },
                  { icon: "🔒", title: "Secure Portal", desc: "Your data is protected with bank-level security" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trusted by users */}
              <div className="pt-6">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center font-medium">
                    Trusted by thousands of vehicle owners across the country
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};