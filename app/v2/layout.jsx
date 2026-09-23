import { ThemeProvider } from "./ThemeProvider";
import { MobileGate } from "./MobileGate";

/**
 * Wraps every /v2/* route in the dark/light ThemeProvider and the
 * phone/tablet-only gate, so login, the landing page, profile, and the
 * scanner all get both without each page wiring them up individually.
 */
export default function V2Layout({ children }) {
  return (
    <ThemeProvider>
      <MobileGate>{children}</MobileGate>
    </ThemeProvider>
  );
}
