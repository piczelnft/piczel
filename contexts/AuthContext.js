"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [authVersion, setAuthVersion] = useState(0); // Force re-renders
  const router = useRouter();

  // Check for existing token on mount and when storage changes
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }

    // Listen for storage changes (useful for multiple tabs)
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user") {
        const newToken = localStorage.getItem("token");
        const newUser = localStorage.getItem("user");

        if (newToken && newUser) {
          setToken(newToken);
          setUser(JSON.parse(newUser));
        } else {
          setUser(null);
          setToken(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(tokenToVerify);
        setAuthVersion((prev) => prev + 1); // Force re-render
      } else {
        // Token is invalid, clear stored data
        logout();
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful, updating state:", data.user);
        setUser(data.user);
        setToken(data.token);
        setAuthVersion((prev) => prev + 1); // Force re-render
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Force immediate state update
        setTimeout(() => {
          setIsLoading(false);
        }, 100);

        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Login error in context:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const signup = async (name, email, mobile, password, sponsorId, note = "") => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, mobile, password, sponsorId, note }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Signup successful, updating state:", data.user);
        setUser(data.user);
        setToken(data.token);
        setAuthVersion((prev) => prev + 1); // Force re-render
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Force immediate state update
        setTimeout(() => {
          setIsLoading(false);
        }, 100);

        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Signup error in context:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthVersion((prev) => prev + 1); // Force re-render
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    authVersion, // Include version for debugging
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/login");
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
