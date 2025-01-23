import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EyeSlashIcon,
  EyeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState(""); // Add this line to manage error state
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  // Hardcoded demo users
  const demoUsers = [
    { email: "admin@example.com", password: "admin123", role: "admin" },
    { email: "user@example.com", password: "user123", role: "user" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = demoUsers.find(
      (u) => u.email === formData.email && u.password === formData.password
    );

    if (user) {
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8  relative">
        {/* Header */}
        <div className="text-center mb-8 ">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center  shadow-lg">
              <GlobeAltIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-semibold text-gray-900">
            Welcome back
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Please enter your details to sign in
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="transform hover:translate-z-2 transition-transform">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none shadow-sm hover:shadow-md transition-shadow"
              placeholder="Enter your email"
            />
          </div>

          <div className="transform hover:translate-z-2 transition-transform">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none shadow-sm hover:shadow-md transition-shadow"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeIcon className="w-5 h-5" />
                ) : (
                  <EyeSlashIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-sm text-gray-600"
              >
                Remember for 30 days
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-purple-600 hover:text-purple-500 font-medium"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            Sign in
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-purple-600 hover:text-purple-500 font-medium"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
