import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [wobble, setWobble] = useState(false);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderDemoCards = (accounts) =>
    accounts.map((account) => (
      <div
        key={account.email}
        className="border border-dashed border-purple-200 rounded-lg p-3 bg-purple-50/60"
      >
        <p className="text-sm text-gray-700">
          <span className="font-medium">Account:</span>{" "}
          {account.label || account.role}
        </p>
        {account.psu && (
          <p className="text-xs text-gray-600">
            <span className="font-medium">PSU:</span> {account.psu}
          </p>
        )}
        <p className="text-xs text-gray-600">
          <span className="font-medium">Role:</span> {account.role}
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-medium">Email:</span> {account.email}
        </p>
        <p className="text-xs text-gray-600">
          <span className="font-medium">Password:</span> {account.password}
        </p>
      </div>
    ));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation errors when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "", general: "" };

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const triggerWobble = () => {
    setWobble(true);
    setTimeout(() => setWobble(false), 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      triggerWobble();
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Invalid credentials. Please try again.",
      }));
      triggerWobble();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="assets/nsfdc_new.png"
              alt="Logo"
              className="w-32 object-contain"
            />
            <img
              src="assets/ministry.png"
              alt="Logo"
              className="w-24 h-30 object-contain"
            />
            <img src="assets/src.jpg" alt="Logo" className="w-24 object-fill" />
          </div>
          <h2 className="text-3xl font-display font-semibold text-gray-900">
            Welcome back
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Please enter your details to sign in
          </p>
        </div>

        {/* Error display */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

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
              className={`w-full px-4 py-3 border ${
                errors.email ? "border-red-500" : "border-gray-200"
              } rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none shadow-sm hover:shadow-md transition-shadow`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
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
                className={`w-full px-4 py-3 border ${
                  errors.password ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none shadow-sm hover:shadow-md transition-shadow`}
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
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    rememberMe: e.target.checked,
                  }))
                }
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
            ref={buttonRef}
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
              wobble ? "animate-wobble" : ""
            }`}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
