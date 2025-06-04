import { useAuth } from "../../context/AuthProvider";

export const WelcomeBanner = () => {
  const {user} = useAuth();
  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h1 className="text-2xl font-semibold">
          Welcome back, {user.username || "User"}!
        </h1>
        <p className="text-blue-100 mt-1">Here's your insurance overview</p>
      </div>
    </>
  );
};
