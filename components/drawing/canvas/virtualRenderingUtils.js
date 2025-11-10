/**
 * Virtual Rendering Utilities
 * 
 * Optimize canvas rendering by only drawing strokes visible in viewport.
 * Critical for performance when dealing with 500+ strokes per page.
 */

/**
 * Calculate bounding box for a stroke
 * @param {Object} stroke - Stroke object with points or shape
 * @returns {Object} Bounding box {minX, maxX, minY, maxY}
 */
export const getStrokeBounds = (stroke) => {
  if (!stroke) return null;
  
  // Handle different stroke types
  if (stroke.points && Array.isArray(stroke.points) && stroke.points.length > 0) {
    // Path-based strokes (pen, pencil, marker, etc.)
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const point of stroke.points) {
      if (point.x < minX) minX = point.x;
      if (point.x > maxX) maxX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.y > maxY) maxY = point.y;
    }
    
    // Add stroke width padding
    const padding = (stroke.strokeWidth || stroke.width || 2) / 2;
    
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding,
    };
  }
  
  // Handle shape-based strokes
  if (stroke.shape) {
    const { shape } = stroke;
    const padding = (stroke.strokeWidth || 2) / 2;
    
    if (shape.x !== undefined && shape.y !== undefined && shape.w !== undefined && shape.h !== undefined) {
      // Rectangle/square
      return {
        minX: shape.x - padding,
        maxX: shape.x + shape.w + padding,
        minY: shape.y - padding,
        maxY: shape.y + shape.h + padding,
      };
    }
    
    if (shape.cx !== undefined && shape.cy !== undefined && shape.r !== undefined) {
      // Circle
      return {
        minX: shape.cx - shape.r - padding,
        maxX: shape.cx + shape.r + padding,
        minY: shape.cy - shape.r - padding,
        maxY: shape.cy + shape.r + padding,
      };
    }
    
    if (shape.cx !== undefined && shape.cy !== undefined && shape.rx !== undefined && shape.ry !== undefined) {
      // Oval
      return {
        minX: shape.cx - shape.rx - padding,
        maxX: shape.cx + shape.rx + padding,
        minY: shape.cy - shape.ry - padding,
        maxY: shape.cy + shape.ry + padding,
      };
    }
    
    if (shape.points && Array.isArray(shape.points)) {
      // Polygon/star
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      
      for (const point of shape.points) {
        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;
      }
      
      return {
        minX: minX - padding,
        maxX: maxX + padding,
        minY: minY - padding,
        maxY: maxY + padding,
      };
    }
  }
  
  // Handle text strokes
  if (stroke.tool === 'text' || stroke.tool === 'sticky' || stroke.tool === 'comment') {
    const x = stroke.x || 0;
    const y = stroke.y || 0;
    const width = stroke.width || 100;
    const height = stroke.height || (stroke.fontSize || 18) + 10;
    
    return {
      minX: x,
      maxX: x + width,
      minY: y,
      maxY: y + height,
    };
  }
  
  // Handle image/sticker
  if (stroke.tool === 'image' || stroke.tool === 'sticker') {
    const x = stroke.x || 0;
    const y = stroke.y || 0;
    const width = stroke.width || 100;
    const height = stroke.height || 100;
    
    return {
      minX: x,
      maxX: x + width,
      minY: y,
      maxY: y + height,
    };
  }
  
  // Handle table
  if (stroke.tool === 'table') {
    const x = stroke.x || 0;
    const y = stroke.y || 0;
    const width = stroke.width || 200;
    const height = stroke.height || 150;
    
    return {
      minX: x,
      maxX: x + width,
      minY: y,
      maxY: y + height,
    };
  }
  
  return null;
};

/**
 * Check if two bounding boxes intersect
 * @param {Object} bounds1 - First bounding box
 * @param {Object} bounds2 - Second bounding box
 * @returns {boolean} True if boxes intersect
 */
export const boundsIntersect = (bounds1, bounds2) => {
  if (!bounds1 || !bounds2) return false;
  
  return !(
    bounds1.maxX < bounds2.minX ||
    bounds1.minX > bounds2.maxX ||
    bounds1.maxY < bounds2.minY ||
    bounds1.minY > bounds2.maxY
  );
};

/**
 * Get strokes that are visible in the current viewport
 * @param {Array} strokes - Array of stroke objects
 * @param {Object} viewport - Viewport bounds {x, y, width, height}
 * @param {Object} options - Optional config {padding}
 * @returns {Array} Filtered array of visible strokes
 */
