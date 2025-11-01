// Utility functions for calculating page dimensions based on paper size and orientation

// Paper sizes in millimeters (width x height)
const PAPER_SIZES_MM = {
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  B3: { width: 353, height: 500 },
  B4: { width: 250, height: 353 },
  B5: { width: 176, height: 250 },
  Letter: { width: 216, height: 279 }, // 8.5 x 11 inches converted to mm
};

/**
 * Calculate page dimensions in pixels based on paper size and orientation
 * @param {string} paperSize - Paper size (A3, A4, A5, B3, B4, B5, Letter)
 * @param {string} orientation - 'portrait' or 'landscape'
 * @param {number} screenWidth - Available screen width in pixels
 * @param {number} screenHeight - Available screen height in pixels (optional, for better fit)
 * @param {number} marginH - Horizontal margin in pixels
 * @param {number} marginV - Vertical margin in pixels
 * @returns {Object} { width, height } in pixels
 */
export function calculatePageDimensions(
  paperSize,
  orientation,
  screenWidth,
  screenHeight = null,
  marginH = 24,
  marginV = 20
) {
  const paper = PAPER_SIZES_MM[paperSize] || PAPER_SIZES_MM.A4;

  // Get dimensions in mm based on orientation
  let widthMM = paper.width;
  let heightMM = paper.height;

  if (orientation === "landscape") {
    // Swap width and height for landscape
    [widthMM, heightMM] = [heightMM, widthMM];
  }

  // Calculate aspect ratio
  const aspectRatio = widthMM / heightMM;

  // Calculate available dimensions
  const availableWidth = screenWidth - marginH * 2;
  const availableHeight = screenHeight
    ? screenHeight - marginV * 2 - 100 // reserve space for UI
    : null;

  // Calculate dimensions based on width first
  let pageWidth = availableWidth;
  let pageHeight = pageWidth / aspectRatio;

  // If we have screen height, check if we need to scale based on height instead
  // This is important for landscape mode on tablets
  if (availableHeight && pageHeight > availableHeight) {
    // Scale down to fit height
    pageHeight = availableHeight;
    pageWidth = pageHeight * aspectRatio;

    // But also check if width still fits
    if (pageWidth > availableWidth) {
      pageWidth = availableWidth;
      pageHeight = pageWidth / aspectRatio;
    }
  }

  // Additional safety: ensure dimensions don't exceed reasonable limits
  const maxWidth = screenWidth * 0.95;
  const maxHeight = (screenHeight || screenWidth * 1.5) * 0.9;

  if (pageWidth > maxWidth) {
    pageWidth = maxWidth;
    pageHeight = pageWidth / aspectRatio;
  }

  if (pageHeight > maxHeight) {
    pageHeight = maxHeight;
    pageWidth = pageHeight * aspectRatio;
  }

  return {
    width: Math.round(pageWidth),
    height: Math.round(pageHeight),
  };
}

/**
 * Get paper size dimensions in millimeters
 */
export function getPaperSizeMM(paperSize) {
  return PAPER_SIZES_MM[paperSize] || PAPER_SIZES_MM.A4;
}
