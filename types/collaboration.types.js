/**
 * =============================================================================
 * COLLABORATIVE SKETCHNOTE - TYPE DEFINITIONS
 * =============================================================================
 * 
 * This file contains all type definitions for the real-time collaboration system.
 * Use JSDoc for type checking and documentation.
 */

// =============================================================================
// ELEMENT TYPES
// =============================================================================

/**
 * @typedef {'stroke' | 'shape' | 'image' | 'text' | 'sticker' | 'table' | 'emoji'} ElementType
 */

/**
 * @typedef {'pen' | 'pencil' | 'brush' | 'marker' | 'highlighter' | 'calligraphy' | 'eraser'} StrokeTool
 */

/**
 * @typedef {'rect' | 'circle' | 'oval' | 'line' | 'arrow' | 'triangle' | 'star' | 'polygon'} ShapeType
 */

/**
 * Base element interface - all canvas elements inherit from this
 * @typedef {Object} BaseElement
 * @property {string} id - Unique identifier (UUID or timestamp-based)
 * @property {ElementType} type - Type of element
 * @property {string} tool - Tool used to create this element
 * @property {string} layerId - Layer this element belongs to
 * @property {number} x - X position (for positioned elements)
 * @property {number} y - Y position (for positioned elements)
 * @property {number} [width] - Width (for images, shapes)
 * @property {number} [height] - Height (for images, shapes)
 * @property {number} [rotation] - Rotation in degrees
 * @property {number} [opacity] - Opacity (0-1)
 * @property {boolean} [locked] - Whether element is locked
 * @property {boolean} [visible] - Whether element is visible
 * @property {string} createdBy - User ID who created this element
 * @property {number} createdAt - Timestamp when created
 * @property {number} updatedAt - Timestamp when last updated
 * @property {number} [version] - Version number for conflict resolution
 */

/**
 * Point in a stroke path
 * @typedef {Object} StrokePoint
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} [pressure] - Pen pressure (0-1)
 * @property {number} [thickness] - Point thickness
 * @property {number} [tiltX] - Pen tilt X
 * @property {number} [tiltY] - Pen tilt Y
 */

/**
 * Free-draw stroke element
 * @typedef {Object} StrokeElement
 * @property {string} id
 * @property {'stroke'} type
 * @property {StrokeTool} tool
 * @property {string} color - Hex color code
 * @property {number} width - Stroke width in pixels
 * @property {StrokePoint[]} points - Array of points forming the path
 * @property {number} [opacity]
 * @property {string} layerId
 * @property {number} [rotation]
 * @property {Object} [pathData] - Pre-computed SVG path data for optimization
 */

/**
 * Shape definition for geometric shapes
 * @typedef {Object} ShapeDefinition
 * @property {ShapeType} shapeType
 * @property {number} [x] - X position (rect)
 * @property {number} [y] - Y position (rect)
 * @property {number} [width] - Width (rect)
 * @property {number} [height] - Height (rect)
 * @property {number} [cx] - Center X (circle/oval)
 * @property {number} [cy] - Center Y (circle/oval)
 * @property {number} [rx] - Radius X (oval) or radius (circle)
 * @property {number} [ry] - Radius Y (oval)
 * @property {number} [x1] - Start X (line/arrow)
 * @property {number} [y1] - Start Y (line/arrow)
 * @property {number} [x2] - End X (line/arrow)
 * @property {number} [y2] - End Y (line/arrow)
 * @property {StrokePoint[]} [points] - Vertices (polygon/star/triangle)
 */

/**
 * Shape element (rectangle, circle, line, arrow, etc.)
 * @typedef {Object} ShapeElement
 * @property {string} id
 * @property {'shape'} type
 * @property {ShapeType} tool - Shape type
 * @property {ShapeDefinition} shape - Shape geometry
 * @property {string} color - Stroke color
 * @property {number} width - Stroke width
 * @property {boolean} [fill] - Whether shape is filled
 * @property {string} [fillColor] - Fill color (if fill is true)
 * @property {number} [opacity]
 * @property {string} layerId
 * @property {number} [rotation]
 */

/**
 * Image element (imported images, photos)
 * @typedef {Object} ImageElement
 * @property {string} id
 * @property {'image'} type
 * @property {'image'} tool
 * @property {string} uri - Image URI (local or remote URL)
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} width - Display width
 * @property {number} height - Display height
 * @property {number} [rotation] - Rotation in degrees
 * @property {number} [opacity]
 * @property {string} layerId
 * @property {number} [originalWidth] - Original image width
 * @property {number} [originalHeight] - Original image height
 * @property {boolean} [flipX] - Horizontal flip
 * @property {boolean} [flipY] - Vertical flip
 */

