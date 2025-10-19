import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
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
  },
  ref
) {
  const drawingDataRef = useRef({
    pages: {}, // key là pageId, value là mảng strokes
  });
  const [pages, setPages] = useState([{ id: 1 }]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageLayouts, setPageLayouts] = useState({});
  const [scrollY, setScrollY] = useState(0); // 🆕 lưu scroll hiện tại
  const scrollRef = useRef(null);
  const lastAddedRef = useRef(null);

  const { height } = Dimensions.get("window");
  const PAGE_SPACING = 30;
  const fallbackHeight = Math.round(height * 0.9);

  const pageRefs = useRef({});

  // Tính offset cho từng page
  const offsets = useMemo(() => {
    let acc = 0;
    return pages.map((p) => {
      const off = acc;
      const h = pageLayouts[p.id] ?? fallbackHeight;
      acc += h + PAGE_SPACING;
      return off;
    });
  }, [pages, pageLayouts, fallbackHeight]);

  // Thêm page mới
  const addPage = () => {
    if (pages.length >= 10) {
      Alert.alert("Limit. You can only create up to 10 pages.");
      return;
    }
    const newId = Date.now();
    lastAddedRef.current = newId;
    setPages((prev) => [...prev, { id: newId }]);
    onActivePageChange?.(newId);
  };

  // Scroll tới page
  const scrollToPage = (index) => {
    if (index < 0 || index >= pages.length) return;
    const y = offsets[index] ?? 0;
    scrollRef.current?.scrollTo({ y, animated: true });
    setActiveIndex(index);
    onActivePageChange?.(pages[index]?.id);
  };

  // Khi page mới thêm xong layout, scroll tới
  useEffect(() => {
    const id = lastAddedRef.current;
    if (!id) return;

    if (pageLayouts[id]) {
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
    }
  }, [pageLayouts, pages, offsets, onActivePageChange]);

  // Theo dõi scroll
  const handleScroll = (e) => {
    const offset = e.nativeEvent.contentOffset.y;
    setScrollY(offset); // 🆕 cập nhật scroll hiện tại

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

  const onPageLayout = (pageId, layoutHeight) => {
    setPageLayouts((prev) => {
      if (prev[pageId] === layoutHeight) return prev;
      return { ...prev, [pageId]: layoutHeight };
    });
  };

  // ======== API REF ========
  useImperativeHandle(ref, () => ({
    addImageStroke: (stroke) => {
      const activePage = pages[activeIndex];
      if (!activePage) return;
      const pageRef = pageRefs.current[activePage.id];
      const pageOffset = offsets[activeIndex] ?? 0;
      pageRef?.addImageStroke?.({
        ...stroke,
        scrollOffsetY: scrollY - pageOffset,
        scrollOffsetX: 0,
      });
    },

    addStickerStroke: (stroke) => {
      const activePage = pages[activeIndex];
      if (!activePage) return;
      const pageRef = pageRefs.current[activePage.id];
      const pageOffset = offsets[activeIndex] ?? 0;
      pageRef?.addStickerStroke?.({
        ...stroke,
        scrollOffsetY: scrollY - pageOffset,
        scrollOffsetX: 0,
      });
    },

    addTextStroke: (stroke) => {
      const activePage = pages[activeIndex];
      if (!activePage) return;
      const pageRef = pageRefs.current[activePage.id];
      const pageOffset = offsets[activeIndex] ?? 0;
      pageRef?.addTextStroke?.({
        ...stroke,
        scrollOffsetY: scrollY - pageOffset,
        scrollOffsetX: 0,
      });
    },

    scrollToPage,
    addPage,

    // 🧾 Lấy toàn bộ data
    getProjectData: () => {
      const allPages = Object.keys(pageRefs.current).map((pageId) => {
        const strokes =
          pageRefs.current[pageId]?.getStrokes?.() ||
          drawingDataRef.current.pages[pageId] ||
          [];
        return { id: pageId, strokes };
      });
      return {
        createdAt: new Date().toISOString(),
        totalPages: allPages.length,
        pages: allPages,
      };
    },

    // 🆕 Upload từng page một
    uploadAllPages: async () => {
      try {
        const uploadResults = [];

        for (const pageId of Object.keys(pageRefs.current)) {
          const strokes =
            pageRefs.current[pageId]?.getStrokes?.() ||
            drawingDataRef.current.pages[pageId] ||
            [];

          if (!strokes.length) {
            console.log(`⚪ Page ${pageId} rỗng, bỏ qua`);
            continue;
          }

          const pageData = {
            id: pageId,
            createdAt: new Date().toISOString(),
            strokes,
          };

          const fileName = `Test-${pageId}`;
          console.log(`📤 Uploading ${fileName} ...`);
          const url = await projectService.uploadProjectFile(
            pageData,
            fileName
          );
          uploadResults.push({ pageId, url });
        }

        console.log("✅ Upload xong tất cả:", uploadResults);
        return uploadResults;
      } catch (err) {
        console.error("❌ Upload tất cả pages thất bại:", err);
        throw err;
      }
    },

    loadProjectData: (data) => {
      if (!data) return;

      // Nếu JSON có nhiều trang
      if (Array.isArray(data.pages)) {
        data.pages.forEach((p) => {
          const ref = pageRefs.current[p.id];
          if (ref && Array.isArray(p.strokes)) {
            ref.loadStrokes(p.strokes); // gọi xuống từng CanvasContainer
          }
        });
      }
      // Nếu JSON chỉ có 1 trang (như "Test-1")
      else if (data.strokes) {
        const ref = pageRefs.current[data.id] || pageRefs.current[1];
        if (ref) {
          ref.loadStrokes(data.strokes);
        }
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
        {pages.map((p, i) => (
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
              ref={(ref) => {
                if (ref) {
                  registerPageRef?.(p.id, ref);
                  pageRefs.current[p.id] = ref;
                }
              }}
              tool={tool}
              color={color}
              isPenMode={isPenMode}
              strokeWidth={strokeWidth}
              pencilWidth={pencilWidth}
              eraserSize={eraserSize}
              eraserMode={eraserMode}
              brushWidth={brushWidth}
              brushOpacity={brushOpacity}
              calligraphyWidth={calligraphyWidth}
              calligraphyOpacity={calligraphyOpacity}
              paperStyle={paperStyle}
              pageId={p.id}
              shapeType={shapeType}
              onRequestTextInput={onRequestTextInput}
              toolConfigs={toolConfigs}
              pressure={pressure}
              thickness={thickness}
              stabilization={stabilization}
              onChangeStrokes={(strokes) => {
                drawingDataRef.current.pages[p.id] = strokes;
              }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

export default MultiPageCanvas;
