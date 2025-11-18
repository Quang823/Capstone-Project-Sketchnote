import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  memo,
} from "react";
import { useFont } from "@shopify/react-native-skia";
import { View, Text, TouchableOpacity, Dimensions, Alert } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useDerivedValue,
  useAnimatedReaction,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import CanvasContainer from "./CanvasContainer";
import CustomScrollbar from "./CustomScrollbar";
import DocumentSidebar from "../document/DocumentSidebar";
import DocumentOverviewModal from "../document/DocumentOverviewModal";
import { projectService } from "../../../service/projectService";
import { calculatePageDimensions } from "../../../utils/pageDimensions";
import Icon from "react-native-vector-icons/MaterialIcons";
import RobotoRegular from "../../../assets/fonts/Roboto/Roboto_Condensed-Regular.ttf";
import RobotoBold from "../../../assets/fonts/Roboto/Roboto_Condensed-Bold.ttf";
import RobotoItalic from "../../../assets/fonts/Roboto/Roboto_Condensed-Italic.ttf";
import RobotoBoldItalic from "../../../assets/fonts/Roboto/Roboto_Condensed-BoldItalic.ttf";
import LatoRegular from "../../../assets/fonts/Lato/Lato-Regular.ttf";
import LatoBold from "../../../assets/fonts/Lato/Lato-Bold.ttf";
import LatoItalic from "../../../assets/fonts/Lato/Lato-Italic.ttf";
import LatoBoldItalic from "../../../assets/fonts/Lato/Lato-BoldItalic.ttf";
import MontserratRegular from "../../../assets/fonts/Montserrat/Montserrat-Regular.ttf";
import MontserratBold from "../../../assets/fonts/Montserrat/Montserrat-Bold.ttf";
import MontserratItalic from "../../../assets/fonts/Montserrat/Montserrat-Italic.ttf";
import MontserratBoldItalic from "../../../assets/fonts/Montserrat/Montserrat-BoldItalic.ttf";
import OpenSansCondensedRegular from "../../../assets/fonts/OpenSans/OpenSans_Condensed-Regular.ttf";
import OpenSansCondensedBold from "../../../assets/fonts/OpenSans/OpenSans_Condensed-Bold.ttf";
import OpenSansCondensedItalic from "../../../assets/fonts/OpenSans/OpenSans_Condensed-Italic.ttf";
import OpenSansCondensedBoldItalic from "../../../assets/fonts/OpenSans/OpenSans_Condensed-BoldItalic.ttf";
import InterRegular from "../../../assets/fonts/Inter/Inter_18pt-Regular.ttf";
import InterBold from "../../../assets/fonts/Inter/Inter_18pt-Bold.ttf";
import InterItalic from "../../../assets/fonts/Inter/Inter_18pt-Italic.ttf";
import InterBoldItalic from "../../../assets/fonts/Inter/Inter_18pt-BoldItalic.ttf";
import PoppinsRegular from "../../../assets/fonts/Poppins/Poppins-Regular.ttf";
import PoppinsBold from "../../../assets/fonts/Poppins/Poppins-Bold.ttf";
import PoppinsItalic from "../../../assets/fonts/Poppins/Poppins-Italic.ttf";
import PoppinsBoldItalic from "../../../assets/fonts/Poppins/Poppins-BoldItalic.ttf";
import PacificoRegular from "../../../assets/fonts/Pacifico/Pacifico-Regular.ttf";
import NotoColorEmojiRegular from "../../../assets/fonts/NotoColorEmoji/NotoColorEmoji-Regular.ttf";

const FONT_MAP = {
  Roboto: {
    Regular: RobotoRegular,
    Bold: RobotoBold,
    Italic: RobotoItalic,
    BoldItalic: RobotoBoldItalic,
  },
  Lato: {
    Regular: LatoRegular,
    Bold: LatoBold,
    Italic: LatoItalic,
    BoldItalic: LatoBoldItalic,
  },
  Montserrat: {
    Regular: MontserratRegular,
    Bold: MontserratBold,
    Italic: MontserratItalic,
    BoldItalic: MontserratBoldItalic,
  },
  OpenSans: {
    Regular: OpenSansCondensedRegular,
    Bold: OpenSansCondensedBold,
    Italic: OpenSansCondensedItalic,
    BoldItalic: OpenSansCondensedBoldItalic,
  },
  Inter: {
    Regular: InterRegular,
    Bold: InterBold,
    Italic: InterItalic,
    BoldItalic: InterBoldItalic,
  },
  Poppins: {
    Regular: PoppinsRegular,
    Bold: PoppinsBold,
    Italic: PoppinsItalic,
    BoldItalic: PoppinsBoldItalic,
  },
  Pacifico: {
    Regular: PacificoRegular,
  },
  NotoColorEmoji: {
    Regular: NotoColorEmojiRegular,
  },
};

const FONT_SIZES = [12, 18, 24];

function usePreloadedFonts() {
  const loaded = {};
  for (const family in FONT_MAP) {
    loaded[family] = {};
    for (const styleKey of Object.keys(FONT_MAP[family])) {
      loaded[family][styleKey] = {};
      for (const sz of FONT_SIZES) {
        loaded[family][styleKey][sz] = useFont(FONT_MAP[family][styleKey], sz);
      }
    }
  }
  return loaded;
}

function getNearestFont(loadedFonts, family, bold, italic, size = 18) {
  const baseFamily = (family || "Roboto").replace(
    /(-Regular|-Bold|-Italic|-BoldItalic)+$/g,
    ""
  );

  const fontSet = loadedFonts[baseFamily] || loadedFonts["Roboto"];
  const style =
    bold && italic
      ? "BoldItalic"
      : bold
      ? "Bold"
      : italic
      ? "Italic"
      : "Regular";

  const nearest = FONT_SIZES.reduce((a, b) =>
    Math.abs(b - size) < Math.abs(a - size) ? b : a
  );

  return {
    font:
      fontSet?.[style]?.[nearest] ||
      fontSet?.["Regular"]?.[nearest] ||
      loadedFonts["Roboto"]["Regular"][18] ||
      null,
    nearest,
  };
}