export const getVisibleStrokes = (strokes, viewport, options = {}) => {
  if (!Array.isArray(strokes) || strokes.length === 0) {
    return [];
  }
  
  if (!viewport || typeof viewport.width !== 'number' || typeof viewport.height !== 'number') {
    // No valid viewport - return all strokes
    return strokes;
  }
  
  const padding = options.padding || 100; // Extra padding to render off-screen strokes
  
  const viewportBounds = {
    minX: viewport.x - padding,
    maxX: viewport.x + viewport.width + padding,
    minY: viewport.y - padding,
    maxY: viewport.y + viewport.height + padding,
  };
  
  return strokes.filter(stroke => {
    const bounds = getStrokeBounds(stroke);
    return bounds && boundsIntersect(bounds, viewportBounds);
  });
};

/**
 * Batch strokes by similar properties for optimized rendering
 * @param {Array} strokes - Array of stroke objects
 * @returns {Array} Array of batches [{key, strokes}]
 */
export const batchStrokesByType = (strokes) => {
  if (!Array.isArray(strokes) || strokes.length === 0) {
    return [];
  }
  
  const batches = {};
  
  strokes.forEach(stroke => {
    // Create batch key based on stroke properties
    const tool = stroke.tool || 'unknown';
    const color = stroke.color || '#000000';
    const strokeWidth = stroke.strokeWidth || stroke.width || 1;
    
    // Don't batch complex items (text, images, tables)
    if (['text', 'sticky', 'comment', 'image', 'sticker', 'table'].includes(tool)) {
      // Each gets its own batch
      const uniqueKey = `${tool}-${stroke.id}`;
      batches[uniqueKey] = [stroke];
      return;
    }
    
    // Batch simple strokes by type and style
    const key = `${tool}-${color}-${strokeWidth}`;
    if (!batches[key]) {
      batches[key] = [];
    }
    batches[key].push(stroke);
  });
  
  return Object.entries(batches).map(([key, strokes]) => ({
    key,
    strokes,
    count: strokes.length,
  }));
};

/**
 * Calculate optimal viewport based on zoom and scroll position
 * @param {Object} page - Page object {x, y, w, h}
 * @param {Object} zoom - Zoom state {scale, translateX, translateY}
 * @param {number} scrollY - Current scroll position
 * @param {Object} screen - Screen dimensions {width, height}
 * @returns {Object} Viewport {x, y, width, height}
 */
export const calculateViewport = (page, zoom, scrollY, screen) => {
  if (!page || !screen) {
    return { x: 0, y: 0, width: screen?.width || 500, height: screen?.height || 800 };
  }
  
  const scale = zoom?.scale || 1;
  const translateX = zoom?.translateX || 0;
  const translateY = zoom?.translateY || 0;
  
  // Convert screen coordinates to canvas coordinates
  const viewportX = ((-translateX) / scale) + page.x;
  const viewportY = ((scrollY - translateY) / scale) + page.y;
  const viewportWidth = (screen.width || 500) / scale;
  const viewportHeight = (screen.height || 800) / scale;
  
  return {
    x: viewportX,
    y: viewportY,
    width: viewportWidth,
    height: viewportHeight,
  };
};

/**
 * Estimate rendering complexity (0-100 score)
 * @param {Array} strokes - Array of strokes
 * @returns {number} Complexity score
 */
export const estimateRenderingComplexity = (strokes) => {
  if (!Array.isArray(strokes)) return 0;
  
  let complexity = 0;
  
  strokes.forEach(stroke => {
    // Base complexity per stroke
    complexity += 1;
    
    // Add complexity based on point count
    if (stroke.points && Array.isArray(stroke.points)) {
      complexity += stroke.points.length * 0.01;
    }
    
    // Heavy items add more complexity
    if (['image', 'sticker', 'table'].includes(stroke.tool)) {
      complexity += 5;
    }
    
    if (['text', 'sticky', 'comment'].includes(stroke.tool)) {
      complexity += 2;
    }
    
    // Complex tools add complexity
    if (['airbrush', 'calligraphy', 'brush'].includes(stroke.tool)) {
      complexity += 3;
    }
  });
  
  // Normalize to 0-100
  return Math.min(100, complexity / 10);
};

/**
 * Determine if virtual rendering should be enabled
 * @param {number} strokeCount - Total number of strokes
 * @param {number} complexity - Rendering complexity score
 * @returns {boolean} True if should use virtual rendering
 */
export const shouldUseVirtualRendering = (strokeCount, complexity) => {
  // Enable if more than 200 strokes OR high complexity
  return strokeCount > 200 || complexity > 40;
};

export default {
  getStrokeBounds,
  boundsIntersect,
  getVisibleStrokes,
  batchStrokesByType,
  calculateViewport,
  estimateRenderingComplexity,
  shouldUseVirtualRendering,
};
