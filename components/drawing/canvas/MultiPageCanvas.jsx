import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import CanvasContainer from "./CanvasContainer";

export default function MultiPageCanvas({
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
}) {
  const [pages, setPages] = useState([{ id: 1 }]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageLayouts, setPageLayouts] = useState({});
  const scrollRef = useRef(null);
  const lastAddedRef = useRef(null);

  const { height } = Dimensions.get("window");
  const PAGE_SPACING = 30;
  const fallbackHeight = Math.round(height * 0.9);

  // ✅ Tính offset cho từng page để scrollTo hoạt động chính xác
  const offsets = useMemo(() => {
    const offs = [];
    let acc = 0;
    for (let i = 0; i < pages.length; i++) {
      const id = pages[i].id;
      offs.push(acc);
      const h = pageLayouts[id] ?? fallbackHeight;
      acc += h + PAGE_SPACING;
    }
    return offs;
  }, [pages, pageLayouts, fallbackHeight]);

  // ✅ Thêm page mới
  const addPage = () => {
    if (pages.length >= 10) {
      Alert.alert("Giới hạn", "Bạn chỉ có thể tạo tối đa 10 trang.");
      return;
    }
    const newId = Date.now();
    lastAddedRef.current = newId;
    setPages((prev) => [...prev, { id: newId }]);
  };

  // ✅ Scroll đến page được chọn
  const scrollToPage = (index) => {
    const y = offsets[index] ?? 0;
    scrollRef.current?.scrollTo({ y, animated: true });
    setActiveIndex(index);
    const id = pages[index]?.id;
    if (id) onActivePageChange?.(id); // ✅ gọi callback cho DrawingScreen
  };

  // ✅ Khi page mới thêm được đo layout, tự scroll tới đó
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
          onActivePageChange?.(id); // ✅ cập nhật lại active page
          lastAddedRef.current = null;
        });
      }
    }
  }, [pageLayouts, pages, offsets, onActivePageChange]);

  // ✅ Theo dõi scroll để cập nhật trang hiện tại
  const handleScroll = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    let current = pages.length - 1;
    for (let i = 0; i < offsets.length; i++) {
      const start = offsets[i];
      const end =
        i + 1 < offsets.length
          ? offsets[i + 1]
          : start + (pageLayouts[pages[i].id] ?? fallbackHeight) + PAGE_SPACING;
      const mid = start + (end - start) / 2;
      if (offsetY < mid) {
        current = i;
        break;
      }
    }
    if (current !== activeIndex) {
      setActiveIndex(current);
      const id = pages[current]?.id;
      if (id) onActivePageChange?.(id);
    }
  };

  // ✅ Cập nhật layout từng trang
  const onPageLayout = (pageId, layoutHeight) => {
    setPageLayouts((prev) => {
      if (prev[pageId] === layoutHeight) return prev;
      return { ...prev, [pageId]: layoutHeight };
    });
  };

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {/* Sidebar danh sách trang */}
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

          {/* Nút thêm trang */}
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

      {/* Scroll các trang */}
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
            onLayout={(e) => {
              const h = e.nativeEvent.layout.height;
              onPageLayout(p.id, h);
            }}
          >
            <CanvasContainer
              ref={(ref) => {
                registerPageRef?.(p.id, ref ?? null); // ✅ Đăng ký ref mỗi trang
              }}
              tool={tool}
              color={color}
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
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