const MultiPageCanvas = forwardRef(function MultiPageCanvas(
  {
    noteConfig, // Add noteConfig to props
    tool,
    color,
    setColor,
    setTool,
    strokeWidth,
    pencilWidth,
    eraserSize,
    brushWidth,
    brushOpacity,
    calligraphyWidth,
    calligraphyOpacity,
    paperStyle,
    shapeType,
    onRequestTextInput,
    registerPageRef,
    onActivePageChange,
    toolConfigs,
    pressure,
    thickness,
    stabilization,
    eraserMode,
    pageLayers, // 👈 Changed from layers to pageLayers
    activeLayerId,
    setPageLayers, // 👈 Changed from setLayers to setPageLayers
    rulerPosition,
    onColorPicked,
  },
  ref
) {
  const loadedFonts = usePreloadedFonts();

  // ✨ FIX: Add cleanup effect to dispose of all SkFont objects on unmount
  useEffect(() => {
    return () => {
      if (loadedFonts) {
        for (const family in loadedFonts) {
          for (const styleKey in loadedFonts[family]) {
            for (const sz in loadedFonts[family][styleKey]) {
              const font = loadedFonts[family][styleKey][sz];
              if (font && typeof font.dispose === "function") {
                font.dispose();
              }
            }
          }
        }
      }
    };
  }, [loadedFonts]);

  const drawingDataRef = useRef({ pages: {} });

  // Sidebar state
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [overviewVisible, setOverviewVisible] = useState(false);

  // Initialize pages based on noteConfig
  const initialPages = useMemo(() => {
    if (!noteConfig) return [{ id: 1 }];

    const pages = [];
    const paperTemplate = noteConfig.paper?.template || "blank";
    const paperBg = noteConfig.paper?.color || "#FFFFFF";

    // Check if first page from API is a cover page (pageNumber === 1)
    const firstPageFromAPI =
      Array.isArray(noteConfig.pages) && noteConfig.pages.length > 0
        ? noteConfig.pages[0]
        : null;
    const isFirstPageCover = firstPageFromAPI?.pageNumber === 1;

    // Add cover page if enabled
    if (noteConfig.hasCover && noteConfig.cover && !isFirstPageCover) {
      pages.push({
        id: 1,
        type: "cover",
        backgroundColor: noteConfig.cover.color,
        template: noteConfig.cover.template,
        imageUrl: noteConfig.cover.imageUrl,
        snapshotUrl: null,
      });
    }

    // Add pages based on noteConfig.pages if provided
    if (Array.isArray(noteConfig.pages) && noteConfig.pages.length > 0) {
      noteConfig.pages.forEach((p, index) => {
        if (index === 0 && p.pageNumber === 1) {
          pages.push({
            id: 1,
            type: "cover",
            backgroundColor: noteConfig.cover?.color || paperBg,
            template: noteConfig.cover?.template || paperTemplate,
            imageUrl: noteConfig.cover?.imageUrl,
            pageNumber: p.pageNumber,
            strokeUrl: p.strokeUrl,
            snapshotUrl: p.snapshotUrl || null,
          });
        } else {
          const id = p.pageId ? Number(p.pageId) : Number(p.pageNumber) + 10000;
          pages.push({
            id,
            type: "paper",
            backgroundColor: paperBg,
            template: paperTemplate,
            pageNumber: p.pageNumber,
            strokeUrl: p.strokeUrl,
            snapshotUrl: p.snapshotUrl || null,
          });
        }
      });
    } else {
      pages.push({
        id: pages.length + 1,
        type: "paper",
        backgroundColor: paperBg,
        template: paperTemplate,
        snapshotUrl: null,
      });
    }

    return pages;
  }, [noteConfig]);

  const [pages, setPages] = useState(initialPages);
  const snapshotSignaturesRef = useRef({});

  // Initialize layers for initial pages
  // IMPORTANT: Only run once when component mounts, NOT when setPageLayers changes
  useEffect(() => {
    if (initialPages.length > 0 && setPageLayers) {
      const initialLayers = {};
      initialPages.forEach((page) => {
        initialLayers[page.id] = [
          { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
        ];
      });
      setPageLayers((prev) => ({ ...prev, ...initialLayers }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPages]); // Only depend on initialPages, NOT setPageLayers
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageLayouts, setPageLayouts] = useState({});
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isZooming, setIsZooming] = useState(false); // Track zoom state to disable scroll
  const [zoomPercent, setZoomPercent] = useState(100);
  const [zoomLocked, setZoomLocked] = useState(false);
  const [showZoomOverlay, setShowZoomOverlay] = useState(false);

  // State for single selection across all pages
  const [selectedId, setSelectedId] = useState(null);
  const [selectionPageId, setSelectionPageId] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);

  // Callback for GestureHandler to update selection state
  const handleSelectionChange = useCallback(
    (pageId, strokeId, box) => {
      if (strokeId) {
        setSelectedId(strokeId);
        setSelectionPageId(pageId);
        setSelectedBox(box);
      } else if (selectedId && selectionPageId === pageId) {
        // Deselect if the change comes from the page with the active selection
        setSelectedId(null);
        setSelectionPageId(null);
        setSelectedBox(null);
      }
    },
    [selectedId, selectionPageId]
  );

  useEffect(() => {
    if (tool === "scroll" || tool === "zoom") {
      projectScale.value = withTiming(1, { duration: 200 });
      projectTranslateX.value = withTiming(0, { duration: 200 });
      projectTranslateY.value = withTiming(0, { duration: 200 });
      setIsZooming(false);
      setShowZoomOverlay(false);
    }
  }, [tool]);

  // Zoom/Pan state - áp dụng cho toàn bộ project
  const projectScale = useSharedValue(1);
  const baseProjectScale = useSharedValue(1);
  const projectTranslateX = useSharedValue(0);
  const projectTranslateY = useSharedValue(0);
  const baseProjectTranslateX = useSharedValue(0);
  const baseProjectTranslateY = useSharedValue(0);
  const lastZoomState = useRef(false);

  const scrollRef = useRef(null);
  const lastAddedRef = useRef(null);
  const pageRefs = useRef({});

  // --- Reanimated scroll shared value + refs ---
  const scrollNativeRef = useRef(null); // native gesture handler ref
  const scrollYShared = useSharedValue(0);

  // last-handled in JS to throttle tiny updates
  const lastHandledScrollRef = useRef(0);
  const zoomOverlayTimeoutRef = useRef(null);
  const scrollRafRef = useRef(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  // Track unmount state + scheduled timeouts to avoid running callbacks after unmount
  const isUnmountedRef = useRef(false);
  const loadTimeoutsRef = useRef(new Set());

  const scheduleSafeTimeout = useCallback((callback, delay = 0) => {
    if (isUnmountedRef.current || typeof callback !== "function") return null;
    const id = setTimeout(() => {
      loadTimeoutsRef.current.delete(id);
      if (isUnmountedRef.current) return;
      try {
        callback();
      } catch (error) {
        console.error("[MultiPageCanvas] Timeout callback error:", error);
      }
    }, delay);
    loadTimeoutsRef.current.add(id);
    return id;
  }, []);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      loadTimeoutsRef.current.forEach((id) => clearTimeout(id));
      loadTimeoutsRef.current.clear();
      if (zoomOverlayTimeoutRef.current) {
        clearTimeout(zoomOverlayTimeoutRef.current);
      }
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  // Auto-hide zoom overlay sau 2 giây sau khi buông tay
  useEffect(() => {
    if (showZoomOverlay) {
      // Clear previous timeout
      if (zoomOverlayTimeoutRef.current) {
        clearTimeout(zoomOverlayTimeoutRef.current);
      }
      // Set new timeout
      zoomOverlayTimeoutRef.current = setTimeout(() => {
        setShowZoomOverlay(false);
      }, 2000); // 2 giây sau khi buông tay
    }
    return () => {
      if (zoomOverlayTimeoutRef.current) {
        clearTimeout(zoomOverlayTimeoutRef.current);
      }
    };
  }, [showZoomOverlay]);

  // Animated scroll handler (runs on UI thread)
  const onScrollAnimated = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollYShared.value = event.contentOffset.y;
    },
  });

  const { height, width } = Dimensions.get("window");
  const PAGE_SPACING = 12;
  const fallbackHeight = Math.round(height * 0.9);

  // Calculate page dimensions from noteConfig
  const pageDimensions = useMemo(() => {
    if (!noteConfig) {
      return { width: null, height: null };
    }
    return calculatePageDimensions(
      noteConfig.paperSize || "A4",
      noteConfig.orientation || "portrait",
      width,
      height, // Pass screen height for better fitting
      24, // marginH
      20 // marginV
    );
  }, [noteConfig, width, height]);

  // 🧮 Tính offset cho từng page
  const offsets = useMemo(() => {
    let acc = 0;
    return pages.map((p) => {
      const off = acc;
      const h = pageLayouts[p.id] ?? fallbackHeight;
      acc += h + PAGE_SPACING;
      return off;
    });
  }, [pages, pageLayouts, fallbackHeight]);

  // 📏 Tính contentHeight và update khi pages thay đổi
  useEffect(() => {
    if (pages.length === 0) {
      setContentHeight(0);
      return;
    }
    const lastPageIndex = pages.length - 1;
    const lastPageOffset = offsets[lastPageIndex] ?? 0;
    const lastPageHeight =
      pageLayouts[pages[lastPageIndex]?.id] ?? fallbackHeight;
    const totalHeight = lastPageOffset + lastPageHeight + PAGE_SPACING;
    setContentHeight(totalHeight);
  }, [pages, offsets, pageLayouts, fallbackHeight]);

  // 📐 Cập nhật containerHeight khi ScrollView layout thay đổi
  useEffect(() => {
    if (scrollRef.current) {
      // Get the height of the scroll view container
      // This is a rough estimate - we'll update it on layout
      setContainerHeight(height - 200); // Estimate: screen height - toolbars
    }
  }, [height]);

  // ➕ Thêm page mới
  const addPage = useCallback(() => {
    if (pages.length >= 10) {
      Alert.alert("Limit", "You can only create up to 10 pages.");
      return;
    }
    const newId = Date.now();
    lastAddedRef.current = newId;

    // Copy template config from first paper page (not cover)
    const firstPaperPage = pages.find((p) => p.type === "paper") || pages[0];
    const newPage = {
      id: newId,
      type: "paper",
      backgroundColor:
        firstPaperPage?.backgroundColor ||
        noteConfig?.paper?.color ||
        "#FFFFFF",
      template:
        firstPaperPage?.template || noteConfig?.paper?.template || "blank",
    };

    // Initialize layers for new page
    setPageLayers?.((prev) => ({
      ...prev,
      [newId]: [{ id: "layer1", name: "Layer 1", visible: true, strokes: [] }],
    }));

    setPages((prev) => [...prev, newPage]);
    onActivePageChange?.(newId);
  }, [pages, onActivePageChange, noteConfig, setPageLayers]);

  // ✅ Lock để tránh race condition khi scroll programmatically
  const isScrollingProgrammaticallyRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // 🧭 Scroll tới page với debounce và lock
  const scrollToPage = useCallback(
    (index) => {
      // ✅ Validate index
      if (index < 0 || index >= pages.length) {
        console.warn(
          `[MultiPageCanvas] scrollToPage: Invalid index ${index}, pages.length=${pages.length}`
        );
        return;
      }

      // ✅ Check if component is mounted and scrollRef is available
      if (isUnmountedRef.current || !scrollRef.current) {
        console.warn(
          `[MultiPageCanvas] scrollToPage: Component unmounted or scrollRef not available`
        );
        return;
      }

      // ✅ Validate page exists
      const targetPage = pages[index];
      if (!targetPage || targetPage.id == null) {
        console.warn(
          `[MultiPageCanvas] scrollToPage: Page at index ${index} is invalid`,
          targetPage
        );
        return;
      }

      // ✅ Clear timeout trước đó nếu có
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }

      // ✅ Lock scroll để tránh conflict với handleScrollFromUI
      isScrollingProgrammaticallyRef.current = true;

      try {
        const y = offsets[index] ?? 0;

        // ✅ Double check scrollRef before using
        if (!scrollRef.current) {
          console.warn(`[MultiPageCanvas] scrollToPage: scrollRef became null`);
          isScrollingProgrammaticallyRef.current = false;
          return;
        }

        scrollRef.current.scrollTo({ y, animated: true });

        // ✅ Safe state updates
        if (!isUnmountedRef.current) {
          setActiveIndex(index);
          onActivePageChange?.(targetPage.id);
        }

        // ✅ Unlock sau khi scroll xong (đợi animation hoàn thành)
        scrollTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) {
            isScrollingProgrammaticallyRef.current = false;
          }
          scrollTimeoutRef.current = null;
        }, 500); // 500ms để animation hoàn thành
      } catch (error) {
        console.error(`[MultiPageCanvas] scrollToPage error:`, error);
        isScrollingProgrammaticallyRef.current = false;
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      }
    },
    [offsets, pages, onActivePageChange]
  );

  // 🎯 Xử lý scroll từ CustomScrollbar
  const handleCustomScrollbarScroll = useCallback((newScrollY) => {
    scrollRef.current?.scrollTo({ y: newScrollY, animated: false });
  }, []);

  // 🧱 Khi page mới thêm xong layout → scroll tới
  useEffect(() => {
    const id = lastAddedRef.current;
    if (!id || !pageLayouts[id]) return;
    const idx = pages.findIndex((p) => p.id === id);
    if (idx >= 0) {
      const y = offsets[idx] ?? 0;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y, animated: true });
        setActiveIndex(idx);
        onActivePageChange?.(id);
        lastAddedRef.current = null;
      });
    }
  }, [pageLayouts, pages, offsets, onActivePageChange]);

  // 🖱 Theo dõi scroll
  // Replace old handleScroll with this JS handler (called from UI worklet via runOnJS)
  const handleScrollFromUI = (offset) => {
    // ✅ Skip nếu component đã unmount
    if (isUnmountedRef.current) return;

    // ✅ Skip nếu đang scroll programmatically (check sớm để tránh unnecessary work)
    if (isScrollingProgrammaticallyRef.current) return;

    // Throttle bằng RAF để giảm tần suất setState
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;

      // ✅ Double check unmount và programmatic scroll
      if (isUnmountedRef.current || isScrollingProgrammaticallyRef.current)
        return;

      // throttle tiny moves to avoid spamming JS (raise to 3px to reduce JS pressure)
      if (Math.abs(offset - lastHandledScrollRef.current) < 0.5) return;

      lastHandledScrollRef.current = offset;

      // ✅ Safe state update
      if (!isUnmountedRef.current) {
        setScrollY(offset);
      }

      // Compute visible window
      const viewTop = offset;
      const viewBottom = offset + height;

      // Find visible range (binary search-like approach)
      let firstVisible = 0;
      let lastVisible = pages.length - 1;

      // Find first visible page
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        if (!p || p.id == null) continue;
        const top = offsets[i] ?? 0;
        const h = pageLayouts[p.id] ?? fallbackHeight;
        const bottom = top + h + PAGE_SPACING;
        if (bottom >= viewTop) {
          firstVisible = i;
          break;
        }
      }

      // Find last visible page
      for (let i = pages.length - 1; i >= firstVisible; i--) {
        const top = offsets[i] ?? 0;
        if (top <= viewBottom) {
          lastVisible = i;
          break;
        }
      }

      // Only update visible pages (optimized range)
      for (let i = firstVisible; i <= lastVisible; i++) {
        const p = pages[i];
        if (!p || p.id == null) continue;
        const pageRef = pageRefs.current[p.id];
        if (pageRef && typeof pageRef.setScrollOffsetY === "function") {
          try {
            pageRef.setScrollOffsetY(offset - (offsets[i] ?? 0));
          } catch (error) {
            console.error(
              `[MultiPageCanvas] Error setting scroll offset for page ${p.id}:`,
              error
            );
          }
        }
      }

      // ✅ Skip nếu đang scroll programmatically (check lại sau khi update visible pages)
      if (isScrollingProgrammaticallyRef.current) return;

      // compute active page (midpoint method)
      let current = pages.length - 1;
      for (let i = 0; i < offsets.length; i++) {
        const p = pages[i];
        if (!p || p.id == null) continue;
        const start = offsets[i];
        const end =
          i + 1 < offsets.length
            ? offsets[i + 1]
            : start + (pageLayouts[p.id] ?? fallbackHeight) + PAGE_SPACING;
        const mid = start + (end - start) / 2;
        if (offset < mid) {
          current = i;
          break;
        }
      }

      if (current !== activeIndex && !isUnmountedRef.current) {
        const currentPage = pages[current];
        if (currentPage && currentPage.id != null) {
          setActiveIndex(current);
          onActivePageChange?.(currentPage.id);
        }
      }
    });
  };

  useAnimatedReaction(
    () => scrollYShared.value,
    (val, prev) => {
      if (val !== prev) runOnJS(handleScrollFromUI)(val);
    }
  );

  // 🧾 Layout height tracking
  const onPageLayout = (pageId, layoutHeight) => {
    setPageLayouts((prev) =>
      prev[pageId] === layoutHeight ? prev : { ...prev, [pageId]: layoutHeight }
    );
  };

  // ====== ZOOM PROJECT (Áp dụng cho toàn bộ project) ======
  const clampProjectPan = () => {
    "worklet";
    // Clamp theo kích thước nội dung đã scale để tránh kéo quá
    const scaleVal = projectScale.value || 1;
    const contH = containerHeight || 0;
    const contentH = contentHeight || 0;
    const pageW = pageDimensions?.width || width || 0;
    if (!scaleVal || !isFinite(scaleVal) || contH <= 0) return;
    const scaledHeight = Math.max(0, contentH * scaleVal);
    const scaledWidth = Math.max(0, pageW * scaleVal);

    const maxY = Math.max(0, (scaledHeight - contH) / 2);
    const maxX = Math.max(0, (scaledWidth - width) / 2);

    if (isFinite(maxY)) {
      projectTranslateY.value = Math.min(
        Math.max(projectTranslateY.value, -maxY),
        maxY
      );
    }
    if (isFinite(maxX)) {
      projectTranslateX.value = Math.min(
        Math.max(projectTranslateX.value, -maxX),
        maxX
      );
    }
  };

  const pinch = Gesture.Pinch()
    .enabled(!zoomLocked && tool === "zoom")
    .onStart((e) => {
      "worklet";
      try {
        baseProjectScale.value = projectScale.value;
        // Lưu translate hiện tại để anchor vào tiêu điểm pinch
        baseProjectTranslateX.value = projectTranslateX.value;
        baseProjectTranslateY.value = projectTranslateY.value;
        runOnJS(setShowZoomOverlay)(true);
        // Disable scroll khi zoom
        runOnJS(setIsZooming)(true);
      } catch (err) {
        console.warn("[Pinch.onStart] Error:", err);
      }
    })
    .onUpdate((e) => {
      "worklet";
      try {
        if (typeof e.scale !== "number" || !isFinite(e.scale)) return;

        // Tăng độ nhạy bằng cách nhân thêm hệ số
        const sensitivityFactor = 1.2;
        const scaleDelta = (e.scale - 1) * sensitivityFactor + 1;

        const newScale = Math.max(
          1.0,
          Math.min(3, baseProjectScale.value * scaleDelta)
        );
        const prevScale = projectScale.value;
        if (newScale < 1.0) {
          projectScale.value = 1.0;
        } else if (newScale > 3) {
          projectScale.value = 3;
        } else {
          projectScale.value = newScale;
        }

        // Anchor zoom theo tiêu điểm 2 ngón để cảm giác tự nhiên hơn
        if (
          typeof e.focalX === "number" &&
          typeof e.focalY === "number" &&
          isFinite(e.focalX) &&
          isFinite(e.focalY)
        ) {
          const s = projectScale.value / (prevScale || 1);
          // Tịnh tiến để giữ tiêu điểm tại chỗ khi scale
          const dx = e.focalX - width / 2;
          const dy = e.focalY - height / 2;
          projectTranslateX.value = (baseProjectTranslateX.value - dx) * s + dx;
          projectTranslateY.value = (baseProjectTranslateY.value - dy) * s + dy;
          clampProjectPan();
        }
      } catch (err) {
        console.warn("[Pinch.onUpdate] Error:", err);
      }
    })
    .onEnd((e) => {
      "worklet";
      try {
        if (projectScale.value < 1) {
          projectScale.value = withTiming(1, { duration: 300 });
        }
        if (projectScale.value > 3) {
          projectScale.value = withTiming(3, { duration: 300 });
        }
        // Sau khi scale, clamp lại pan để không vượt biên
        clampProjectPan();
        runOnJS(setShowZoomOverlay)(false);
        // Re-enable scroll khi zoom xong
        runOnJS(setIsZooming)(false);
      } catch (err) {
        console.warn("[Pinch.onEnd] Error:", err);
      }
    });

  // Two-finger pan khi đang zoom để di chuyển project mượt mà
  const pan = Gesture.Pan()
    .minPointers(2)
    .enabled(!zoomLocked && tool === "zoom")
    .onStart(() => {
      "worklet";
      baseProjectTranslateX.value = projectTranslateX.value;
      baseProjectTranslateY.value = projectTranslateY.value;
      // Khi pan 2 ngón, disable scroll
      runOnJS(setIsZooming)(true);
    })
    .onUpdate((e) => {
      "worklet";
      try {
        if (
          typeof e.translationX !== "number" ||
          typeof e.translationY !== "number"
        )
          return;
        // Chỉ pan khi đã phóng to để tránh conflict với scroll
        if ((projectScale.value || 1) <= 1) return;
        projectTranslateX.value = baseProjectTranslateX.value + e.translationX;
        projectTranslateY.value = baseProjectTranslateY.value + e.translationY;
        clampProjectPan();
      } catch (err) {}
    })
    .onEnd(() => {
      "worklet";
      clampProjectPan();
      runOnJS(setIsZooming)(false);
    });

  const derivedZoom = useDerivedValue(() =>
    Math.round(projectScale.value * 100)
  );
  useAnimatedReaction(
    () => derivedZoom.value,
    (val, prev) => {
      if (val !== prev) runOnJS(setZoomPercent)(val);
    }
  );

  // Mirror scale to JS to control scrollEnabled reactively
  useAnimatedReaction(
    () => projectScale.value,
    (s, prev) => {
      if (s !== prev) runOnJS(setIsZoomedIn)(s > 1.01);
    }
  );

  const projectAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: projectTranslateX.value },
      { translateY: projectTranslateY.value },
      { scale: projectScale.value },
    ],
  }));

  // ✅ Scroll đến page bằng pageId (dùng trong DocumentOverviewModal)
  const scrollToPageById = useCallback(
    (pageId) => {
      if (!pageId) {
        // Không log warning cho empty pageId (có thể là normal case)
        return;
      }

      // ✅ Check if component is mounted - silent return để tránh spam warning
      if (isUnmountedRef.current) {
        // Không log warning vì có thể là normal case khi modal đóng
        return;
      }

      // ✅ Convert pageId thành string để so sánh (vì có thể nhận number hoặc string)
      const pageIdStr = String(pageId);

      // ✅ Tìm page bằng cách so sánh cả number và string
      const index = pages.findIndex((p) => {
        if (!p || p.id == null) return false;
        // So sánh cả number và string
        return String(p.id) === pageIdStr || p.id === pageId;
      });

      if (index >= 0) {
        requestAnimationFrame(() => {
          if (!isUnmountedRef.current) {
            scrollToPage(index);
          }
        });
      } else {
        console.warn(
          `[MultiPageCanvas] scrollToPageById: Page not found for pageId ${pageId}. Available pages:`,
          pages.map((p) => p?.id)
        );
      }
    },
    [pages, scrollToPage]
  );

  // ✅ Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      isScrollingProgrammaticallyRef.current = false;
    };
  }, []);

  // 🪄 Public API
  useImperativeHandle(ref, () => ({
    scrollToPage,
    scrollToPageById, // ✅ Expose method để scroll bằng pageId
    addPage,

    // ✅ Update page template và backgroundColor
    updatePage: (pageId, updates) => {
      if (!pageId || !updates) return;
      setPages((prev) =>
        prev.map((pg) => {
          if (pg.id === pageId) {
            return { ...pg, ...updates };
          }
          return pg;
        })
      );
    },

    // Get current zoom level for image size calculation
    getCurrentZoom: () => projectScale.value,

    addImageStroke: (stroke) => {
      const page = pages[activeIndex];
      pageRefs.current[page?.id]?.addImageStroke?.({
        ...stroke,
        layerId: stroke.layerId ?? activeLayerId,
        scrollOffsetY: scrollY - (offsets[activeIndex] ?? 0),
      });
    },

    addStickerStroke: (stroke) => {
      const page = pages[activeIndex];
      pageRefs.current[page?.id]?.addStickerStroke?.({
        ...stroke,
        scrollOffsetY: scrollY - (offsets[activeIndex] ?? 0),
      });
    },

    addTextStroke: (stroke) => {
      const page = pages[activeIndex];
      pageRefs.current[page?.id]?.addTextStroke?.({
        ...stroke,
        scrollOffsetY: scrollY - (offsets[activeIndex] ?? 0),
      });
    },

    // [NEW] This function ONLY gathers data from all pages. It does not upload.
    getAllPagesData: () => {
      const allPagesData = [];
      for (let index = 0; index < pages.length; index++) {
        const page = pages[index];
        if (!page || page.id == null) continue;

        try {
          const strokes =
            pageRefs.current[page.id]?.getStrokes?.() ||
            drawingDataRef.current.pages[page.id] ||
            [];
          const layersMetadata =
            pageRefs.current[page.id]?.getLayersMetadata?.() || [];

          const dataObject = {
            id: page.id,
            createdAt: new Date().toISOString(),
            type: page.type || "paper",
            backgroundColor: page.backgroundColor,
            template: page.template,
            imageUrl: page.imageUrl,
            strokes,
            layers: layersMetadata,
          };

          const fallbackNumber = index + 1;
          const pageNumber =
            typeof page.pageNumber === "number"
              ? page.pageNumber
              : page.type === "cover"
              ? 1
              : fallbackNumber;

          allPagesData.push({
            pageId: page.id,
            pageNumber: pageNumber,
            dataObject: dataObject,
          });
        } catch (e) {
          console.error(`Error gathering data for page ${page.id}:`, e);
        }
      }
      return allPagesData;
    },
    getAllPagesSnapshots: () => {
      const out = [];
      for (let index = 0; index < pages.length; index++) {
        const page = pages[index];
        if (!page || page.id == null) continue;
        const strokes = pageRefs.current[page.id]?.getStrokes?.() || [];
        const count = strokes.length;
        const lastId = count > 0 ? strokes[count - 1]?.id : "";
        const sig = `${count}:${lastId}`;
        if (snapshotSignaturesRef.current[page.id] === sig) continue;
        const b64 = pageRefs.current[page.id]?.getSnapshotBase64?.(85);
        if (!b64) continue;
        snapshotSignaturesRef.current[page.id] = sig;
        const fallbackNumber = index + 1;
        const pageNumber =
          typeof page.pageNumber === "number"
            ? page.pageNumber
            : page.type === "cover"
            ? 1
            : fallbackNumber;
        out.push({ pageId: page.id, pageNumber, base64: b64 });
      }
      return out;
    },
    refreshSnapshots: (remotePages = []) => {
      try {
        const map = new Map(
          remotePages
            .filter((p) => p && typeof p.pageNumber === "number")
            .map((p) => [p.pageNumber, p.snapshotUrl || null])
        );
        setPages((prev) => {
          if (!Array.isArray(prev) || prev.length === 0) return prev;
          return prev.map((pg, idx) => {
            const fallbackNumber = idx + 1;
            const num =
              typeof pg.pageNumber === "number"
                ? pg.pageNumber
                : pg.type === "cover"
                ? 1
                : fallbackNumber;
            const snap = map.get(num);
            if (snap == null || snap === pg.snapshotUrl) return pg;
            return { ...pg, snapshotUrl: snap };
          });
        });
      } catch (e) {}
    },

    // [NEW] Append strokes to a specific page, used for incremental loading.
    appendStrokesToPage: (pageId, strokeChunk) => {
      if (!pageId || !strokeChunk || strokeChunk.length === 0) {
        return;
      }
      const pageRef = pageRefs.current[pageId];
      if (pageRef && typeof pageRef.appendStrokes === "function") {
        pageRef.appendStrokes(strokeChunk);
      } else {
        console.warn(
          `[MultiPageCanvas] appendStrokes not available for pageId: ${pageId}`
        );
      }
    },

    // [NEW] Clears all strokes from a specific page.
    clearPage: (pageId) => {
      if (!pageId) return;
      const pageRef = pageRefs.current[pageId];
      if (pageRef && typeof pageRef.clearAllStrokes === "function") {
        pageRef.clearAllStrokes();
      } else {
        console.warn(
          `[MultiPageCanvas] clearAllStrokes not available for pageId: ${pageId}`
        );
      }
    },

    // Insert table vào active page
    insertTable: (rows, cols) => {
      const activePage = pages[activeIndex];
      if (activePage && pageRefs.current[activePage.id]) {
        pageRefs.current[activePage.id]?.insertTable?.(rows, cols);
      }
    },

    loadProjectData: (data) => {
      if (!data || isUnmountedRef.current) return;
      // Clear any pending retry callbacks before loading new data
      loadTimeoutsRef.current.forEach((id) => clearTimeout(id));
      loadTimeoutsRef.current.clear();
      try {
        if (Array.isArray(data.pages)) {
          data.pages.forEach((p) => {
            if (!p || !p.id) return;

            // Retry logic: đợi pageRef sẵn sàng
            const tryLoad = (retries = 5) => {
              if (isUnmountedRef.current) return;
              const pageRef = pageRefs.current[p.id];
              if (pageRef?.loadStrokes) {
                // Validate strokes trước khi load
                const strokes = Array.isArray(p.strokes) ? p.strokes : [];
                // Limit strokes để tránh crash
                const safeStrokes = strokes.slice(0, 1000);
                // ✅ Lấy layers metadata từ data
                const layersMetadata = Array.isArray(p.layersMetadata)
                  ? p.layersMetadata
                  : [];
                try {
                  pageRef.loadStrokes(safeStrokes, layersMetadata);
                } catch (loadError) {
                  // console.error(
                  //   `[MultiPageCanvas] Error loading strokes into page id: ${p.id}:`,
                  //   loadError
                  // );
                }
              } else if (retries > 0) {
                scheduleSafeTimeout(() => tryLoad(retries - 1), 200);
              } else {
                console.warn(
                  `[MultiPageCanvas] Page ref not ready for id: ${p.id} after all retries. Available pageRefs:`,
                  Object.keys(pageRefs.current)
                );
              }
            };

            tryLoad();
          });
        } else if (data.strokes && data.id) {
          const tryLoad = (retries = 5) => {
            if (isUnmountedRef.current) return;
            const pageRef = pageRefs.current[data.id];
            if (pageRef?.loadStrokes) {
              const strokes = Array.isArray(data.strokes)
                ? data.strokes.slice(0, 1000)
                : [];
              pageRef.loadStrokes(strokes);
            } else if (retries > 0) {
              scheduleSafeTimeout(() => tryLoad(retries - 1), 200);
            }
          };
          tryLoad();
        }
      } catch (e) {
        console.error("[MultiPageCanvas] loadProjectData error:", e);
      }
    },
  }));

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {/* Document Sidebar */}
      <DocumentSidebar
        visible={sidebarVisible}
        onToggle={() => setSidebarVisible(!sidebarVisible)}
        pages={pages}
        activePageId={
          pages[activeIndex]?.id != null
            ? String(pages[activeIndex].id)
            : pages.length > 0 && pages[0]?.id != null
            ? String(pages[0].id)
            : "1"
        }
        onPageSelect={(pageId) => {
          // ✅ Sử dụng scrollToPageById với debounce đã có trong scrollToPage
          scrollToPageById(pageId);
        }}
        onAddPage={addPage}
        resourceItems={[]}
        onOpenOverview={() => setOverviewVisible(true)}
      />
      <DocumentOverviewModal
        visible={overviewVisible}
        onClose={() => setOverviewVisible(false)}
        pages={pages}
        activePageId={pages[activeIndex]?.id}
        onPageSelect={(pageId) => {
          scrollToPageById(pageId);
        }}
        onAddPage={addPage}
        onResourceSelect={(uri) => {}}
      />

      {/* Pages - Wrapped with Gesture Detector for project-wide zoom */}
      <View
        style={{
          flex: 1,
          overflow: "hidden",
          paddingLeft: sidebarVisible ? 280 : 0,
        }}
      >
        <GestureDetector
          gesture={Gesture.Simultaneous(pinch, pan)}
          simultaneousHandlers={scrollRef}
        >
          <Animated.View
            style={[{ flex: 1, alignSelf: "center" }, projectAnimatedStyle]}
          >
            <Animated.ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={{
                alignItems: "center",
                paddingVertical: 20,
              }}
              onScroll={onScrollAnimated}
              scrollEventThrottle={12}
              decelerationRate="normal"
              showsVerticalScrollIndicator={false}
              // Chế độ scroll-only cho phép scroll ngay cả khi đã zoom
              scrollEnabled={
                tool === "scroll"
                  ? true
                  : tool === "zoom"
                  ? false
                  : !isZooming && !isZoomedIn
              }
              simultaneousHandlers={scrollRef}
              onLayout={(e) => {
                const h = e?.nativeEvent?.layout?.height;
                if (Number.isFinite(h) && h > 0) setContainerHeight(h);
              }}
            >
              {pages.map((p, i) => {
                // ✅ Đảm bảo page id luôn hợp lệ cho key
                const pageKey = p?.id != null ? String(p.id) : `page-${i}`;
                return (
                  <View
                    key={pageKey}
                    style={{
                      marginBottom: PAGE_SPACING,
                      width: "100%",
                      alignItems: "center",
                    }}
                    onLayout={(e) => {
                      if (p?.id != null) {
                        onPageLayout(p.id, e.nativeEvent.layout.height);
                      }
                    }}
                  >
                    <CanvasContainer
                      // MultiPageCanvas.jsx
                      ref={(ref) => {
                        // Always keep pageRefs in sync immediately (no setState)
                        if (p?.id != null) {
                          pageRefs.current[p.id] = ref || null;
                          if (typeof registerPageRef === "function") {
                            registerPageRef(p.id, ref || null);
                          }
                        }
                      }}
                      loadedFonts={loadedFonts}
                      getNearestFont={getNearestFont}
                      {...{
                        tool,
                        color,
                        setColor,
                        setTool,
                        strokeWidth,
                        pencilWidth,
                        eraserSize,
                        eraserMode,
                        brushWidth,
                        brushOpacity,
                        calligraphyWidth,
                        calligraphyOpacity,
                        paperStyle,
                        shapeType,
                        onRequestTextInput,
                        toolConfigs,
                        pressure,
                        thickness,
                        stabilization,
                        layers: pageLayers?.[p.id] || [
                          {
                            id: "layer1",
                            name: "Layer 1",
                            visible: true,
                            strokes: [],
                          },
                        ], // 👈 Pass page-specific layers
                        activeLayerId,
                        setLayers: (updater) => {
                          if (p?.id == null) return;
                          setPageLayers?.((prev) => ({
                            ...prev,
                            [p.id]:
                              typeof updater === "function"
                                ? updater(
                                    prev[p.id] || [
                                      {
                                        id: "layer1",
                                        name: "Layer 1",
                                        visible: true,
                                        strokes: [],
                                      },
                                    ]
                                  )
                                : updater,
                          }));
                        }, // 👈 Update page-specific layers
                        rulerPosition,
                        onColorPicked,
                        scrollOffsetY: scrollY - (offsets[activeIndex] ?? 0),
                        scrollYShared, // ✅ Animated scroll value
                        pageOffsetY: offsets[i] ?? 0, // ✅ Page offset trong project
                        backgroundColor: p.backgroundColor,
                        pageTemplate: p.template,
                        backgroundImageUrl: p.imageUrl,
                        pageWidth: pageDimensions.width,
                        pageHeight: pageDimensions.height,
                        onZoomChange: (isZoomActive) => {
                          // Update zoom state: true when pinch gesture starts, false when ends
                          // Disable ScrollView scroll when pinch gesture is active to prevent crash
                          setIsZooming(isZoomActive);
                        },
                        // Pass down selection state
                        selectedId:
                          selectionPageId === p.id ? selectedId : null,
                        selectedBox:
                          selectionPageId === p.id ? selectedBox : null,
                        onSelectionChange: (strokeId, box) => {
                          handleSelectionChange(p.id, strokeId, box);
                        },
                      }}
                      pageId={p?.id != null ? p.id : `page-${i}`}
                      onChangeStrokes={(strokes) => {
                        if (p?.id != null) {
                          drawingDataRef.current.pages[p.id] = strokes;
                        }
                      }}
                    />
                  </View>
                );
              })}
            </Animated.ScrollView>

            {/* CustomScrollbar Component */}
            <CustomScrollbar
              scrollYShared={scrollYShared}
              contentHeight={contentHeight}
              containerHeight={containerHeight}
              onScroll={handleCustomScrollbarScroll}
              isZooming={isZooming}
            />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Zoom Overlay - Hiển thị lâu hơn, position đúng giữa */}
      {showZoomOverlay && (
        <Animated.View
          style={{
            position: "absolute",
            top: 40,
            left: "50%",
            transform: [{ translateX: -80 }], // Canh chính xác giữa
            backgroundColor: "rgba(0,0,0,0.75)",
            padding: 14,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            zIndex: 100,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
            Zoom: {zoomPercent}%
          </Text>
          <TouchableOpacity
            onPress={() => setZoomLocked((prev) => !prev)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: zoomLocked ? "#007AFF" : "#555",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>
              {zoomLocked ? "🔒" : "🔓"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Interaction Mode Buttons */}
      <View
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          flexDirection: "row",
          gap: 8,
          zIndex: 100,
        }}
      >
        <TouchableOpacity
          onPress={() => setTool?.("scroll")}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: tool === "scroll" ? "#34C759" : "#555",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="swap-vert" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTool?.("zoom")}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: tool === "zoom" ? "#007AFF" : "#555",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="zoom-in" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          gap: 6,
          zIndex: 100,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            projectScale.value = withTiming(
              Math.min(projectScale.value + 0.2, 3),
              {
                duration: 200,
              }
            );
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#007AFF",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 2,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 18, color: "white", fontWeight: "bold" }}>
            +
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            projectScale.value = withTiming(
              Math.max(projectScale.value - 0.2, 1.0),
              {
                duration: 200,
              }
            );
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#007AFF",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 2,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 18, color: "white", fontWeight: "bold" }}>
            −
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            projectScale.value = withTiming(1, { duration: 200 });
          }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#34C759",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 2,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 14, color: "white", fontWeight: "bold" }}>
            ↺
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default memo(MultiPageCanvas);
