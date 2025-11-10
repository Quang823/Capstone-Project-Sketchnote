const AVAILABLE_FONTS = [
  "Roboto-Regular",
  "Roboto-Bold",
  "Roboto-Italic",
  "Roboto-BoldItalic",
  "Lato-Regular",
  "Lato-Bold",
  "Lato-Italic",
  "Lato-BoldItalic",
  "Montserrat-Regular",
  "Montserrat-Bold",
  "Montserrat-Italic",
  "Montserrat-BoldItalic",
  "OpenSans-Regular",
  "OpenSans-Bold",
  "OpenSans-Italic",
  "OpenSans-BoldItalic",
  "Inter-Regular",
  "Inter-Bold",
  "Inter-Italic",
  "Inter-BoldItalic",
  "Poppins-Regular",
  "Poppins-Bold",
  "Poppins-Italic",
  "Poppins-BoldItalic",
  "Pacifico-Regular",
];

export function getFontVariant(base, bold, italic) {
  const family = base.replace(/-.+$/, "");
  const tryList = [
    bold && italic ? `${family}-BoldItalic` : null,
    bold ? `${family}-Bold` : null,
    italic ? `${family}-Italic` : null,
    `${family}-Regular`,
  ].filter(Boolean);

  for (let f of tryList) {
    if (AVAILABLE_FONTS.includes(f)) return f;
  }
  // fallback
  return "Roboto-Regular";
}
