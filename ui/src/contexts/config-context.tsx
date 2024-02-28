// import { HomePage } from "@/pages/home.page";
import { createContext, useContext } from "react";

interface ConfigContextProps {
  isExtension: boolean;
}

const ConfigContext = createContext<ConfigContextProps>({
  isExtension: false,
});

export function ConfigContextProvider({
  children,
  isExtension,
}: {
  children: React.ReactNode;
  isExtension: boolean;
}) {
  return (
    <ConfigContext.Provider value={{ isExtension }}>
      {children}
    </ConfigContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfigContext() {
  return useContext(ConfigContext);
}
