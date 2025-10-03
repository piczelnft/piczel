'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captcha: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const router = useRouter();

  // Generate random captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

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

    if (!formData.captcha) {
      newErrors.captcha = "Captcha is required";
    } else if (formData.captcha.toLowerCase() !== captchaCode.toLowerCase()) {
      newErrors.captcha = "Captcha code is incorrect";
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
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Admin login successful! Redirecting...");
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
      } else {
        setErrors({ general: data.error || "Invalid admin credentials" });
        generateCaptcha(); // Generate new captcha on failed login
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setErrors({ general: "Network error. Please try again." });
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{background: 'linear-gradient(to bottom right, var(--default-body-bg-color) 0%, var(--theme-bg-gradient) 25%, var(--default-body-bg-color) 100%)', fontFamily: 'var(--default-font-family)'}}>
      {/* Left Half - Admin Security Visualization */}
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
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-700/5 to-indigo-600/5 rounded-full blur-3xl animate-float"></div>
        </div>

        {/* Admin Security Visualization */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white gradient-text-enhanced mb-4 animate-fadeInUp">
              🔐 ADMIN
            </h1>
            <p className="text-xl text-white/80 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              Secure Admin Access Portal
            </p>
          </div>

          {/* Security Features */}
          <div className="w-full max-w-md space-y-6">
            {/* Security Status */}
            <div className="card-enhanced rounded-xl p-6 animate-fadeInUp" style={{animationDelay: '0.4s', backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-white font-semibold">Security Level</div>
                  <div className="text-green-400 text-sm">MAXIMUM</div>
                </div>
                <div className="text-white font-bold text-xl">🛡️</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">SSL Encryption</span>
                  <span className="text-green-400">✓ Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">2FA Protection</span>
                  <span className="text-green-400">✓ Enabled</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Access Logging</span>
                  <span className="text-green-400">✓ Monitored</span>
                </div>
              </div>
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-2 gap-4 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
              <div className="card-enhanced rounded-lg p-4 text-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
                <div className="text-white font-bold text-lg">System Status</div>
                <div className="text-green-400 font-semibold">Online</div>
              </div>
              <div className="card-enhanced rounded-lg p-4 text-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(10px)', borderColor: 'var(--default-border)'}}>
                <div className="text-white font-bold text-lg">Last Access</div>
                <div className="text-blue-400 font-semibold">Secure</div>
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-3 animate-fadeInUp" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center space-x-3 text-white/80">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span>Multi-layer Authentication</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>Real-time Security Monitoring</span>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Encrypted Data Transmission</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Admin Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-white gradient-text-enhanced animate-fadeInUp">
              Admin Access
            </h2>
            <p className="mt-2 text-sm animate-fadeInUp" style={{color: 'rgba(255, 255, 255, 0.7)', animationDelay: '0.2s'}}>
              Enter your admin credentials to continue
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
                  Admin Email
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
                  placeholder="admin@gmail.com"
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
                  Admin Password
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
                  placeholder="Enter admin password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm" style={{color: 'rgb(var(--danger-rgb))'}}>{errors.password}</p>
                )}
              </div>

              {/* Captcha */}
              <div>
                <label
                  htmlFor="captcha"
                  className="block text-sm font-medium mb-2"
                  style={{color: 'rgba(255, 255, 255, 0.8)'}}
                >
                  Security Verification
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      id="captcha"
                      name="captcha"
                      type="text"
                      required
                      value={formData.captcha}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{
                        backgroundColor: 'rgba(29, 68, 67, 0.8)',
                        border: '1px solid var(--default-border)',
                        color: 'rgb(var(--default-text-color-rgb))',
                        focusRingColor: 'var(--primary-color)'
                      }}
                      placeholder="Enter code above"
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div 
                      className="px-4 py-3 rounded-lg font-mono text-lg font-bold text-center select-none"
                      style={{
                        backgroundColor: 'rgba(29, 68, 67, 0.9)',
                        border: '1px solid var(--default-border)',
                        color: '#00ff88',
                        letterSpacing: '2px'
                      }}
                    >
                      {captchaCode}
                    </div>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="text-xs px-2 py-1 rounded transition-colors"
                      style={{color: 'var(--primary-color)', backgroundColor: 'rgba(0, 255, 136, 0.1)'}}
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
                {errors.captcha && (
                  <p className="mt-1 text-sm" style={{color: 'rgb(var(--danger-rgb))'}}>{errors.captcha}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-2">🔐</span>
                      Admin Login
                    </div>
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm transition-colors duration-200"
                  style={{color: 'var(--primary-color)'}}
                >
                  ← Back to User Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
