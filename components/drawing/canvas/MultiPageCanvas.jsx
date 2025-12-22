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
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useDerivedValue,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedRef,
  scrollTo,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import CanvasContainer from "./CanvasContainer";
import CustomScrollbar from "./CustomScrollbar";
import DocumentSidebar from "../document/DocumentSidebar";
import DocumentOverviewModal from "../document/DocumentOverviewModal";
import { projectService } from "../../../service/projectService";
import { calculatePageDimensions } from "../../../utils/pageDimensions";
import { useToast } from "../../../hooks/use-toast";
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

const FONT_SIZES = [18];

// ✅ FIX: Use individual useFont calls at top level to avoid hooks in loops
// Each font is loaded once and cached by Skia
function usePreloadedFonts() {
  // Load each font individually to follow React hooks rules
  const robotoRegular18 = useFont(FONT_MAP.Roboto.Regular, 18);
  const robotoBold18 = useFont(FONT_MAP.Roboto.Bold, 18);
  const robotoItalic18 = useFont(FONT_MAP.Roboto.Italic, 18);
  const robotoBoldItalic18 = useFont(FONT_MAP.Roboto.BoldItalic, 18);

  const latoRegular18 = useFont(FONT_MAP.Lato.Regular, 18);
  const latoBold18 = useFont(FONT_MAP.Lato.Bold, 18);
  const latoItalic18 = useFont(FONT_MAP.Lato.Italic, 18);
  const latoBoldItalic18 = useFont(FONT_MAP.Lato.BoldItalic, 18);

  const montserratRegular18 = useFont(FONT_MAP.Montserrat.Regular, 18);
  const montserratBold18 = useFont(FONT_MAP.Montserrat.Bold, 18);
  const montserratItalic18 = useFont(FONT_MAP.Montserrat.Italic, 18);
  const montserratBoldItalic18 = useFont(FONT_MAP.Montserrat.BoldItalic, 18);

  const openSansRegular18 = useFont(FONT_MAP.OpenSans.Regular, 18);
  const openSansBold18 = useFont(FONT_MAP.OpenSans.Bold, 18);
  const openSansItalic18 = useFont(FONT_MAP.OpenSans.Italic, 18);
  const openSansBoldItalic18 = useFont(FONT_MAP.OpenSans.BoldItalic, 18);

  const interRegular18 = useFont(FONT_MAP.Inter.Regular, 18);
  const interBold18 = useFont(FONT_MAP.Inter.Bold, 18);
  const interItalic18 = useFont(FONT_MAP.Inter.Italic, 18);
  const interBoldItalic18 = useFont(FONT_MAP.Inter.BoldItalic, 18);

  const poppinsRegular18 = useFont(FONT_MAP.Poppins.Regular, 18);
  const poppinsBold18 = useFont(FONT_MAP.Poppins.Bold, 18);
  const poppinsItalic18 = useFont(FONT_MAP.Poppins.Italic, 18);
  const poppinsBoldItalic18 = useFont(FONT_MAP.Poppins.BoldItalic, 18);

  const pacificoRegular18 = useFont(FONT_MAP.Pacifico.Regular, 18);
  const notoEmojiRegular18 = useFont(FONT_MAP.NotoColorEmoji.Regular, 18);

  // ✅ Use useMemo to create the loaded object only once
  return React.useMemo(() => ({
    Roboto: {
      Regular: { 18: robotoRegular18 },
      Bold: { 18: robotoBold18 },
      Italic: { 18: robotoItalic18 },
      BoldItalic: { 18: robotoBoldItalic18 },
    },
    Lato: {
      Regular: { 18: latoRegular18 },
      Bold: { 18: latoBold18 },
      Italic: { 18: latoItalic18 },
      BoldItalic: { 18: latoBoldItalic18 },
    },
    Montserrat: {
      Regular: { 18: montserratRegular18 },
      Bold: { 18: montserratBold18 },
      Italic: { 18: montserratItalic18 },
      BoldItalic: { 18: montserratBoldItalic18 },
    },
    OpenSans: {
      Regular: { 18: openSansRegular18 },
      Bold: { 18: openSansBold18 },
      Italic: { 18: openSansItalic18 },
      BoldItalic: { 18: openSansBoldItalic18 },
    },
    Inter: {
      Regular: { 18: interRegular18 },
      Bold: { 18: interBold18 },
      Italic: { 18: interItalic18 },
      BoldItalic: { 18: interBoldItalic18 },
    },
    Poppins: {
      Regular: { 18: poppinsRegular18 },
      Bold: { 18: poppinsBold18 },
      Italic: { 18: poppinsItalic18 },
      BoldItalic: { 18: poppinsBoldItalic18 },
    },
    Pacifico: {
      Regular: { 18: pacificoRegular18 },
    },
    NotoColorEmoji: {
      Regular: { 18: notoEmojiRegular18 },
    },
  }), [
    robotoRegular18, robotoBold18, robotoItalic18, robotoBoldItalic18,
    latoRegular18, latoBold18, latoItalic18, latoBoldItalic18,
    montserratRegular18, montserratBold18, montserratItalic18, montserratBoldItalic18,
    openSansRegular18, openSansBold18, openSansItalic18, openSansBoldItalic18,
    interRegular18, interBold18, interItalic18, interBoldItalic18,
    poppinsRegular18, poppinsBold18, poppinsItalic18, poppinsBoldItalic18,
    pacificoRegular18, notoEmojiRegular18,
  ]);
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
    noteConfig = null, // Add noteConfig to props
    projectId,
    userId,
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
    onColorPicked,
    tapeSettings, // ✅ Tape settings
    shapeSettings, // ✅ Shape settings
    // 🔄 REALTIME COLLABORATION props
    collabEnabled,
    collabConnected,
    onCollabElementUpdate,
    onCollabElementCreate,
    onCollabElementDelete,
    onCollabRequestLock,
    onCollabReleaseLock,
    onCollabIsElementLocked,
    onCollabPageCreate,
  },
  ref
) {
  const loadedFonts = usePreloadedFonts();


  // ✅ Skia's useFont hook manages font lifecycle automatically
  // No manual dispose needed - fonts are garbage collected when component unmounts


  const drawingDataRef = useRef({ pages: {} });

  // Sidebar state
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [overviewVisible, setOverviewVisible] = useState(false);
  const [templateConfirm, setTemplateConfirm] = useState(null);
  const [applyMode, setApplyMode] = useState("append");
  const [placeTemplateOnNewLayer, setPlaceTemplateOnNewLayer] = useState(true);

  const { toast } = useToast();
  // Initialize pages based on noteConfig
  const initialPages = useMemo(() => {
    if (!noteConfig) return [{ id: 1 }];

    const pages = [];
    const paperTemplate = noteConfig.paper?.template || "blank";
    const paperBg = noteConfig.paper?.color || "#FFFFFF";
    const paperImageUrl = noteConfig.paper?.imageUrl || null;

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
            imageUrl: p.imageUrl || paperImageUrl,
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
        imageUrl: paperImageUrl,
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

  const scrollRef = useAnimatedRef();
  const lastAddedRef = useRef(null);
  const pageRefs = useRef({});
  const templateHistoryRef = useRef(new Map());

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
      // ✅ FIX: Add scrollTimeoutRef cleanup
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
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
      toast({
        type: "error",
        text1: "Limit",
        text2: "You can only create up to 10 pages.",
        variant: "destructive",
      });
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
      imageUrl: firstPaperPage?.imageUrl || noteConfig?.paper?.imageUrl || null,
      snapshotUrl: null,
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
    .enabled(!zoomLocked) // ✅ Always enabled (except when locked) - allows zoom during drawing
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
        // ✅ Strict validation để tránh crash
        if (
          typeof e.scale !== "number" ||
          !isFinite(e.scale) ||
          e.scale <= 0 ||
          e.scale > 10
        )
          return;

        // ✅ Giảm sensitivity xuống 1.2 để ổn định hơn (từ 1.3)
        const baseSensitivity = 1.2;
        const scaleDelta = (e.scale - 1) * baseSensitivity + 1;

        // ✅ Strict clamping để tránh giá trị extreme
        const newScale = Math.max(
          0.5, // Min 50% để tránh crash
          Math.min(3.5, baseProjectScale.value * scaleDelta) // Max 350%
        );

        // ✅ Validate newScale trước khi assign
        if (!isFinite(newScale) || newScale <= 0) return;

        const prevScale = projectScale.value;

        // ✅ Smooth clamping - nhưng với validation
        projectScale.value = Math.max(1.0, Math.min(3.0, newScale));

        // ✅ Cải thiện focal point tracking với validation
        if (
          typeof e.focalX === "number" &&
          typeof e.focalY === "number" &&
          isFinite(e.focalX) &&
          isFinite(e.focalY) &&
          prevScale > 0
        ) {
          // Tính scale ratio với safety check
          const scaleRatio = projectScale.value / prevScale;
          if (!isFinite(scaleRatio) || scaleRatio <= 0) return;

          // Tính offset từ center đến focal point
          const focalOffsetX = e.focalX - width / 2;
          const focalOffsetY = e.focalY - height / 2;

          // ✅ Validate offsets
          if (!isFinite(focalOffsetX) || !isFinite(focalOffsetY)) return;

          // Điều chỉnh translation với validation
          const newTranslateX =
            (baseProjectTranslateX.value - focalOffsetX) * scaleRatio +
            focalOffsetX;
          const newTranslateY =
            (baseProjectTranslateY.value - focalOffsetY) * scaleRatio +
            focalOffsetY;

          // ✅ Validate trước khi assign
          if (isFinite(newTranslateX) && isFinite(newTranslateY)) {
            projectTranslateX.value = newTranslateX;
            projectTranslateY.value = newTranslateY;
            clampProjectPan();
          }
        }
      } catch (err) {
        console.warn("[Pinch.onUpdate] Error:", err);
      }
    })
    .onEnd((e) => {
      "worklet";
      try {
        // ✅ Smooth bounce back to limits với timing
        if (projectScale.value < 1) {
          projectScale.value = withTiming(1, { duration: 250 });
        }
        if (projectScale.value > 3) {
          projectScale.value = withTiming(3, { duration: 250 });
        }
        // Sau khi scale, clamp lại pan để không vượt biên
        clampProjectPan();

        // ✅ Delay hide overlay nếu không phải zoom tool
        runOnJS(setShowZoomOverlay)(false);
        // Re-enable scroll khi zoom xong
        runOnJS(setIsZooming)(false);
      } catch (err) {
        console.warn("[Pinch.onEnd] Error:", err);
      }
    });

  // Two-finger pan for panning when zoomed - only enabled when actually zoomed in
  const pan = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .minDistance(5) // ✅ Thêm minDistance để tránh nhầm lẫn với pinch
    .enabled(!zoomLocked && isZoomedIn) // ✅ Only enabled when zoomed in - allows native scroll when not zoomed
    .activateAfterLongPress(50) // ✅ Delay nhẹ để phân biệt với pinch
    .shouldCancelWhenOutside(false) // ✅ Không cancel khi ra ngoài
    .onStart(() => {
      "worklet";
      baseProjectTranslateX.value = projectTranslateX.value;
      baseProjectTranslateY.value = projectTranslateY.value;
      runOnJS(setIsZooming)(true);
    })
    .onUpdate((e) => {
      "worklet";
      try {
        // ✅ Strict validation
        if (
          typeof e.translationX !== "number" ||
          typeof e.translationY !== "number" ||
          !isFinite(e.translationX) ||
          !isFinite(e.translationY)
        )
          return;

        // ✅ Smooth pan với translation trực tiếp
        const newTranslateX = baseProjectTranslateX.value + e.translationX;
        const newTranslateY = baseProjectTranslateY.value + e.translationY;

        // ✅ Validate trước khi assign
        if (isFinite(newTranslateX) && isFinite(newTranslateY)) {
          projectTranslateX.value = newTranslateX;
          projectTranslateY.value = newTranslateY;
          clampProjectPan();
        }
      } catch (err) { }
    })
    .onEnd((e) => {
      "worklet";
      try {
        // ✅ Thêm momentum nếu có velocity (với validation nghiêm ngặt)
        if (
          typeof e.velocityX === "number" &&
          typeof e.velocityY === "number" &&
          isFinite(e.velocityX) &&
          isFinite(e.velocityY) &&
          Math.abs(e.velocityX) < 5000 && // ✅ Giới hạn velocity để tránh extreme values
          Math.abs(e.velocityY) < 5000
        ) {
          // Giảm momentum factor để ổn định hơn
          const momentumFactor = 0.2; // Giảm từ 0.3
          const newTranslateX =
            projectTranslateX.value + e.velocityX * momentumFactor;
          const newTranslateY =
            projectTranslateY.value + e.velocityY * momentumFactor;

          // ✅ Validate trước khi animate
          if (isFinite(newTranslateX) && isFinite(newTranslateY)) {
            projectTranslateX.value = withTiming(newTranslateX, {
              duration: 400,
            });
            projectTranslateY.value = withTiming(newTranslateY, {
              duration: 400,
            });
          }
        }
        clampProjectPan();
        runOnJS(setIsZooming)(false);
      } catch (err) { }
    });

  // ✅ Single-finger scroll gesture - chỉ hoạt động khi tool === "scroll"
  // ⚠️ CRITICAL FIX: Sử dụng scrollTo trên UI thread để tránh crash và đảm bảo mượt mà
  const scrollGesture = Gesture.Pan()
    .enabled(tool === "scroll") // ✅ Chỉ enable khi scroll tool active
    .minPointers(1)
    .maxPointers(1)
    .minDistance(5) // ✅ Tăng minDistance để tránh conflict
    .shouldCancelWhenOutside(false) // ✅ Không cancel khi ra ngoài
    .onStart(() => {
      "worklet";
      // Lưu scroll position ban đầu
      baseProjectTranslateY.value = scrollYShared.value;
    })
    .onUpdate((e) => {
      "worklet";
      // ✅ Validate inputs
      if (typeof e.translationY !== "number" || !isFinite(e.translationY))
        return;

      // ✅ Tính toán scroll position mới với clamping an toàn
      const maxScroll = Math.max(0, contentHeight - containerHeight);
      const newScrollY = Math.max(
        0,
        Math.min(maxScroll, baseProjectTranslateY.value - e.translationY)
      );

      // ✅ Scroll trực tiếp trên UI thread (High Performance)
      scrollTo(scrollRef, 0, newScrollY, false);
    })
    .onEnd((e) => {
      "worklet";
      // ✅ Thêm momentum cho scroll (an toàn)
      if (
        typeof e.velocityY === "number" &&
        isFinite(e.velocityY) &&
        Math.abs(e.velocityY) > 200
      ) {
        // Tính toán momentum scroll với clamping
        const momentumFactor = 0.3;
        const momentumDistance = e.velocityY * momentumFactor;
        const maxScroll = Math.max(0, contentHeight - containerHeight);
        const targetScrollY = Math.max(
          0,
          Math.min(maxScroll, scrollYShared.value - momentumDistance)
        );

        // ✅ Scroll có animation trên UI thread
        scrollTo(scrollRef, 0, targetScrollY, true);
      }
    });


  const derivedZoom = useDerivedValue(() =>
    Math.round(projectScale.value * 100)
  );
  useAnimatedReaction(
    () => derivedZoom.value,
    (val, prev) => {
      // ✅ Only update if significant change (>= 5%) - reduces JS thread load
      if (val !== prev && Math.abs(val - prev) >= 5) runOnJS(setZoomPercent)(val);

      // ✅ Update isZoomedIn state to enable/disable pan gesture
      const zoomed = val > 101; // > 101% considered zoomed in
      runOnJS(setIsZoomedIn)(zoomed);
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

      // ✅ FIX: Explicitly clear large refs to release memory
      if (pageRefs.current) {
        Object.keys(pageRefs.current).forEach(key => {
          pageRefs.current[key] = null;
        });
        pageRefs.current = {};
      }
      if (templateHistoryRef.current) {
        templateHistoryRef.current.clear();
      }
      if (snapshotSignaturesRef.current) {
        snapshotSignaturesRef.current = {};
      }
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
            snapshotUrl: page.snapshotUrl,
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
      } catch (e) { }
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

    // 🔄 REALTIME COLLABORATION: Update a stroke by ID on a specific page
    updateStrokeById: (pageId, strokeId, changes, options = {}) => {
      if (!pageId || !strokeId || !changes) return;
      const pageRef = pageRefs.current[pageId];
      if (pageRef && typeof pageRef.updateStrokeById === "function") {
        pageRef.updateStrokeById(strokeId, changes, options);
      } else {
        console.warn(`[MultiPageCanvas] updateStrokeById not available for pageId: ${pageId}`);
      }
    },

    // 🔄 REALTIME COLLABORATION: Delete a stroke by ID on a specific page
    deleteStrokeById: (pageId, strokeId, options = {}) => {
      if (!pageId || !strokeId) return;
      const pageRef = pageRefs.current[pageId];
      if (pageRef && typeof pageRef.deleteStrokeById === "function") {
        pageRef.deleteStrokeById(strokeId, options);
      } else {
        console.warn(`[MultiPageCanvas] deleteStrokeById not available for pageId: ${pageId}`);
      }
    },

    // 🔄 REALTIME COLLABORATION: Add page from remote user
    addPageFromRemote: (page, insertAt) => {
      if (!page || !page.id) return;
      setPages((prev) => {
        // Check if page already exists
        if (prev.some(p => p.id === page.id)) return prev;
        
        const newPage = {
          id: page.id,
          type: page.type || "paper",
          backgroundColor: page.backgroundColor || noteConfig?.paper?.color || "#FFFFFF",
          template: page.template || noteConfig?.paper?.template || "blank",
          imageUrl: page.imageUrl || null,
          snapshotUrl: page.snapshotUrl || null,
        };
        
        // Initialize layers for new page
        setPageLayers?.((prev) => ({
          ...prev,
          [page.id]: [{ id: "layer1", name: "Layer 1", visible: true, strokes: [] }],
        }));
        
        if (typeof insertAt === "number" && insertAt >= 0 && insertAt < prev.length) {
          const next = [...prev];
          next.splice(insertAt, 0, newPage);
          return next;
        }
        return [...prev, newPage];
      });
    },
  }));

  const extractTemplateData = (json) => {
    try {
      if (!json || typeof json !== "object") return {};
      let strokesArray = [];
      let layersMetadata = [];
      let pageUpdates = null;

      const rootStrokes = Array.isArray(json.strokes) ? json.strokes : [];

      if (Array.isArray(json.layers)) {
        json.layers.forEach((layer) => {
          const lid = layer?.id || "layer1";
          layersMetadata.push({
            id: lid,
            name: layer?.name || `Layer ${lid}`,
            visible: layer?.visible !== false,
            locked: layer?.locked === true,
          });
          const lst = Array.isArray(layer?.strokes) ? layer.strokes : [];
          lst.forEach((s) => strokesArray.push({ ...s, layerId: lid }));
        });
      }

      if (strokesArray.length === 0 && rootStrokes.length > 0) {
        strokesArray = rootStrokes;
      }

      if (json.page && typeof json.page === "object") {
        const bg = json.page.backgroundColor;
        const tpl = json.page.template;
        pageUpdates = {
          ...(bg ? { backgroundColor: bg } : {}),
          ...(tpl ? { template: tpl } : {}),
          imageUrl: json.page.imageUrl ?? undefined,
        };
      } else {
        const bg = json.backgroundColor;
        const tpl = json.template;
        pageUpdates = {
          ...(bg ? { backgroundColor: bg } : {}),
          ...(tpl ? { template: tpl } : {}),
          imageUrl: json.imageUrl ?? undefined,
        };
      }

      return { strokesArray, layersMetadata, pageUpdates };
    } catch (e) {
      return {};
    }
  };

  const fetchTemplateJson = useCallback(async (safeUrl) => {
    const resp = await fetch(safeUrl, {
      headers: { Accept: "application/json, text/plain, */*" },
    });
    const ct =
      (resp.headers && resp.headers.get && resp.headers.get("content-type")) ||
      "";
    if (ct.includes("application/json")) {
      return await resp.json();
    }
    const text = await resp.text();
    const raw = String(text)
      .trim()
      .replace(/^\uFEFF/, "");
    let candidate = raw;
    const idxBrace = raw.indexOf("{");
    const idxBracket = raw.indexOf("[");
    const startIdx =
      idxBrace >= 0 && idxBracket >= 0
        ? Math.min(idxBrace, idxBracket)
        : Math.max(idxBrace, idxBracket);
    const endBrace = raw.lastIndexOf("}");
    const endBracket = raw.lastIndexOf("]");
    const endIdx =
      endBrace >= 0 && endBracket >= 0
        ? Math.max(endBrace, endBracket)
        : Math.max(endBrace, endBracket);
    if (startIdx >= 0 && endIdx > startIdx) {
      candidate = raw.slice(startIdx, endIdx + 1);
    }
    return JSON.parse(candidate);
  }, []);

  const applyTemplateToPage = useCallback(
    async (pageId, url, mode = "append") => {
      try {
        if (!pageId || !url) return;
        const safeUrl = String(url).trim().replace(/^`|`$/g, "");
        let json;
        try {
          json = await fetchTemplateJson(safeUrl);
        } catch (e) {
          Alert.alert(
            "Template lỗi",
            "Không thể đọc dữ liệu template từ URL đã chọn."
          );
          return;
        }

        const { strokesArray, layersMetadata, pageUpdates } =
          extractTemplateData(json);
        const prevPage = pages.find((pg) => pg.id === pageId) || {};
        const pageRef = pageRefs.current[pageId];
        if (placeTemplateOnNewLayer) {
          setPageLayers?.((prev) => {
            const curr = prev[pageId] || [
              { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
            ];
            const hasTemplateLayer = curr.some((l) => l.id === "template");
            return {
              ...prev,
              [pageId]: hasTemplateLayer
                ? curr
                : [
                  ...curr,
                  {
                    id: "template",
                    name: "Template",
                    visible: true,
                    locked: false,
                    strokes: [],
                  },
                ],
            };
          });
        }
        if (pageRef) {
          if (mode === "replace" && typeof pageRef.loadStrokes === "function") {
            const toLoad = Array.isArray(strokesArray) ? strokesArray : [];
            pageRef.loadStrokes(toLoad, layersMetadata || []);
          } else if (typeof pageRef.appendStrokes === "function") {
            const toAppend = Array.isArray(strokesArray)
              ? strokesArray.map((s) => ({
                ...s,
                __templateSource: safeUrl,
                layerId: placeTemplateOnNewLayer
                  ? "template"
                  : s.layerId || "layer1",
              }))
              : [];
            pageRef.appendStrokes(toAppend);
          }
        }
        if (pageUpdates) {
          setPages((prev) =>
            prev.map((pg) =>
              pg.id === pageId ? { ...pg, ...pageUpdates } : pg
            )
          );
        }
        const stack = templateHistoryRef.current.get(pageId) || [];
        const prevStrokes = pageRef?.getStrokes?.() || [];
        const prevLayersMetadata = pageRef?.getLayersMetadata?.() || [];
        stack.push({
          source: safeUrl,
          mode,
          prevBackgroundColor: prevPage.backgroundColor,
          prevTemplate: prevPage.template,
          prevImageUrl: prevPage.imageUrl,
          prevStrokes,
          prevLayersMetadata,
        });
        templateHistoryRef.current.set(pageId, stack);
      } catch (e) {
        console.warn("[MultiPageCanvas] applyTemplateToPage error:", e);
      }
    },
    []
  );

  const unapplyLastTemplate = useCallback((pageId) => {
    const stack = templateHistoryRef.current.get(pageId) || [];
    if (stack.length === 0) return;
    const last = stack.pop();
    templateHistoryRef.current.set(pageId, stack);
    const pageRef = pageRefs.current[pageId];
    if (last.mode === "replace") {
      if (pageRef && typeof pageRef.loadStrokes === "function") {
        pageRef.loadStrokes(
          last.prevStrokes || [],
          last.prevLayersMetadata || []
        );
      }
    } else {
      if (
        pageRef &&
        typeof pageRef.removeStrokesByTemplateSource === "function"
      ) {
        pageRef.removeStrokesByTemplateSource(last.source);
      }
    }
    setPages((prev) =>
      prev.map((pg) =>
        pg.id === pageId
          ? {
            ...pg,
            backgroundColor: last.prevBackgroundColor,
            template: last.prevTemplate,
            imageUrl: last.prevImageUrl,
          }
          : pg
      )
    );
  }, []);

  const handleResourceSelect = useCallback(
    async (res) => {
      try {
        if (!res) return;

        const typeStr = String(res.type || "").toUpperCase();

        // Handle AI generated images
        if (typeStr.includes("AI_IMAGE") || typeStr.includes("AI IMAGE")) {
          const page = pages[activeIndex];
          if (!page || page.id == null) return;
          const pageRef = pageRefs.current[page.id];
          if (pageRef && typeof pageRef.addImageStroke === "function") {
            pageRef.addImageStroke({
              uri: res.imageUrl,
              width: 300,
              height: 300,
            });
            setOverviewVisible(false);
          }
          return;
        }

        if (typeStr.includes("ICON")) {
          const page = pages[activeIndex];
          if (!page || page.id == null) return;
          const pageRef = pageRefs.current[page.id];
          if (pageRef && typeof pageRef.addImageStroke === "function") {
            pageRef.addImageStroke({
              uri: res.itemUrl,
              width: 240,
              height: 240,
            });
            setOverviewVisible(false);
          }
          return;
        }

        if (typeStr.includes("TEMPLATE")) {
          setTemplateConfirm({
            itemUrl: res.itemUrl,
            name: res.name,
          });
          return;
        }
      } catch (e) {
        console.warn("[MultiPageCanvas] handleResourceSelect error:", e);
      }
    },
    [pages, activeIndex]
  );

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
        onResourceSelect={handleResourceSelect}
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
        onResourceSelect={handleResourceSelect}
      />

      <Modal
        visible={!!templateConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setTemplateConfirm(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* ===== HEADER ===== */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconCircle}>
                  <Icon name="auto-fix-high" size={28} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.title}>Apply Template</Text>
                  {templateConfirm?.name && (
                    <Text style={styles.templateName} numberOfLines={1}>
                      {templateConfirm.name}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => setTemplateConfirm(null)}>
                <Icon name="close" size={26} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* ===== SECTION: Apply Mode ===== */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Apply Mode</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[
                    styles.option,
                    applyMode === "append" && styles.optionActive,
                  ]}
                  onPress={() => setApplyMode("append")}
                >
                  <Icon
                    name="playlist-add"
                    size={22}
                    color={applyMode === "append" ? "#2563EB" : "#64748B"}
                  />
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.optionLabel,
                        applyMode === "append" && styles.activeText,
                      ]}
                    >
                      Append
                    </Text>
                    <Text style={styles.optionDesc}>
                      Keep current content, add template to the end
                    </Text>
                  </View>
                  {applyMode === "append" && (
                    <Icon name="check" size={24} color="#2563EB" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.option,
                    applyMode === "replace" && styles.optionActive,
                  ]}
                  onPress={() => setApplyMode("replace")}
                >
                  <Icon
                    name="refresh"
                    size={22}
                    color={applyMode === "replace" ? "#2563EB" : "#64748B"}
                  />
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.optionLabel,
                        applyMode === "replace" && styles.activeText,
                      ]}
                    >
                      Replace
                    </Text>
                    <Text style={styles.optionDesc}>
                      Clear current content, replace with template
                    </Text>
                  </View>
                  {applyMode === "replace" && (
                    <Icon name="check" size={24} color="#2563EB" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* ===== SECTION: Layer Placement ===== */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Layer Placement</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[
                    styles.option,
                    placeTemplateOnNewLayer && styles.optionActive,
                  ]}
                  onPress={() => setPlaceTemplateOnNewLayer(true)}
                >
                  <Icon
                    name="layers"
                    size={22}
                    color={placeTemplateOnNewLayer ? "#2563EB" : "#64748B"}
                  />
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.optionLabel,
                        placeTemplateOnNewLayer && styles.activeText,
                      ]}
                    >
                      New Layer
                    </Text>
                    <Text style={styles.optionDesc}>
                      Create a new layer, easier to edit later
                    </Text>
                  </View>
                  {placeTemplateOnNewLayer && (
                    <Icon name="check" size={24} color="#2563EB" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.option,
                    !placeTemplateOnNewLayer && styles.optionActive,
                  ]}
                  onPress={() => setPlaceTemplateOnNewLayer(false)}
                >
                  <Icon
                    name="merge-type"
                    size={22}
                    color={!placeTemplateOnNewLayer ? "#2563EB" : "#64748B"}
                  />
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.optionLabel,
                        !placeTemplateOnNewLayer && styles.activeText,
                      ]}
                    >
                      Merge Layer
                    </Text>
                    <Text style={styles.optionDesc}>
                      Merge directly into the current layer
                    </Text>
                  </View>
                  {!placeTemplateOnNewLayer && (
                    <Icon name="check" size={24} color="#2563EB" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* ===== ACTION BUTTONS ===== */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.currentBtn]}
                onPress={async () => {
                  const page = pages[activeIndex];
                  if (page?.id) {
                    await applyTemplateToPage(
                      page.id,
                      templateConfirm.itemUrl,
                      applyMode
                    );
                    setTemplateConfirm(null);
                    setOverviewVisible(false);
                  }
                }}
              >
                <Icon name="description" size={20} color="#FFF" />
                <Text style={styles.actionText}>Current Page Only</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.allBtn]}
                onPress={async () => {
                  for (const p of pages) {
                    if (p?.id)
                      await applyTemplateToPage(
                        p.id,
                        templateConfirm.itemUrl,
                        applyMode
                      );
                  }
                  setTemplateConfirm(null);
                  setOverviewVisible(false);
                }}
              >
                <Icon name="library-books" size={20} color="#FFF" />
                <Text style={styles.actionText}>All Pages</Text>
              </TouchableOpacity>
            </View>

            {/* ===== UNDO + CANCEL ===== */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.undoBtn}
                onPress={() => {
                  const page = pages[activeIndex];
                  if (page?.id) unapplyLastTemplate(page.id);
                  setTemplateConfirm(null);
                  setOverviewVisible(false);
                }}
              >
                <Icon
                  name="settings-backup-restore"
                  size={19}
                  color="#D97706"
                />
                <Text style={styles.undoText}>Undo Last Template</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setTemplateConfirm(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pages - Wrapped with Gesture Detector for project-wide zoom */}
      <View
        style={{
          flex: 1,
          overflow: "hidden",
          paddingLeft: sidebarVisible ? 280 : 0,
        }}
      >
        <GestureDetector
          gesture={Gesture.Simultaneous(pinch, pan, scrollGesture)}
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
              // ✅ Always scrollable except in zoom mode - improves responsiveness
              scrollEnabled={tool !== "zoom"}
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
                        projectId,
                        userId,
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
                        tapeSettings, // ✅ Pass tape settings
                        shapeSettings, // ✅ Pass shape settings
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
                        onColorPicked,
                        scrollOffsetY: scrollY - (offsets[activeIndex] ?? 0),
                        scrollYShared, // ✅ Animated scroll value
                        pageOffsetY: offsets[i] ?? 0, // ✅ Page offset trong project
                        backgroundColor: p.backgroundColor,
                        pageTemplate: p.template,
                        backgroundImageUrl: p.imageUrl,
                        isCover: p.type === "cover",
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
                        // 🔄 REALTIME COLLABORATION props
                        collabEnabled,
                        collabConnected,
                        onCollabElementUpdate,
                        onCollabElementCreate,
                        onCollabElementDelete,
                        onCollabRequestLock,
                        onCollabReleaseLock,
                        onCollabIsElementLocked,
                        onCollabPageCreate,
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modal: {
    width: "92%",
    maxWidth: 460, // rộng hơn & đẹp trên tablet
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  title: { fontSize: 20, fontWeight: "800", color: "#111827" },
  templateName: { fontSize: 13.5, color: "#64748B", marginTop: 2 },

  // Section
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
  },

  // Option
  optionRow: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.3,
    borderColor: "#E2E8F0",
  },
  optionActive: { backgroundColor: "#EFF6FF", borderColor: "#3B82F6" },

  optionText: { flex: 1, marginLeft: 10 },
  optionLabel: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  optionDesc: { fontSize: 13, color: "#64748B", marginTop: 2 },
  activeText: { color: "#2563EB" },

  // Buttons
  actions: { flexDirection: "row", gap: 10, marginBottom: 16 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  currentBtn: { backgroundColor: "#3B82F6" },
  allBtn: { backgroundColor: "#059669" },

  actionText: { color: "#FFF", fontSize: 15, fontWeight: "700" },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  undoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: "#F59E0B",
  },
  undoText: { color: "#D97706", fontSize: 14, fontWeight: "600" },

  cancelBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  cancelText: { color: "#475569", fontSize: 14.5, fontWeight: "600" },
});
