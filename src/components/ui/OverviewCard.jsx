export const OverviewCard = ({ title, value, icon: Icon, className = "" }) => {
  return (
    <div
      className={`rounded-xl shadow-sm p-6 border ${className} hover:shadow-lg transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-semibold mt-2 text-gray-800">{value}</p>
        </div>
        {Icon && <Icon className="h-8 w-8 text-gray-600" />}
      </div>
    </div>
  );
};
