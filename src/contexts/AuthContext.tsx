"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "Admin" | "Marketing" | "Manager" | "Owner";
  companyId?: string | number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => Promise<void>;
  remainingIdleSeconds: number;
  showIdleWarning: boolean;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [remainingIdleSeconds, setRemainingIdleSeconds] = useState(0);
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  // Timeout refs
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const absoluteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const activityDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Configuration
  const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  const ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
  const WARNING_BEFORE_IDLE = 60 * 1000; // Show warning 1 minute before idle logout
  const LOGIN_TIME_KEY = "loginTime";

  // Check session saat app mount
  useEffect(() => {
    checkSessionOnMount();
  }, []);

  // Update isAuthenticated based on token & user
  useEffect(() => {
    const authenticated = !!(token && user);
    setIsAuthenticated(authenticated);
  }, [token, user]);

  const checkSessionOnMount = async () => {
    console.log("🔐 Checking session on mount...");
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Validate user data
          if (!userData.id || !userData.email) {
            throw new Error("Invalid user data structure");
          }
          
          // Set state FIRST sebelum verify
          setToken(storedToken);
          setUser(userData);
          console.log("✓ Session restored:", userData.email);
        } catch (parseErr) {
          console.error("❌ Error parsing user:", parseErr);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        // Verify token di background dengan timeout (non-blocking)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch("/api/auth/verify", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${storedToken}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!response.ok && response.status === 401) {
            console.warn("⚠️  Token invalid (401), logging out");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          } else if (response.ok) {
            console.log("✓ Token verified successfully");
          }
        } catch (verifyErr) {
          clearTimeout(timeout);
          console.warn("⚠️  Verification timeout, keeping session");
        }
      } else {
        console.log("ℹ️  No stored session");
      }
    } catch (err) {
      console.error("Session check error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSession = async () => {
    await checkSessionOnMount();
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    // Setup timeouts akan trigger via useEffect when isAuthenticated changes
  };

  const loginWithCredentials = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      console.log("🔐 Attempting login to:", `${apiUrl}/api/auth/login`);
      
      const response = await fetch(
        `${apiUrl}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      console.log("📝 Response status:", response.status);
      console.log("📝 Response statusText:", response.statusText);
      
      const contentType = response.headers.get("content-type");
      console.log("📝 Content-Type:", contentType);

      // Check if response is HTML (error page)
      if (contentType?.includes("text/html")) {
        const textResponse = await response.text();
        console.error("❌ Backend returned HTML (error page):", textResponse.substring(0, 200));
        return {
          success: false,
          error: "Backend error - check server logs",
        };
      }

      let data;
      const text = await response.text();
      console.log("📝 Raw response body:", text.substring(0, 500));
      
      if (!text) {
        console.warn("⚠️  Empty response body from backend");
        data = {};
      } else {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("❌ Failed to parse JSON:", e);
          console.log("Response text:", text);
          return {
            success: false,
            error: "Invalid response format from backend",
          };
        }
      }

      console.log("📊 Parsed data:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error("❌ HTTP error:", { status: response.status, data });
        return {
          success: false,
          error: data?.message || data?.error || `Login failed (${response.status})`,
        };
      }

      // Backend mungkin return langsung { token, user } tanpa wrapper
      if (data?.token && data?.user) {
        console.log("✅ Format 1: Direct token + user");
        const user: User = {
          id: data.user.id?.toString() || "",
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as User["role"],
          companyId: data.user.companyId,
        };
        login(data.token, user);
        return { success: true };
      }

      // Atau format { success: true, data: { token, user } }
      if (data?.success && data?.data) {
        console.log("✅ Format 2: Wrapped in success + data");
        const { token, user: userData } = data.data;
        const user: User = {
          id: userData.id?.toString() || "",
          email: userData.email,
          name: userData.name,
          role: userData.role as User["role"],
          companyId: userData.companyId,
        };
        login(token, user);
        return { success: true };
      }

      // Atau format { success: true, token, user }
      if (data?.success && data?.token && data?.user) {
        console.log("✅ Format 3: Direct properties");
        const user: User = {
          id: data.user.id?.toString() || "",
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as User["role"],
          companyId: data.user.companyId,
        };
        login(data.token, user);
        return { success: true };
      }

      console.error("❌ Unknown response format:", {
        keys: Object.keys(data || {}),
        data,
      });

      return {
        success: false,
        error: "Backend returned unexpected format",
      };
    } catch (error: any) {
      console.error("❌ Error:", error?.message);
      return {
        success: false,
        error: error?.message || "Network error",
      };
    }
  };

  const logout = () => {
    cleanupTimeouts();
    setToken(null);
    setUser(null);
    setShowIdleWarning(false);
    setRemainingIdleSeconds(0);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem(LOGIN_TIME_KEY);
  };

  const resetIdleTimer = () => {
    const now = Date.now();
    lastActivityRef.current = now;
    
    // Clear existing timers
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // Hide warning jika ada
    setShowIdleWarning(false);
    setRemainingIdleSeconds(0);

    // Set warning timer (trigger 1 minute before timeout)
    warningTimeoutRef.current = setTimeout(() => {
      console.log("⚠️  Idle warning triggered - starting countdown");
      setShowIdleWarning(true);
      
      // Start countdown
      setRemainingIdleSeconds(Math.ceil(WARNING_BEFORE_IDLE / 1000));
      countdownIntervalRef.current = setInterval(() => {
        setRemainingIdleSeconds((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, IDLE_TIMEOUT - WARNING_BEFORE_IDLE);

    // Set logout timer
    idleTimeoutRef.current = setTimeout(() => {
      console.log("⏱️  Idle timeout reached - auto logout triggered");
      logout();
    }, IDLE_TIMEOUT);
  };

  const setupTimeouts = () => {
    // Reset idle timer
    resetIdleTimer();

    // Check login time
    let loginTime = localStorage.getItem(LOGIN_TIME_KEY);
    if (!loginTime) {
      const now = Date.now();
      localStorage.setItem(LOGIN_TIME_KEY, now.toString());
      loginTime = now.toString();
    }

    // Setup absolute timeout
    if (absoluteTimeoutRef.current) {
      clearTimeout(absoluteTimeoutRef.current);
    }

    const loginTimestamp = parseInt(loginTime, 10);
    const timeElapsed = Date.now() - loginTimestamp;
    const remainingTime = Math.max(0, ABSOLUTE_TIMEOUT - timeElapsed);

    if (remainingTime > 0) {
      absoluteTimeoutRef.current = setTimeout(() => {
        console.log("⏰ Session timeout reached, logging out");
        logout();
      }, remainingTime);
    }
  };

  const cleanupTimeouts = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (absoluteTimeoutRef.current) clearTimeout(absoluteTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (activityDebounceRef.current) clearTimeout(activityDebounceRef.current);
  };

  const extendSession = () => {
    console.log("🔄 Session extended by user");
    setShowIdleWarning(false);
    setRemainingIdleSeconds(0);
    resetIdleTimer();
  };

  // Setup activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Debounced activity handler - prevent too frequent resets
    const handleActivity = () => {
      // Clear existing debounce timer
      if (activityDebounceRef.current) {
        clearTimeout(activityDebounceRef.current);
      }

      // Debounce: only process activity once per second
      activityDebounceRef.current = setTimeout(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;

        // Only reset if more than 1 second has passed since last activity
        if (timeSinceLastActivity > 1000) {
          console.log("🔐 User activity detected - resetting idle timer");
          resetIdleTimer();
        }
      }, 100);
    };

    // Listen untuk user activity - only meaningful interactions
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    
    // Scroll dengan delay check to avoid passive scroll triggers
    let lastScrollTime = Date.now();
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime > 2000) {
        lastScrollTime = now;
        handleActivity();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (activityDebounceRef.current) {
        clearTimeout(activityDebounceRef.current);
      }
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isAuthenticated]);

  // Setup timeouts when authenticated
  useEffect(() => {
    if (isAuthenticated && token && user) {
      setupTimeouts();
    } else {
      cleanupTimeouts();
      localStorage.removeItem(LOGIN_TIME_KEY);
    }

    return () => {
      // Don't cleanup on unmount if still authenticated
      // (session continues across page navigation)
    };
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    loginWithCredentials,
    logout,
    checkSession,
    remainingIdleSeconds,
    showIdleWarning,
    extendSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
