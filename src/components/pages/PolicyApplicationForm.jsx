import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { DashboardLayout } from "../layout/DashboardLayout";
import { FormInput } from "../components/FormInput";
import { useAuth } from "../../context/AuthProvider";
import { customerMenuItems } from "../../constants/data";

// Vehicle manufacturers list
const manufacturers = [
  "Maruti Suzuki", "Hyundai", "Tata Motors", "Mahindra", "Honda", "Toyota",
  "Kia", "MG", "Volkswagen", "Skoda", "Ford", "Renault", "BMW", "Mercedes-Benz",
  "Audi", "Bajaj", "Hero", "TVS", "Royal Enfield", "Yamaha", "Suzuki",
  "Honda Motorcycle", "Other"
];

// Validation schema for the form
const applicationSchema = Yup.object({
  registrationNumber: Yup.string()
    .required("Registration number is required")
    .matches(/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/, "Enter a valid registration number (e.g., KA01AB1234)"),
  model: Yup.string().required("Model is required"),
  manufacturer: Yup.string().required("Manufacturer is required"),
  yearOfPurchase: Yup.number()
    .required("Year of purchase is required")
    .min(1990, "Year must be after 1990")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  exshowroomPrice: Yup.number()
    .required("Ex-showroom price is required")
    .min(10000, "Ex-showroom price must be at least ₹10,000")
    .max(10000000, "Ex-showroom price cannot exceed ₹1 crore"),
  insuredValue: Yup.number().required("Insured value is required"),
  policyTerm: Yup.number().required("Policy term is required"),
});

