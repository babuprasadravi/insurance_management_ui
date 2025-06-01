import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { FormInput } from "../components/FormInput";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

export const SignupPage = () => {
  const navigate = useNavigate();
  const handleSubmit = (values, { resetForm }) => {
    toast.success("Registration successful!");
    resetForm();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div
                className="flex items-center justify-center space-x-2 mb-6"
                onClick={() => navigate("/")}
              >
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
                <span className="text-xl font-bold text-gray-800">
                  SecureWheel
                </span>
              </div>

              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Create Your Account
              </h2>

              <Formik
                initialValues={{
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <FormInput
                      label="Full Name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                    />
                    <FormInput
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                    />
                    <FormInput
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      placeholder="1234567890"
                    />
                    <FormInput
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-70"
                    >
                      Create Account
                    </button>
                  </Form>
                )}
              </Formik>

              <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Right side - Content */}
            <div className="hidden md:block space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                Join SecureWheel Today
              </h3>
              <p className="text-gray-600">
                Experience hassle-free vehicle insurance with our modern digital
                platform.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: "🚀",
                    title: "Quick Setup",
                    desc: "Get started in minutes with our simple signup process",
                  },
                  {
                    icon: "🛡️",
                    title: "Secure Coverage",
                    desc: "Your vehicle protection is our top priority",
                  },
                  {
                    icon: "💬",
                    title: "24/7 Support",
                    desc: "Our team is always here to help you",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-white bg-indigo-200"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      Join <span className="font-semibold">5,000+</span> vehicle
                      owners who trust SecureWheel
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
