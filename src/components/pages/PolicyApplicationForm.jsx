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

// Vehicle manufacturers list for dropdown
const manufacturers = [
  "Maruti Suzuki",
  "Hyundai",
  "Tata Motors",
  "Mahindra",
  "Honda",
  "Toyota",
  "Kia",
  "MG",
  "Volkswagen",
  "Skoda",
  "Ford",
  "Renault",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Bajaj",
  "Hero",
  "TVS",
  "Royal Enfield",
  "Yamaha",
  "Suzuki",
  "Honda Motorcycle",
  "Other"
];

// Validation schema
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
  const [step, setStep] = useState(1); // 1 for form, 2 for review
  const [applicationData, setApplicationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if no policy data
  if (!policy) {
    return (
      <DashboardLayout menuItems={customerMenuItems}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">No Policy Selected</h2>
          <p className="text-gray-600 mb-6">Please select a policy to continue with the application.</p>
          <button
            onClick={() => navigate("/dashboard/browse-policies")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Policies
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 34 }, (_, i) => currentYear - i);
  
  // Calculate IDV (Insured Declared Value) based on ex-showroom price and year of purchase
  const calculateIDV = (exshowroomPrice, yearOfPurchase) => {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - yearOfPurchase;
    
    // Depreciation rates based on vehicle age
    let depreciationRate = 0;
    if (vehicleAge <= 1) {
      depreciationRate = 0; // New vehicle, no depreciation
    } else if (vehicleAge <= 2) {
      depreciationRate = 0.05; // 5% depreciation
    } else if (vehicleAge <= 3) {
      depreciationRate = 0.10; // 10% depreciation
    } else if (vehicleAge <= 4) {
      depreciationRate = 0.15; // 15% depreciation
    } else if (vehicleAge <= 5) {
      depreciationRate = 0.20; // 20% depreciation
    } else {
      depreciationRate = 0.25; // 25% depreciation for older vehicles
    }
    
    const idv = exshowroomPrice * (1 - depreciationRate);
    return Math.round(idv);
  };

  // Calculate insured value options based on policy type
  const getInsuredValueOptions = () => {
    if (policy.type === "Two-Wheeler") {
      return [25000, 50000, 75000, 100000, 150000];
    } else {
      return [100000, 200000, 300000, 500000, 750000, 1000000];
    }
  };

  // Convert policy term number to string format
  const formatPolicyTerm = (termNumber) => {
    if (termNumber === 1) {
      return "1 year";
    } else {
      return `${termNumber} years`;
    }
  };

  const handleSubmit = (values) => {
    // Calculate IDV based on ex-showroom price and year of purchase
    const calculatedIDV = calculateIDV(values.exshowroomPrice, values.yearOfPurchase);
    
    const applicationDetails = {
      ...values,
      insuredValue: calculatedIDV, // Use calculated IDV
      policyDetails: policy,
      calculatedPremium: policy.premium * values.policyTerm
    };
    
    setApplicationData(applicationDetails);
    setStep(2);
  };

  const handleProceedToPayment = async () => {
    if (!applicationData || !user?.id) {
      toast.error("Missing application data or user information");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare API request body
      const apiRequestBody = {
        policyName: policy.name, // From selected policy
        premium: policy.premium, // From selected policy
        licenceNo: applicationData.registrationNumber, // Map registrationNumber to licenceNo
        manufacturer: applicationData.manufacturer,
        model: applicationData.model,
        exshowroomPrice: applicationData.exshowroomPrice,
        yearOfPurchase: applicationData.yearOfPurchase,
        idv: applicationData.insuredValue, // Map insuredValue to idv
        policyTerm: formatPolicyTerm(applicationData.policyTerm), // Convert to string format
        customerId: user.id // From authenticated user
      };

      console.log("Submitting policy application:", apiRequestBody);

      // Make API call to backend
      const response = await axios.post(
        "http://localhost:8084/api/policies/apply",
        apiRequestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Policy application response:", response.data);

      // Show success message with policy details
      toast.success(
        `Policy application successful! Policy for ${response.data.vehicle} is valid from ${response.data.validFrom} to ${response.data.validUntil}. Agent ${response.data.agentAssigned} has been assigned.`,
        { duration: 6000 }
      );

      // Navigate to My Policies page
      navigate("/dashboard/my-policies");

    } catch (error) {
      console.error("Policy application error:", error);
      
      let errorMessage = "Failed to submit policy application. Please try again.";
      
      if (error.response?.status === 400) {
        errorMessage = "Invalid application data. Please check your inputs and try again.";
      } else if (error.response?.status === 404) {
        errorMessage = "Policy not found. Please select a valid policy.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if the backend is running.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate premium based on term
  const calculatePremium = (term) => {
    return policy.premium * term;
  };

  return (
    <DashboardLayout menuItems={customerMenuItems}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Header */}
          <div className="border-b pb-4 mb-6">
            <button
              onClick={() => step === 1 ? navigate(-1) : setStep(1)}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {step === 1 ? "Back to Policies" : "Back to Form"}
            </button>
            
            <h1 className="text-2xl font-semibold text-gray-800">
              {step === 1 ? "Policy Application" : "Review Application"}
            </h1>
            <p className="text-gray-600 mt-1">
              {step === 1 ? "Fill in your vehicle details" : "Review your application details"}
            </p>
          </div>

          {/* Selected Policy Info */}
          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-indigo-800 mb-2">Selected Policy</h3>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-indigo-900">{policy.name}</p>
                <p className="text-sm text-indigo-700">{policy.type}</p>
                <p className="text-xs text-indigo-600 mt-1">{policy.coverage}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-900">₹{policy.premium.toLocaleString()}</p>
                <p className="text-sm text-indigo-700">per year</p>
              </div>
            </div>
          </div>

          {step === 1 ? (
            /* Application Form */
            <Formik
              initialValues={{
                registrationNumber: "",
                model: "",
                manufacturer: "",
                yearOfPurchase: currentYear,
                exshowroomPrice: "",
                insuredValue: getInsuredValueOptions()[0],
                policyTerm: 1
              }}
              validationSchema={applicationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, isValid, dirty }) => {
                // Auto-calculate IDV when ex-showroom price or year changes
                const calculatedIDV = values.exshowroomPrice && values.yearOfPurchase 
                  ? calculateIDV(parseInt(values.exshowroomPrice), parseInt(values.yearOfPurchase))
                  : 0;

                // Update insured value when calculation changes
                if (calculatedIDV && calculatedIDV !== values.insuredValue) {
                  setFieldValue('insuredValue', calculatedIDV);
                }

                return (
                  <Form className="space-y-6">
                    {/* Vehicle Registration */}
                    <div>
                      <h3 className="font-medium text-gray-800 mb-4">Vehicle Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          label="Registration Number"
                          name="registrationNumber"
                          placeholder="e.g., KA01AB1234"
                          className="uppercase"
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Manufacturer
                          </label>
                          <Field
                            as="select"
                            name="manufacturer"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Manufacturer</option>
                            {manufacturers.map(manufacturer => (
                              <option key={manufacturer} value={manufacturer}>
                                {manufacturer}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage 
                            name="manufacturer" 
                            component="div" 
                            className="text-red-600 text-sm mt-1" 
                          />
                        </div>
                        
                        <FormInput
                          label="Model"
                          name="model"
                          placeholder="e.g., Activa 6G"
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Year of Purchase
                          </label>
                          <Field
                            as="select"
                            name="yearOfPurchase"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            {years.map(year => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage 
                            name="yearOfPurchase" 
                            component="div" 
                            className="text-red-600 text-sm mt-1" 
                          />
                        </div>

                        <FormInput
                          label="Ex-showroom Price (₹)"
                          name="exshowroomPrice"
                          type="number"
                          placeholder="Enter vehicle's original price"
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Insured Declared Value (IDV) - Auto Calculated
                          </label>
                          <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                            ₹{calculatedIDV ? calculatedIDV.toLocaleString() : '0'}
                            {calculatedIDV && (
                              <p className="text-xs text-gray-500 mt-1">
                                Calculated based on ex-showroom price and vehicle age
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Policy Terms */}
                    <div>
                      <h3 className="font-medium text-gray-800 mb-4">Policy Terms</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Policy Term
                          </label>
                          <Field
                            as="select"
                            name="policyTerm"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value={1}>1 Year</option>
                            <option value={2}>2 Years</option>
                            <option value={3}>3 Years</option>
                          </Field>
                          <ErrorMessage 
                            name="policyTerm" 
                            component="div" 
                            className="text-red-600 text-sm mt-1" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Premium
                          </label>
                          <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-indigo-50 text-indigo-900 font-semibold">
                            ₹{calculatePremium(values.policyTerm).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="border-t pt-6 flex justify-end">
                      <button
                        type="submit"
                        disabled={!isValid || !dirty}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Review Application
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          ) : (
            /* Review Step */
            <div className="space-y-6">
              {/* Application Summary */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4">Application Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Registration Number</p>
                      <p className="font-medium">{applicationData.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-medium">{applicationData.manufacturer} {applicationData.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Year of Purchase</p>
                      <p className="font-medium">{applicationData.yearOfPurchase}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ex-showroom Price</p>
                      <p className="font-medium">₹{parseInt(applicationData.exshowroomPrice).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Insured Declared Value</p>
                      <p className="font-medium">₹{applicationData.insuredValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Policy Term</p>
                      <p className="font-medium">{formatPolicyTerm(applicationData.policyTerm)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Breakdown */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4">Premium Breakdown</h3>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span>Annual Premium</span>
                    <span>₹{policy.premium.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Policy Term</span>
                    <span>{formatPolicyTerm(applicationData.policyTerm)}</span>
                  </div>
                  <div className="border-t border-indigo-200 pt-2 mt-2">
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total Premium</span>
                      <span className="text-indigo-600">₹{applicationData.calculatedPremium.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Edit Details
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing Application...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};