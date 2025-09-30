import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import CanvasContainer from "./CanvasContainer";

export default function MultiPageCanvas({
  tool,
  color,
  strokeWidth,
  pencilWidth,
  eraserWidth,
  brushWidth,
  brushOpacity,
  calligraphyWidth,
  calligraphyOpacity,
  paperStyle,
  shapeType,
  onRequestTextInput,
  registerPageRef,
  onPageChange, // callback báo cho DrawingScreen page active (pageId)
}) {
  const [pages, setPages] = useState([{ id: 1 }]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageLayouts, setPageLayouts] = useState({}); // { [pageId]: height }
  const scrollRef = useRef(null);
  const lastAddedRef = useRef(null);

  const { height } = Dimensions.get("window");
  const PAGE_SPACING = 30; // marginBottom as used in layout

  // fallback height when a page hasn't reported its layout yet
  const fallbackHeight = Math.round(height * 0.9);

  // offsets: cumulative top positions for each page (based on pages order)
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

  // add page: create id, set state, save lastAddedRef so we can auto-scroll when layout comes in
  const addPage = () => {
    const newId = Date.now();
    lastAddedRef.current = newId;
    setPages((prev) => [...prev, { id: newId }]);
    // onPageChange will be triggered once layout measured (see effect below)
  };

  // if user taps sidebar page (index), scroll to its offset
  const scrollToPage = (index) => {
    const y = offsets[index] ?? 0;
    scrollRef.current?.scrollTo({ y, animated: true });
    setActiveIndex(index);
    onPageChange?.(pages[index]?.id);
  };

  // When pageLayouts receives measurement for the lastAdded page, auto-scroll it and set active
  useEffect(() => {
    const id = lastAddedRef.current;
    if (!id) return;
    // check if measured
    if (pageLayouts[id]) {
      const idx = pages.findIndex((p) => p.id === id);
      if (idx >= 0) {
        const y = offsets[idx] ?? 0;
        // give the layout a tick before scrolling to ensure visual stability
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ y, animated: true });
          setActiveIndex(idx);
          onPageChange?.(id);
          lastAddedRef.current = null;
        });
      }
    }
  }, [pageLayouts, pages, offsets, onPageChange]);

  // called when ScrollView is scrolled - determine visible page by offsets
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
      onPageChange?.(pages[current]?.id);
    }
  };

  // helper to update measured layout height per page
  const onPageLayout = (pageId, layoutHeight) => {
    setPageLayouts((prev) => {
      // avoid unnecessary state updates
      if (prev[pageId] === layoutHeight) return prev;
      return { ...prev, [pageId]: layoutHeight };
    });
  };

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {/* Sidebar page list */}
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

          {/* Add page button (below list) */}
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

      {/* Pages scroll */}
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
                // register or unregister ref in parent (DrawingScreen)
                registerPageRef?.(p.id, ref ?? null);
              }}
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              pencilWidth={pencilWidth}
              eraserWidth={eraserWidth}
              brushWidth={brushWidth}
              brushOpacity={brushOpacity}
              calligraphyWidth={calligraphyWidth}
              calligraphyOpacity={calligraphyOpacity}
              paperStyle={paperStyle}
              pageId={p.id}
              shapeType={shapeType}
              onRequestTextInput={onRequestTextInput}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
