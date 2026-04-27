"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ActivityType = 
  | "approve_booking" 
  | "reject_booking" 
  | "create_booking" 
  | "create_user" 
  | "delete_user" 
  | "update_user" 
  | "login" 
  | "logout"
  | "role_switch";

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  user: string;
  role: string;
  timestamp: Date;
  details?: Record<string, any>;
}

interface ActivityLogContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  clearActivities: () => void;
  getActivities: (limit?: number) => Activity[];
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export function ActivityLogProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  const addActivity = useCallback((activity: Omit<Activity, "id" | "timestamp">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setActivities(prev => [
      { ...activity, id, timestamp: new Date() },
      ...prev
    ].slice(0, 100)); // Keep only last 100 activities
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  const getActivities = useCallback((limit = 50) => {
    return activities.slice(0, limit);
  }, [activities]);

  return (
    <ActivityLogContext.Provider value={{ activities, addActivity, clearActivities, getActivities }}>
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error("useActivityLog must be used within ActivityLogProvider");
  }
  return context;
}
