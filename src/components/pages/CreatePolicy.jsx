import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { addDays, format } from "date-fns";
import { useAgent } from "../../context/AgentContext";
import { FormInput } from "../components/FormInput";
import { CustomerSearchSelect } from "../components/CustomerSearch";
import { toast } from "react-hot-toast";
import { 
  ChevronRightIcon, 
  ChevronLeftIcon,
  UserIcon,
  TruckIcon,
  CreditCardIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { AgentMenuItems } from "../../constants/data";

// Import policy data from BrowsePolicies
const policiesData = [
  {
    id: "TW-1001",
    name: "Basic Two-Wheeler Insurance",
    type: "Two-Wheeler",
    premium: 1200,
    coverage: "Third-party liability, Own damage, Personal accident cover",
    validity: "1 year with option to renew",
    details: "Covers damages up to ₹50,000 for two-wheelers with engine capacity under 150cc.",
  },
  {
    id: "TW-1002",
    name: "Premium Two-Wheeler Insurance",
    type: "Two-Wheeler",
    premium: 2500,
    coverage: "Comprehensive coverage with zero depreciation, Roadside assistance",
    validity: "1 year with option to renew",
    details: "Ideal for high-end two-wheelers with complete protection against damages and theft.",
  },
  {
    id: "TW-1003",
    name: "Student Two-Wheeler Plan",
    type: "Two-Wheeler",
    premium: 800,
    coverage: "Basic third-party liability, Limited own damage cover",
    validity: "1 year with option to renew",
    details: "Special plan for students with affordable premiums and essential coverage.",
  },
  {
    id: "TW-1004",
    name: "Electric Scooter Insurance",
    type: "Two-Wheeler",
    premium: 1800,
    coverage: "Battery cover, Electrical damages, Charging station accidents",
    validity: "1 year with option to renew",
    details: "Specialized coverage for electric two-wheelers including battery protection.",
  },
  {
    id: "TW-1005",
    name: "Delivery Partner Insurance",
    type: "Two-Wheeler",
    premium: 3200,
    coverage: "Commercial usage, Enhanced third-party, Accident cover",
    validity: "1 year with option to renew",
    details: "Designed for delivery partners with extended coverage for commercial usage.",
  },
  {
    id: "FW-2001",
    name: "Basic Car Insurance",
    type: "Four-Wheeler",
    premium: 5500,
    coverage: "Third-party liability, Basic own damage cover",
    validity: "1 year with option to renew",
    details: "Mandatory coverage for all cars with basic protection against damages.",
  },
  {
    id: "FW-2002",
    name: "Premium Sedan Insurance",
    type: "Four-Wheeler",
    premium: 12000,
    coverage: "Comprehensive coverage, Zero depreciation, 24/7 roadside assistance",
    validity: "1 year with option to renew",
    details: "Complete protection for sedans with premium features and addon benefits.",
  },
  {
    id: "FW-2003",
    name: "SUV Special Coverage",
    type: "Four-Wheeler",
    premium: 18000,
    coverage: "All-terrain coverage, Flood damage, Engine protection",
    validity: "1 year with option to renew",
    details: "Specialized coverage for SUVs with protection against various terrains and conditions.",
  },
  {
    id: "FW-2004",
    name: "Electric Car Insurance",
    type: "Four-Wheeler",
    premium: 15000,
    coverage: "Battery cover, Charging accidents, Special electric components",
    validity: "1 year with option to renew",
    details: "Tailored for electric vehicles with special coverage for EV-specific components.",
  },
  {
    id: "FW-2005",
    name: "Luxury Vehicle Insurance",
    type: "Four-Wheeler",
    premium: 35000,
    coverage: "Premium comprehensive, Import parts coverage, Valet parking",
    validity: "1 year with option to renew",
    details: "Elite coverage for luxury vehicles with specialized service and import parts protection.",
  },
];

// Vehicle manufacturers list
const manufacturers = [
  "Maruti Suzuki", "Hyundai", "Tata Motors", "Mahindra", "Honda", "Toyota", "Kia", "MG", 
  "Volkswagen", "Skoda", "Ford", "Renault", "BMW", "Mercedes-Benz", "Audi", "Bajaj", 
  "Hero", "TVS", "Royal Enfield", "Yamaha", "Suzuki", "Honda Motorcycle", "Other"
];

// Validation schemas for each step
const customerSelectionSchema = Yup.object({
  selectedCustomer: Yup.object().required("Please select a customer"),
});

const policySelectionSchema = Yup.object({
  selectedPolicy: Yup.object().required("Please select a policy"),
});

const vehicleDetailsSchema = Yup.object({
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

export const CreatePolicy = () => {
  const navigate = useNavigate();
  const { assignedCustomers, addAgentCreatedPolicy } = useAgent();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedCustomer: null,
    selectedPolicy: null,
    vehicleDetails: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, name: "Customer", icon: UserIcon },
    { id: 2, name: "Policy", icon: DocumentTextIcon },
    { id: 3, name: "Vehicle", icon: TruckIcon },
    { id: 4, name: "Review", icon: CreditCardIcon },
  ];

  // Calculate years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 34 }, (_, i) => currentYear - i);

  // Calculate insured value options based on policy type
  const getInsuredValueOptions = (policyType) => {
    if (policyType === "Two-Wheeler") {
      return [30000, 50000, 75000, 100000, 150000, 200000];
    } else {
      return [300000, 500000, 750000, 1000000, 1500000, 2000000];
    }
  };

  // Filter policies by type
  const [policyFilter, setPolicyFilter] = useState("All");
  const filteredPolicies = policyFilter === "All" 
    ? policiesData 
    : policiesData.filter(policy => policy.type === policyFilter);

  // Step 1: Customer Selection
  const handleCustomerSelection = (values) => {
    setFormData(prev => ({ ...prev, selectedCustomer: values.selectedCustomer }));
    setCurrentStep(2);
  };

  // Step 2: Policy Selection
  const handlePolicySelection = (policy) => {
    setFormData(prev => ({ ...prev, selectedPolicy: policy }));
    setCurrentStep(3);
  };

  // Step 3: Vehicle Details
  const handleVehicleDetails = (values) => {
    setFormData(prev => ({ ...prev, vehicleDetails: values }));
    setCurrentStep(4);
  };

  // Calculate premium and tax
  const calculatePremium = (term) => {
    return formData.selectedPolicy ? formData.selectedPolicy.premium * term : 0;
  };

  const calculateTax = (amount) => {
    return amount * 0.12;
  };

  const calculateCommission = (totalAmount) => {
    return totalAmount * 0.05;
  };

  // Final submission
  const handleFinalSubmission = async () => {
    setIsSubmitting(true);
  
    try {
      console.log("Starting policy creation...");
      console.log("Form data:", formData);
  
      // Validate form data
      if (!formData.selectedCustomer) {
        throw new Error("No customer selected");
      }
      if (!formData.selectedPolicy) {
        throw new Error("No policy selected");
      }
      if (!formData.vehicleDetails) {
        throw new Error("No vehicle details provided");
      }
  
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      // Generate policy details
      const startDate = new Date();
      const endDate = addDays(startDate, formData.vehicleDetails.policyTerm * 365);
      
      const totalPremium = calculatePremium(formData.vehicleDetails.policyTerm);
      const tax = calculateTax(totalPremium);
      const totalAmount = Math.round(totalPremium + tax);
  
      // Create new policy object
      const newPolicy = {
        id: `POL-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`,
        policyId: formData.selectedPolicy.id,
        name: formData.selectedPolicy.name,
        type: formData.selectedPolicy.type,
        vehicleRegNo: formData.vehicleDetails.registrationNumber,
        manufacturer: formData.vehicleDetails.manufacturer,
        model: formData.vehicleDetails.model,
        validityStart: format(startDate, "yyyy-MM-dd"),
        validityEnd: format(endDate, "yyyy-MM-dd"),
        premiumPaid: totalAmount,
        insuredValue: formData.vehicleDetails.insuredValue,
        customerName: formData.selectedCustomer.name,
        customerEmail: formData.selectedCustomer.email,
        status: "Active",
        createdBy: "Agent"
      };
  
      console.log("New policy object:", newPolicy);
  
      // Add policy using context function
      await addAgentCreatedPolicy(newPolicy, formData.selectedCustomer.id);
  
      toast.success(`Policy created successfully for ${formData.selectedCustomer.name}!`);
      
      // Navigate to agent policies page
      setTimeout(() => {
        navigate("/agentDashboard/policies");
      }, 1000);
  
    } catch (error) {
      console.error("Policy creation error:", error);
      toast.error(`Failed to create policy: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors
                    ${currentStep >= step.id 
                      ? "bg-indigo-600 text-white" 
                      : "bg-gray-200 text-gray-500"
                    }
                  `}>
                    {currentStep > step.id ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? "text-indigo-600" : "text-gray-500"
                    }`}>
                      Step {step.id}
                    </p>
                    <p className={`text-xs ${
                      currentStep >= step.id ? "text-indigo-500" : "text-gray-400"
                    }`}>
                      {step.name}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-16 mx-4 transition-colors ${
                    currentStep > step.id ? "bg-indigo-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Step 1: Customer Selection */}
          {currentStep === 1 && (
            <div>
              <div className="border-b pb-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Select Customer</h1>
                <p className="text-gray-600 mt-1">Choose the customer for whom you want to create a policy</p>
              </div>

              <Formik
                initialValues={{ selectedCustomer: null }}
                validationSchema={customerSelectionSchema}
                onSubmit={handleCustomerSelection}
              >
                {({ values, setFieldValue, errors, touched }) => (
                  <Form className="space-y-6">
                    <CustomerSearchSelect
                      customers={assignedCustomers}
                      selectedCustomer={values.selectedCustomer}
                      onCustomerSelect={(customer) => setFieldValue("selectedCustomer", customer)}
                      error={touched.selectedCustomer && errors.selectedCustomer}
                    />

                    {values.selectedCustomer && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-800 mb-3">Customer Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Name:</span>
                            <p className="font-medium">{values.selectedCustomer.name}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <p className="font-medium">{values.selectedCustomer.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <p className="font-medium">{values.selectedCustomer.phone}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Existing Policies:</span>
                            <p className="font-medium">{values.selectedCustomer.policies?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-6 border-t">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        Continue
                        <ChevronRightIcon className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {/* Step 2: Policy Selection */}
          {currentStep === 2 && (
            <div>
              <div className="border-b pb-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Select Policy</h1>
                <p className="text-gray-600 mt-1">Choose the insurance policy type</p>
              </div>

              {/* Policy Filter */}
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Filter by type:</span>
                  {["All", "Two-Wheeler", "Four-Wheeler"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setPolicyFilter(type)}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        policyFilter === type 
                          ? "bg-indigo-600 text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Policy Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {filteredPolicies.map((policy) => (
                  <div
                    key={policy.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      formData.selectedPolicy?.id === policy.id 
                        ? "border-indigo-500 bg-indigo-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePolicySelection(policy)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          policy.type === "Two-Wheeler"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {policy.type}
                        </span>
                        <h3 className="font-semibold text-gray-800 mt-2">{policy.name}</h3>
                        <p className="text-sm text-gray-500">ID: {policy.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">₹{policy.premium}</p>
                        <p className="text-xs text-gray-500">/year</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{policy.coverage}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </button>
                {formData.selectedPolicy && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    Continue
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Vehicle Details */}
          {currentStep === 3 && (
            <div>
              <div className="border-b pb-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Vehicle Details</h1>
                <p className="text-gray-600 mt-1">Enter the vehicle information</p>
              </div>

              <Formik
                initialValues={{
                  registrationNumber: "",
                  model: "",
                  manufacturer: "",
                  yearOfPurchase: currentYear,
                  insuredValue: getInsuredValueOptions(formData.selectedPolicy.type)[2],
                  policyTerm: 1,
                }}
                validationSchema={vehicleDetailsSchema}
                onSubmit={handleVehicleDetails}
              >
                {({ values, setFieldValue, isValid, dirty }) => (
                  <Form className="space-y-6">
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Insured Value (IDV)</label>
                        <select
                          name="insuredValue"
                          value={values.insuredValue}
                          onChange={(e) => setFieldValue("insuredValue", Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {getInsuredValueOptions(formData.selectedPolicy.type).map((value) => (
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value={1}>1 Year</option>
                          <option value={2}>2 Years</option>
                          <option value={3}>3 Years</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between pt-6 border-t">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                      >
                        <ChevronLeftIcon className="w-4 h-4 mr-2" />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={!isValid || !dirty}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                      >
                        Continue to Review
                        <ChevronRightIcon className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 4 && (
            <div>
              <div className="border-b pb-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Review & Confirm</h1>
                <p className="text-gray-600 mt-1">Please review all details before creating the policy</p>
              </div>

              <div className="space-y-6">
                {/* Customer Details */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{formData.selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{formData.selectedCustomer.email}</p>
                    </div>
                  </div>
                </div>

                {/* Policy Details */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Policy Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Policy Name</p>
                      <p className="font-medium">{formData.selectedPolicy.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Policy Type</p>
                      <p className="font-medium">{formData.selectedPolicy.type}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Vehicle Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      <p className="font-medium">{formData.vehicleDetails.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vehicle</p>
                      <p className="font-medium">{formData.vehicleDetails.manufacturer} {formData.vehicleDetails.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="font-medium">{formData.vehicleDetails.yearOfPurchase}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Policy Term</p>
                      <p className="font-medium">{formData.vehicleDetails.policyTerm} Year(s)</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
                  <h3 className="font-medium text-gray-800 mb-4">Pricing Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-gray-600">Base Premium</p>
                      <p className="font-medium">₹{formData.selectedPolicy.premium.toLocaleString()}/year</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Policy Term</p>
                      <p className="font-medium">{formData.vehicleDetails.policyTerm} Year(s)</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Total Premium</p>
                      <p className="font-medium">₹{calculatePremium(formData.vehicleDetails.policyTerm).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Tax (12%)</p>
                      <p className="font-medium">₹{calculateTax(calculatePremium(formData.vehicleDetails.policyTerm)).toLocaleString()}</p>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between">
                      <p className="font-semibold text-gray-800">Total Amount</p>
                      <p className="font-bold text-indigo-600">₹{(calculatePremium(formData.vehicleDetails.policyTerm) + calculateTax(calculatePremium(formData.vehicleDetails.policyTerm))).toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <p className="text-green-600">Your Commission (5%)</p>
                      <p className="font-medium text-green-600">₹{calculateCommission(calculatePremium(formData.vehicleDetails.policyTerm) + calculateTax(calculatePremium(formData.vehicleDetails.policyTerm))).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmission}
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
                        Creating Policy...
                      </>
                    ) : (
                      <>
                        Create Policy
                        <CheckCircleIcon className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};