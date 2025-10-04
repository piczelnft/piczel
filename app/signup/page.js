"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRedirectIfAuthenticated } from "../../lib/auth-utils";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    sponsorId: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sponsorValid, setSponsorValid] = useState(null);
  const [sponsorChecking, setSponsorChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();
  const { isAuthenticated, isLoading: authLoading } = useRedirectIfAuthenticated();

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
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.mobile.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.mobile = "Please enter a valid mobile number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(
        formData.name,
        formData.email,
        formData.mobile,
        formData.password,
        formData.sponsorId.trim()
      );

      if (result.success) {
        setMessage(
          "Account created successfully! You've been added to the genealogy tree. Redirecting..."
        );
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setErrors({ general: result.error || "Something went wrong" });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render signup form if already authenticated (will redirect to dashboard)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      {/* Left Half - Trading Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating particles */}
          <div className="particle" style={{top: '10%', left: '10%'}}></div>
          <div className="particle" style={{top: '20%', left: '80%'}}></div>
          <div className="particle" style={{top: '60%', left: '20%'}}></div>
          <div className="particle" style={{top: '80%', left: '70%'}}></div>
          <div className="particle" style={{top: '40%', left: '90%'}}></div>
          
          {/* Gradient orbs */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-500/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-700/5 to-teal-600/5 rounded-full blur-3xl animate-float"></div>
        </div>

        {/* Trading Visualization */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white gradient-text-enhanced mb-4 animate-fadeInUp">
              PICZEL
            </h1>
            <p className="text-xl text-white/80 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              Professional Crypto Trading Platform
            </p>
          </div>

          {/* Animated Trading Charts */}
          <div className="w-full max-w-md space-y-6">
            {/* Price Chart Animation */}
            <div className="card-enhanced rounded-xl p-6 animate-fadeInUp" style={{animationDelay: '0.4s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-white font-semibold">ETH/USD</div>
                  <div className="text-green-400 text-sm">+3.21%</div>
                </div>
                <div className="text-white font-bold text-xl">$3,456.78</div>
              </div>
              <div className="relative h-24">
                <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                  <path
                    d="M0,80 L20,60 L40,90 L60,40 L80,100 L100,50 L120,95 L140,30 L160,80 L180,55 L200,75"
                    stroke="url(#signupTradingGradient)"
                    strokeWidth="3"
                    fill="none"
                    className="animate-zigzag"
                  />
                  <defs>
                    <linearGradient id="signupTradingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgb(34, 197, 94)" />
                      <stop offset="50%" stopColor="rgb(59, 130, 246)" />
                      <stop offset="100%" stopColor="rgb(34, 197, 94)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Live Trading Stats */}
            <div className="grid grid-cols-2 gap-4 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
              <div className="card-enhanced rounded-lg p-4 text-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
                <div className="text-white font-bold text-lg">Market Cap</div>
                <div className="text-green-400 font-semibold">$1.2T</div>
              </div>
              <div className="card-enhanced rounded-lg p-4 text-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
                <div className="text-white font-bold text-lg">New Users</div>
                <div className="text-blue-400 font-semibold">5.2K+</div>
              </div>
            </div>

            {/* Trading Features */}
            <div className="space-y-3 animate-fadeInUp" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center space-x-3 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Instant Account Setup</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Multi-Currency Support</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white gradient-text-enhanced animate-fadeInUp">
            Create Your Account
          </h2>
            <p className="mt-2 text-sm animate-fadeInUp" style={{color: 'rgba(255, 255, 255, 0.7)', animationDelay: '0.2s'}}>
            Join PICZEL and start your crypto journey
          </p>
        </div>

          <div className="card-enhanced rounded-xl shadow-2xl p-8 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div
                className="px-4 py-3 rounded-lg animate-fadeInUp"
                style={{
                  backgroundColor: "rgba(255, 74, 74, 0.2)",
                  border: "1px solid rgba(255, 74, 74, 0.3)",
                  color: "rgb(var(--danger-rgb))",
                }}
              >
                {errors.general}
              </div>
            )}

            {message && (
              <div
                className="px-4 py-3 rounded-lg animate-fadeInUp"
                style={{
                  backgroundColor: "rgba(72, 247, 104, 0.2)",
                  border: "1px solid rgba(72, 247, 104, 0.3)",
                  color: "rgb(var(--success-rgb))",
                }}
              >
                {message}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
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
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: "rgba(29, 68, 67, 0.8)",
                  border: "1px solid var(--default-border)",
                  color: "rgb(var(--default-text-color-rgb))",
                  focusRingColor: "var(--primary-color)",
                }}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "rgb(var(--danger-rgb))" }}
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
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
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: "rgba(29, 68, 67, 0.8)",
                  border: "1px solid var(--default-border)",
                  color: "rgb(var(--default-text-color-rgb))",
                  focusRingColor: "var(--primary-color)",
                }}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "rgb(var(--danger-rgb))" }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-medium mb-2"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
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
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: "rgba(29, 68, 67, 0.8)",
                  border: "1px solid var(--default-border)",
                  color: "rgb(var(--default-text-color-rgb))",
                  focusRingColor: "var(--primary-color)",
                }}
                placeholder="Enter your mobile number"
              />
              {errors.mobile && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "rgb(var(--danger-rgb))" }}
                >
                  {errors.mobile}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="sponsorId"
                className="block text-sm font-medium mb-2"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
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
                  className="flex-1 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: "rgba(29, 68, 67, 0.8)",
                    border: "1px solid var(--default-border)",
                    color: "rgb(var(--default-text-color-rgb))",
                    focusRingColor: "var(--primary-color)",
                  }}
                  placeholder="Enter sponsor's ID (e.g., M123ABC)"
                />
                <button
                  type="button"
                  onClick={validateSponsor}
                  disabled={!formData.sponsorId.trim() || sponsorChecking}
                  className="btn-enhanced hover-bounce hover-glow px-4 py-3 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sponsorChecking ? "Checking..." : "Validate"}
                </button>
              </div>
              {sponsorValid === true && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "rgb(var(--success-rgb))" }}
                >
                  Sponsor ID is valid.
                </p>
              )}
              {sponsorValid === false && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "rgb(var(--danger-rgb))" }}
                >
                  Invalid Sponsorship ID.
                </p>
              )}
              {errors.sponsorId && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "rgb(var(--danger-rgb))" }}
                >
                  {errors.sponsorId}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
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
                  className="w-full px-4 py-3 pr-12 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: "rgba(29, 68, 67, 0.8)",
                    border: "1px solid var(--default-border)",
                    color: "rgb(var(--default-text-color-rgb))",
                    focusRingColor: "var(--primary-color)",
                  }}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "rgb(var(--danger-rgb))" }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
                style={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: "rgba(29, 68, 67, 0.8)",
                    border: "1px solid var(--default-border)",
                    color: "rgb(var(--default-text-color-rgb))",
                    focusRingColor: "var(--primary-color)",
                  }}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  className="mt-1 text-sm"
                  style={{ color: "rgb(var(--danger-rgb))" }}
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-enhanced w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

              <div className="text-center">
                <span className="transition-colors duration-200" style={{color: 'rgba(255, 255, 255, 0.7)'}}>
                  Already have an account?{" "}
                </span>
                <Link
                  href="/login"
                  className="font-medium transition-colors duration-200"
                  style={{color: 'var(--primary-color)'}}
                >
                  Sign in here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
