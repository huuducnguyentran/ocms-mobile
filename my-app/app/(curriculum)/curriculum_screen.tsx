import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Card, Chip, IconButton } from "react-native-paper";
import {
  CurriculumPlan,
  CurriculumCourse,
  CurriculumSubject,
  getMyCurriculum,
} from "@/service/curriculumService";

// Enable layout animation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PRIMARY = "#3620AC";

export default function MyCurriculumScreen() {
  const [plans, setPlans] = useState<CurriculumPlan[]>([]);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurriculum();
  }, []);

  const loadCurriculum = async () => {
    setLoading(true);
    const res = await getMyCurriculum();
    if (res.success) setPlans(res.data);
    setLoading(false);
  };

  const togglePlan = (planId: string) => {
    LayoutAnimation.easeInEaseOut();
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const toggleCourse = (courseId: string) => {
    LayoutAnimation.easeInEaseOut();
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const renderSubject = (subject: CurriculumSubject) => (
    <Card style={styles.subjectCard} key={subject.traineeAssignationId}>
      <View style={styles.subjectRow}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.subjectName}>
            {subject.subjectName} ({subject.subjectCode})
          </Text>

          <Text style={styles.subjectDetail}>Score: {subject.score}</Text>
          <Text style={styles.subjectDetail}>
            Graded:{" "}
            {subject.gradeDate
              ? new Date(subject.gradeDate).toLocaleString()
              : "N/A"}
          </Text>
        </View>

        <Chip
          style={[
            styles.statusChip,
            {
              backgroundColor:
                subject.status === "Passed"
                  ? "#3CB371"
                  : subject.status === "Failed"
                  ? "#D32F2F"
                  : "#FF9800",
            },
          ]}
          textStyle={{ color: "white", fontWeight: "600" }}
        >
          {subject.status}
        </Chip>
      </View>
    </Card>
  );

  const renderCourse = (course: CurriculumCourse) => (
    <View key={course.courseId} style={{ marginTop: 10 }}>
      <TouchableOpacity
        onPress={() => toggleCourse(course.courseId)}
        style={styles.courseHeader}
      >
        <Text style={styles.courseTitle}>{course.courseName}</Text>

        <IconButton
          icon={
            expandedCourse === course.courseId ? "chevron-up" : "chevron-down"
          }
          size={24}
          iconColor={PRIMARY}
        />
      </TouchableOpacity>

      {expandedCourse === course.courseId && (
        <View style={{ marginTop: 6 }}>
          {course.subjects.map(renderSubject)}
        </View>
      )}
    </View>
  );

  const renderPlan = ({ item }: { item: CurriculumPlan }) => (
    <Card style={styles.planCard}>
      <TouchableOpacity
        onPress={() => togglePlan(item.planId)}
        style={styles.planHeader}
      >
        <View>
          <Text style={styles.planTitle}>{item.planName}</Text>
        </View>

        <IconButton
          icon={expandedPlan === item.planId ? "chevron-up" : "chevron-down"}
          size={28}
          iconColor={PRIMARY}
        />
      </TouchableOpacity>

      {expandedPlan === item.planId && (
        <View style={{ marginTop: 10 }}>{item.courses.map(renderCourse)}</View>
      )}
    </Card>
  );

  // Loading state screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Loading curriculum...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={plans}
      keyExtractor={(item) => item.planId}
      renderItem={renderPlan}
      contentContainerStyle={{ padding: 14, paddingBottom: 30 }}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },

  planCard: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5F0",
    elevation: 1,
  },

  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  planTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: PRIMARY,
  },

  courseHeader: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: "#F4F3FF",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  courseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },

  subjectCard: {
    padding: 12,
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    elevation: 1,
  },

  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  subjectName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },

  subjectDetail: {
    marginTop: 2,
    color: "#666",
    fontSize: 13,
  },

  statusChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 4,
    marginTop: 4,
  },
});
