import axios from "axios";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { FormInput } from "../components/FormInput";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// Validation schema object for the signup form using Yup object
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
  isAgent: Yup.boolean(),
});

export const SignupPage = () => {
  const navigate = useNavigate();

  // Handles form submission
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      const formData = {
        username: values.name,
        email: values.email,
        password: values.password,
        role: values.isAgent ? "AGENT" : "CUSTOMER",
        phonenumber: values.phone,
      };

      const response = await axios.post(
        "http://localhost:8087/auth/register",
        formData
      );

      if (response.data) {
        toast.success("Registration successful!");
        resetForm();
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data);

      let errorMessage = "Registration failed. Please try again.";
      if (error.response?.status === 409) {
        errorMessage =
          "An account with this email already exists. Please use a different email or try logging in.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Signup Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Logo and Title */}
            <div
              className="flex items-center justify-center mb-6 cursor-pointer"
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

            <h2 className="text-2xl font-bold text-center mb-6">
              Create Your Account
            </h2>

            {/* Formik Form */}
            <Formik
              initialValues={{
                name: "",
                email: "",
                phone: "",
                password: "",
                isAgent: false,
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
                  <div className="flex items-center">
                    <Field
                      type="checkbox"
                      id="isAgent"
                      name="isAgent"
                      className="h-4 w-4 text-indigo-600"
                    />
                    <label htmlFor="isAgent" className="text-sm ml-2">
                      Create an Agent Account
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-70"
                  >
                    Create Account
                  </button>
                </Form>
              )}
            </Formik>

            <p className="mt-4 text-center text-sm">
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
            <h3 className="text-3xl font-bold">Join SecureWheel Today</h3>
            <p>Experience hassle-free vehicle insurance with our platform.</p>

            {/* Features Section */}
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
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Section */}
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
                  <p className="text-sm">
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
  );
};