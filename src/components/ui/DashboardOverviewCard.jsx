import { ClipLoader } from "react-spinners";

export const DashboardOverviewCard = ({ title, data, icon: Icon, className, onClick }) => {
  if (data.loading) {
    return (
      <div className={`p-6 rounded-xl border ${className} flex items-center justify-center min-h-[120px]`}>
        <ClipLoader size={24} color="#6366F1" />
      </div>
    );
  }

  const displayValue = data.error || data.value;
  const isError = data.error !== null;

  return (
    <div 
      className={`p-6 rounded-xl border ${className} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${isError ? 'text-red-500' : 'text-gray-900'}`}>
            {displayValue ?? 'N/A'}
          </p>
        </div>
        <div className={`p-3 rounded-full ${isError ? 'bg-red-100' : 'bg-white/50'}`}>
          <Icon className={`h-6 w-6 ${isError ? 'text-red-500' : 'text-gray-700'}`} />
        </div>
      </div>
    </div>
  );
};