/**
 * Text element
 * @typedef {Object} TextElement
 * @property {string} id
 * @property {'text'} type
 * @property {'text'} tool
 * @property {string} text - Text content
 * @property {number} x - X position
 * @property {number} y - Y position (baseline)
 * @property {string} color - Text color
 * @property {number} fontSize - Font size in pixels
 * @property {string} [fontFamily] - Font family name
 * @property {boolean} [bold]
 * @property {boolean} [italic]
 * @property {boolean} [underline]
 * @property {'left' | 'center' | 'right'} [align]
 * @property {number} [padding]
 * @property {string} layerId
 * @property {number} [rotation]
 */

/**
 * Sticker element
 * @typedef {Object} StickerElement
 * @property {string} id
 * @property {'sticker'} type
 * @property {'sticker'} tool
 * @property {string} uri - Sticker image URI
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} [rotation]
 * @property {string} layerId
 */

/**
 * Union type for all elements
 * @typedef {StrokeElement | ShapeElement | ImageElement | TextElement | StickerElement} Element
 */

// =============================================================================
// PAGE & DOCUMENT TYPES
// =============================================================================

/**
 * Layer containing elements
 * @typedef {Object} Layer
 * @property {string} id - Layer ID
 * @property {string} name - Display name
 * @property {boolean} visible - Whether layer is visible
 * @property {boolean} [locked] - Whether layer is locked
 * @property {Element[]} elements - Elements in this layer
 * @property {number} [order] - Z-order (higher = on top)
 */

/**
 * Page in a document
 * @typedef {Object} Page
 * @property {string|number} id - Page ID
 * @property {number} pageNumber - Page order (1-indexed)
 * @property {'cover' | 'paper'} type - Page type
 * @property {string} backgroundColor - Background color
 * @property {string} [template] - Paper template (blank, grid, lined, etc.)
 * @property {string} [backgroundImageUrl] - Background image URL
 * @property {Layer[]} layers - Layers on this page
 * @property {number} [width] - Page width (optional override)
 * @property {number} [height] - Page height (optional override)
 * @property {string} [snapshotUrl] - Thumbnail snapshot URL
 * @property {number} updatedAt - Last update timestamp
 */

/**
 * Document (project) containing multiple pages
 * @typedef {Object} Document
 * @property {string|number} projectId - Project ID
 * @property {string} name - Project name
 * @property {string} [description]
 * @property {'portrait' | 'landscape'} orientation
 * @property {string} paperSize - e.g., 'A4', 'Letter'
 * @property {Page[]} pages - Array of pages
 * @property {number} activePageIndex - Currently active page
 * @property {Object.<string, UserPresence>} users - Active users
 * @property {number} version - Document version for sync
 * @property {number} updatedAt - Last update timestamp
 */

// =============================================================================
// WEBSOCKET EVENT TYPES
// =============================================================================

/**
 * @typedef {'ELEMENT_CREATE' | 'ELEMENT_UPDATE' | 'ELEMENT_DELETE' | 'STROKE_APPEND' | 'STROKE_END' | 'PAGE_CREATE' | 'PAGE_UPDATE' | 'PAGE_DELETE' | 'PAGE_SWITCH' | 'USER_JOIN' | 'USER_LEAVE' | 'USER_CURSOR' | 'SYNC_REQUEST' | 'SYNC_RESPONSE' | 'UNDO' | 'REDO'} EventType
 */

/**
 * Base WebSocket message
 * @typedef {Object} BaseMessage
 * @property {EventType} type - Event type
 * @property {string|number} projectId - Project ID
 * @property {string|number} userId - User who sent this message
 * @property {string} [userName] - Display name
 * @property {number} timestamp - Unix timestamp (ms)
 * @property {string} [messageId] - Unique message ID for deduplication
 */

/**
 * Element creation event
 * @typedef {Object} ElementCreateEvent
 * @property {'ELEMENT_CREATE'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} payload
 * @property {string|number} payload.pageId - Target page
 * @property {Element} payload.element - The created element
 */

/**
 * Element update event (for drag, resize, property changes)
 * @typedef {Object} ElementUpdateEvent
 * @property {'ELEMENT_UPDATE'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} payload
 * @property {string|number} payload.pageId
 * @property {string} payload.elementId - ID of element to update
 * @property {Partial<Element>} payload.changes - Changed properties only
 * @property {boolean} [payload.transient] - If true, don't persist (for live drag)
 */

/**
 * Element delete event
 * @typedef {Object} ElementDeleteEvent
 * @property {'ELEMENT_DELETE'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} payload
 * @property {string|number} payload.pageId
 * @property {string} payload.elementId - ID of element to delete
 */

/**
 * Stroke append event (for real-time drawing)
 * Points are appended to an existing or new stroke
 * @typedef {Object} StrokeAppendEvent
 * @property {'STROKE_APPEND'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} payload
 * @property {string|number} payload.pageId
 * @property {string} payload.strokeId - Stroke ID (new or existing)
 * @property {StrokePoint[]} payload.points - Points to append
 * @property {Object} [payload.strokeInit] - Initial stroke properties (if new)
 * @property {string} [payload.strokeInit.tool]
 * @property {string} [payload.strokeInit.color]
 * @property {number} [payload.strokeInit.width]
 * @property {number} [payload.strokeInit.opacity]
 * @property {string} [payload.strokeInit.layerId]
 */

