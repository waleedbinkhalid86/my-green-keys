"use client";
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Custom Icons
const LeafIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const BellIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m2.12-2.12l4.24-4.24"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

interface Child {
  id: string;
  name: string;
  username: string;
  age: number;
  gender: "boy" | "girl";
  avatar: string;
  lessonsCompleted: number;
  avgWpm: number;
  accuracy: number;
  ecoPhotos: number;
  currentStreak: number;
  badges: string[];
  wpmData: number[];
  nextMilestone: string;
  ecoActions: { type: string; date: string; approved: boolean }[];
}

interface CustomLesson {
  id: string;
  name: string;
  text: string;
  difficulty: string;
  assignedTo: string;
  createdAt: string;
}

interface PendingPhoto {
  id: string;
  studentId: string;
  photoUrl: string;
  actionType: string;
  dateSubmitted: string;
  pointsAwarded: number;
}

type ChildRow = {
  id: string;
  full_name: string | null;
  age: number | null;
  gender: "boy" | "girl" | null;
  username: string | null;
};

function toChildDashboard(row: ChildRow): Child {
  const gender = row.gender ?? "boy";
  const name = row.full_name?.trim() || "Child";
  const username = row.username?.trim() || "";
  const age = row.age ?? 0;
  return {
    id: row.id,
    name,
    username,
    age,
    gender,
    avatar: gender === "girl" ? "👧" : "👦",
    lessonsCompleted: 0,
    avgWpm: 0,
    accuracy: 0,
    ecoPhotos: 0,
    currentStreak: 0,
    badges: [],
    wpmData: [],
    nextMilestone: "Complete lessons to unlock badges",
    ecoActions: [],
  };
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [childrenError, setChildrenError] = useState("");
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [addChildLoading, setAddChildLoading] = useState(false);
  const [addChildError, setAddChildError] = useState("");
  const [childForm, setChildForm] = useState({
    name: "",
    username: "",
    age: "8",
    gender: "boy" as "boy" | "girl",
  });

  const [lessonText, setLessonText] = useState("");
  const [lessonName, setLessonName] = useState("");
  const [lessonDifficulty, setLessonDifficulty] = useState("Beginner");
  const [customLessons, setCustomLessons] = useState<CustomLesson[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [ecoError, setEcoError] = useState<string>("");
  const [ecoSuccess, setEcoSuccess] = useState<string>("");
  const [ecoLoading, setEcoLoading] = useState<boolean>(true);
  const [ecoApprovingId, setEcoApprovingId] = useState<string | null>(null);

  const selectedChild = children.find((c) => c.id === selectedChildId) || null;

  const actionLabel = useMemo(() => {
    const map: Record<string, string> = {
      planting_tree: "🌱 Planting a tree",
      watering_plants: "💧 Watering plants",
      water_for_birds: "🐦 Water on roof for birds",
    };
    return (actionType: string) => map[actionType] || actionType;
  }, []);

  useEffect(() => {
    const loadPending = async () => {
      setEcoLoading(true);
      setEcoError("");
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("eco_photos")
          .select("id, student_id, action_type, photo_url, submitted_at, points_awarded, status")
          .eq("status", "pending")
          .order("submitted_at", { ascending: false });

        if (error) throw error;

        setPendingPhotos(
          (data || []).map((row) => ({
            id: row.id as string,
            studentId: row.student_id as string,
            photoUrl: (row.photo_url as string) || "",
            actionType: (row.action_type as string) || "",
            dateSubmitted: row.submitted_at
              ? new Date(row.submitted_at as string).toLocaleString()
              : "",
            pointsAwarded: (row.points_awarded as number) || 0,
          }))
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load pending photos.";
        setEcoError(message);
      } finally {
        setEcoLoading(false);
      }
    };

    void loadPending();
  }, []);

  const loadChildren = async () => {
    setChildrenLoading(true);
    setChildrenError("");
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setChildren([]);
        setSelectedChildId("");
        setChildrenError("You must be logged in to view your children.");
        return;
      }

      const { data, error } = await supabase
        .from("children")
        .select("id, full_name, age, gender, username")
        .eq("parent_id", userData.user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      const mapped = (data as ChildRow[] | null)?.map(toChildDashboard) ?? [];
      setChildren(mapped);
      if (mapped.length > 0) {
        setSelectedChildId((prev) => prev || mapped[0].id);
      } else {
        setSelectedChildId("");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load children.";
      setChildrenError(message);
      setChildren([]);
      setSelectedChildId("");
    } finally {
      setChildrenLoading(false);
    }
  };

  useEffect(() => {
    void loadChildren();
  }, []);

  const handleAddChild = async () => {
    setAddChildError("");
    setAddChildLoading(true);
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setAddChildError("You must be logged in to add a child.");
        return;
      }

      const age = Number(childForm.age);
      if (!childForm.name.trim()) {
        setAddChildError("Child name is required.");
        return;
      }
      if (!Number.isFinite(age) || age < 3 || age > 18) {
        setAddChildError("Please enter a valid age.");
        return;
      }
      if (!childForm.username.trim()) {
        setAddChildError("Username is required.");
        return;
      }

      const { error } = await supabase.from("children").insert([
        {
          parent_id: userData.user.id,
          full_name: childForm.name.trim(),
          age,
          gender: childForm.gender,
          username: childForm.username.trim(),
        },
      ]);
      if (error) throw error;

      setShowAddChildModal(false);
      setChildForm({ name: "", username: "", age: "8", gender: "boy" });
      await loadChildren();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add child.";
      setAddChildError(message);
    } finally {
      setAddChildLoading(false);
    }
  };

  const handleSaveLesson = () => {
    if (lessonName && lessonText) {
      const newLesson: CustomLesson = {
        id: Date.now().toString(),
        name: lessonName,
        text: lessonText,
        difficulty: lessonDifficulty,
        assignedTo: selectedChildId,
        createdAt: new Date().toLocaleDateString(),
      };
      setCustomLessons([...customLessons, newLesson]);
      setLessonName("");
      setLessonText("");
      setLessonDifficulty("Beginner");
    }
  };

  const handleApprovePhoto = async (photo: PendingPhoto) => {
    setEcoError("");
    setEcoSuccess("");
    setEcoApprovingId(photo.id);
    try {
      const supabase = createClient();

      const { error: updatePhotoError } = await supabase
        .from("eco_photos")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          points_awarded: photo.pointsAwarded,
        })
        .eq("id", photo.id);

      if (updatePhotoError) throw updatePhotoError;

      // Award points to the student (requires profiles.eco_points column).
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("eco_points")
        .eq("id", photo.studentId)
        .single();

      if (profileError) throw profileError;

      const current = (profile as unknown as { eco_points?: number }).eco_points || 0;
      const { error: awardError } = await supabase
        .from("profiles")
        .update({ eco_points: current + photo.pointsAwarded })
        .eq("id", photo.studentId);

      if (awardError) throw awardError;

      setPendingPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setEcoSuccess("Approved! Eco points awarded to the student 🌿");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to approve photo.";
      setEcoError(message);
    } finally {
      setEcoApprovingId(null);
    }
  };

  const handleRejectPhoto = async (photo: PendingPhoto) => {
    setEcoError("");
    setEcoSuccess("");
    setEcoApprovingId(photo.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("eco_photos")
        .update({ status: "rejected", reviewed_at: new Date().toISOString() })
        .eq("id", photo.id);
      if (error) throw error;
      setPendingPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      setEcoSuccess("Rejected. The student can submit a new photo if needed.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reject photo.";
      setEcoError(message);
    } finally {
      setEcoApprovingId(null);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    setCustomLessons(customLessons.filter(l => l.id !== lessonId));
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>
      {/* NAV */}
      <nav style={{ background: "#2c3e50", position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
            {/* Logo & Title */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LeafIcon />
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>My Green Keys</div>
                <div style={{ color: "#999", fontSize: "0.85rem" }}>Parent Dashboard</div>
              </div>
            </div>

            {/* Welcome Message */}
            <div style={{ color: "#fff", fontWeight: 600, fontSize: "1rem" }}>
              Welcome back, Sarah's Mom 👋
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 8 }} title="Notifications">
                <BellIcon />
              </button>
              <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 8 }} title="Settings">
                <SettingsIcon />
              </button>
              <button
                style={{
                  background: "transparent",
                  border: "1px solid #fff",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = "transparent";
                }}
              >
                <LogoutIcon /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: 80, paddingBottom: 40 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}>
          {/* Add Child Modal */}
          {showAddChildModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 999,
                padding: 16,
              }}
            >
              <div
                style={{
                  background: "white",
                  width: "min(560px, 95vw)",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#2c3e50" }}>
                      Add Child
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#666", marginTop: 4 }}>
                      Create a child profile linked to your parent account.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddChildModal(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: 22,
                      cursor: "pointer",
                      color: "#999",
                    }}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {addChildError && (
                  <div
                    style={{
                      background: "#ffebee",
                      border: "1px solid #ef5350",
                      color: "#c62828",
                      padding: "10px 12px",
                      borderRadius: 12,
                      marginBottom: 12,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                    }}
                  >
                    {addChildError}
                  </div>
                )}

                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 700, color: "#2c3e50", marginBottom: 6 }}>
                      Child name
                    </label>
                    <input
                      value={childForm.name}
                      onChange={(e) => setChildForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Sarah"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #e0e0e0",
                        borderRadius: 10,
                        fontSize: "1rem",
                      }}
                      disabled={addChildLoading}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontWeight: 700, color: "#2c3e50", marginBottom: 6 }}>
                      Username
                    </label>
                    <input
                      value={childForm.username}
                      onChange={(e) => setChildForm((p) => ({ ...p, username: e.target.value }))}
                      placeholder="e.g. sarah10"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #e0e0e0",
                        borderRadius: 10,
                        fontSize: "1rem",
                      }}
                      disabled={addChildLoading}
                    />
                    <div style={{ fontSize: "0.8rem", color: "#999", marginTop: 6 }}>
                      This is used for linking and identifying the child.
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 700, color: "#2c3e50", marginBottom: 6 }}>
                        Age
                      </label>
                      <input
                        inputMode="numeric"
                        value={childForm.age}
                        onChange={(e) => setChildForm((p) => ({ ...p, age: e.target.value }))}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #e0e0e0",
                          borderRadius: 10,
                          fontSize: "1rem",
                        }}
                        disabled={addChildLoading}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 700, color: "#2c3e50", marginBottom: 6 }}>
                        Gender
                      </label>
                      <select
                        value={childForm.gender}
                        onChange={(e) =>
                          setChildForm((p) => ({
                            ...p,
                            gender: e.target.value as "boy" | "girl",
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          border: "1px solid #e0e0e0",
                          borderRadius: 10,
                          fontSize: "1rem",
                        }}
                        disabled={addChildLoading}
                      >
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddChildModal(false)}
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid #e0e0e0",
                      background: "white",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                    disabled={addChildLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleAddChild()}
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "none",
                      background: "#4CAF50",
                      color: "white",
                      fontWeight: 900,
                      cursor: addChildLoading ? "not-allowed" : "pointer",
                      opacity: addChildLoading ? 0.7 : 1,
                    }}
                    disabled={addChildLoading}
                  >
                    {addChildLoading ? "Adding..." : "Add Child"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {childrenError && (
            <div
              style={{
                background: "#ffebee",
                border: "1px solid #ef5350",
                color: "#c62828",
                padding: "12px 16px",
                borderRadius: 12,
                marginBottom: 16,
                fontSize: "0.95rem",
                fontWeight: 700,
              }}
            >
              {childrenError}
            </div>
          )}

          {childrenLoading ? (
            <div
              style={{
                background: "#f5f7fa",
                padding: 24,
                borderRadius: 12,
                border: "1px solid #e0e0e0",
                marginBottom: 24,
              }}
            >
              Loading children...
            </div>
          ) : children.length === 0 ? (
            <div
              style={{
                background: "#E8F5E9",
                border: "2px solid #4CAF50",
                padding: 20,
                borderRadius: 12,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 900, color: "#2c3e50", marginBottom: 6 }}>
                  Add your first child
                </div>
                <div style={{ color: "#666" }}>
                  Create a linked child profile to track progress.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddChildModal(true)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "#4CAF50",
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                + Add Child
              </button>
            </div>
          ) : null}

          {/* OVERVIEW CARDS */}
          <section style={{ marginBottom: 60 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
              <div style={{ background: "#f5f7fa", padding: 24, borderRadius: 12, border: "1px solid #e0e0e0" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>📚</div>
                <div style={{ color: "#999", fontSize: "0.9rem", marginBottom: 8 }}>Total lessons completed</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#2c3e50" }}>{selectedChild?.lessonsCompleted ?? 0}</div>
              </div>
              <div style={{ background: "#f5f7fa", padding: 24, borderRadius: 12, border: "1px solid #e0e0e0" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>⚡</div>
                <div style={{ color: "#999", fontSize: "0.9rem", marginBottom: 8 }}>Average WPM</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#2c3e50" }}>{selectedChild?.avgWpm ?? 0}</div>
              </div>
              <div style={{ background: "#f5f7fa", padding: 24, borderRadius: 12, border: "1px solid #e0e0e0" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎯</div>
                <div style={{ color: "#999", fontSize: "0.9rem", marginBottom: 8 }}>Accuracy</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#4CAF50" }}>{selectedChild?.accuracy ?? 0}%</div>
              </div>
              <div style={{ background: "#f5f7fa", padding: 24, borderRadius: 12, border: "1px solid #e0e0e0" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🌿</div>
                <div style={{ color: "#999", fontSize: "0.9rem", marginBottom: 8 }}>Eco actions</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#2c3e50" }}>{selectedChild?.ecoPhotos ?? 0}</div>
              </div>
            </div>
          </section>

          {/* CHILD SELECTOR */}
          {children.length > 0 && (
            <section style={{ marginBottom: 60 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#2c3e50" }}>
                  Children
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(true)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "#4CAF50",
                    color: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  + Add Child
                </button>
              </div>
              <div style={{ display: "flex", gap: 12, borderBottom: "2px solid #e0e0e0", paddingBottom: 16, overflowX: "auto" }}>
                {children.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setSelectedChildId(child.id)}
                    style={{
                      background: selectedChildId === child.id ? "#E8F5E9" : "transparent",
                      border: selectedChildId === child.id ? "2px solid #4CAF50" : "1px solid #e0e0e0",
                      color: selectedChildId === child.id ? "#4CAF50" : "#666",
                      padding: "12px 16px",
                      borderRadius: 999,
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>{child.avatar}</span>
                    <span>{child.name}</span>
                    {child.username && (
                      <span style={{ color: selectedChildId === child.id ? "#2e7d32" : "#999", fontWeight: 700 }}>
                        @{child.username}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* CHILD PROGRESS SECTION */}
          {selectedChild && (
          <section style={{ marginBottom: 60 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
              <div style={{ fontSize: "3rem" }}>{selectedChild.avatar}</div>
              <div>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#2c3e50", margin: 0 }}>{selectedChild.name}'s Progress</h2>
                <p style={{ color: "#999", margin: 0, marginTop: 4 }}>Tracking typing skills & eco actions</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
              {/* WPM Chart */}
              <div style={{ background: "#f5f7fa", padding: 24, borderRadius: 12, border: "1px solid #e0e0e0" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2c3e50", marginBottom: 16 }}>WPM Progress (Last 7 Days)</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 150 }}>
                  {(selectedChild.wpmData.length ? selectedChild.wpmData : [0,0,0,0,0,0,0]).map((wpm, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ fontSize: "0.8rem", color: "#999", marginBottom: 4 }}>{wpm}</div>
                      <div
                        style={{
                          width: "100%",
                          height: `${(wpm / Math.max(...(selectedChild.wpmData.length ? selectedChild.wpmData : [1]))) * 100}px`,
                          background: "#4CAF50",
                          borderRadius: "4px 4px 0 0",
                          transition: "height 0.3s ease",
                        }}
                      />
                      <div style={{ fontSize: "0.75rem", color: "#999", marginTop: 4 }}>Day {i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats & Streak */}
              <div style={{ background: "#f5f7fa", padding: 24, borderRadius: 12, border: "1px solid #e0e0e0" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2c3e50", marginBottom: 16 }}>Performance</h3>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#666" }}>Accuracy</span>
                    <span style={{ fontWeight: 700, color: "#4CAF50" }}>{selectedChild.accuracy}%</span>
                  </div>
                  <div style={{ width: "100%", height: 8, background: "#e0e0e0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${selectedChild.accuracy}%`, height: "100%", background: "#4CAF50" }} />
                  </div>
                </div>

                <div style={{ marginBottom: 20, padding: 16, background: "#fff", borderRadius: 8, border: "1px solid #e0e0e0" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2c3e50", marginBottom: 4 }}>🔥 {selectedChild.currentStreak} day streak</div>
                  <p style={{ color: "#999", margin: 0, fontSize: "0.9rem" }}>Keep it going!</p>
                </div>

                <div>
                  <p style={{ color: "#999", fontSize: "0.9rem", marginBottom: 8 }}>Badges earned:</p>
                  <div style={{ display: "flex", gap: 12 }}>
                    {selectedChild.badges.map((badge, i) => (
                      <div key={i} style={{ fontSize: "2rem" }}>{badge}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Milestone */}
              <div style={{ background: "#E8F5E9", padding: 24, borderRadius: 12, border: "2px solid #4CAF50" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2c3e50", marginBottom: 16 }}>Next Milestone</h3>
                <p style={{ color: "#666", lineHeight: 1.6, margin: 0 }}>
                  {selectedChild.nextMilestone}
                </p>
              </div>
            </div>
          </section>
          )}

          {/* CUSTOM LESSON CREATOR */}
          <section style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#2c3e50", marginBottom: 24 }}>📖 Create a custom typing lesson</h2>
            <div style={{ background: "#f5f7fa", padding: 32, borderRadius: 12, border: "1px solid #e0e0e0" }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontSize: "0.95rem", fontWeight: 600, color: "#2c3e50" }}>Lesson name</label>
                <input
                  type="text"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  placeholder="Give this lesson a name..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    fontSize: "1rem",
                    fontFamily: "Poppins, sans-serif",
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 8, fontSize: "0.95rem", fontWeight: 600, color: "#2c3e50" }}>Lesson text</label>
                <textarea
                  value={lessonText}
                  onChange={(e) => setLessonText(e.target.value.slice(0, 500))}
                  placeholder="Paste any text, story or passage here for your child to type..."
                  style={{
                    width: "100%",
                    minHeight: 150,
                    padding: "12px 16px",
                    border: "1px solid #e0e0e0",
                    borderRadius: 8,
                    fontSize: "1rem",
                    fontFamily: "Poppins, sans-serif",
                    resize: "vertical",
                  }}
                />
                <div style={{ fontSize: "0.85rem", color: "#999", marginTop: 8 }}>
                  {lessonText.length}/500 characters
                </div>
              </div>

              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5"
                style={{ display: "grid", gap: 16, marginBottom: 20 }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontSize: "0.95rem", fontWeight: 600, color: "#2c3e50" }}>Difficulty</label>
                  <select
                    value={lessonDifficulty}
                    onChange={(e) => setLessonDifficulty(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: "1rem",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontSize: "0.95rem", fontWeight: 600, color: "#2c3e50" }}>Assign to</label>
                  <select
                    value={selectedChildId}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "1px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: "1rem",
                      fontFamily: "Poppins, sans-serif",
                    }}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                  >
                    {children.map(child => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveLesson}
                disabled={!lessonName || !lessonText}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  background: lessonName && lessonText ? "#4CAF50" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: lessonName && lessonText ? "pointer" : "not-allowed",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (lessonName && lessonText) (e.target as HTMLElement).style.background = "#45a049";
                }}
                onMouseLeave={(e) => {
                  if (lessonName && lessonText) (e.target as HTMLElement).style.background = "#4CAF50";
                }}
              >
                Save & Assign Lesson
              </button>
            </div>

            {/* Saved Lessons List */}
            {customLessons.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2c3e50", marginBottom: 16 }}>Your custom lessons</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {customLessons.map(lesson => (
                    <div key={lesson.id} style={{ background: "#f5f7fa", padding: 16, borderRadius: 8, border: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#2c3e50", marginBottom: 4 }}>{lesson.name}</div>
                        <div style={{ fontSize: "0.85rem", color: "#999" }}>
                        {lesson.difficulty} • Assigned to {children.find(c => c.id === lesson.assignedTo)?.name || "Unknown"} • {lesson.createdAt}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        style={{
                          padding: "6px 12px",
                          background: "#FFEBEE",
                          color: "#c62828",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ECO PHOTO APPROVALS */}
          <section style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#2c3e50", marginBottom: 24 }}>🌿 Eco action photos waiting for approval</h2>

            {/* Pencil texture filter defs */}
            <svg
              width="0"
              height="0"
              style={{ position: "absolute" }}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <filter id="kidsPencilFilterParent" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.9"
                    numOctaves="3"
                    seed="7"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="4"
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="displaced"
                  />

                  {/* Edge sketch */}
                  <feColorMatrix in="displaced" type="luminanceToAlpha" result="luma" />
                  <feConvolveMatrix
                    in="luma"
                    order="3"
                    kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1"
                    result="edges"
                  />
                  <feComponentTransfer in="edges" result="edgesSoft">
                    <feFuncA type="gamma" amplitude="0.65" exponent="1.2" offset="0" />
                  </feComponentTransfer>
                  <feBlend in="displaced" in2="edgesSoft" mode="multiply" result="withEdges" />

                  {/* Paper grain */}
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.15"
                    numOctaves="2"
                    seed="3"
                    result="paper"
                  />
                  <feColorMatrix
                    in="paper"
                    type="matrix"
                    values="
                      0 0 0 0 0.7
                      0 0 0 0 0.7
                      0 0 0 0 0.7
                      0 0 0 0.15 0"
                    result="paperAlpha"
                  />
                  <feBlend in="withEdges" in2="paperAlpha" mode="soft-light" />
                </filter>
              </defs>
            </svg>

            {ecoError && (
              <div
                style={{
                  background: "#ffebee",
                  border: "1px solid #ef5350",
                  color: "#c62828",
                  padding: "12px 16px",
                  borderRadius: 12,
                  marginBottom: 16,
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
              >
                {ecoError}
              </div>
            )}

            {ecoSuccess && (
              <div
                style={{
                  background: "#e8f5e9",
                  border: "1px solid #4caf50",
                  color: "#2e7d32",
                  padding: "12px 16px",
                  borderRadius: 12,
                  marginBottom: 16,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                }}
              >
                {ecoSuccess}
              </div>
            )}
            
            {ecoLoading ? (
              <div style={{ background: "#f5f7fa", padding: 24, borderRadius: 12, border: "1px solid #e0e0e0" }}>
                Loading pending photos...
              </div>
            ) : pendingPhotos.length === 0 ? (
              <div style={{ background: "#E8F5E9", padding: 40, borderRadius: 12, textAlign: "center", border: "1px solid #4CAF50" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>✓</div>
                <p style={{ color: "#4CAF50", fontWeight: 600, fontSize: "1.1rem" }}>No pending photos</p>
                <p style={{ color: "#999", marginTop: 8 }}>All eco actions have been approved or reviewed.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {pendingPhotos.map(photo => (
                  <div key={photo.id} style={{ background: "#f5f7fa", borderRadius: 12, border: "1px solid #e0e0e0", overflow: "hidden" }}>
                    {/* Photo */}
                    {photo.photoUrl ? (
                      <img
                        src={photo.photoUrl}
                        alt="Eco action submission"
                        style={{
                          width: "100%",
                          height: 200,
                          objectFit: "cover",
                          display: "block",
                          filter:
                            "url(#kidsPencilFilterParent) contrast(140%) saturate(150%) brightness(110%)",
                        }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: 200, background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "3rem" }}>
                        🌍
                      </div>
                    )}

                    {/* Photo Info */}
                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "#2c3e50", marginBottom: 8 }}>
                        {actionLabel(photo.actionType)}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: 16 }}>
                        {photo.dateSubmitted} • <strong style={{ color: "#4CAF50" }}>+{photo.pointsAwarded} points</strong>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          onClick={() => handleApprovePhoto(photo)}
                          disabled={ecoApprovingId === photo.id}
                          style={{
                            flex: 1,
                            padding: "10px",
                            background: ecoApprovingId === photo.id ? "#bbb" : "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            fontWeight: 700,
                            cursor: ecoApprovingId === photo.id ? "not-allowed" : "pointer",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#45a049"; }}
                          onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "#4CAF50"; }}
                        >
                          ✅ {ecoApprovingId === photo.id ? "Working..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleRejectPhoto(photo)}
                          disabled={ecoApprovingId === photo.id}
                          style={{
                            flex: 1,
                            padding: "10px",
                            background: ecoApprovingId === photo.id ? "#eee" : "#FFCDD2",
                            color: ecoApprovingId === photo.id ? "#999" : "#c62828",
                            border: "none",
                            borderRadius: 6,
                            fontWeight: 700,
                            cursor: ecoApprovingId === photo.id ? "not-allowed" : "pointer",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#EF9A9A"; }}
                          onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "#FFCDD2"; }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* WEEKLY REPORT */}
          <section style={{ marginBottom: 60 }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#2c3e50", marginBottom: 24 }}>📊 This week's summary</h2>
            <div style={{ background: "#f5f7fa", padding: 32, borderRadius: 12, border: "1px solid #e0e0e0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 32 }}>
                <div>
                  <div style={{ color: "#999", fontSize: "0.9rem", marginBottom: 8 }}>Lessons completed</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#4CAF50" }}>12</div>
                </div>
                <div>
                  <div style={{ color: "#999", fontSize: "0.9rem", marginBottom: 8 }}>Time spent</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#4CAF50" }}>2h 45m</div>
                </div>
                <div>
                  <div style={{ color: "#999", fontSize: "0.9rem", marginBottom: 8 }}>WPM improvement</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#4CAF50" }}>+8 WPM</div>
                </div>
                <div>
                  <div style={{ color: "#999", fontSize: "0.9rem", marginBottom: 8 }}>Eco actions</div>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#4CAF50" }}>3</div>
                </div>
              </div>

              <button
                style={{
                  padding: "12px 24px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#45a049"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "#4CAF50"; }}
              >
                Send report to email
              </button>
            </div>
          </section>

          {/* SUBSCRIPTION INFO */}
          <section>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#2c3e50", marginBottom: 24 }}>💳 Subscription & Billing</h2>
            <div style={{ background: "#f5f7fa", padding: 32, borderRadius: 12, border: "1px solid #e0e0e0" }}>
              <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-8"
                style={{ display: "grid", gap: 40, marginBottom: 32 }}
              >
                <div>
                  <p style={{ color: "#999", fontSize: "0.9rem", marginBottom: 8 }}>Current plan</p>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2c3e50", marginBottom: 16 }}>Family Plan</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#4CAF50", marginBottom: 16 }}>$9.99/month</div>
                  <p style={{ color: "#666", marginBottom: 8 }}>Next billing date: May 25, 2024</p>
                  <a href="#" style={{ color: "#4CAF50", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem" }}>
                    Manage subscription →
                  </a>
                </div>

                <div>
                  <p style={{ color: "#999", fontSize: "0.9rem", marginBottom: 8 }}>Have a promo code?</p>
                  <div style={{ display: "flex", gap: 12 }}>
                    <input
                      type="text"
                      placeholder="Enter promo code..."
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        border: "1px solid #e0e0e0",
                        borderRadius: 6,
                        fontSize: "0.9rem",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    />
                    <button
                      style={{
                        padding: "10px 20px",
                        background: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#45a049"; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "#4CAF50"; }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ padding: 16, background: "#E8F5E9", borderRadius: 8, border: "1px solid #4CAF50" }}>
                <p style={{ color: "#4CAF50", fontWeight: 600, fontSize: "0.95rem", margin: 0 }}>
                  ✓ Your account is in good standing. All features unlocked for your family!
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}
