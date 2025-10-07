import React, { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import YoutubePlayer from "react-native-youtube-iframe";
import { lessonStyles } from "./LessonScreen.styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CONTENT_MAX = 1000; // sync with styles
const CONTENT_WIDTH = Math.min(SCREEN_WIDTH, CONTENT_MAX);
const LEFT_COL_WIDTH = Math.round(CONTENT_WIDTH * 0.68);
const PLAYER_WIDTH = LEFT_COL_WIDTH - 32; // padding inside left col (16*2)
const PLAYER_HEIGHT = Math.round((PLAYER_WIDTH * 9) / 16);

// Map of lessonId -> YouTube videoId (placeholder demo data)
const demoLessonVideos = {
  l1: "JGwWNGJdvx8",
  l2: "JGwWNGJdvx8",
  l3: "JGwWNGJdvx8",
  l4: "VYOjWnS4cMY",
  l5: "2Vv-BfVoq4g",
  l6: "JGwWNGJdvx8",
  l7: "M7lc1UVf-VE",
  l8: "oHg5SJYRHA0",
  l9: "E7wJTI-1dvQ",
  l10: "3fumBcKC6RE",
  l11: "aqz-KE-bpKQ",
  l12: "ScMzIvxBSi4",
};

export default function LessonScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId = "1", lessonId = "l1" } = route.params || {};

  const modules = useMemo(
    () => [
      { id: "m1", title: "IIFE, Scope, Closure", lessons: [
        { id: "l1", title: "Giới thiệu", duration: "01:48" },
        { id: "l2", title: "IIFE là gì?", duration: "23:57" },
        { id: "l3", title: "Ôn tập IIFE #1", duration: "00:35" },
      ]},
      { id: "m2", title: "Hosting, Strict Mode, Data Types", lessons: [
        { id: "l4", title: "Chữ và phông chữ", duration: "20:10" },
        { id: "l5", title: "Biểu tượng đơn giản", duration: "18:25" },
        { id: "l6", title: "Khung và đường viền", duration: "14:50" },
      ]},
      { id: "m3", title: "Tổ chức thông tin", lessons: [
        { id: "l7", title: "Cấu trúc trang", duration: "22:15" },
        { id: "l8", title: "Sử dụng màu sắc", duration: "16:40" },
        { id: "l9", title: "Kỹ thuật nhấn mạnh", duration: "19:30" },
      ]},
    ],
    []
  );

  const [expanded, setExpanded] = useState({ m1: true });
  const allLessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);
  const [currentLessonId, setCurrentLessonId] = useState(lessonId);
  const currentVideoId = demoLessonVideos[currentLessonId] || demoLessonVideos.l1;
  const currentLesson = allLessons.find(l => l.id === currentLessonId);

  const onChangeState = useCallback(() => {}, []);

  const handleBack = () => navigation.goBack();
  const handleOpenLesson = (id) => setCurrentLessonId(id);
  const toggleModule = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <View style={lessonStyles.containerCenter}>
      <View style={[lessonStyles.contentMax, { flex: 1 }]}> 
        <View style={lessonStyles.header}>
          <Pressable onPress={handleBack}><Text style={lessonStyles.back}>Quay lại</Text></Pressable>
          <Text style={lessonStyles.title}>Khóa học #{courseId}</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={lessonStyles.mainRow}>
          <View style={[lessonStyles.leftCol, { width: Math.round(CONTENT_WIDTH * 0.68) }]}>
            <View style={[lessonStyles.playerWrap, { width: PLAYER_WIDTH, height: PLAYER_HEIGHT }]}>
              <YoutubePlayer
                height={PLAYER_HEIGHT}
                width={PLAYER_WIDTH}
                play={false}
                videoId={currentVideoId}
                onChangeState={onChangeState}
                webViewStyle={{ backgroundColor: "#000000" }}
                webViewProps={{ allowsFullscreenVideo: true }}
              />
            </View>
            <Text style={lessonStyles.currentLessonTitle}>{currentLesson?.title}</Text>
          </View>

          <View style={[lessonStyles.rightCol, { width: Math.round(CONTENT_WIDTH * 0.32) }]}>
            <ScrollView style={lessonStyles.sidebar}>
              {modules.map((mod) => {
                const lessonCount = mod.lessons.length;
                const totalDuration = mod.lessons.map(l => l.duration).join(" • ");
                return (
                  <View key={mod.id} style={lessonStyles.moduleBox}>
                    <Pressable style={lessonStyles.moduleHeader} onPress={() => toggleModule(mod.id)}>
                      <Text style={lessonStyles.moduleTitle}>{mod.title}</Text>
                      <Text style={lessonStyles.moduleMeta}>{lessonCount} bài học</Text>
                      <Text style={lessonStyles.moduleChevron}>{expanded[mod.id] ? "▾" : "▸"}</Text>
                    </Pressable>
                    {expanded[mod.id] && (
                      <View style={lessonStyles.lessonsList}>
                        {mod.lessons.map((lesson) => {
                          const isActive = lesson.id === currentLessonId;
                          return (
                            <Pressable
                              key={lesson.id}
                              onPress={() => handleOpenLesson(lesson.id)}
                              style={[lessonStyles.lessonItem, isActive && lessonStyles.activeItem]}
                            >
                              <Text style={lessonStyles.lessonTitle}>{lesson.title}</Text>
                              <Text style={lessonStyles.lessonDuration}>{lesson.duration}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
} 