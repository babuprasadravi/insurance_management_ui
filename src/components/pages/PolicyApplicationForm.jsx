import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { addDays, format } from "date-fns";
import { usePolicy } from "../../context/PolicyProvider";
import { FormInput } from "../components/FormInput";
import { toast } from "react-hot-toast";
import { ChevronRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
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
  insuredValue: Yup.number().required("Insured value is required"),
  policyTerm: Yup.number().required("Policy term is required"),
});

export const PolicyApplicationForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const policy = location.state?.policy;
    const { addPurchasedPolicy } = usePolicy();
    const [step, setStep] = useState(1); // 1 for form, 2 for review
    const [applicationData, setApplicationData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Redirect if no policy data
    if (!policy) {
      toast.error("No policy selected. Please select a policy first.");
      navigate("/dashboard/browse-policies");
      return null;
    }
  
    // Calculate years for dropdown
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 34 }, (_, i) => currentYear - i);
    
    // Calculate insured value options based on policy type
    const getInsuredValueOptions = () => {
      if (policy.type === "Two-Wheeler") {
        return [30000, 50000, 75000, 100000, 150000, 200000];
      } else {
        return [300000, 500000, 750000, 1000000, 1500000, 2000000];
      }
    };
  
    const handleSubmit = (values) => {
      setApplicationData(values);
      setStep(2);
      window.scrollTo(0, 0);
    };
  
    const handleProceedToPayment = async () => {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate policy details
      const startDate = new Date();
      const endDate = addDays(startDate, applicationData.policyTerm * 365);
      
      // Create a new policy object
      const newPolicy = {
        id: `POL-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`,
        policyId: policy.id,
        name: policy.name,
        type: policy.type,
        vehicleRegNo: applicationData.registrationNumber,
        manufacturer: applicationData.manufacturer,
        model: applicationData.model,
        validityStart: format(startDate, "yyyy-MM-dd"),
        validityEnd: format(endDate, "yyyy-MM-dd"),
        premiumPaid: calculatePremium(applicationData.policyTerm) + calculateTax(calculatePremium(applicationData.policyTerm)),
        insuredValue: applicationData.insuredValue,
        agentName: "Rahul Sharma",  // Mock agent name
        status: "Active"
      };
      
      // Add to purchased policies
      addPurchasedPolicy(newPolicy);
      
      toast.success("Payment successful! Your policy has been issued.");
      navigate("/dashboard/my-policies");
      setIsSubmitting(false);
    };
  
    // Calculate premium based on term
    const calculatePremium = (term) => {
      return policy.premium * term;
    };
  
    // Calculate tax (12%)
    const calculateTax = (amount) => {
      return amount * 0.12;
    };

  return (
    <DashboardLayout menuItems={customerMenuItems} >
      <div className="max-w-3xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>
                1
              </div>
              <div className={`h-1 w-16 mx-2 ${step >= 2 ? "bg-indigo-600" : "bg-gray-200"}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>
                2
              </div>
              <div className={`h-1 w-16 mx-2 ${step >= 3 ? "bg-indigo-600" : "bg-gray-200"}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>
                3
              </div>
            </div>
            <div className="text-sm font-medium text-gray-500">
              {step === 1 ? "Vehicle Information" : step === 2 ? "Review & Payment" : "Complete"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              {step === 1 ? "Policy Application" : "Review & Confirm"}
            </h1>
            <p className="text-gray-600 mt-1">
              {step === 1 
                ? "Please provide your vehicle details to continue" 
                : "Review your application details before proceeding to payment"}
            </p>
          </div>

          {step === 1 ? (
            <>
              {/* Policy Info Summary */}
              <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <h3 className="font-medium text-gray-800 mb-2">Selected Policy</h3>
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-700 font-medium">{policy.name}</p>
                    <p className="text-sm text-gray-600">Policy ID: {policy.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-600 font-semibold">₹{policy.premium}/year</p>
                    <p className="text-xs text-gray-500">Base premium</p>
                  </div>
                </div>
              </div>

              <Formik
                initialValues={{
                  registrationNumber: "",
                  model: "",
                  manufacturer: "",
                  yearOfPurchase: currentYear,
                  insuredValue: getInsuredValueOptions()[2],
                  policyTerm: 1,
                }}
                validationSchema={applicationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, setFieldValue, isValid, dirty }) => (
                  <Form className="space-y-6">
                    <h3 className="font-medium text-gray-800 mb-4">Vehicle Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormInput
                        label="Registration Number"
                        name="registrationNumber"
                        placeholder="KA01AB1234"
                      />
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                        <select
                          name="manufacturer"
                          value={values.manufacturer}
                          onChange={(e) => setFieldValue("manufacturer", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select manufacturer</option>
                          {manufacturers.map((mfr) => (
                            <option key={mfr} value={mfr}>{mfr}</option>
                          ))}
                        </select>
                      </div>
                      
                      <FormInput
                        label="Model"
                        name="model"
                        placeholder="e.g., Swift, Activa"
                      />
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Year of Purchase</label>
                        <select
                          name="yearOfPurchase"
                          value={values.yearOfPurchase}
                          onChange={(e) => setFieldValue("yearOfPurchase", Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <h3 className="font-medium text-gray-800 mb-4 mt-8">Policy Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Insured Value (IDV)</label>
                        <select
                          name="insuredValue"
                          value={values.insuredValue}
                          onChange={(e) => setFieldValue("insuredValue", Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {getInsuredValueOptions().map((value) => (
                            <option key={value} value={value}>₹{value.toLocaleString()}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Policy Term</label>
                        <select
                          name="policyTerm"
                          value={values.policyTerm}
                          onChange={(e) => setFieldValue("policyTerm", Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={1}>1 Year</option>
                          <option value={2}>2 Years</option>
                          <option value={3}>3 Years</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t pt-6 mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigate("/dashboard/browse-policies")}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg mr-4 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!isValid || !dirty}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50 disabled:hover:bg-indigo-600"
                      >
                        Continue to Review
                        <ChevronRightIcon className="h-4 w-4 ml-2" />
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </>
          ) : (
            <>
              {/* Review Step */}
              <div className="space-y-6">
                {/* Vehicle Details Review */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Vehicle Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      <p className="font-medium">{applicationData.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Manufacturer</p>
                      <p className="font-medium">{applicationData.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Model</p>
                      <p className="font-medium">{applicationData.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Year of Purchase</p>
                      <p className="font-medium">{applicationData.yearOfPurchase}</p>
                    </div>
                  </div>
                </div>
                
                {/* Policy Details Review */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Policy Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Policy Type</p>
                      <p className="font-medium">{policy.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Policy ID</p>
                      <p className="font-medium">{policy.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Insured Value (IDV)</p>
                      <p className="font-medium">₹{applicationData.insuredValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Policy Term</p>
                      <p className="font-medium">{applicationData.policyTerm} {applicationData.policyTerm === 1 ? 'Year' : 'Years'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Payment Summary */}
                <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                  <h3 className="font-medium text-gray-800 mb-4">Payment Summary</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-gray-600">Base Premium</p>
                      <p className="font-medium">₹{policy.premium.toLocaleString()}/year</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Policy Term</p>
                      <p className="font-medium">{applicationData.policyTerm} {applicationData.policyTerm === 1 ? 'Year' : 'Years'}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Premium Amount</p>
                      <p className="font-medium">₹{calculatePremium(applicationData.policyTerm).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Tax (12%)</p>
                      <p className="font-medium">₹{calculateTax(calculatePremium(applicationData.policyTerm)).toLocaleString()}</p>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between">
                      <p className="font-semibold text-gray-800">Total Amount</p>
                      <p className="font-bold text-indigo-600">₹{(calculatePremium(applicationData.policyTerm) + calculateTax(calculatePremium(applicationData.policyTerm))).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
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
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <ChevronRightIcon className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};