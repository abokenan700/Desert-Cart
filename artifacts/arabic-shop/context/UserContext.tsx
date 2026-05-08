import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarColor: string;
}

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  avatarInitial: string;
}

const STORAGE_KEY = "@al-ostora/user-profile";

const DEFAULT_PROFILE: UserProfile = {
  name: "سارة العمري",
  email: "sara.omari@email.com",
  phone: "0501234567",
  avatarColor: "#E63946",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed: Partial<UserProfile> = JSON.parse(raw);
            setProfile((prev) => ({ ...prev, ...parsed }));
          } catch (e) {
            console.warn("[UserContext] corrupted storage:", e);
          }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch((e) => {
      console.warn("[UserContext] failed to persist:", e);
    });
  }, [profile, hydrated]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const avatarInitial = profile.name.trim().charAt(0) || "م";

  return (
    <UserContext.Provider value={{ profile, updateProfile, avatarInitial }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
