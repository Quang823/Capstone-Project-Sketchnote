import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import CanvasContainer from "./CanvasContainer";
import { projectService } from "../../../service/projectService";

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
    layers,
    activeLayerId,
    setLayers,
    rulerPosition,
    onColorPicked, // 👈 Thêm prop
  },
  ref
) {
  const drawingDataRef = useRef({ pages: {} });
  const [pages, setPages] = useState([{ id: 1 }]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageLayouts, setPageLayouts] = useState({});
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef(null);
  const lastAddedRef = useRef(null);
  const pageRefs = useRef({});

  const { height } = Dimensions.get("window");
  const PAGE_SPACING = 30;
  const fallbackHeight = Math.round(height * 0.9);

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

  // ➕ Thêm page mới
  const addPage = useCallback(() => {
    if (pages.length >= 10) {
      Alert.alert("Limit", "You can only create up to 10 pages.");
      return;
    }
    const newId = Date.now();
    lastAddedRef.current = newId;
    setPages((prev) => [...prev, { id: newId }]);
    onActivePageChange?.(newId);
  }, [pages, onActivePageChange]);

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
  const handleScroll = (e) => {
    const offset = e.nativeEvent.contentOffset.y;
    setScrollY(offset);
    if (__DEV__) {
      // Sampled log to avoid spamming
      if (Math.abs((handleScroll.__last || 0) - offset) > 200) {
        // console.log("[MultiPageCanvas] scrollY=", offset);
        handleScroll.__last = offset;
      }
    }

    // Đảm bảo cập nhật scrollOffsetY cho tất cả các trang
    Object.values(pageRefs.current).forEach((pageRef) => {
      if (pageRef && pageRef.setScrollOffsetY) {
        pageRef.setScrollOffsetY(offset - (offsets[activeIndex] ?? 0));
      }
    });

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

  // 🧾 Layout height tracking
  const onPageLayout = (pageId, layoutHeight) => {
    setPageLayouts((prev) =>
      prev[pageId] === layoutHeight ? prev : { ...prev, [pageId]: layoutHeight }
    );
  };

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
        <ScrollView
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
        </ScrollView>
      </View>

      {/* Pages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {pages.map((p) => (
          <View
            key={p.id}
            style={{
              marginBottom: PAGE_SPACING,
              width: "100%",
              alignItems: "center",
            }}
            onLayout={(e) => onPageLayout(p.id, e.nativeEvent.layout.height)}
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
                layers,
                activeLayerId,
                setLayers,
                isPenMode,
                rulerPosition,
                onColorPicked,
                scrollOffsetY: scrollY - (offsets[activeIndex] ?? 0),
              }}
              pageId={p.id}
              onChangeStrokes={(strokes) =>
                (drawingDataRef.current.pages[p.id] = strokes)
              }
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

export default MultiPageCanvas;
