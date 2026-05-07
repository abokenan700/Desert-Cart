import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@al_ostora_addresses_v1";

export type SavedAddress = {
  id: string;
  label: string;
  labelIcon: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  postalCode?: string;
  addressDetail?: string;
  isDefault: boolean;
};

type AddressContextValue = {
  addresses: SavedAddress[];
  addAddress: (
    addr: Omit<SavedAddress, "id" | "isDefault">,
    makeDefault?: boolean
  ) => string;
  updateAddress: (
    id: string,
    changes: Partial<Omit<SavedAddress, "id">>
  ) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
};

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: "a1",
    label: "المنزل",
    labelIcon: "home-outline",
    fullName: "سارة العمري",
    phone: "0501234567",
    city: "الرياض",
    district: "العليا",
    postalCode: "12345",
    addressDetail: "",
    isDefault: true,
  },
  {
    id: "a2",
    label: "العمل",
    labelIcon: "business-outline",
    fullName: "سارة العمري",
    phone: "0501234567",
    city: "جدة",
    district: "الروضة",
    postalCode: "21432",
    addressDetail: "",
    isDefault: false,
  },
];

const AddressContext = createContext<AddressContextValue | null>(null);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(DEFAULT_ADDRESSES);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed: SavedAddress[] = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAddresses(parsed);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        hydrated.current = true;
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(addresses)).catch(() => {});
  }, [addresses]);

  const addAddress = useCallback(
    (
      addr: Omit<SavedAddress, "id" | "isDefault">,
      makeDefault = false
    ): string => {
      const id = `addr_${Date.now()}`;
      setAddresses((prev) => {
        const demoted = makeDefault
          ? prev.map((a) => ({ ...a, isDefault: false }))
          : prev;
        const shouldBeDefault = makeDefault || prev.length === 0;
        return [...demoted, { ...addr, id, isDefault: shouldBeDefault }];
      });
      return id;
    },
    []
  );

  const updateAddress = useCallback(
    (id: string, changes: Partial<Omit<SavedAddress, "id">>) => {
      setAddresses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...changes } : a))
      );
    },
    []
  );

  const deleteAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      const wasDefault = prev.find((a) => a.id === id)?.isDefault ?? false;
      if (wasDefault && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return remaining;
    });
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  }, []);

  return (
    <AddressContext.Provider
      value={{ addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses(): AddressContextValue {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddresses must be used within <AddressProvider>");
  return ctx;
}
