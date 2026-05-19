import React, { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { City } from '../data/cities';
import { computeChart, HumanDesignChart } from '../utils/humanDesign';

export interface SavedProfile {
  id: string;
  name: string;
  birthDate: string;     // YYYY-MM-DD
  birthTime: string;     // HH:MM (24h)
  city: City;
  createdAt: string;
  photoUri?: string;     // lokal asset URI (lokal stilize foto)
}

export interface UserStats {
  openedAt: string;
  totalOpens: number;
  streak: number;
  lastOpenDate?: string;
  level: number;
}

const STORAGE_KEYS = {
  PROFILES: '@tasarim_profiles',
  ACTIVE: '@tasarim_active',
  STATS: '@tasarim_stats',
  ONBOARDED: '@tasarim_onboarded',
};

const todayStr = () => new Date().toISOString().split('T')[0];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

interface StoreValue {
  profiles: SavedProfile[];
  activeProfile: SavedProfile | null;
  stats: UserStats;
  chart: HumanDesignChart | null;
  isLoading: boolean;
  isOnboarded: boolean;
  addProfile: (
    name: string, birthDate: string, birthTime: string, city: City, makeActive?: boolean,
  ) => Promise<SavedProfile>;
  selectProfile: (id: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  updateProfilePhoto: (id: string, photoUri: string | null) => Promise<void>;
  setOnboarded: () => Promise<void>;
  getLevelTitle: (level: number) => string;
}

const StoreCtx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    openedAt: new Date().toISOString(),
    totalOpens: 0,
    streak: 0,
    level: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [chart, setChart] = useState<HumanDesignChart | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [pRaw, aRaw, sRaw, oRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PROFILES),
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVE),
          AsyncStorage.getItem(STORAGE_KEYS.STATS),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
        ]);
        const list: SavedProfile[] = pRaw ? JSON.parse(pRaw) : [];
        setProfiles(list);
        setActiveId(aRaw);
        if (sRaw) setStats(JSON.parse(sRaw));
        setIsOnboarded(oRaw === '1');

        if (aRaw) {
          const found = list.find(p => p.id === aRaw);
          if (found) {
            try {
              setChart(computeChart(found.birthDate, found.birthTime, found.city));
            } catch (e) { console.error('chart calc:', e); }
          }
        }

        // bump open
        const today = todayStr();
        const cur = sRaw ? (JSON.parse(sRaw) as UserStats) : {
          openedAt: new Date().toISOString(), totalOpens: 0, streak: 0, level: 1,
        };
        if (cur.lastOpenDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = yesterday.toISOString().split('T')[0];
          cur.streak = cur.lastOpenDate === yStr ? cur.streak + 1 : 1;
          cur.lastOpenDate = today;
          cur.totalOpens += 1;
          cur.level = Math.floor(cur.totalOpens / 7) + 1;
          setStats({ ...cur });
          await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(cur));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setOnboarded = useCallback(async () => {
    setIsOnboarded(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, '1');
  }, []);

  const addProfile = useCallback(async (
    name: string,
    birthDate: string,
    birthTime: string,
    city: City,
    makeActive = true,
  ): Promise<SavedProfile> => {
    const profile: SavedProfile = {
      id: makeId(), name, birthDate, birthTime, city,
      createdAt: new Date().toISOString(),
    };
    setProfiles(prev => {
      const next = [profile, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(next));
      return next;
    });
    if (makeActive) {
      setActiveId(profile.id);
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE, profile.id);
      try {
        setChart(computeChart(birthDate, birthTime, city));
      } catch (e) { console.error('chart calc:', e); }
    }
    setIsOnboarded(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, '1');
    return profile;
  }, []);

  const selectProfile = useCallback(async (pid: string) => {
    const found = profiles.find(p => p.id === pid);
    if (!found) return;
    setActiveId(pid);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE, pid);
    try {
      setChart(computeChart(found.birthDate, found.birthTime, found.city));
    } catch (e) { console.error('chart calc:', e); }
  }, [profiles]);

  const updateProfilePhoto = useCallback(async (pid: string, photoUri: string | null) => {
    setProfiles(prev => {
      const next = prev.map(p =>
        p.id === pid
          ? { ...p, photoUri: photoUri ?? undefined }
          : p
      );
      AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteProfile = useCallback(async (pid: string) => {
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== pid);
      AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(next));
      return next;
    });
    if (activeId === pid) {
      setActiveId(null);
      setChart(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE);
    }
  }, [activeId]);

  const activeProfile: SavedProfile | null =
    profiles.find(p => p.id === activeId) || null;

  const getLevelTitle = useCallback((level: number) => {
    const t = ['Acemi', 'Gözlemci', 'Tanık', 'Çırak', 'Usta', 'Bilge', 'Pir'];
    return t[Math.min(level - 1, t.length - 1)];
  }, []);

  const value: StoreValue = {
    profiles, activeProfile, stats, chart, isLoading, isOnboarded,
    addProfile, selectProfile, deleteProfile, updateProfilePhoto,
    setOnboarded, getLevelTitle,
  };

  return React.createElement(StoreCtx.Provider, { value }, children);
}

export function useTasarimStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) {
    throw new Error('useTasarimStore must be used within <StoreProvider>');
  }
  return ctx;
}
