import { HomePage } from "@/pages/home.page";
import { createContext, useContext, useMemo, useState } from "react";

interface ConfigContextProps {
  isExtension: boolean;
}

const ConfigContext = createContext<ConfigContextProps>({
  isExtension: false,
});

export function ConfigContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isExtension] = useState(() => {
    const path = window.location.href;
    if (
      path.startsWith("chrome-extension://") ||
      path.startsWith("moz-extension://")
    ) {
      return true;
    }

    return false;
  });

  const value = useMemo(() => ({ isExtension }), [isExtension]);

  if (isExtension) {
    return <HomePage />;
  }

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export function useConfigContext() {
  return useContext(ConfigContext);
}
