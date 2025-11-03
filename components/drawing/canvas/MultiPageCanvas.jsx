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
import { projectService } from "../../../service/projectService";
import { calculatePageDimensions } from "../../../utils/pageDimensions";

const MultiPageCanvas = forwardRef(function MultiPageCanvas(
  {
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
    isPenMode,
    pageLayers, // 👈 Changed from layers to pageLayers
    activeLayerId,
    setPageLayers, // 👈 Changed from setLayers to setPageLayers
    rulerPosition,
    onColorPicked,
    noteConfig,
  },
  ref
) {
  const drawingDataRef = useRef({ pages: {} });

  // Initialize pages based on noteConfig
  const initialPages = useMemo(() => {
    if (!noteConfig) return [{ id: 1 }];

    const pages = [];

    // Add cover page if enabled
    if (noteConfig.hasCover && noteConfig.cover) {
      pages.push({
        id: 1,
        type: "cover",
        backgroundColor: noteConfig.cover.color,
        template: noteConfig.cover.template,
        imageUrl: noteConfig.cover.imageUrl,
      });
    }

    // Add first paper page
    pages.push({
      id: pages.length + 1,
      type: "paper",
      backgroundColor: noteConfig.paper?.color || "#FFFFFF",
      template: noteConfig.paper?.template || "blank",
    });

    return pages;
  }, [noteConfig]);

  const [pages, setPages] = useState(initialPages);

  // Initialize layers for initial pages
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
  }, [initialPages, setPageLayers]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageLayouts, setPageLayouts] = useState({});
  const [scrollY, setScrollY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isZooming, setIsZooming] = useState(false); // Track zoom state to disable scroll
  const [zoomPercent, setZoomPercent] = useState(100);
  const [zoomLocked, setZoomLocked] = useState(false);
  const [showZoomOverlay, setShowZoomOverlay] = useState(false);

  // Zoom state - áp dụng cho toàn bộ project
  const projectScale = useSharedValue(1);
  const baseProjectScale = useSharedValue(1);
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
  const PAGE_SPACING = 30;
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
    // throttle tiny moves to avoid spamming JS
    if (Math.abs(offset - lastHandledScrollRef.current) < 4) return;

    lastHandledScrollRef.current = offset;

    setScrollY(offset);

    // compute visible window
    const viewTop = offset;
    const viewBottom = offset + height;

    // only update pageRefs that overlap the visible window
    pages.forEach((p, i) => {
      const top = offsets[i] ?? 0;
      const h = pageLayouts[p.id] ?? fallbackHeight;
      const bottom = top + h + PAGE_SPACING;
      const isVisible = bottom >= viewTop && top <= viewBottom;

      if (isVisible) {
        const pageRef = pageRefs.current[p.id];
        pageRef?.setScrollOffsetY?.(offset - (offsets[i] ?? 0));
      }
    });

    // compute active page (midpoint method) — same idea as before
    let current = pages.length - 1;
    for (let i = 0; i < offsets.length; i++) {
      const start = offsets[i];
      const end =
        i + 1 < offsets.length
          ? offsets[i + 1]
          : start + (pageLayouts[pages[i].id] ?? fallbackHeight) + PAGE_SPACING;
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
  const pinch = Gesture.Pinch()
    .enabled(!zoomLocked)
    .onStart((e) => {
      "worklet";
      try {
        baseProjectScale.value = projectScale.value;
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

        const newScale = baseProjectScale.value * scaleDelta;
        if (newScale < 0.5) {
          projectScale.value = 0.5;
        } else if (newScale > 3) {
          projectScale.value = 3;
        } else {
          projectScale.value = newScale;
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
        runOnJS(setShowZoomOverlay)(false);
        // Re-enable scroll khi zoom xong
        runOnJS(setIsZooming)(false);
      } catch (err) {
        console.warn("[Pinch.onEnd] Error:", err);
      }
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

  const projectAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: projectScale.value }],
  }));

  // 🪄 Public API
  useImperativeHandle(ref, () => ({
    scrollToPage,
    addPage,

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
      try {
        const results = [];
        for (const pageId of Object.keys(pageRefs.current)) {
          const strokes =
            pageRefs.current[pageId]?.getStrokes?.() ||
            drawingDataRef.current.pages[pageId] ||
            [];
          if (!strokes.length) continue;

          const pageData = {
            id: pageId,
            createdAt: new Date().toISOString(),
            strokes,
          };

          const fileName = `Test-${pageId}`;
          const url = await projectService.uploadProjectFile(
            pageData,
            fileName
          );
          results.push({ pageId, url });
        }
        return results;
      } catch (err) {
        console.error("❌ Upload thất bại:", err);
        throw err;
      }
    },

    // 📊 Insert table vào active page
    insertTable: (rows, cols) => {
      const activePage = pages[activeIndex];
      if (activePage && pageRefs.current[activePage.id]) {
        pageRefs.current[activePage.id]?.insertTable?.(rows, cols);
      }
    },

    loadProjectData: (data) => {
      if (!data) return;
      if (Array.isArray(data.pages)) {
        data.pages.forEach((p) =>
          pageRefs.current[p.id]?.loadStrokes?.(p.strokes)
        );
      } else if (data.strokes) {
        pageRefs.current[data.id || 1]?.loadStrokes?.(data.strokes);
      }
    },
  }));

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {/* Sidebar */}
      <View
        style={{
          width: 60,
          backgroundColor: "#fafafa",
          borderRightWidth: 1,
          borderColor: "#ddd",
          alignItems: "center",
        }}
      >
        <Animated.ScrollView
          contentContainerStyle={{ alignItems: "center", paddingVertical: 10 }}
        >
          {pages.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => scrollToPage(i)}
              style={{
                marginBottom: 12,
                width: 40,
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 6,
                borderWidth: 1,
                borderColor: activeIndex === i ? "#007AFF" : "#ccc",
                backgroundColor: activeIndex === i ? "#E6F0FF" : "#fff",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color: activeIndex === i ? "#007AFF" : "#333",
                }}
              >
                {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={addPage}
            style={{
              marginTop: 8,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#007AFF",
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 20 }}>＋</Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      </View>

      {/* Pages - Wrapped with Gesture Detector for project-wide zoom */}
      <View style={{ flex: 1, overflow: "hidden" }}>
        <GestureDetector gesture={pinch} simultaneousHandlers={scrollRef}>
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
              scrollEventThrottle={8} // Giảm xuống 8 để tăng độ nhạy
              decelerationRate="normal" // Thêm để scroll mượt hơn
              showsVerticalScrollIndicator={false}
              scrollEnabled={!isZooming} // Disable scroll when zooming
              simultaneousHandlers={scrollRef}
            >
              {pages.map((p) => (
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
                      // Defer calling registerPageRef to avoid setState during render
                      if (typeof registerPageRef === "function") {
                        setTimeout(() => registerPageRef(p.id, ref || null), 0);
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
                      isPenMode,
                      rulerPosition,
                      onColorPicked,
                      scrollOffsetY: scrollY - (offsets[activeIndex] ?? 0),
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
              scrollY={scrollY}
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
              Math.max(projectScale.value - 0.2, 0.5),
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
