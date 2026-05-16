import { createContext, useContext, useEffect, useState } from "react";

interface ApiContextType {
  apiUrl: string;
  setApiUrl: (url: string) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const STORAGE_KEY = "api_url";

export const ApiProvider = ({ children }: { children: React.ReactNode }) => {
  const [apiUrl, setApiUrlState] = useState<string>("https://extended-naval-customized-astrology.trycloudflare.com");

  // ✅ Load from localStorage on startup
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && apiUrl == "") {
      setApiUrlState(saved);
    }
  }, []);

  // ✅ sync to localStorage whenever changes
  const setApiUrl = (url: string) => {
    setApiUrlState(url);
    localStorage.setItem(STORAGE_KEY, url);
  };

  return (
    <ApiContext.Provider value={{ apiUrl, setApiUrl }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used inside ApiProvider");
  return ctx;
};