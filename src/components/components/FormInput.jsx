import { useField } from "formik";

export const FormInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        {...field}
        {...props}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {meta.touched && meta.error ? (
        <div className="text-red-600 text-sm">{meta.error}</div>
      ) : null}
    </div>
  );
};
