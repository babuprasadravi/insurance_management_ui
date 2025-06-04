import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { DocumentArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";

import { DashboardLayout } from "../layout/DashboardLayout";
import { FormInput } from "../components/FormInput";
import { useAuth } from "../../context/AuthProvider";
import { customerMenuItems } from "../../constants/data";

// Maximum allowed file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed file types
const SUPPORTED_FORMATS = [
  "image/jpg", 
  "image/jpeg", 
  "image/png", 
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

const validationSchema = Yup.object({
  policyId: Yup.string().required("Please select a policy"),
  incidentDate: Yup.date()
    .required("Incident date is required")
    .max(new Date(), "Incident date cannot be in the future"),
  description: Yup.string()
    .required("Description is required")
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must not exceed 500 characters"),
  claimAmount: Yup.number()
    .required("Claim amount is required")
    .positive("Claim amount must be positive")
    .integer("Claim amount must be a whole number")
});

export const FileClaimForm = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const [policiesError, setPoliciesError] = useState("");

  // Get pre-selected policy from navigation state (if available)
  const preSelectedPolicy = location.state?.selectedPolicy;

  // Calculate status based on validity dates
  const calculateStatus = (validFrom, validUntil) => {
    const today = new Date();
    const startDate = new Date(validFrom);
    const endDate = new Date(validUntil);
    
    if (today < startDate) {
      return "Pending";
    } else if (today > endDate) {
      return "Expired";
    } else {
      return "Active";
    }
  };

  // Fetch user's policies from backend API
  const fetchPolicies = async () => {
    try {
      setIsLoadingPolicies(true);
      setPoliciesError("");

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await axios.get(`http://localhost:8084/api/policies/customer/${user.id}`);
      
      console.log("Customer Policies API Response:", response.data);

      // Map API response to frontend format and filter only active policies
      const mappedPolicies = response.data
        .map(policy => ({
          id: policy.id,
          name: policy.policyName, // Map policyName to name
          vehicleRegNo: policy.licenceNo, // Map licenceNo to vehicleRegNo
          vehicle: policy.vehicle,
          validityStart: policy.validFrom,
          validityEnd: policy.validUntil,
          premiumPaid: policy.premium,
          agentName: policy.agentAssigned,
          agentId: policy.agentId,
          customerId: policy.customerId,
          status: calculateStatus(policy.validFrom, policy.validUntil)
        }))
        .filter(policy => policy.status === "Active"); // Only show active policies

      setPolicies(mappedPolicies);
    } catch (error) {
      console.error("Error fetching customer policies:", error);
      
      let errorMessage = "Failed to fetch policies. Please try again.";
      
      if (error.response?.status === 404) {
        errorMessage = "No policies found for your account.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if the backend is running.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === "User not authenticated") {
        errorMessage = "Please log in to file a claim.";
      }
      
      setPoliciesError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  // Fetch policies when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchPolicies();
    }
  }, [user?.id]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    let hasError = false;
    
    const validFiles = selectedFiles.filter(file => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File "${file.name}" is too large. Maximum size is 5MB.`);
        hasError = true;
        return false;
      }
      
      // Check file type
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        setFileError(`File "${file.name}" has unsupported format. Please use JPG, PNG, or PDF.`);
        hasError = true;
        return false;
      }
      
      return true;
    });
    
    if (!hasError) {
      setFileError("");
      setFiles(prev => [...prev, ...validFiles]);
    }
  };
  
  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return "🖼️";
    } else if (['pdf'].includes(extension)) {
      return "📄";
    } else if (['doc', 'docx'].includes(extension)) {
      return "📝";
    }
    
    return "📎";
  };
  
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Get policy details
      const policyDetails = policies.find(policy => policy.id === parseInt(values.policyId));
      
      if (!policyDetails) {
        throw new Error("Selected policy not found");
      }

      // Prepare API request body according to backend requirements
      const apiRequestBody = {
        policyId: parseInt(values.policyId), // Use actual selected policy ID
        customerId: user.id, // Get from authenticated user
        policyName: policyDetails.name, // Use policy name from selected policy
        dateOfIncident: values.incidentDate, // Map frontend field to API field
        briefDescription: values.description, // Map frontend field to API field
        claimAmountRequested: parseFloat(values.claimAmount) // Convert to number
      };

      console.log("Submitting claim with data:", apiRequestBody);

      // Make API call to backend
      const response = await axios.post(
        "http://localhost:8082/api/claims/post",
        apiRequestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("API Response:", response.data);

      toast.success(
        `Claim submitted successfully! Claim ID: ${response.data.claimId}`,
        { duration: 4000 }
      );
      
      // Navigate to claims page to see the submitted claim
      navigate("/dashboard/claims");
      
    } catch (error) {
      console.error("Claim submission error:", error);
      
      let errorMessage = "Failed to submit claim. Please try again.";
      
      if (error.response?.status === 400) {
        errorMessage = "Invalid claim data. Please check your inputs and try again.";
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

  // Determine initial policy ID for form
  const getInitialPolicyId = () => {
    if (preSelectedPolicy) {
      // If policy was passed through navigation, use its ID
      return preSelectedPolicy.id.toString();
    }
    return "";
  };

  return (
    <DashboardLayout menuItems={customerMenuItems}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">File a Claim</h1>
            <p className="text-gray-600 mt-1">
              Submit a new insurance claim for your vehicle
            </p>
            {preSelectedPolicy && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-700">
                  <span className="font-medium">Pre-selected Policy:</span> {preSelectedPolicy.name} ({preSelectedPolicy.vehicleRegNo})
                </p>
              </div>
            )}
          </div>

          <Formik
            initialValues={{
              policyId: getInitialPolicyId(),
              incidentDate: format(new Date(), "yyyy-MM-dd"),
              description: "",
              claimAmount: ""
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isValid, dirty, setFieldValue }) => (
              <Form className="space-y-6">
                {/* Policy Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Policy
                  </label>
                  
                  {isLoadingPolicies ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="animate-pulse">
                        <div className="h-5 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ) : policiesError ? (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                      <p className="text-sm">{policiesError}</p>
                      <button
                        type="button"
                        onClick={fetchPolicies}
                        className="mt-2 text-sm text-red-600 underline hover:text-red-700"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : policies.length > 0 ? (
                    <Field
                      as="select"
                      name="policyId"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">-- Select a policy --</option>
                      {policies.map(policy => (
                        <option key={policy.id} value={policy.id}>
                          {policy.name} ({policy.vehicleRegNo}) - {policy.vehicle}
                        </option>
                      ))}
                    </Field>
                  ) : (
                    <div className="p-4 bg-amber-50 text-amber-700 rounded-lg">
                      <p className="text-sm">
                        No active policies found. You need an active policy to file a claim.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate("/dashboard/browse-policies")}
                        className="mt-2 text-sm text-amber-600 underline hover:text-amber-700"
                      >
                        Browse Policies
                      </button>
                    </div>
                  )}
                  
                  <ErrorMessage 
                    name="policyId" 
                    component="div" 
                    className="text-red-600 text-sm mt-1" 
                  />
                </div>

                {/* Incident Details */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-4">Accident/Incident Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date of Incident
                      </label>
                      <Field
                        type="date"
                        name="incidentDate"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        max={format(new Date(), "yyyy-MM-dd")}
                      />
                      <ErrorMessage 
                        name="incidentDate" 
                        component="div" 
                        className="text-red-600 text-sm mt-1" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Brief Description
                      </label>
                      <Field
                        as="textarea"
                        name="description"
                        rows="4"
                        placeholder="Please describe the incident in detail..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <ErrorMessage 
                        name="description" 
                        component="div" 
                        className="text-red-600 text-sm mt-1" 
                      />
                    </div>
                  </div>
                </div>

                {/* Claim Amount */}
                <div>
                  <FormInput
                    label="Claim Amount Requested (₹)"
                    name="claimAmount"
                    type="number"
                    placeholder="Enter amount in rupees"
                  />
                </div>

                {/* File Upload Section - Keep for future use */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-4">Upload Evidence</h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <DocumentArrowUpIcon className="h-10 w-10 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          Drag and drop files here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported formats: JPG, PNG, PDF, DOC (Max: 5MB each)
                        </p>
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          Note: File upload feature will be available soon
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed font-medium text-sm"
                        disabled
                      >
                        Browse Files (Coming Soon)
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        disabled
                      />
                    </div>
                  </div>

                  {fileError && (
                    <p className="text-red-600 text-sm mt-2">{fileError}</p>
                  )}

                  {/* File Preview List */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Uploaded Files ({files.length})
                      </h4>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{getFileIcon(file.name)}</span>
                              <div>
                                <p className="text-sm font-medium truncate max-w-xs">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1 hover:bg-gray-200 rounded-full"
                            >
                              <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t pt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/my-policies")}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid || !dirty || isSubmitting || isLoadingPolicies}
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
                        Submitting Claim...
                      </>
                    ) : (
                      "Submit Claim"
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </DashboardLayout>
  );
};