/**
 * Stroke end event (stroke drawing completed)
 * @typedef {Object} StrokeEndEvent
 * @property {'STROKE_END'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} payload
 * @property {string|number} payload.pageId
 * @property {string} payload.strokeId - The completed stroke ID
 */

/**
 * Page creation event
 * @typedef {Object} PageCreateEvent
 * @property {'PAGE_CREATE'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} payload
 * @property {Page} payload.page - The new page
 * @property {number} [payload.insertAt] - Index to insert at (default: end)
 */

/**
 * Page update event (background, template changes)
 * @typedef {Object} PageUpdateEvent
 * @property {'PAGE_UPDATE'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} payload
 * @property {string|number} payload.pageId
 * @property {Partial<Page>} payload.changes
 */

/**
 * Page delete event
 * @typedef {Object} PageDeleteEvent
 * @property {'PAGE_DELETE'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} payload
 * @property {string|number} payload.pageId
 */

/**
 * Page switch event (user switched to different page)
 * @typedef {Object} PageSwitchEvent
 * @property {'PAGE_SWITCH'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} payload
 * @property {string|number} payload.pageId - Page user switched to
 */

/**
 * User presence information
 * @typedef {Object} UserPresence
 * @property {string|number} userId
 * @property {string} userName
 * @property {string} [avatarUrl]
 * @property {string} [color] - User's cursor/highlight color
 * @property {string|number} [currentPageId] - Page user is viewing
 * @property {Object} [cursor] - Current cursor position
 * @property {number} [cursor.x]
 * @property {number} [cursor.y]
 * @property {number} lastSeen - Last activity timestamp
 */

/**
 * User join event
 * @typedef {Object} UserJoinEvent
 * @property {'USER_JOIN'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} payload
 * @property {UserPresence} payload.user
 */

/**
 * Sync request (when user joins, request full state)
 * @typedef {Object} SyncRequestEvent
 * @property {'SYNC_REQUEST'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} [payload]
 * @property {number} [payload.fromVersion] - Request changes since this version
 */

/**
 * Sync response (full document state)
 * @typedef {Object} SyncResponseEvent
 * @property {'SYNC_RESPONSE'} type
 * @property {string|number} projectId
 * @property {string|number} userId
 * @property {number} timestamp
 * @property {Object} payload
 * @property {Document} payload.document - Full document state
 * @property {UserPresence[]} payload.activeUsers - Currently active users
 */

/**
 * Union of all event types
 * @typedef {ElementCreateEvent | ElementUpdateEvent | ElementDeleteEvent | StrokeAppendEvent | StrokeEndEvent | PageCreateEvent | PageUpdateEvent | PageDeleteEvent | PageSwitchEvent | UserJoinEvent | SyncRequestEvent | SyncResponseEvent} CollaborationEvent
 */

// =============================================================================
// COMPRESSED DATA FORMATS (for bandwidth optimization)
// =============================================================================

/**
 * Compressed points format (delta encoding)
 * @typedef {Object} CompressedPoints
 * @property {boolean} compressed - Whether data is compressed
 * @property {number[]} [base] - [baseX, baseY] first point
 * @property {number[]} [deltas] - Flat array [dx1, dy1, dx2, dy2, ...]
 * @property {number[][]} [data] - Uncompressed [[x, y], ...] for short strokes
 */

// =============================================================================
// EXPORTS (for use as module)
// =============================================================================

export const EventTypes = {
  ELEMENT_CREATE: 'ELEMENT_CREATE',
  ELEMENT_UPDATE: 'ELEMENT_UPDATE',
  ELEMENT_DELETE: 'ELEMENT_DELETE',
  STROKE_APPEND: 'STROKE_APPEND',
  STROKE_END: 'STROKE_END',
  PAGE_CREATE: 'PAGE_CREATE',
  PAGE_UPDATE: 'PAGE_UPDATE',
  PAGE_DELETE: 'PAGE_DELETE',
  PAGE_SWITCH: 'PAGE_SWITCH',
  USER_JOIN: 'USER_JOIN',
  USER_LEAVE: 'USER_LEAVE',
  USER_CURSOR: 'USER_CURSOR',
  SYNC_REQUEST: 'SYNC_REQUEST',
  SYNC_RESPONSE: 'SYNC_RESPONSE',
  UNDO: 'UNDO',
  REDO: 'REDO',
};

export const ElementTypes = {
  STROKE: 'stroke',
  SHAPE: 'shape',
  IMAGE: 'image',
  TEXT: 'text',
  STICKER: 'sticker',
  TABLE: 'table',
  EMOJI: 'emoji',
};

export const ShapeTypes = {
  RECT: 'rect',
  SQUARE: 'square',
  CIRCLE: 'circle',
  OVAL: 'oval',
  LINE: 'line',
  ARROW: 'arrow',
  TRIANGLE: 'triangle',
  STAR: 'star',
  POLYGON: 'polygon',
};
