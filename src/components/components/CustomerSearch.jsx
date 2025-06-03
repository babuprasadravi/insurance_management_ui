import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, UserIcon } from "@heroicons/react/24/outline";

export const CustomerSearchSelect = ({ customers, selectedCustomer, onCustomerSelect, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomerSelect = (customer) => {
    onCustomerSelect(customer);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select Customer *
      </label>
      <div className="relative" ref={dropdownRef}>
        <div
          className={`w-full px-4 py-3 border rounded-lg bg-white cursor-pointer transition-colors ${
            error ? "border-red-300" : "border-gray-300 hover:border-gray-400"
          } ${isOpen ? "ring-2 ring-indigo-500 border-indigo-500" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            {selectedCustomer ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Search or select a customer...</span>
            )}
            <ChevronDownIcon 
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} 
            />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                        <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                        <p className="text-xs text-gray-400">{customer.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {customer.policies?.length || 0} policies
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <UserIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No customers found</p>
                  <p className="text-xs">Try adjusting your search term</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};