// hooks/useLoadFonts.js
import * as Font from "expo-font";
import { useEffect, useState } from "react";

export default function useLoadFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFonts() {
      try {
        await Font.loadAsync({
          // 🔹 Roboto
          "Roboto-Regular": require("../assets/fonts/Roboto/Roboto_Condensed-Regular.ttf"),
          "Roboto-Bold": require("../assets/fonts/Roboto/Roboto_Condensed-Bold.ttf"),
          "Roboto-Italic": require("../assets/fonts/Roboto/Roboto_Condensed-Italic.ttf"),
          "Roboto-BoldItalic": require("../assets/fonts/Roboto/Roboto_Condensed-BoldItalic.ttf"),

          // 🔹 Lato
          "Lato-Regular": require("../assets/fonts/Lato/Lato-Regular.ttf"),
          "Lato-Bold": require("../assets/fonts/Lato/Lato-Bold.ttf"),
          "Lato-Italic": require("../assets/fonts/Lato/Lato-Italic.ttf"),
          "Lato-BoldItalic": require("../assets/fonts/Lato/Lato-BoldItalic.ttf"),

          // 🔹 Montserrat
          "Montserrat-Regular": require("../assets/fonts/Montserrat/Montserrat-Regular.ttf"),
          "Montserrat-Bold": require("../assets/fonts/Montserrat/Montserrat-Bold.ttf"),
          "Montserrat-Italic": require("../assets/fonts/Montserrat/Montserrat-Italic.ttf"),
          "Montserrat-BoldItalic": require("../assets/fonts/Montserrat/Montserrat-BoldItalic.ttf"),

          // 🔹 Open Sans
          "OpenSans-Regular": require("../assets/fonts/OpenSans/OpenSans_Condensed-Regular.ttf"),
          "OpenSans-Bold": require("../assets/fonts/OpenSans/OpenSans_Condensed-Bold.ttf"),
          "OpenSans-Italic": require("../assets/fonts/OpenSans/OpenSans_Condensed-Italic.ttf"),
          "OpenSans-BoldItalic": require("../assets/fonts/OpenSans/OpenSans_Condensed-BoldItalic.ttf"),

          // 🔹 Inter
          "Inter-Regular": require("../assets/fonts/Inter/Inter_18pt-Regular.ttf"),
          "Inter-Bold": require("../assets/fonts/Inter/Inter_18pt-Bold.ttf"),
          "Inter-Italic": require("../assets/fonts/Inter/Inter_18pt-Italic.ttf"),
          "Inter-BoldItalic": require("../assets/fonts/Inter/Inter_18pt-BoldItalic.ttf"),

          // 🔹 Poppins
          "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
          "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),
          "Poppins-Italic": require("../assets/fonts/Poppins/Poppins-Italic.ttf"),
          "Poppins-BoldItalic": require("../assets/fonts/Poppins/Poppins-BoldItalic.ttf"),

          // 🔹 Pacifico (chỉ có 1 kiểu)
          "Pacifico-Regular": require("../assets/fonts/Pacifico/Pacifico-Regular.ttf"),
        });

        if (isMounted) setFontsLoaded(true);
      } catch (err) {
        console.warn("❌ Font loading failed:", err);
      }
    }

    loadFonts();
    return () => {
      isMounted = false;
    };
  }, []);

  return fontsLoaded;
}
