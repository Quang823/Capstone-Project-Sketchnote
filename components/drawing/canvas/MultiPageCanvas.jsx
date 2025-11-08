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
import DocumentSidebar from "../sidebar/DocumentSidebar";
import { projectService } from "../../../service/projectService";
import { calculatePageDimensions } from "../../../utils/pageDimensions";

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
  const drawingDataRef = useRef({ pages: {} });

  // Sidebar state
  const [sidebarVisible, setSidebarVisible] = useState(true);

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
    // ✅ Chỉ tạo cover page từ noteConfig.cover nếu:
    //    - Có hasCover và cover config
    //    - VÀ page đầu tiên từ API KHÔNG phải là cover (pageNumber !== 1)
    if (noteConfig.hasCover && noteConfig.cover && !isFirstPageCover) {
      pages.push({
        id: 1,
        type: "cover",
        backgroundColor: noteConfig.cover.color,
        template: noteConfig.cover.template,
        imageUrl: noteConfig.cover.imageUrl,
      });
    }

    // Add pages based on noteConfig.pages if provided
    if (Array.isArray(noteConfig.pages) && noteConfig.pages.length > 0) {
      noteConfig.pages.forEach((p, index) => {
        // ✅ Nếu page đầu tiên có pageNumber === 1, đó là cover page
        //    Dùng id = 1 và type = "cover" cho nó
        if (index === 0 && p.pageNumber === 1) {
          pages.push({
            id: 1,
            type: "cover",
            backgroundColor: noteConfig.cover?.color || paperBg,
            template: noteConfig.cover?.template || paperTemplate,
            imageUrl: noteConfig.cover?.imageUrl,
            pageNumber: p.pageNumber,
            strokeUrl: p.strokeUrl,
          });
        } else {
          // Paper pages: dùng pageId từ API hoặc pageNumber + offset
          const id = p.pageId ? Number(p.pageId) : Number(p.pageNumber) + 10000;
          pages.push({
            id,
            type: "paper",
            backgroundColor: paperBg,
            template: paperTemplate,
            pageNumber: p.pageNumber,
            strokeUrl: p.strokeUrl,
          });
        }
      });
    } else {
      // Fallback to a single editable page
      pages.push({
        id: pages.length + 1,
        type: "paper",
        backgroundColor: paperBg,
        template: paperTemplate,
      });
    }

    return pages;
  }, [noteConfig]);

  const [pages, setPages] = useState(initialPages);

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

  // 🧭 Scroll tới page
  const scrollToPage = useCallback(
    (index) => {
      if (index < 0 || index >= pages.length) return;
      const y = offsets[index] ?? 0;
      scrollRef.current?.scrollTo({ y, animated: true });
      setActiveIndex(index);
      onActivePageChange?.(pages[index]?.id);
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
    // Throttle bằng RAF để giảm tần suất setState
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      // throttle tiny moves to avoid spamming JS (reduced to 1px for better transform box sync)
      if (Math.abs(offset - lastHandledScrollRef.current) < 1) return;

      lastHandledScrollRef.current = offset;

      setScrollY(offset);

      // Compute visible window
      const viewTop = offset;
      const viewBottom = offset + height;

      // Find visible range (binary search-like approach)
      let firstVisible = 0;
      let lastVisible = pages.length - 1;

      // Find first visible page
      for (let i = 0; i < pages.length; i++) {
        const top = offsets[i] ?? 0;
        const h = pageLayouts[pages[i].id] ?? fallbackHeight;
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
        const pageRef = pageRefs.current[p.id];
        pageRef?.setScrollOffsetY?.(offset - (offsets[i] ?? 0));
      }

      // compute active page (midpoint method)
      let current = pages.length - 1;
      for (let i = 0; i < offsets.length; i++) {
        const start = offsets[i];
        const end =
          i + 1 < offsets.length
            ? offsets[i + 1]
            : start +
              (pageLayouts[pages[i].id] ?? fallbackHeight) +
              PAGE_SPACING;
        const mid = start + (end - start) / 2;
        if (offset < mid) {
          current = i;
          break;
        }
      }

      if (current !== activeIndex) {
        setActiveIndex(current);
        onActivePageChange?.(pages[current]?.id);
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
    .enabled(!zoomLocked)
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
    .enabled(!zoomLocked)
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

  // 🪄 Public API
  useImperativeHandle(ref, () => ({
    scrollToPage,
    addPage,

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

    getProjectData: () => {
      const allPages = Object.keys(pageRefs.current).map((id) => {
        const strokes =
          pageRefs.current[id]?.getStrokes?.() ||
          drawingDataRef.current.pages[id] ||
          [];
        return { id, strokes };
      });
      return { createdAt: new Date().toISOString(), pages: allPages };
    },

    uploadAllPages: async () => {
      const results = [];
      for (let index = 0; index < pages.length; index++) {
        const page = pages[index];

        try {
          // Thu thập strokes từ page hiện tại (theo layer)
          const strokes =
            pageRefs.current[page.id]?.getStrokes?.() ||
            drawingDataRef.current.pages[page.id] ||
            [];

          // Tạo JSON để lưu (bao gồm metadata cover/background)
          const jsonData = {
            id: page.id,
            createdAt: new Date().toISOString(),
            type: page.type || "paper",
            backgroundColor: page.backgroundColor,
            template: page.template,
            imageUrl: page.imageUrl,
            strokes,
          };

          // Xác định pageNumber để lưu xuống backend/S3
          const fallbackNumber = index + 1; // 1-based index (cover = 1)
          const pageNumber =
            typeof page.pageNumber === "number"
              ? page.pageNumber
              : page.type === "cover"
              ? 1
              : fallbackNumber;

          const fileName = `${
            noteConfig?.projectId || "project"
          }-page-${pageNumber}.json`;
          const { uploadUrl, strokeUrl } = await projectService.getPresign(
            fileName,
            "JSON"
          );

          // Upload JSON
          const finalUrl = await projectService.uploadToPresignedUrl(
            jsonData,
            uploadUrl
          );
          results.push({
            pageId: pageNumber,
            url: finalUrl || strokeUrl,
            type: page.type || "paper",
          });
        } catch (e) {
          console.error(`Error uploading page ${page.id}:`, e);
        }
      }
      return results;
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
                // console.log(
                //   `[MultiPageCanvas] Loading ${safeStrokes.length} strokes into page id: ${p.id}`
                // );
                try {
                  pageRef.loadStrokes(safeStrokes);
                  // console.log(
                  //   `[MultiPageCanvas] Successfully loaded strokes into page id: ${p.id}`
                  // );
                } catch (loadError) {
                  // console.error(
                  //   `[MultiPageCanvas] Error loading strokes into page id: ${p.id}:`,
                  //   loadError
                  // );
                }
              } else if (retries > 0) {
                // Retry sau 200ms nếu pageRef chưa sẵn sàng
                console.log(
                  `[MultiPageCanvas] Page ref not ready for id: ${p.id}, retrying... (${retries} retries left)`
                );
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
        activePageId={pages[activeIndex]?.id}
        onPageSelect={(pageId) => {
          const index = pages.findIndex((p) => p.id === pageId);
          if (index !== -1) scrollToPage(index);
        }}
        onAddPage={addPage}
        resourceItems={[]}
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
              scrollEventThrottle={16}
              decelerationRate="normal" // Thêm để scroll mượt hơn
              showsVerticalScrollIndicator={false}
              // Chỉ cho phép scroll khi không đang zoom & không phóng to
              scrollEnabled={!isZooming && !isZoomedIn}
              simultaneousHandlers={scrollRef}
              onLayout={(e) => {
                const h = e?.nativeEvent?.layout?.height;
                if (Number.isFinite(h) && h > 0) setContainerHeight(h);
              }}
            >
              {pages.map((p, i) => (
                <View
                  key={p.id}
                  style={{
                    marginBottom: PAGE_SPACING,
                    width: "100%",
                    alignItems: "center",
                  }}
                  onLayout={(e) =>
                    onPageLayout(p.id, e.nativeEvent.layout.height)
                  }
                >
                  <CanvasContainer
                    // MultiPageCanvas.jsx
                    ref={(ref) => {
                      // Always keep pageRefs in sync immediately (no setState)
                      pageRefs.current[p.id] = ref || null;
                      if (typeof registerPageRef === "function") {
                        registerPageRef(p.id, ref || null);
                      }
                    }}
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
                    }}
                    pageId={p.id}
                    onChangeStrokes={(strokes) =>
                      (drawingDataRef.current.pages[p.id] = strokes)
                    }
                  />
                </View>
              ))}
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

      {/* Zoom Control Buttons */}
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
        </TouchableOpacity>{" "}
      </View>
    </View>
  );
});

export default memo(MultiPageCanvas);
