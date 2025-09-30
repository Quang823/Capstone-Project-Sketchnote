import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

export default function useOrientation() {
  const [orientation, setOrientation] = useState(
    Dimensions.get("window").width > Dimensions.get("window").height
      ? "landscape"
      : "portrait"
  );

  useEffect(() => {
    const onChange = ({ window }) => {
      setOrientation(window.width > window.height ? "landscape" : "portrait");
    };
    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription?.remove();
  }, []);

  return orientation; // "portrait" | "landscape"
}
