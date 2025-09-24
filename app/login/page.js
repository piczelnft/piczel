"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white gradient-text-enhanced animate-fadeInUp">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm animate-fadeInUp" style={{color: 'rgba(255, 255, 255, 0.7)', animationDelay: '0.2s'}}>
            Sign in to your PICZEL account
          </p>
        </div>

        <div className="card-enhanced rounded-xl shadow-2xl p-8 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="px-4 py-3 rounded-lg animate-fadeInUp" style={{backgroundColor: 'rgba(255, 74, 74, 0.2)', border: '1px solid rgba(255, 74, 74, 0.3)', color: 'rgb(var(--danger-rgb))'}}>
                {errors.general}
              </div>
            )}

            {message && (
              <div className="px-4 py-3 rounded-lg animate-fadeInUp" style={{backgroundColor: 'rgba(72, 247, 104, 0.2)', border: '1px solid rgba(72, 247, 104, 0.3)', color: 'rgb(var(--success-rgb))'}}>
                {message}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{color: 'rgba(255, 255, 255, 0.8)'}}
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
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)',
                  color: 'rgb(var(--default-text-color-rgb))',
                  focusRingColor: 'var(--primary-color)'
                }}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm" style={{color: 'rgb(var(--danger-rgb))'}}>{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{color: 'rgba(255, 255, 255, 0.8)'}}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: 'rgba(29, 68, 67, 0.8)',
                  border: '1px solid var(--default-border)',
                  color: 'rgb(var(--default-text-color-rgb))',
                  focusRingColor: 'var(--primary-color)'
                }}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm" style={{color: 'rgb(var(--danger-rgb))'}}>{errors.password}</p>
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
                  style={{color: 'rgba(255, 255, 255, 0.7)'}}
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="transition-colors duration-200"
                  style={{color: 'var(--primary-color)'}}
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
              <span className="transition-colors duration-200" style={{color: 'rgba(255, 255, 255, 0.7)'}}>Don&apos;t have an account? </span>
              <Link
                href="/signup"
                className="font-medium transition-colors duration-200"
                style={{color: 'var(--primary-color)'}}
              >
                Create one here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
