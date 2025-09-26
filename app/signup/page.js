"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    sponsorId: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sponsorValid, setSponsorValid] = useState(null);
  const [sponsorChecking, setSponsorChecking] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

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

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)",
        fontFamily: "var(--default-font-family)",
      }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white gradient-text-enhanced animate-fadeInUp">
            Create Your Account
          </h2>
          <p
            className="mt-2 text-sm animate-fadeInUp"
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              animationDelay: "0.2s",
            }}
          >
            Join PICZEL and start your crypto journey
          </p>
        </div>

        <div
          className="card-enhanced rounded-xl shadow-2xl p-8 animate-fadeInUp"
          style={{ animationDelay: "0.4s" }}
        >
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
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: "rgba(29, 68, 67, 0.8)",
                  border: "1px solid var(--default-border)",
                  color: "rgb(var(--default-text-color-rgb))",
                  focusRingColor: "var(--primary-color)",
                }}
                placeholder="Create a password"
              />
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
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: "rgba(29, 68, 67, 0.8)",
                  border: "1px solid var(--default-border)",
                  color: "rgb(var(--default-text-color-rgb))",
                  focusRingColor: "var(--primary-color)",
                }}
                placeholder="Confirm your password"
              />
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
              <span
                className="transition-colors duration-200"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="font-medium transition-colors duration-200"
                style={{ color: "var(--primary-color)" }}
              >
                Sign in here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
