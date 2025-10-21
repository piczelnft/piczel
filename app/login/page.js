"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRedirectIfAuthenticated } from "../../lib/auth-utils";

// Login Form Component that uses useSearchParams
function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [prefilledInfo, setPrefilledInfo] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { isAuthenticated, isLoading: authLoading } =
    useRedirectIfAuthenticated();

  // Handle prefilled information from admin-created login link
  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const name = searchParams.get("name");

    if (token && email && name) {
      setPrefilledInfo({
        email: decodeURIComponent(email),
        name: decodeURIComponent(name),
        token,
      });
      setFormData((prev) => ({
        ...prev,
        email: decodeURIComponent(email),
      }));
      setMessage(
        `Welcome ${decodeURIComponent(
          name
        )}! Your account has been created. Please enter your password to continue.`
      );
    }
  }, [searchParams]);

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  // Lightweight wallet connect (no backend save required before auth)
  const connectWallet = async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        alert("Please install MetaMask to continue.");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
      }
    } catch (e) {
      console.error("Wallet connect error:", e);
      setWalletConnected(false);
      setWalletAddress("");
      alert(e?.message || "Failed to connect wallet.");
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
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setErrors({ general: result.error || "Something went wrong" });
      }
    } catch (error) {
      console.error("Login error:", error);
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

  // Don't render login form if already authenticated (will redirect to dashboard)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)",
        fontFamily: "var(--default-font-family)",
      }}
    >
      {/* Left Half - Trading Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating particles */}
          <div className="particle" style={{ top: "10%", left: "10%" }}></div>
          <div className="particle" style={{ top: "20%", left: "80%" }}></div>
          <div className="particle" style={{ top: "60%", left: "20%" }}></div>
          <div className="particle" style={{ top: "80%", left: "70%" }}></div>
          <div className="particle" style={{ top: "40%", left: "90%" }}></div>

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
            <p
              className="text-xl text-white/80 animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              Professional Crypto Trading Platform
            </p>
          </div>

          {/* Animated Trading Charts */}
          <div className="w-full max-w-md space-y-6">
            {/* Price Chart Animation */}
            <div
              className="card-enhanced rounded-xl p-6 animate-fadeInUp"
              style={{
                animationDelay: "0.4s",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(10px)",
                borderColor: "var(--default-border)",
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-white font-semibold">BTC/USD</div>
                  <div className="text-green-400 text-sm">+2.45%</div>
                </div>
                <div className="text-white font-bold text-xl">$67,234.56</div>
              </div>
              <div className="relative h-24">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 200 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,70 L20,50 L40,80 L60,30 L80,90 L100,40 L120,85 L140,20 L160,70 L180,45 L200,65"
                    stroke="url(#tradingGradient)"
                    strokeWidth="3"
                    fill="none"
                    className="animate-zigzag"
                  />
                  <defs>
                    <linearGradient
                      id="tradingGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="rgb(34, 197, 94)" />
                      <stop offset="50%" stopColor="rgb(59, 130, 246)" />
                      <stop offset="100%" stopColor="rgb(34, 197, 94)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Live Trading Stats */}
            <div
              className="grid grid-cols-2 gap-4 animate-fadeInUp"
              style={{ animationDelay: "0.6s" }}
            >
              <div
                className="card-enhanced rounded-lg p-4 text-center"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderColor: "var(--default-border)",
                }}
              >
                <div className="text-white font-bold text-lg">24h Volume</div>
                <div className="text-green-400 font-semibold">$2.4B</div>
              </div>
              <div
                className="card-enhanced rounded-lg p-4 text-center"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderColor: "var(--default-border)",
                }}
              >
                <div className="text-white font-bold text-lg">Active Users</div>
                <div className="text-blue-400 font-semibold">125K+</div>
              </div>
            </div>

            {/* Trading Features */}
            <div
              className="space-y-3 animate-fadeInUp"
              style={{ animationDelay: "0.8s" }}
            >
              <div className="flex items-center space-x-3 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Real-time Market Data</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Advanced Trading Tools</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Secure & Fast Execution</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-white gradient-text-enhanced animate-fadeInUp">
              {prefilledInfo
                ? `Welcome ${prefilledInfo.name}!`
                : "Welcome Back"}
            </h2>
            <p
              className="mt-2 text-sm animate-fadeInUp"
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                animationDelay: "0.2s",
              }}
            >
              {prefilledInfo
                ? "Your account has been created by an admin"
                : "Sign in to your PICZEL account"}
            </p>
            {prefilledInfo && (
              <div className="mt-3 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  ✨ Your account is ready! Just enter your password below.
                </p>
              </div>
            )}
          </div>

          <div
            className="card-enhanced rounded-xl shadow-2xl p-8 animate-fadeInUp"
            style={{ animationDelay: "0.4s" }}
          >
            {/* Wallet Connect Optional */}
            <div className="mb-6">
              {!walletConnected ? (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="w-full flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium text-white transition-all duration-200 hover-lift-enhanced"
                  style={{ backgroundColor: "rgba(29, 68, 67, 0.8)", border: "1px solid var(--default-border)" }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Connect Wallet (optional)   
                </button>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(0,0,0,0.1)", border: "1px solid var(--default-border)" }}>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                    Wallet connected
                  </div>
                  <div className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                Wallet connection is optional. You can sign in without connecting a wallet.
              </p>
            </div>

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
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
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
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "rgb(var(--danger-rgb))" }}
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded bg-white/10"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm"
                    style={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="transition-colors duration-200"
                    style={{ color: "var(--primary-color)" }}
                  >
                    Forgot your password?
                  </Link>
                </div>
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
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>

              <div className="text-center">
                <span
                  className="transition-colors duration-200"
                  style={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Don&apos;t have an account?{" "}
                </span>
                <Link
                  href="/signup"
                  className="font-medium transition-colors duration-200"
                  style={{ color: "var(--primary-color)" }}
                >
                  Create one here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Login Page Component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
