import React, { useMemo, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Switch,
} from "react-native";
import { Image } from "expo-image";
import { projectService } from "../../../service/projectService";

const ExportModal = ({
  visible,
  onClose,
  onExport,
  onShare,
  hasPro,
  hasActiveSubscription,
  projectId,
  pages: initialPages,
}) => {
  const [selected, setSelected] = useState("editable");
  const [fileName, setFileName] = useState("Unnamed note");
  const [includeBg, setIncludeBg] = useState(true);

  const [pagePreviews, setPagePreviews] = useState([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadPages = async () => {
      try {
        if (!visible) return;

        // 🔥 Check if this is a local project
        const isLocalProject = projectService.isLocalProject(projectId);

        if (isLocalProject) {
          // ✅ For local projects, use initialPages directly (no API call)
          if (Array.isArray(initialPages) && initialPages.length > 0) {
            const sorted = initialPages
              .slice()
              .sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
            if (mounted) {
              setPagePreviews(sorted);
              setSelectedPageIndex(0);
            }
          } else {
            if (mounted) {
              setPagePreviews([]);
              setSelectedPageIndex(0);
            }
          }
        } else {
          // ✅ For cloud projects, fetch from API
          if (projectId) {
            const data = await projectService.getProjectById(projectId);
            const pages = Array.isArray(data?.pages) ? data.pages : [];
            const sorted = pages
              .slice()
              .sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
            if (mounted) {
              setPagePreviews(sorted);
              setSelectedPageIndex(0);
            }
          } else if (Array.isArray(initialPages) && initialPages.length > 0) {
            const sorted = initialPages
              .slice()
              .sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
            if (mounted) {
              setPagePreviews(sorted);
              setSelectedPageIndex(0);
            }
          } else {
            if (mounted) {
              setPagePreviews([]);
              setSelectedPageIndex(0);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load pages in ExportModal:", e);
        if (mounted) {
          setPagePreviews([]);
          setSelectedPageIndex(0);
        }
      }
    };
    loadPages();
    return () => {
      mounted = false;
    };
  }, [visible, projectId, initialPages]);

  const isPro = !!(hasPro || hasActiveSubscription);

  const [resolutionKey, setResolutionKey] = useState("medium");
  const resolutionOptions = useMemo(() => {
    const base = [
      { key: "low", label: "Low", quality: 50 },
      { key: "medium", label: "Medium", quality: 75 },
      { key: "high", label: "High", quality: 90 },
    ];
    if (isPro) {
      base.push(
        { key: "hd", label: "HD", quality: 95 },
        { key: "2k", label: "2K", quality: 98 },
        { key: "4k", label: "4K", quality: 100 }
      );
    }
    return base;
  }, [isPro]);

  const [pageMode, setPageMode] = useState("all");
  const [pageRange, setPageRange] = useState("");
  const [pageList, setPageList] = useState("");

  const options = [
    {
      key: "editable",
      label: "Editable PDF",
      icon: "https://cdn-icons-png.flaticon.com/512/1827/1827933.png",
    },
    {
      key: "noneditable",
      label: "Non-editable PDF",
      icon: "https://cdn-icons-png.flaticon.com/512/565/565655.png",
    },
    {
      key: "pictures_all",
      label: "Pictures (All Pages)",
      icon: "https://cdn-icons-png.flaticon.com/512/747/747968.png",
    },
    {
      key: "sketchnote_s3",
      label: "SketchNote (S3)",
      icon: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1763174915/ctsrrmlfcxxmsmvb9yhm.png",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.cancel} onPress={onClose}>
              Cancel
            </Text>
            <Text style={styles.title}>Export file</Text>
            <Text style={styles.exportOnly}>Export only</Text>
          </View>

          <View style={styles.bodyRow}>
            <View style={styles.leftPane}>
              <View style={styles.pageThumbnail}>
                {pagePreviews[selectedPageIndex]?.snapshotUrl ? (
                  <Image
                    source={{
                      uri: pagePreviews[selectedPageIndex].snapshotUrl,
                    }}
                    style={styles.thumbnailImage}
                  />
                ) : (
                  <View style={styles.emptyThumbnail} />
                )}
              </View>
              <View style={styles.thumbRow}>
                {pagePreviews.slice(0, 5).map((p, idx) => (
                  <Pressable
                    key={`${p.pageNumber}-${idx}`}
                    onPress={() => setSelectedPageIndex(idx)}
                  >
                    {p.snapshotUrl ? (
                      <Image
                        source={{ uri: p.snapshotUrl }}
                        style={styles.thumb}
                      />
                    ) : (
                      <View style={styles.thumb} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.rightPane}>
              <View style={styles.optionRow}>
                {options.map((opt) => (
                  <Pressable
                    key={opt.key}
                    style={[
                      styles.option,
                      selected === opt.key && styles.optionSelected,
                    ]}
                    onPress={() => setSelected(opt.key)}
                  >
                    <Image
                      source={{ uri: opt.icon }}
                      style={[
                        styles.optionIcon,
                        selected === opt.key && styles.optionIconSelected,
                      ]}
                    />
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.warningText}>
                ⚠️ If the source file is a scanned document/image/non-editable
                PDF, the exported file will remain as a non-editable PDF
              </Text>

              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>File name:</Text>
                <TextInput
                  style={styles.input}
                  value={fileName}
                  onChangeText={setFileName}
                  placeholder="Unnamed note"
                />
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.label}>Resolution:</Text>
                <View style={styles.resRow}>
                  {resolutionOptions.map((r) => (
                    <Pressable
                      key={r.key}
                      onPress={() => setResolutionKey(r.key)}
                      style={[
                        styles.resOption,
                        resolutionKey === r.key && styles.resOptionSelected,
                      ]}
                    >
                      <Text style={styles.resLabel}>{r.label}</Text>
                    </Pressable>
                  ))}
                </View>
                {!isPro && (
                  <Text style={styles.proHint}>
                    HD, 2K and 4K only for Pro users
                  </Text>
                )}
              </View>

              <View style={styles.checkboxRow}>
                <Switch value={includeBg} onValueChange={setIncludeBg} />
                <Text style={styles.checkboxText}>
                  Including page background (horizontal line/grid/image/text
                  etc.)
                </Text>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.label}>Pages to export:</Text>
                <View style={styles.pageRow}>
                  <View style={styles.pageLeft}>
                    <Pressable
                      onPress={() => setPageMode("all")}
                      style={[
                        styles.pageOption,
                        pageMode === "all" && styles.pageOptionSelected,
                      ]}
                    >
                      <Text style={styles.pageOptionLabel}>All</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setPageMode("range")}
                      style={[
                        styles.pageOption,
                        pageMode === "range" && styles.pageOptionSelected,
                      ]}
                    >
                      <Text style={styles.pageOptionLabel}>Range</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setPageMode("list")}
                      style={[
                        styles.pageOption,
                        pageMode === "list" && styles.pageOptionSelected,
                      ]}
                    >
                      <Text style={styles.pageOptionLabel}>List</Text>
                    </Pressable>
                  </View>
                  <View style={styles.pageRight}>
                    {pageMode === "all" && (
                      <Text style={styles.pageInfo}>Export all pages</Text>
                    )}
                    {pageMode === "range" && (
                      <TextInput
                        style={styles.input}
                        value={pageRange}
                        onChangeText={setPageRange}
                        placeholder="e.g., 1–3"
                      />
                    )}
                    {pageMode === "list" && (
                      <TextInput
                        style={styles.input}
                        value={pageList}
                        onChangeText={setPageList}
                        placeholder="e.g., 1,3,5"
                      />
                    )}
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={[styles.exportBtn, { flex: 1 }]}
                  onPress={() => {
                    const quality =
                      resolutionOptions.find((r) => r.key === resolutionKey)
                        ?.quality || 90;
                    onExport({
                      selected,
                      fileName,
                      includeBg,
                      pageMode,
                      pageRange,
                      pageList,
                      quality,
                    });
                  }}
                >
                  <Text style={styles.exportText}>Export</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.shareBtn, { flex: 1 }]}
                  onPress={() => {
                    const quality =
                      resolutionOptions.find((r) => r.key === resolutionKey)
                        ?.quality || 90;
                    onShare?.({
                      selected,
                      fileName,
                      includeBg,
                      pageMode,
                      pageRange,
                      pageList,
                      quality,
                    });
                  }}
                >
                  <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.savePath}>
                Save path: storage/documents/sketchnote/export
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExportModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#ffffff",
    width: "70%",
    borderRadius: 16,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cancel: { color: "#007AFF", fontSize: 16 },
  title: { color: "#000", fontSize: 16, fontWeight: "bold" },
  exportOnly: { color: "#007AFF", fontSize: 16 },

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  option: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#F4F6F8",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionSelected: {
    backgroundColor: "#EAF4FF",
    borderColor: "#007AFF",
    borderWidth: 1.5,
  },

  optionIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    marginBottom: 8,
    contentFit: "contain",
  },
  optionIconSelected: {
    tintColor: "#007AFF",
  },

  optionLabel: { color: "#000", fontSize: 13 },

  warningText: {
    fontSize: 12,
    color: "#FFC107",
    marginTop: 8,
  },

  label: { color: "#333", fontSize: 13, marginBottom: 4 },

  input: {
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    padding: 10,
    color: "#000",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  checkboxText: {
    color: "#333",
    fontSize: 13,
    flex: 1,
    marginLeft: 8,
  },

  exportBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  exportText: { color: "#fff", fontWeight: "bold" },
  shareBtn: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  shareText: { color: "#111827", fontWeight: "bold" },

  savePath: {
    color: "#999",
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },

  /* --- PAGE SECTION --- */

  pageRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },

  pageLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },

  pageRight: {
    flex: 1,
    justifyContent: "center",
  },

  pageOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  pageOptionSelected: {
    backgroundColor: "#EAF4FF",
    borderColor: "#007AFF",
  },

  pageOptionLabel: {
    fontSize: 14,
    color: "#000",
  },

  pageInfo: {
    color: "#777",
    fontSize: 13,
  },
  bodyRow: {
    flexDirection: "row",
    gap: 16,
  },
  leftPane: {
    flex: 0.4,
    backgroundColor: "#F4F6F8",
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-between",
  },
  rightPane: {
    flex: 0.6,
  },
  pageThumbnail: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  emptyThumbnail: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  previewBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  previewIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  previewLabel: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
  },
  thumbRow: {
    flexDirection: "row",
  },

  thumbWrapSelected: {
    borderColor: "#007AFF",
  },

  thumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#EAF4FF",
    contentFit: "contain",
  },
  resRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  resOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  resOptionSelected: {
    backgroundColor: "#EAF4FF",
    borderColor: "#007AFF",
  },
  resLabel: {
    fontSize: 13,
    color: "#111",
  },
  proHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#777",
  },
});
