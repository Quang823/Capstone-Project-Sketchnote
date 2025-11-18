// components/text/TextSelectionBox.jsx
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Text,
} from "react-native";

export default function TextSelectionBox({
  x,
  y,
  width,
  height,
  onMove, // (dx, dy) incremental deltas
  onResize, // (corner, dx, dy)
  onResizeStart, // (corner)
  onResizeEnd, // ()
  onDelete,
  onCut,
  onCopy,
  onEdit, // open editor on tap
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pos = useRef(new Animated.ValueXY({ x, y })).current;
  const draggingRef = useRef(false);

  // Refs to avoid stale closures inside PanResponder
  const boxRef = useRef({ x, y }); // latest props
  const startPos = useRef({ x: 0, y: 0 }); // touch start (global)
  const startBoxRef = useRef({ x: 0, y: 0 }); // box origin at gesture start

  // lastReportedRef = last absolute position we observed (used to compute diffs)
  const lastReportedRef = useRef({ x, y });

  // Throttling helpers
  const framePendingRef = useRef(false);
  const rafIdRef = useRef(null);
  const pendingDeltaRef = useRef({ x: 0, y: 0 });

  const dotSize = 10;
  const half = dotSize / 2;
  const startTime = useRef(0);

  // fade in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // keep boxRef and Animated.Value in sync when parent moves the box
  useEffect(() => {
    boxRef.current = { x, y };
    if (!draggingRef.current) {
      pos.setValue({ x, y });
      lastReportedRef.current = { x, y };
      pendingDeltaRef.current = { x: 0, y: 0 };
      framePendingRef.current = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    }
  }, [x, y, pos]);

  useEffect(() => {
    return () => {
      // cleanup RAF on unmount
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      framePendingRef.current = false;
    };
  }, []);

  // schedule flush of accumulated pendingDelta to parent (one RAF per frame)
  const scheduleFlush = () => {
    if (framePendingRef.current) return;
    framePendingRef.current = true;
    rafIdRef.current = requestAnimationFrame(() => {
      framePendingRef.current = false;
      rafIdRef.current = null;
      const pd = pendingDeltaRef.current;
      // send only meaningful movement
      if (Math.abs(pd.x) >= 0.5 || Math.abs(pd.y) >= 0.5) {
        try {
          onMove?.(pd.x, pd.y);
        } catch (e) {
          // defensive: ensure parent errors don't break RAF loop
          console.warn("onMove error:", e);
        }
      }
      // reset pending
      pendingDeltaRef.current = { x: 0, y: 0 };
    });
  };

  // PanResponder for moving the whole box: uses refs (no stale props)
  const movePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, g) => {
        startPos.current = { x: g.x0, y: g.y0 };
        // store the box origin at the moment gesture starts
        startBoxRef.current = { ...boxRef.current };
        draggingRef.current = true;
        // lastReportedRef is the last absolute position we used for diff calculations
        lastReportedRef.current = { ...startBoxRef.current };
        // reset pending
        pendingDeltaRef.current = { x: 0, y: 0 };
        framePendingRef.current = false;
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        startTime.current = Date.now();
      },
      onPanResponderMove: (_, g) => {
        const dx = g.moveX - startPos.current.x;
        const dy = g.moveY - startPos.current.y;

        // compute new absolute position based on box origin at gesture start
        const newX = startBoxRef.current.x + dx;
        const newY = startBoxRef.current.y + dy;

        // update Animated value for smooth UI (native)
        pos.setValue({ x: newX, y: newY });

        // compute incremental delta since lastReportedRef, accumulate to pending
        const diffX = newX - lastReportedRef.current.x;
        const diffY = newY - lastReportedRef.current.y;
        // accumulate
        pendingDeltaRef.current.x += diffX;
        pendingDeltaRef.current.y += diffY;
        // move lastReportedRef forward so next diff is relative to this move
        lastReportedRef.current = { x: newX, y: newY };

        // schedule one RAF to flush per frame
        scheduleFlush();
      },
      onPanResponderRelease: () => {
        const endTime = Date.now();
        const duration = endTime - startTime.current;
        const dist = Math.hypot(
          lastReportedRef.current.x - startBoxRef.current.x,
          lastReportedRef.current.y - startBoxRef.current.y
        );

        // flush remaining pending synchronously (avoid losing small delta)
        const pd = pendingDeltaRef.current;
        if (Math.abs(pd.x) >= 0.5 || Math.abs(pd.y) >= 0.5) {
          try {
            // cancel pending RAF if any to avoid double-send
            if (rafIdRef.current) {
              cancelAnimationFrame(rafIdRef.current);
              rafIdRef.current = null;
              framePendingRef.current = false;
            }
            onMove?.(pd.x, pd.y);
          } catch (e) {
            console.warn("onMove error:", e);
          }
        }
        pendingDeltaRef.current = { x: 0, y: 0 };

        // if it was a quick tap (tiny movement) interpret as edit/tap
        if (duration < 200 && dist < 3) {
          requestAnimationFrame(() => onEdit?.());
        }

        // ensure final sync with parent values (parent normally updates via onMove)
        lastReportedRef.current = { ...boxRef.current };
        draggingRef.current = false;
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        // gesture cancelled: flush & reset
        const pd2 = pendingDeltaRef.current;
        if (Math.abs(pd2.x) >= 0.5 || Math.abs(pd2.y) >= 0.5) {
          try {
            if (rafIdRef.current) {
              cancelAnimationFrame(rafIdRef.current);
              rafIdRef.current = null;
              framePendingRef.current = false;
            }
            onMove?.(pd2.x, pd2.y);
          } catch (e) {}
        }
        pendingDeltaRef.current = { x: 0, y: 0 };
        lastReportedRef.current = { ...boxRef.current };
      },
    })
  ).current;

  // Resize handles (closure ok because they immediately call onResize)
  const makeResizePan = (corner) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        onResizeStart?.(corner);
      },
      onPanResponderMove: (_, g) => {
        onResize?.(corner, g.dx, g.dy);
      },
      onPanResponderRelease: () => {
        onResizeEnd?.();
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        onResizeEnd?.();
      },
    });

  const cornerPans = {
    tl: useRef(makeResizePan("tl")).current,
    tr: useRef(makeResizePan("tr")).current,
    bl: useRef(makeResizePan("bl")).current,
    br: useRef(makeResizePan("br")).current,
  };

  return (
    <Animated.View
      style={[
        styles.box,
        {
          width,
          height,
          opacity: fadeAnim,
          transform: [{ translateX: pos.x }, { translateY: pos.y }],
        },
      ]}
    >
      {/* toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={onCopy}>
          <Text style={styles.toolText}>Copy</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.toolBtn} onPress={onCut}>
          <Text style={styles.toolText}>Cut</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.toolBtn} onPress={onDelete}>
          <Text style={[styles.toolText, { color: "#DC2626" }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* move area (captures pan) */}
      <View
        style={StyleSheet.absoluteFill}
        {...movePan.panHandlers}
        pointerEvents="box-only"
      />

      {/* 4 resize dots */}
      <View
        {...cornerPans.tl.panHandlers}
        style={[styles.dot, { top: -half, left: -half }]}
      />
      <View
        {...cornerPans.tr.panHandlers}
        style={[styles.dot, { top: -half, right: -half }]}
      />
      <View
        {...cornerPans.bl.panHandlers}
        style={[styles.dot, { bottom: -half, left: -half }]}
      />
      <View
        {...cornerPans.br.panHandlers}
        style={[styles.dot, { bottom: -half, right: -half }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    borderStyle: "dashed",
    borderRadius: 6,
    zIndex: 100,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    overflow: "visible",
  },
  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    backgroundColor: "#3B82F6",
    borderWidth: 1.5,
    borderColor: "#fff",
    borderRadius: 6,
    zIndex: 101,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1.5,
  },
  toolbar: {
    position: "absolute",
    top: -58,
    left: "50%",
    transform: [{ translateX: -90 }],
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 4,
    zIndex: 200,
    width: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  toolBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  toolText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginHorizontal: 6,
    alignSelf: "center",
  },
});
