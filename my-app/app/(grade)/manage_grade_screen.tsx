import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import {
  Text,
  TextInput,
  Menu,
  Card,
  ActivityIndicator,
  Button,
  Divider,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import {
  getMyClasses,
  getMyClassById,
  MyClass,
  MyClassDetail,
  TraineeAssignation,
} from "@/service/classService";

import {
  addGradeToTraineeAssignation,
  AddTraineeGradeRequest,
} from "@/service/traineeAssignationService";

const BRAND = "#3620AC";

/* ================= TYPES ================= */

type GradeKind =
  | "ProgressTest"
  | "PracticeExamScore"
  | "FinalExamScore"
  | "TotalScore";

type EditableGrade = Partial<Record<GradeKind, number>>;

/* ================= SCREEN ================= */

const ClassGradeScreen: React.FC = () => {
  const [classes, setClasses] = useState<MyClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<MyClass | null>(null);
  const [classDetail, setClassDetail] = useState<MyClassDetail | null>(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [gradeMap, setGradeMap] = useState<Record<string, EditableGrade>>({});
  const [originalGradeMap, setOriginalGradeMap] = useState<
    Record<string, EditableGrade>
  >({});

  /* ================= LOAD ================= */

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    const res = await getMyClasses();
    if (res.success) setClasses(res.data);
    setLoading(false);
  };

  const onSelectClass = async (cls: MyClass) => {
    setMenuVisible(false);
    setSelectedClass(cls);
    setClassDetail(null);
    setEditing(false);

    setLoading(true);
    const res = await getMyClassById(cls.classId);
    if (res.success) {
      setClassDetail(res.data);
      initGrades(res.data);
    }
    setLoading(false);
  };

  /* ================= INIT GRADES ================= */

  const initGrades = (data: MyClassDetail) => {
    const map: Record<string, EditableGrade> = {};

    data.traineeAssignations.forEach((t) => {
      const g: EditableGrade = {};
      t.grades.forEach((gr) => {
        g[gr.gradeKind as GradeKind] = gr.grade;
      });
      map[t.traineeAssignationId] = g;
    });

    setGradeMap(map);
    setOriginalGradeMap(map);
  };

  /* ================= UPDATE LOCAL GRADE ================= */

  const updateGrade = (
    assignationId: string,
    key: GradeKind,
    value: string
  ) => {
    setGradeMap((prev) => ({
      ...prev,
      [assignationId]: {
        ...prev[assignationId],
        [key]: value === "" ? undefined : Number(value),
      },
    }));
  };

  /* ================= SAVE TO API ================= */

  const saveGrades = async () => {
    if (!classDetail) return;

    setLoading(true);

    try {
      for (const t of classDetail.traineeAssignations) {
        const current = gradeMap[t.traineeAssignationId] || {};
        const original = originalGradeMap[t.traineeAssignationId] || {};

        for (const key of Object.keys(current) as GradeKind[]) {
          const newValue = current[key];
          const oldValue = original[key];

          if (newValue === undefined || newValue === oldValue) continue;

          const payload: AddTraineeGradeRequest = {
            grade: newValue,
            gradeKind: key,
          };

          await addGradeToTraineeAssignation(t.traineeAssignationId, payload);
        }
      }

      setOriginalGradeMap(gradeMap);
      setEditing(false);
    } catch (err) {
      console.error("Failed to save grades", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Class Grades
      </Text>

      {/* ===== CLASS SELECT ===== */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <TextInput
              label="Choose class"
              value={
                selectedClass
                  ? `${selectedClass.classId}. ${selectedClass.subjectName} (${selectedClass.classGroupCode})`
                  : ""
              }
              editable={false}
              right={
                <TextInput.Icon
                  icon={() => (
                    <Ionicons name="chevron-down" size={20} color={BRAND} />
                  )}
                />
              }
            />
          </TouchableOpacity>
        }
      >
        {classes.map((cls) => (
          <Menu.Item
            key={cls.classId}
            title={`${cls.classId}. ${cls.subjectName} (${cls.classGroupCode})`}
            onPress={() => onSelectClass(cls)}
          />
        ))}
      </Menu>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      {/* ===== CLASS INFO ===== */}
      {classDetail && (
        <>
          <Card style={styles.infoCard}>
            <Text style={styles.subject}>{classDetail.subjectName}</Text>
            <Text style={styles.meta}>
              Instructor: {classDetail.instructorName}
            </Text>
            <Text style={styles.meta}>Group: {classDetail.classGroupCode}</Text>

            <Divider style={{ marginVertical: 12 }} />

            <Text style={styles.sectionTitle}>Grade Rules</Text>
            <Text style={styles.text}>
              Progress Test ≥ {classDetail.minProgressTest}
            </Text>
            <Text style={styles.text}>
              Practice Exam ≥ {classDetail.minPracticeExamScore}
            </Text>
            <Text style={styles.text}>
              Final Exam ≥ {classDetail.minFinalExamScore}
            </Text>
            <Text style={styles.text}>
              Total Score ≥ {classDetail.minTotalScore}
            </Text>

            <Divider style={{ marginVertical: 12 }} />

            <Text style={styles.sectionTitle}>Weights</Text>
            <Text style={styles.text}>
              Progress Test: {classDetail.weightProgressTest * 100}%
            </Text>
            <Text style={styles.text}>
              Practice Exam: {classDetail.weightPracticalExam * 100}%
            </Text>
            <Text style={styles.text}>
              Final Exam: {classDetail.weightFinalExam * 100}%
            </Text>
          </Card>

          <Button
            mode={editing ? "contained" : "outlined"}
            loading={loading}
            onPress={editing ? saveGrades : () => setEditing(true)}
            style={styles.editBtn}
          >
            {editing ? "Save Grades" : "Unlock Grade Editing"}
          </Button>

          <Text style={styles.sectionTitle}>Trainees</Text>

          {classDetail.traineeAssignations.map((t: TraineeAssignation) => (
            <Card key={t.traineeAssignationId} style={styles.traineeCard}>
              <Text style={styles.traineeName}>{t.traineeName}</Text>
              <Text style={styles.traineeId}>{t.traineeId}</Text>

              {(
                [
                  "ProgressTest",
                  "PracticeExamScore",
                  "FinalExamScore",
                  "TotalScore",
                ] as GradeKind[]
              ).map((k) => (
                <TextInput
                  key={k}
                  label={k}
                  keyboardType="decimal-pad"
                  value={
                    gradeMap[t.traineeAssignationId]?.[k] !== undefined
                      ? String(gradeMap[t.traineeAssignationId]?.[k])
                      : ""
                  }
                  disabled={!editing}
                  onChangeText={(text) =>
                    updateGrade(t.traineeAssignationId, k, text)
                  }
                  style={styles.input}
                  textColor="#ffffff"
                />
              ))}
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 16,
  },
  title: {
    color: BRAND,
    fontWeight: "700",
    fontSize: 22,
    marginBottom: 16,
  },
  text: {
    color: BRAND,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  subject: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND,
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: "#475569",
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  editBtn: {
    marginTop: 16,
    borderRadius: 12,
  },
  traineeCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    elevation: 2,
  },
  traineeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  traineeId: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 12,
  },
  input: {
    width: "48%",
    marginBottom: 12,
    backgroundColor: BRAND,
    borderRadius: 10,
  },
});

export default ClassGradeScreen;
