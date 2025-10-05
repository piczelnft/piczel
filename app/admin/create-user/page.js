"use client";

import { useState } from "react";
import AdminLayout from "../components/AdminLayout";

export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    sponsorId: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [createdUser, setCreatedUser] = useState(null);
  const [loginLink, setLoginLink] = useState("");
  const [sponsorValid, setSponsorValid] = useState(null);
  const [sponsorChecking, setSponsorChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Reset sponsor validation when sponsor ID changes
    if (name === "sponsorId") {
      setSponsorValid(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.mobile.replace(/[\s\-\(\)]/g, ""))
    ) {
      newErrors.mobile = "Please enter a valid mobile number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.sponsorId.trim()) {
      newErrors.sponsorId = "Sponsorship ID is required";
    } else if (sponsorValid !== true) {
      newErrors.sponsorId = "Please validate a valid Sponsorship ID";
    }

    return newErrors;
  };

  const validateSponsor = async () => {
    if (!formData.sponsorId.trim()) return;
    setSponsorChecking(true);
    try {
      const res = await fetch(
        `/api/users/validate-sponsor?memberId=${encodeURIComponent(
          formData.sponsorId.trim()
        )}`
      );
      const data = await res.json();
      if (res.ok && data.valid) {
        setSponsorValid(true);
      } else {
        setSponsorValid(false);
      }
    } catch {
      setSponsorValid(false);
    } finally {
      setSponsorChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});
    setCreatedUser(null);
    setLoginLink("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          sponsorId: formData.sponsorId.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("User created successfully!");
        setCreatedUser(data.user);
        setLoginLink(data.loginLink);

        // Reset form
        setFormData({
          name: "",
          email: "",
          mobile: "",
          password: "",
          sponsorId: "",
        });
        setSponsorValid(null);
      } else {
        setErrors({ general: data.error || "Something went wrong" });
      }
    } catch (error) {
      console.error("User creation error:", error);
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Login link copied to clipboard!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Create New User
          </h1>
          <p className="text-gray-400">
            Create a new user account with all required information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Creation Form */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              User Information
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="px-4 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400">
                  {errors.general}
                </div>
              )}

              {message && (
                <div className="px-4 py-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400">
                  {message}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="mobile"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter mobile number"
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-400">{errors.mobile}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sponsorId"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Sponsorship ID *
                </label>
                <div className="flex gap-2">
                  <input
                    id="sponsorId"
                    name="sponsorId"
                    type="text"
                    required
                    value={formData.sponsorId}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter sponsor's ID (e.g., M123ABC)"
                  />
                  <button
                    type="button"
                    onClick={validateSponsor}
                    disabled={!formData.sponsorId.trim() || sponsorChecking}
                    className="px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sponsorChecking ? "Checking..." : "Validate"}
                  </button>
                </div>
                {sponsorValid === true && (
                  <p className="mt-1 text-sm text-green-400">
                    Sponsor ID is valid.
                  </p>
                )}
                {sponsorValid === false && (
                  <p className="mt-1 text-sm text-red-400">
                    Invalid Sponsorship ID.
                  </p>
                )}
                {errors.sponsorId && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.sponsorId}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating User...
                  </div>
                ) : (
                  "Create User Account"
                )}
              </button>
            </form>
          </div>

          {/* Success Panel */}
          {createdUser && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                User Created Successfully!
              </h2>

              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg
                      className="h-5 w-5 text-green-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-green-400 font-medium">
                      Account Details
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      <span className="text-gray-400">Name:</span>{" "}
                      {createdUser.name}
                    </p>
                    <p>
                      <span className="text-gray-400">Email:</span>{" "}
                      {createdUser.email}
                    </p>
                    <p>
                      <span className="text-gray-400">Mobile:</span>{" "}
                      {createdUser.mobile}
                    </p>
                    <p>
                      <span className="text-gray-400">Member ID:</span>{" "}
                      {createdUser.memberId}
                    </p>
                    <p>
                      <span className="text-gray-400">Sponsor:</span>{" "}
                      {createdUser.sponsor.name} ({createdUser.sponsor.memberId}
                      )
                    </p>
                    <p>
                      <span className="text-gray-400">Status:</span>{" "}
                      <span className="text-green-400">Activated</span>
                    </p>
                  </div>
                </div>

                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-blue-400 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      <span className="text-blue-400 font-medium">
                        Login Link
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(loginLink)}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    Share this link with the user to allow them to login with
                    prefilled information:
                  </p>
                  <div className="bg-gray-700 rounded p-2 text-xs text-gray-300 break-all">
                    {loginLink}
                  </div>
                  <p className="text-xs text-yellow-400 mt-2">
                    ⚠️ This link expires in 24 hours
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Next Steps:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Copy and share the login link with the user</li>
                    <li>
                      • The user can click the link to access their account
                    </li>
                    <li>
                      • Their email and name will be prefilled in the login form
                    </li>
                    <li>• They can change their password after first login</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