export const PolicyApplicationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const policy = location.state?.policy;
  const [step, setStep] = useState(1); // Step 1: Form, Step 2: Review
  const [applicationData, setApplicationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no policy is selected
  if (!policy) {
    return (
      <DashboardLayout menuItems={customerMenuItems}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">No Policy Selected</h2>
          <p className="text-gray-600 mb-6">Please select a policy to continue with the application.</p>
          <button
            onClick={() => navigate("/dashboard/browse-policies")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Browse Policies
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Generate years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 34 }, (_, i) => currentYear - i);

  // Calculate IDV (Insured Declared Value) based on depreciation
  const calculateIDV = (exshowroomPrice, yearOfPurchase) => {
    const vehicleAge = currentYear - yearOfPurchase;
    const depreciationRate = vehicleAge <= 1 ? 0 : vehicleAge <= 2 ? 0.05 : vehicleAge <= 3 ? 0.10 : vehicleAge <= 4 ? 0.15 : vehicleAge <= 5 ? 0.20 : 0.25;
    return Math.round(exshowroomPrice * (1 - depreciationRate));
  };

  // Get insured value options based on policy type
  const getInsuredValueOptions = () => policy.type === "Two-Wheeler" ? [25000, 50000, 75000, 100000, 150000] : [100000, 200000, 300000, 500000, 750000, 1000000];

  // Format policy term for display
  const formatPolicyTerm = (termNumber) => termNumber === 1 ? "1 year" : `${termNumber} years`;

  // Handle form submission
  const handleSubmit = (values) => {
    const calculatedIDV = calculateIDV(values.exshowroomPrice, values.yearOfPurchase);
    setApplicationData({
      ...values,
      insuredValue: calculatedIDV,
      policyDetails: policy,
      calculatedPremium: policy.premium * values.policyTerm,
    });
    setStep(2);
  };

  // Handle payment submission
  const handleProceedToPayment = async () => {
    if (!applicationData || !user?.id) {
      toast.error("Missing application data or user information");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiRequestBody = {
        policyName: policy.name,
        premium: policy.premium,
        licenceNo: applicationData.registrationNumber,
        manufacturer: applicationData.manufacturer,
        model: applicationData.model,
        exshowroomPrice: applicationData.exshowroomPrice,
        yearOfPurchase: applicationData.yearOfPurchase,
        idv: applicationData.insuredValue,
        policyTerm: formatPolicyTerm(applicationData.policyTerm),
        customerId: user.id,
      };

      const response = await axios.post("http://localhost:8084/api/policies/apply", apiRequestBody, {
        headers: { 'Content-Type': 'application/json' },
      });

      toast.success(`Policy application successful! Policy for ${response.data.vehicle} is valid from ${response.data.validFrom} to ${response.data.validUntil}. Agent ${response.data.agentAssigned} has been assigned.`);
      navigate("/dashboard/my-policies");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to submit policy application. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate premium based on policy term
  const calculatePremium = (term) => policy.premium * term;

  return (
    <DashboardLayout menuItems={customerMenuItems}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Header */}
          <div className="border-b pb-4 mb-6">
            <button
              onClick={() => step === 1 ? navigate(-1) : setStep(1)}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {step === 1 ? "Back to Policies" : "Back to Form"}
            </button>
            <h1 className="text-2xl font-semibold">{step === 1 ? "Policy Application" : "Review Application"}</h1>
            <p>{step === 1 ? "Fill in your vehicle details" : "Review your application details"}</p>
          </div>

          {/* Selected Policy Info */}
          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-indigo-800 mb-2">Selected Policy</h3>
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{policy.name}</p>
                <p className="text-sm">{policy.type}</p>
                <p className="text-xs">{policy.coverage}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">₹{policy.premium.toLocaleString()}</p>
                <p className="text-sm">per year</p>
              </div>
            </div>
          </div>

          {step === 1 ? (
            // Application Form
            <Formik
              initialValues={{
                registrationNumber: "",
                model: "",
                manufacturer: "",
                yearOfPurchase: currentYear,
                exshowroomPrice: "",
                insuredValue: getInsuredValueOptions()[0],
                policyTerm: 1,
              }}
              validationSchema={applicationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, isValid, dirty }) => {
                const calculatedIDV = values.exshowroomPrice && values.yearOfPurchase
                  ? calculateIDV(parseInt(values.exshowroomPrice), parseInt(values.yearOfPurchase))
                  : 0;

                if (calculatedIDV && calculatedIDV !== values.insuredValue) {
                  setFieldValue('insuredValue', calculatedIDV);
                }

                return (
                  <Form className="space-y-6">
                    {/* Vehicle Information */}
                    <div>
                      <h3 className="font-medium mb-4">Vehicle Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Registration Number" name="registrationNumber" placeholder="e.g., KA01AB1234" />
                        <div>
                          <label>Manufacturer</label>
                          <Field as="select" name="manufacturer" className="w-full px-4 py-2 border rounded-lg">
                            <option value="">Select Manufacturer</option>
                            {manufacturers.map((manufacturer) => (
                              <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                            ))}
                          </Field>
                          <ErrorMessage name="manufacturer" component="div" className="text-red-600 text-sm" />
                        </div>
                        <FormInput label="Model" name="model" placeholder="e.g., Activa 6G" />
                        <div>
                          <label>Year of Purchase</label>
                          <Field as="select" name="yearOfPurchase" className="w-full px-4 py-2 border rounded-lg">
                            {years.map((year) => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </Field>
                          <ErrorMessage name="yearOfPurchase" component="div" className="text-red-600 text-sm" />
                        </div>
                        <FormInput label="Ex-showroom Price (₹)" name="exshowroomPrice" type="number" placeholder="Enter price" />
                        <div>
                          <label>Insured Declared Value (IDV)</label>
                          <div className="w-full px-4 py-2 border rounded-lg bg-gray-50">
                            ₹{calculatedIDV ? calculatedIDV.toLocaleString() : '0'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Policy Terms */}
                    <div>
                      <h3 className="font-medium mb-4">Policy Terms</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label>Policy Term</label>
                          <Field as="select" name="policyTerm" className="w-full px-4 py-2 border rounded-lg">
                            <option value={1}>1 Year</option>
                            <option value={2}>2 Years</option>
                            <option value={3}>3 Years</option>
                          </Field>
                          <ErrorMessage name="policyTerm" component="div" className="text-red-600 text-sm" />
                        </div>
                        <div>
                          <label>Total Premium</label>
                          <div className="w-full px-4 py-2 border rounded-lg bg-indigo-50">
                            ₹{calculatePremium(values.policyTerm).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!isValid || !dirty}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Review Application
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          ) : (
            // Review Step
            <div className="space-y-6">
              {/* Application Summary */}
              <div>
                <h3 className="font-medium mb-4">Application Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>Registration Number</p>
                      <p>{applicationData.registrationNumber}</p>
                    </div>
                    <div>
                      <p>Vehicle</p>
                      <p>{applicationData.manufacturer} {applicationData.model}</p>
                    </div>
                    <div>
                      <p>Year of Purchase</p>
                      <p>{applicationData.yearOfPurchase}</p>
                    </div>
                    <div>
                      <p>Ex-showroom Price</p>
                      <p>₹{parseInt(applicationData.exshowroomPrice).toLocaleString()}</p>
                    </div>
                    <div>
                      <p>Insured Declared Value</p>
                      <p>₹{applicationData.insuredValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p>Policy Term</p>
                      <p>{formatPolicyTerm(applicationData.policyTerm)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Breakdown */}
              <div>
                <h3 className="font-medium mb-4">Premium Breakdown</h3>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span>Annual Premium</span>
                    <span>₹{policy.premium.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Policy Term</span>
                    <span>{formatPolicyTerm(applicationData.policyTerm)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Premium</span>
                      <span>₹{applicationData.calculatedPremium.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="px-4 py-2 border rounded-lg">
                  Edit Details
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {isSubmitting ? "Processing..." : "Submit Application"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};