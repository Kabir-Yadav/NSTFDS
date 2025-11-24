// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   EyeSlashIcon,
//   EyeIcon,
//   GlobeAltIcon,
// } from "@heroicons/react/24/outline";

// const RegisterPage = () => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     agreeToTerms: false,
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [passwordError, setPasswordError] = useState("");
//   const [isPasswordValid, setIsPasswordValid] = useState(true);
//   const [successMessage, setSuccessMessage] = useState(""); // Already implemented
//   const navigate = useNavigate();

//   const validatePasswords = (password, confirmPassword) => {
//     if (password !== confirmPassword) {
//       setPasswordError("Passwords don't match");
//       setIsPasswordValid(false);
//       return false;
//     }
//     if (password.length < 8) {
//       setPasswordError("Password must be at least 8 characters long");
//       setIsPasswordValid(false);
//       return false;
//     }
//     if (!/\d/.test(password)) {
//       setPasswordError("Password must contain at least one number");
//       setIsPasswordValid(false);
//       return false;
//     }
//     if (!/[A-Z]/.test(password)) {
//       setPasswordError("Password must contain at least one uppercase letter");
//       setIsPasswordValid(false);
//       return false;
//     }
//     if (!/[a-z]/.test(password)) {
//       setPasswordError("Password must contain at least one lowercase letter");
//       setIsPasswordValid(false);
//       return false;
//     }
//     setPasswordError("");
//     setIsPasswordValid(true);
//     return true;
//   };

//   const handleInputChange = (e) => {
//     const { name, value, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: name === "agreeToTerms" ? checked : value,
//     }));
//     // Validate passwords on change
//     if (name === "password" || name === "confirmPassword") {
//       validatePasswords(
//         name === "password" ? value : formData.password,
//         name === "confirmPassword" ? value : formData.confirmPassword
//       );
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {
//       setPasswordError("Passwords do not match");
//       return;
//     }
//     setPasswordError("");
//     setSuccessMessage("Registration successful! Redirecting to login...");
//     setTimeout(() => {
//       navigate("/login");
//     }, 2000); // Redirect to login after 2 seconds
//   };



//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 perspective-900">
//       <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 transform rotate-y-3 hover:rotate-y-0 transition-transform duration-500 relative">
//         {/* Pseudo-elements for 3D edges */}
//         <div className="absolute inset-0 rounded-3xl transform -rotate-y-6 -z-10 opacity-20" />
//         <div className="absolute inset-0 rounded-3xl transform -rotate-y-3 -z-20 opacity-10" />

//         {/* Header */}
//         <div className="text-center mb-8 transform hover:translate-z-4 transition-transform">
//           <div className="flex justify-center mb-4">
//             <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform shadow-lg">
//               <GlobeAltIcon className="w-6 h-6 text-purple-600" />
//             </div>
//           </div>
//           <h2 className="text-3xl font-display font-semibold text-gray-900">
//             Create Account
//           </h2>
//           <p className="text-sm text-gray-600 mt-1">
//             Please fill in your details to register
//           </p>
//         </div>

//         {/* Registration Form */}
//         <form className="space-y-6" onSubmit={handleSubmit}>
//           <div className="transform hover:translate-z-2 transition-transform">
//             <label
//               htmlFor="fullName"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Full Name
//             </label>
//             <input
//               type="text"
//               name="fullName"
//               id="fullName"
//               value={formData.fullName}
//               onChange={handleInputChange}
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none shadow-sm hover:shadow-md transition-shadow"
//               placeholder="Enter your full name"
//               required
//             />
//           </div>

//           <div className="transform hover:translate-z-2 transition-transform">
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Email address
//             </label>
//             <input
//               type="email"
//               name="email"
//               id="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none shadow-sm hover:shadow-md transition-shadow"
//               placeholder="Enter your email"
//               required
//             />
//           </div>

//           <div className="transform hover:translate-z-2 transition-transform">
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 id="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none shadow-sm hover:shadow-md transition-shadow"
//                 placeholder="Create a password"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//               >
//                 {showPassword ? (
//                   <EyeIcon className="w-5 h-5" />
//                 ) : (
//                   <EyeSlashIcon className="w-5 h-5" />
//                 )}
//               </button>
//             </div>
//           </div>

//           <div className="transform hover:translate-z-2 transition-transform">
//             <label
//               htmlFor="confirmPassword"
//               className="block text-sm font-medium text-gray-700 mb-2"
//             >
//               Confirm Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showConfirmPassword ? "text" : "password"}
//                 name="confirmPassword"
//                 id="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none shadow-sm hover:shadow-md transition-shadow"
//                 placeholder="Confirm your password"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//               >
//                 {showConfirmPassword ? (
//                   <EyeIcon className="w-5 h-5" />
//                 ) : (
//                   <EyeSlashIcon className="w-5 h-5" />
//                 )}
//               </button>
//             </div>
//             {passwordError && (
//               <p className="mt-2 text-sm text-red-600">{passwordError}</p>
//             )}
//           </div>

//           {/* Password Requirements */}
//           <div className="text-sm text-gray-600 space-y-1">
//             <p>Password must contain:</p>
//             <ul className="list-disc pl-5 space-y-1">
//               <li
//                 className={
//                   formData.password.length >= 8 ? "text-green-600" : ""
//                 }
//               >
//                 At least 8 characters
//               </li>
//               <li
//                 className={
//                   /[A-Z]/.test(formData.password) ? "text-green-600" : ""
//                 }
//               >
//                 One uppercase letter
//               </li>
//               <li
//                 className={
//                   /[a-z]/.test(formData.password) ? "text-green-600" : ""
//                 }
//               >
//                 One lowercase letter
//               </li>
//               <li
//                 className={/\d/.test(formData.password) ? "text-green-600" : ""}
//               >
//                 One number
//               </li>
//             </ul>
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               name="agreeToTerms"
//               id="agreeToTerms"
//               checked={formData.agreeToTerms}
//               onChange={handleInputChange}
//               className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
//               required
//             />
//             <label
//               htmlFor="agreeToTerms"
//               className="ml-2 text-sm text-gray-600"
//             >
//               I agree to the Terms of Service and Privacy Policy
//             </label>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
//           >
//             Create Account
//           </button>
//         </form>

//         {/* Sign In Link */}
//         <p className="mt-8 text-center text-sm text-gray-600">
//           Already have an account?{" "}
//           <button
//             onClick={() => navigate("/login")}
//             className="text-purple-600 hover:text-purple-500 font-medium"
//           >
//             Sign in
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;
