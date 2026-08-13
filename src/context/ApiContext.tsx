import { createContext, useContext, useEffect, useState } from "react";

interface ApiContextType {
  apiUrl: string;
  setApiUrl: (url: string) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

const STORAGE_KEY = "api_url";

const CURRENT_API =
  "https://next-api-omega-ruby.vercel.app";

export const ApiProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [apiUrl, setApiUrlState] = useState<string>("");

  // Fetch current API URL from Next.js API
  useEffect(() => {
    console.log("useEffect")
    
    const loadApiUrl = async () => {
      const url = `${CURRENT_API}/api/urls?newer=true`;
      console.log(url)
      
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch API URL");
        }

        const data = await response.json();

        const currentUrl = data[0]?.url;
        console.log("durr", currentUrl)

        if (currentUrl) {
          setApiUrlState(currentUrl);
          localStorage.setItem(STORAGE_KEY, currentUrl);
        }
      } catch (error) {
        console.error("Failed to fetch current URL:", error);

        // fallback to localStorage
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
          setApiUrlState(saved);
        }
      }
    };

    loadApiUrl();
  }, []);

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

  if (!ctx) {
    throw new Error("useApi must be used inside ApiProvider");
  }

  return ctx;
};