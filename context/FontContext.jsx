// context/FontContext.js
import React, { createContext, useContext } from "react";

const FontContext = createContext({ fontsLoaded: false });

export const FontProvider = ({ fontsLoaded, children }) => (
  <FontContext.Provider value={{ fontsLoaded }}>
    {children}
  </FontContext.Provider>
);

export const useFontContext = () => useContext(FontContext);
