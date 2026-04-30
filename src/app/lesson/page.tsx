"use client";
import React, { useState, useEffect, useRef } from "react";
import { lessons, phases, type Lesson } from "@/data/lessons";
import { createClient } from "@/lib/supabase/client";
import "../globals.css";

const FINGER_MAP: Record<string, string> = {
  // Left pinky
  "q": "lpinky", "a": "lpinky", "z": "lpinky", "1": "lpinky", "!": "lpinky", "2": "lpinky", "@": "lpinky",
  // Left ring
  "w": "lring", "s": "lring", "x": "lring", "3": "lring", "#": "lring",
  // Left middle
  "e": "lmiddle", "d": "lmiddle", "c": "lmiddle", "4": "lmiddle", "$": "lmiddle",
  // Left index
  "r": "lindex", "f": "lindex", "v": "lindex", "t": "lindex", "y": "lindex", "5": "lindex", "%": "lindex", "6": "lindex", "^": "lindex",
  // Right index
  "u": "rindex", "j": "rindex", "m": "rindex", "7": "rindex", "&": "rindex", "8": "rindex", "*": "rindex",
  // Right middle
  "i": "rmiddle", "k": "rmiddle", ",": "rmiddle", "9": "rmiddle", "(": "rmiddle",
  // Right ring
  "o": "rring", "l": "rring", ".": "rring", "0": "rring", ")": "rring",
  // Right pinky
  "p": "rpinky", ";": "rpinky", "/": "rpinky", "-": "rpinky", "_": "rpinky", "=": "rpinky", "+": "rpinky", "[": "rpinky", "{": "rpinky", "]": "rpinky", "}": "rpinky", "'": "rpinky", "\"": "rpinky",
  " ": "space",
};

// Finger colors for hand display
const FINGER_COLORS_HAND: Record<string, string> = {
  lpinky: "#EF9A9A",   // Red
  lring: "#FFCC80",    // Orange
  lmiddle: "#FFF176",  // Yellow
  lindex: "#A5D6A7",   // Green
  rindex: "#A5D6A7",   // Green
  rmiddle: "#FFF176",  // Yellow
  rring: "#FFCC80",    // Orange
  rpinky: "#EF9A9A",   // Red
  space: "#B0BEC5",    // Grey
};

const FINGER_COLORS: Record<string, string> = {
  lpinky: "#FFCDD2",
  lring: "#FFE0B2",
  lmiddle: "#FFF9C4",
  lindex: "#C8E6C9",
  rindex: "#C8E6C9",
  rmiddle: "#BBDEFB",
  rring: "#E1BEE7",
  rpinky: "#F8BBD0",
  space: "#E0E0E0",
};

const FINGER_NAMES: Record<string, string> = {
  lpinky: "Pinky",
  lring: "Ring",
  lmiddle: "Middle",
  lindex: "Index",
  rindex: "Index",
  rmiddle: "Middle",
  rring: "Ring",
  rpinky: "Pinky",
  space: "Thumb",
};

const KEYBOARD_LAYOUT = [
  { row: 1, keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"] },
  { row: 2, keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"] },
  { row: 3, keys: ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"] },
];

const TYPING_RULES = [
  {
    icon: "🏠",
    title: "HOME ROW",
    description: "Place fingers on A S D F (left) and J K L ; (right). These are your home keys - always return here."
  },
  {
    icon: "🪑",
    title: "POSTURE",
    description: "Sit straight, feet flat. Screen at eye level. Wrists hover - don't rest on keyboard."
  },
  {
    icon: "👆",
    title: "FINGER ZONES",
    description: "Each finger owns specific keys. Never use wrong finger - it builds bad habits."
  },
  {
    icon: "👀",
    title: "EYES ON SCREEN",
    description: "Never look at keyboard. Trust your muscle memory. Eyes stay on the text always."
  },
  {
    icon: "🎯",
    title: "ACCURACY FIRST",
    description: "Slow and correct beats fast and wrong. Accuracy builds speed naturally over time."
  },
  {
    icon: "📅",
    title: "DAILY PRACTICE",
    description: "10-15 minutes daily is perfect. Consistency beats long occasional sessions."
  }
];

interface UserProfile {
  name: string;
  age: number;
  gender: "boy" | "girl";
}

interface LessonStats {
  wpm: number;
  accuracy: number;
  streak: number;
  ecoWords: number;
  startTime: number | null;
}

type EcoActionType = "planting_tree" | "watering_plants" | "water_for_birds";

const ECO_ACTIONS: Array<{
  type: EcoActionType;
  label: string;
  points: number;
}> = [
  { type: "planting_tree", label: "🌱 Planting a tree", points: 500 },
  { type: "watering_plants", label: "💧 Watering plants", points: 300 },
  { type: "water_for_birds", label: "🐦 Water on roof for birds", points: 400 },
];

export default function LessonPage() {
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [userInput, setUserInput] = useState("");
  const [stats, setStats] = useState<LessonStats>({
    wpm: 0,
    accuracy: 100,
    streak: 0,
    ecoWords: 0,
    startTime: null,
  });
  const [isComplete, setIsComplete] = useState(false);
  const [stars, setStars] = useState(0);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showLessonMap, setShowLessonMap] = useState(false);
  const [showTypingRulesModal, setShowTypingRulesModal] = useState(false);
  const [showEcoUploadModal, setShowEcoUploadModal] = useState(false);
  const [ecoSelectedAction, setEcoSelectedAction] = useState<EcoActionType | null>(null);
  const [ecoFile, setEcoFile] = useState<File | null>(null);
  const [ecoPreviewUrl, setEcoPreviewUrl] = useState<string>("");
  const [ecoSubmitting, setEcoSubmitting] = useState(false);
  const [ecoMessage, setEcoMessage] = useState<string>("");
  const [ecoError, setEcoError] = useState<string>("");
  const [showJoinClassModal, setShowJoinClassModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [joinClassLoading, setJoinClassLoading] = useState(false);
  const [joinClassError, setJoinClassError] = useState("");
  const [joinClassSuccess, setJoinClassSuccess] = useState("");
  const [currentClass, setCurrentClass] = useState<{ id: string; name: string; code: string } | null>(null);

  // Virtual Pet state (stored in Supabase profiles)
  const [petLoading, setPetLoading] = useState(true);
  const [petError, setPetError] = useState("");
  const [showPetSetup, setShowPetSetup] = useState(false);
  const [petType, setPetType] = useState<"panda" | "turtle" | null>(null);
  const [petName, setPetName] = useState("");
  const [petHealth, setPetHealth] = useState(100);
  const [petLastFed, setPetLastFed] = useState<string | null>(null);
  const [petPulse, setPetPulse] = useState(false);
  const [petDance, setPetDance] = useState(false);

  // Onboarding tutorial (3-step, first login only)
  const [studentDisplayName, setStudentDisplayName] = useState<string>("");
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);
  const [onboardingError, setOnboardingError] = useState("");
  const [welcomeData, setWelcomeData] = useState({
    name: "",
    age: "8",
    gender: "" as "boy" | "girl" | "",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const messageTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const petPulseTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const petDanceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const loadCurrentClass = async () => {
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setCurrentClass(null);
        return;
      }

      const { data: enrollment, error: enrollError } = await supabase
        .from("class_enrollments")
        .select("class_id")
        .eq("student_id", userData.user.id)
        .limit(1)
        .maybeSingle();

      if (enrollError) throw enrollError;
      const classId = (enrollment as { class_id?: string } | null)?.class_id;
      if (!classId) {
        setCurrentClass(null);
        return;
      }

      const { data: cls, error: clsError } = await supabase
        .from("classes")
        .select("id, name, code")
        .eq("id", classId)
        .single();
      if (clsError) throw clsError;
      setCurrentClass(cls as { id: string; name: string; code: string });
    } catch {
      // Non-blocking — lesson should still work even if class lookup fails.
      setCurrentClass(null);
    }
  };

  useEffect(() => {
    if (!ecoFile) {
      setEcoPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(ecoFile);
    setEcoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [ecoFile]);

  // Get current lesson data
  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];
  const currentPhase = phases.find(p => p.id === currentLesson.phase);

  // Initialize from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    const savedLessonId = localStorage.getItem("currentLessonId");
    const queryLesson =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("lesson")
        : null;
    
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      setShowWelcomeModal(true);
    }
    
    const queryLessonId = queryLesson ? Number(queryLesson) : NaN;
    if (Number.isFinite(queryLessonId) && queryLessonId >= 1 && queryLessonId <= 100) {
      setCurrentLessonId(queryLessonId);
      localStorage.setItem("currentLessonId", String(queryLessonId));
      return;
    }

    if (savedLessonId) setCurrentLessonId(parseInt(savedLessonId));
  }, []);

  useEffect(() => {
    void loadCurrentClass();
  }, []);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const petMood: "happy" | "neutral" | "sad" =
    petHealth >= 70 ? "happy" : petHealth >= 40 ? "neutral" : "sad";

  const petEmoji = petType === "turtle" ? "🐢" : "🐼";

  const loadPetFromProfile = async () => {
    setPetLoading(true);
    setPetError("");
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setPetError("You must be logged in to use the virtual pet.");
        setShowPetSetup(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, pet_type, pet_name, pet_health, pet_last_fed, onboarding_completed")
        .eq("id", userData.user.id)
        .single();
      if (profileError) throw profileError;

      const onboarding = Boolean((profile as any)?.onboarding_completed);
      setOnboardingCompleted(onboarding);
      setStudentDisplayName(((profile as any)?.full_name as string | null)?.trim() || "");
      setShowOnboarding(!onboarding);
      setOnboardingStep(1);

      const nextPetType = (profile as any)?.pet_type as "panda" | "turtle" | null;
      const nextPetName = ((profile as any)?.pet_name as string | null) ?? "";
      const nextHealth = Number((profile as any)?.pet_health ?? 100);
      const nextLastFed = ((profile as any)?.pet_last_fed as string | null) ?? null;

      setPetType(nextPetType);
      setPetName(nextPetName);
      setPetHealth(clamp(Number.isFinite(nextHealth) ? nextHealth : 100, 0, 100));
      setPetLastFed(nextLastFed);

      // Pet setup screen should not interrupt onboarding; only show as fallback after onboarding.
      if (!onboarding && (!nextPetType || !nextPetName)) {
        setShowPetSetup(false);
      } else {
        setShowPetSetup(!nextPetType || !nextPetName);
      }

      // Health decay: -5 for each full 24h with no feeding (no completed lesson).
      if (nextLastFed) {
        const last = new Date(nextLastFed).getTime();
        if (Number.isFinite(last)) {
          const days = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));
          if (days > 0) {
            const dec = days * 5;
            const decayed = clamp(nextHealth - dec, 0, 100);
            if (decayed !== nextHealth) {
              setPetHealth(decayed);
              const { error: updateError } = await supabase
                .from("profiles")
                .update({ pet_health: decayed })
                .eq("id", userData.user.id);
              if (updateError) throw updateError;
            }
          }
        }
      }
    } catch (err) {
      setPetError(err instanceof Error ? err.message : "Failed to load pet.");
    } finally {
      setPetLoading(false);
      setOnboardingLoading(false);
    }
  };

  useEffect(() => {
    void loadPetFromProfile();
    return () => {
      if (petPulseTimeoutRef.current) clearTimeout(petPulseTimeoutRef.current);
      if (petDanceTimeoutRef.current) clearTimeout(petDanceTimeoutRef.current);
    };
  }, []);

  const savePetSetup = async () => {
    setPetError("");
    try {
      if (!petType) {
        setPetError("Please choose a pet.");
        return;
      }
      if (!petName.trim()) {
        setPetError("Please name your pet.");
        return;
      }

      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setPetError("You must be logged in to set up your pet.");
        return;
      }

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("profiles")
        .update({
          pet_type: petType,
          pet_name: petName.trim(),
          pet_health: clamp(petHealth, 0, 100),
          pet_last_fed: now,
        })
        .eq("id", userData.user.id);
      if (error) throw error;

      setPetLastFed(now);
      setShowPetSetup(false);
    } catch (err) {
      setPetError(err instanceof Error ? err.message : "Failed to save pet.");
    }
  };

  const saveOnboardingCompleted = async (opts?: { defaultPetIfMissing?: boolean }) => {
    setOnboardingError("");
    try {
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setOnboardingError("You must be logged in.");
        return;
      }

      const now = new Date().toISOString();
      const updates: Record<string, unknown> = { onboarding_completed: true };

      if (opts?.defaultPetIfMissing && (!petType || !petName.trim())) {
        updates.pet_type = "panda";
        updates.pet_name = "Buddy";
        updates.pet_health = clamp(petHealth || 100, 0, 100);
        updates.pet_last_fed = now;
        setPetType("panda");
        setPetName("Buddy");
        setPetLastFed(now);
      }

      const { error } = await supabase.from("profiles").update(updates).eq("id", userData.user.id);
      if (error) throw error;

      setOnboardingCompleted(true);
      setShowOnboarding(false);
    } catch (err) {
      setOnboardingError(err instanceof Error ? err.message : "Failed to update onboarding.");
    }
  };

  const savePetFromOnboarding = async () => {
    setOnboardingError("");
    try {
      if (!petType) {
        setOnboardingError("Please choose a companion.");
        return;
      }
      if (!petName.trim()) {
        setOnboardingError("Please name your pet.");
        return;
      }

      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setOnboardingError("You must be logged in.");
        return;
      }

      const now = new Date().toISOString();
      const { error } = await supabase
        .from("profiles")
        .update({
          pet_type: petType,
          pet_name: petName.trim(),
          pet_health: clamp(petHealth, 0, 100),
          pet_last_fed: now,
        })
        .eq("id", userData.user.id);
      if (error) throw error;

      setPetLastFed(now);
      setShowPetSetup(false);
    } catch (err) {
      setOnboardingError(err instanceof Error ? err.message : "Failed to save pet.");
    }
  };

  const bumpPetOnce = () => {
    setPetPulse(true);
    if (petPulseTimeoutRef.current) clearTimeout(petPulseTimeoutRef.current);
    petPulseTimeoutRef.current = setTimeout(() => setPetPulse(false), 300);
  };

  // Save current lesson to localStorage
  useEffect(() => {
    localStorage.setItem("currentLessonId", currentLessonId.toString());
  }, [currentLessonId]);

  // Initialize typing
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Reset stats for new lesson
    setUserInput("");
    setStats({
      wpm: 0,
      accuracy: 100,
      streak: 0,
      ecoWords: 0,
      startTime: null,
    });
    setIsComplete(false);
    setStars(0);
  }, [currentLessonId]);

  // Calculate WPM and accuracy against the sentence
  useEffect(() => {
    if (userInput.length === 0) return;

    const now = Date.now();
    const startTime = stats.startTime || now;
    const timeInMinutes = (now - startTime) / 1000 / 60;
    const words = userInput.split(" ").length;
    const wpm = Math.max(0, Math.round(words / Math.max(timeInMinutes, 0.016)));

    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === currentLesson.sentence[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / userInput.length) * 100);

    setStats((prev) => ({
      ...prev,
      wpm,
      accuracy,
      startTime: prev.startTime || startTime,
    }));
  }, [userInput, stats.startTime, currentLesson]);

  // Calculate streak
  useEffect(() => {
    let streak = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === currentLesson.sentence[i]) {
        streak++;
      } else {
        break;
      }
    }
    setStats((prev) => ({ ...prev, streak }));
  }, [userInput, currentLesson]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastChar = value[value.length - 1];

    // Check if typed character matches
    if (value.length > userInput.length) {
      const expectedChar = currentLesson.sentence[userInput.length];
      if (lastChar !== expectedChar) {
        setShakeKey(lastChar);
        shakeTimeoutRef.current = setTimeout(() => setShakeKey(null), 300);
      } else {
        // Correct key pressed
        bumpPetOnce();
        const newEcoWords = value.split(" ").length - 1;
        setStats((prev) => ({ ...prev, ecoWords: newEcoWords }));

        // Encouragement every 5 correct keys
        if (stats.streak > 0 && stats.streak % 5 === 0) {
          const baseMessages = [
            "Great typing! 🌟",
            "You're doing amazing! 💚",
            "Keep it up! 🌱",
            "Fantastic! 🌍",
            "You're a pro! 🎯",
          ];
          
          // Use personalized messages if profile exists
          if (userProfile) {
            const personalized = [
              `Amazing ${userProfile.name}! 🌿`,
              `Keep going ${userProfile.name}! 💪`,
              `You're brilliant ${userProfile.name}! ✨`,
              `${userProfile.name} is on fire! 🔥`,
              `${userProfile.name} rocks! 🎵`,
            ];
            const msg = personalized[Math.floor(Math.random() * personalized.length)];
            setMessages([msg]);
          } else {
            const msg = baseMessages[Math.floor(Math.random() * baseMessages.length)];
            setMessages([msg]);
          }
          messageTimeoutRef.current = setTimeout(() => setMessages([]), 2000);
        }
      }
    }

    // Highlight next key
    if (value.length < currentLesson.sentence.length) {
      setHighlightKey(currentLesson.sentence[value.length]);
    } else {
      setHighlightKey(null);
    }

    setUserInput(value);

    // Check if lesson complete
    if (value === currentLesson.sentence) {
      setIsComplete(true);
      // Calculate stars
      let earnedStars = 1;
      if (stats.accuracy >= 90) earnedStars++;
      if (stats.wpm >= (currentLesson.targetWPM || 20)) earnedStars++;
      setStars(earnedStars);
    }
  };

  // Feed pet on lesson completion (+10 health) and set last fed timestamp.
  useEffect(() => {
    const feedPet = async () => {
      if (!isComplete) return;
      if (!petType || !petName) return;

      setPetDance(true);
      if (petDanceTimeoutRef.current) clearTimeout(petDanceTimeoutRef.current);
      petDanceTimeoutRef.current = setTimeout(() => setPetDance(false), 1400);

      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) return;

        const nextHealth = clamp(petHealth + 10, 0, 100);
        const now = new Date().toISOString();
        setPetHealth(nextHealth);
        setPetLastFed(now);

        const { error } = await supabase
          .from("profiles")
          .update({ pet_health: nextHealth, pet_last_fed: now })
          .eq("id", userData.user.id);
        if (error) throw error;
      } catch {
        // Non-blocking
      }
    };

    void feedPet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  const handleNextLesson = () => {
    if (currentLessonId < 100) {
      setCurrentLessonId(currentLessonId + 1);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonId > 1) {
      setCurrentLessonId(currentLessonId - 1);
    }
  };

  const handleSelectLesson = (lessonId: number) => {
    setCurrentLessonId(lessonId);
    setShowLessonMap(false);
  };

  const handleReset = () => {
    setUserInput("");
    setIsComplete(false);
    setStats({
      wpm: 0,
      accuracy: 100,
      streak: 0,
      ecoWords: 0,
      startTime: null,
    });
    setStars(0);
    setMessages([]);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSubmitEcoPhoto = async () => {
    setEcoError("");
    setEcoMessage("");

    if (!ecoSelectedAction) {
      setEcoError("Please choose an eco action.");
      return;
    }
    if (!ecoFile) {
      setEcoError("Please upload a photo.");
      return;
    }

    const action = ECO_ACTIONS.find((a) => a.type === ecoSelectedAction);
    if (!action) {
      setEcoError("Invalid eco action.");
      return;
    }

    setEcoSubmitting(true);
    try {
      const supabase = createClient();

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setEcoError("You must be logged in to submit a photo.");
        return;
      }

      const studentId = userData.user.id;
      const safeName = ecoFile.name.replace(/[^\w.\-]+/g, "_");
      const objectPath = `${studentId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("eco-photos")
        .upload(objectPath, ecoFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: ecoFile.type || undefined,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("eco-photos")
        .getPublicUrl(objectPath);

      const photoUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from("eco_photos").insert([
        {
          student_id: studentId,
          action_type: action.type,
          photo_url: photoUrl,
          status: "pending",
          points_awarded: action.points,
        },
      ]);

      if (insertError) throw insertError;

      setEcoMessage("Photo submitted! Waiting for parent approval 🌿");
      setEcoFile(null);
      setEcoSelectedAction(null);
      setShowEcoUploadModal(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit photo.";
      setEcoError(message);
    } finally {
      setEcoSubmitting(false);
    }
  };

  const handleJoinClass = async () => {
    setJoinClassError("");
    setJoinClassSuccess("");
    setJoinClassLoading(true);
    try {
      const code = classCode.trim().toUpperCase();
      if (!code) {
        setJoinClassError("Please enter a class code.");
        return;
      }
      const supabase = createClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) {
        setJoinClassError("You must be logged in to join a class.");
        return;
      }

      const { data: cls, error: clsError } = await supabase
        .from("classes")
        .select("id, name, code")
        .eq("code", code)
        .single();
      if (clsError) throw clsError;

      const classId = (cls as { id: string }).id;
      const { error: enrollError } = await supabase
        .from("class_enrollments")
        .upsert(
          { class_id: classId, student_id: userData.user.id },
          { onConflict: "class_id,student_id" }
        );
      if (enrollError) throw enrollError;

      setJoinClassSuccess(`Joined class: ${(cls as { name?: string }).name || code}`);
      setShowJoinClassModal(false);
      setClassCode("");
      await loadCurrentClass();
    } catch (err) {
      setJoinClassError(err instanceof Error ? err.message : "Failed to join class.");
    } finally {
      setJoinClassLoading(false);
    }
  };

  const progressPercent = (userInput.length / currentLesson.sentence.length) * 100;
  const lessonProgress = ((currentLessonId - 1) / 100) * 100;

  const handleWelcomeSubmit = () => {
    if (welcomeData.name && welcomeData.gender) {
      const profile: UserProfile = {
        name: welcomeData.name,
        age: parseInt(welcomeData.age),
        gender: welcomeData.gender,
      };
      setUserProfile(profile);
      localStorage.setItem("userProfile", JSON.stringify(profile));
      setShowWelcomeModal(false);
    }
  };

  // Determine color theme based on gender
  const getThemeColor = () => {
    if (!userProfile) return "#4CAF50";
    return userProfile.gender === "boy" ? "#2196F3" : "#E91E63";
  };

  const getGlowColor = () => {
    if (!userProfile) return "rgba(76,175,80,0.25)";
    return userProfile.gender === "boy" ? "rgba(33,150,243,0.25)" : "rgba(233,30,99,0.25)";
  };

  const getGlowBorder = () => {
    if (!userProfile) return "#4CAF50";
    return userProfile.gender === "boy" ? "#2196F3" : "#E91E63";
  };

  const renderHandSVG = (hand: "left" | "right") => {
    const isLeft = hand === "left";
    const fingerLabels = ["Pinky", "Ring", "Middle", "Index", "Thumb"];
    const fingerMapping = isLeft
      ? ["lpinky", "lring", "lmiddle", "lindex", "space"]
      : ["rindex", "rmiddle", "rring", "rpinky", "space"];
    
    // Determine which finger is highlighted
    let highlightedFingerType = "";
    if (highlightKey) {
      highlightedFingerType = FINGER_MAP[highlightKey] || "";
    }

    return (
      <div style={{ textAlign: "center", flex: 1 }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "8px" }}>
          {isLeft ? "Left Hand" : "Right Hand"}
        </div>
        <svg width="80" height="140" viewBox="0 0 80 140" style={{ margin: "0 auto", display: "block" }}>
          {/* Hand base */}
          <ellipse cx="40" cy="110" rx="18" ry="20" fill="#F5DEB3" stroke="#D3A574" strokeWidth="1" />
          
          {/* Fingers */}
          {[0, 1, 2, 3].map((i) => {
            const xPositions = isLeft ? [15, 27, 39, 51] : [29, 41, 53, 65];
            const fingerType = fingerMapping[i];
            const isGlowing = fingerType === highlightedFingerType;
            
            return (
              <g key={i}>
                <rect
                  x={xPositions[i] - 5}
                  y={isGlowing ? 10 : 20}
                  width="10"
                  height="80"
                  fill={FINGER_COLORS_HAND[fingerType]}
                  stroke="#999"
                  strokeWidth="0.5"
                  rx="4"
                  style={{
                    filter: isGlowing ? "brightness(1.4) drop-shadow(0 0 8px currentColor)" : "opacity: 0.5",
                    transition: "all 0.3s ease",
                  }}
                  opacity={isGlowing ? 1 : 0.5}
                />
                <circle
                  cx={xPositions[i]}
                  cy={isGlowing ? 8 : 18}
                  r="6"
                  fill={FINGER_COLORS_HAND[fingerType]}
                  stroke="#999"
                  strokeWidth="0.5"
                  style={{
                    filter: isGlowing ? "brightness(1.4) drop-shadow(0 0 8px currentColor)" : "opacity: 0.5",
                    transition: "all 0.3s ease",
                  }}
                  opacity={isGlowing ? 1 : 0.5}
                />
              </g>
            );
          })}
          
          {/* Thumb */}
          {(() => {
            const thumbType = fingerMapping[4];
            const isGlowing = thumbType === highlightedFingerType;
            const thumbX = isLeft ? 15 : 65;
            return (
              <g key="thumb">
                <ellipse
                  cx={thumbX}
                  cy="100"
                  rx="7"
                  ry="14"
                  fill={FINGER_COLORS_HAND[thumbType]}
                  stroke="#999"
                  strokeWidth="0.5"
                  style={{
                    filter: isGlowing ? "brightness(1.4) drop-shadow(0 0 8px currentColor)" : "opacity: 0.5",
                    transition: "all 0.3s ease",
                  }}
                  opacity={isGlowing ? 1 : 0.5}
                />
              </g>
            );
          })()}
        </svg>
        <div style={{ fontSize: "10px", color: "#999", marginTop: "8px", display: "flex", justifyContent: "space-around" }}>
          {fingerLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>
      {/* ONBOARDING OVERLAY */}
      {showOnboarding && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2500,
            background:
              "linear-gradient(180deg,#162d1e 0%,#1f4d35 25%,#2d6a4f 55%,#52b788 80%,#81c99e 100%)",
            overflow: "hidden",
          }}
        >
          {/* Animated leaves */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="onb-leaf"
              style={{
                left: `${(i * 9) % 95}%`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${7 + (i % 4)}s`,
              }}
            />
          ))}

          {/* Trees at bottom */}
          <div className="onb-trees" aria-hidden />

          {/* Skip */}
          <button
            type="button"
            onClick={() => void saveOnboardingCompleted({ defaultPetIfMissing: true })}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.22)",
              color: "rgba(255,255,255,0.9)",
              padding: "8px 12px",
              borderRadius: 999,
              fontWeight: 800,
              cursor: "pointer",
              zIndex: 3,
            }}
          >
            Skip
          </button>

          <div
            style={{
              position: "relative",
              zIndex: 2,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
            }}
          >
            <div
              style={{
                width: "min(760px, 94vw)",
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 20,
                boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  transform: `translateX(-${(onboardingStep - 1) * 100}%)`,
                  transition: "transform 400ms ease",
                  width: "300%",
                }}
              >
                {/* STEP 1 */}
                <div style={{ width: "100%", padding: 26 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.18em", color: "#2d6a4f" }}>
                      STEP 1/3
                    </div>
                    <div style={{ fontSize: 34, fontWeight: 950, color: "#2c3e50", marginTop: 10, lineHeight: 1.15 }}>
                      Welcome to My Green Keys{studentDisplayName ? `, ${studentDisplayName}` : ""}! 🌿
                    </div>
                    <div style={{ marginTop: 10, color: "#6b7280", fontSize: 16, fontWeight: 700 }}>
                      Learn to type while helping the planet!
                    </div>
                  </div>

                  <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
                    <div className="onb-heroTrees" />
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(2)}
                        style={{
                          padding: "14px 20px",
                          borderRadius: 999,
                          border: "none",
                          background: "#4CAF50",
                          color: "white",
                          fontWeight: 900,
                          fontSize: 16,
                          cursor: "pointer",
                        }}
                      >
                        Let&apos;s Start! →
                      </button>
                    </div>
                  </div>
                </div>

                {/* STEP 2 */}
                <div style={{ width: "100%", padding: 26 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.18em", color: "#2d6a4f" }}>
                      STEP 2/3
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 950, color: "#2c3e50", marginTop: 10 }}>
                      Choose your companion!
                    </div>
                    <div style={{ marginTop: 8, color: "#6b7280", fontSize: 14, fontWeight: 700 }}>
                      Your pet stays healthy when you type every day! 🌱
                    </div>
                  </div>

                  {onboardingError && (
                    <div style={{ marginTop: 14, background: "#ffebee", border: "1px solid #ef5350", color: "#c62828", padding: "10px 12px", borderRadius: 12, fontWeight: 900 }}>
                      {onboardingError}
                    </div>
                  )}

                  <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setPetType("panda")}
                      style={{
                        borderRadius: 18,
                        border: petType === "panda" ? "3px solid #4CAF50" : "1px solid #e0e0e0",
                        background: petType === "panda" ? "#E8F5E9" : "white",
                        padding: 16,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 42 }}>🐼</div>
                      <div style={{ fontWeight: 950, color: "#2c3e50", marginTop: 6 }}>Panda</div>
                      <div style={{ color: "#6b7280", fontWeight: 700, fontSize: 13, marginTop: 2 }}>Friendly and playful.</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPetType("turtle")}
                      style={{
                        borderRadius: 18,
                        border: petType === "turtle" ? "3px solid #4CAF50" : "1px solid #e0e0e0",
                        background: petType === "turtle" ? "#E8F5E9" : "white",
                        padding: 16,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontSize: 42 }}>🐢</div>
                      <div style={{ fontWeight: 950, color: "#2c3e50", marginTop: 6 }}>Turtle</div>
                      <div style={{ color: "#6b7280", fontWeight: 700, fontSize: 13, marginTop: 2 }}>Calm and steady.</div>
                    </button>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: "block", fontWeight: 900, color: "#2c3e50", marginBottom: 6 }}>
                      Name your pet
                    </label>
                    <input
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="e.g. Bamboo"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "2px solid #e0e0e0",
                        fontSize: 16,
                        fontWeight: 800,
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "1px solid #e0e0e0",
                        background: "white",
                        fontWeight: 950,
                        cursor: "pointer",
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await savePetFromOnboarding();
                        if (!onboardingError) setOnboardingStep(3);
                      }}
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "none",
                        background: "#4CAF50",
                        color: "white",
                        fontWeight: 950,
                        cursor: "pointer",
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* STEP 3 */}
                <div style={{ width: "100%", padding: 26 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.18em", color: "#2d6a4f" }}>
                      STEP 3/3
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 950, color: "#2c3e50", marginTop: 10 }}>
                      Here&apos;s how My Green Keys works!
                    </div>
                  </div>

                  <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                    {[
                      { icon: "⌨️", title: "Type lessons to improve your speed" },
                      { icon: "🌿", title: "Earn eco points with nature sentences" },
                      { icon: "📸", title: "Upload eco photos for bonus rewards" },
                      { icon: "🏆", title: "Earn badges and climb leaderboard" },
                    ].map((c, idx) => (
                      <div
                        key={idx}
                        className="onb-card"
                        style={{ animationDelay: `${idx * 140}ms` }}
                      >
                        <div style={{ fontSize: 22 }}>{c.icon}</div>
                        <div style={{ fontWeight: 950, color: "#2c3e50" }}>{c.title}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                    <span className="onb-dot onb-dot-off" />
                    <span className="onb-dot onb-dot-off" />
                    <span className="onb-dot" />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "1px solid #e0e0e0",
                        background: "white",
                        fontWeight: 950,
                        cursor: "pointer",
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await saveOnboardingCompleted();
                        window.location.href = "/lesson";
                      }}
                      style={{
                        flex: 1,
                        padding: "12px 14px",
                        borderRadius: 14,
                        border: "none",
                        background: "#FFEB3B",
                        color: "#1B4D30",
                        fontWeight: 950,
                        cursor: "pointer",
                      }}
                    >
                      Start Typing! 🚀
                    </button>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "0 0 18px" }}>
                <span className={`onb-dot ${onboardingStep === 1 ? "" : "onb-dot-off"}`} />
                <span className={`onb-dot ${onboardingStep === 2 ? "" : "onb-dot-off"}`} />
                <span className={`onb-dot ${onboardingStep === 3 ? "" : "onb-dot-off"}`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PET SETUP (first time) */}
      {!showOnboarding && showPetSetup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 28,
              borderRadius: 18,
              width: "min(680px, 94vw)",
              boxShadow: "0 12px 50px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.18em", color: "#4CAF50" }}>
                VIRTUAL PET
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#2c3e50", marginTop: 6 }}>
                Choose Your Pet
              </div>
              <div style={{ color: "#666", marginTop: 6 }}>
                Complete lessons to keep your pet healthy and happy.
              </div>
            </div>

            {petError && (
              <div style={{ background: "#ffebee", border: "1px solid #ef5350", color: "#c62828", padding: "10px 12px", borderRadius: 12, marginBottom: 12, fontSize: "13px", fontWeight: 800 }}>
                {petError}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => setPetType("panda")}
                style={{
                  borderRadius: 16,
                  border: petType === "panda" ? "3px solid #4CAF50" : "1px solid #e0e0e0",
                  background: petType === "panda" ? "#E8F5E9" : "#fff",
                  padding: 18,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 42, lineHeight: 1 }}>🐼</div>
                <div style={{ fontWeight: 900, color: "#2c3e50", marginTop: 8 }}>Panda</div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Loves typing streaks.</div>
              </button>

              <button
                type="button"
                onClick={() => setPetType("turtle")}
                style={{
                  borderRadius: 16,
                  border: petType === "turtle" ? "3px solid #4CAF50" : "1px solid #e0e0e0",
                  background: petType === "turtle" ? "#E8F5E9" : "#fff",
                  padding: 18,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 42, lineHeight: 1 }}>🐢</div>
                <div style={{ fontWeight: 900, color: "#2c3e50", marginTop: 8 }}>Turtle</div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>Slow and steady typer.</div>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              <label style={{ fontWeight: 900, color: "#2c3e50" }}>Pet name</label>
              <input
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g. Bamboo"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  fontSize: 16,
                  fontWeight: 700,
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => void savePetSetup()}
              style={{
                width: "100%",
                marginTop: 14,
                padding: "14px 16px",
                borderRadius: 14,
                border: "none",
                background: "#4CAF50",
                color: "white",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              Save Pet
            </button>
          </div>
        </div>
      )}
      {/* JOIN CLASS MODAL */}
      {showJoinClassModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1004,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 16,
              width: "min(520px, 92vw)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#2c3e50" }}>Join Class</div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: 4 }}>
                  Enter your 6-character class code (example: GRN42X).
                </div>
              </div>
              <button
                onClick={() => setShowJoinClassModal(false)}
                style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {joinClassError && (
              <div style={{ background: "#ffebee", border: "1px solid #ef5350", color: "#c62828", padding: "10px 12px", borderRadius: 12, marginBottom: 12, fontSize: "13px", fontWeight: 700 }}>
                {joinClassError}
              </div>
            )}

            <input
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="GRN42X"
              maxLength={6}
              disabled={joinClassLoading}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "2px solid #e0e0e0",
                borderRadius: 12,
                fontSize: "18px",
                letterSpacing: "0.12em",
                fontWeight: 900,
                color: "#2c3e50",
              }}
            />

            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setShowJoinClassModal(false)}
                disabled={joinClassLoading}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  background: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: 12,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleJoinClass()}
                disabled={joinClassLoading}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  background: joinClassLoading ? "#bbb" : "#4CAF50",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 900,
                  color: "white",
                  cursor: joinClassLoading ? "not-allowed" : "pointer",
                }}
              >
                {joinClassLoading ? "Joining..." : "Join"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP NAV BAR */}
      <nav style={{
        background: "#2c3e50",
        color: "white",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: "300px" }}>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>Lesson {currentLessonId} of 100</div>
            <div style={{ fontSize: "16px", fontWeight: 600 }}>{currentLesson.title}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24, position: "relative" }}>
          {currentPhase && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>{currentPhase.icon}</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>{currentPhase.name}</div>
            </div>
          )}
          <div style={{ fontSize: "13px", textAlign: "center" }}>
            <div style={{ color: "#4CAF50", fontWeight: 700, fontSize: "18px" }}>{stats.wpm}</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>WPM</div>
          </div>
          <div style={{ fontSize: "13px", textAlign: "center" }}>
            <div style={{ color: "#4CAF50", fontWeight: 700, fontSize: "18px" }}>{stats.accuracy}%</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Accuracy</div>
          </div>
          <div style={{ fontSize: "13px", textAlign: "center" }}>
            <div style={{ color: "#4CAF50", fontWeight: 700, fontSize: "18px" }}>{stats.streak}</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Streak</div>
          </div>
          {userProfile && (
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              Hi {userProfile.name}! 👋
            </div>
          )}

          {/* PET WIDGET */}
          <div
            style={{
              position: "absolute",
              right: -10,
              top: -2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: 120,
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 800, marginBottom: 2 }}>
              {petName || "My Pet"}
            </div>
            <div
              className={[
                "pet",
                `pet-${petMood}`,
                petPulse ? "pet-pulse" : "",
                petDance ? "pet-dance" : "",
              ].join(" ")}
              style={{ fontSize: 34, lineHeight: 1 }}
            >
              {petEmoji}
            </div>
            <div
              style={{
                width: 86,
                height: 8,
                background: "rgba(255,255,255,0.22)",
                borderRadius: 999,
                overflow: "hidden",
                marginTop: 6,
                border: "1px solid rgba(255,255,255,0.18)",
              }}
              aria-label="Pet health"
            >
              <div
                style={{
                  width: `${clamp(petHealth, 0, 100)}%`,
                  height: "100%",
                  background:
                    petMood === "happy"
                      ? "#4CAF50"
                      : petMood === "neutral"
                        ? "#FFEB3B"
                        : "#f44336",
                  transition: "width 0.35s ease",
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* PROGRESS BAR */}
      <div style={{
        height: "4px",
        background: "#e0e0e0",
        position: "relative",
      }}>
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #4CAF50 0%, #2196F3 100%)",
            width: `${lessonProgress}%`,
            transition: "width 0.3s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-8px",
            left: `${lessonProgress}%`,
            transform: "translateX(-50%)",
            fontSize: "16px",
            transition: "left 0.3s ease",
          }}
        >
          🌿
        </div>
      </div>

      {/* LESSON INFO BAR */}
      <div style={{
        background: "white",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e0e0e0",
      }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{
            background: currentLesson.module === "eco" ? "#E8F5E9" : 
                       currentLesson.module === "health" ? "#E3F2FD" :
                       currentLesson.module === "manners" ? "#FCE4EC" : "#F5F5F5",
            color: currentLesson.module === "eco" ? "#4CAF50" : 
                   currentLesson.module === "health" ? "#2196F3" :
                   currentLesson.module === "manners" ? "#E91E63" : "#666",
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: 600,
          }}>
            {currentLesson.module === "eco" ? "🌍 Eco" : 
             currentLesson.module === "health" ? "💪 Health" :
             currentLesson.module === "manners" ? "🤝 Manners" : "⌨️ Typing"}
          </span>
          <span style={{ color: "#666", fontSize: "14px" }}>
            New Keys: {currentLesson.newKeys.join(", ")}
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => {
              setJoinClassError("");
              setJoinClassSuccess("");
              setShowJoinClassModal(true);
            }}
            style={{
              background: "white",
              border: "2px solid #4CAF50",
              color: "#4CAF50",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = "#4CAF50";
              target.style.color = "white";
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = "white";
              target.style.color = "#4CAF50";
            }}
          >
            🏫 Join Class
          </button>
          <button
            onClick={() => {
              window.location.href = "/lesson-map";
            }}
            style={{
              background: "white",
              border: "2px solid #4CAF50",
              color: "#4CAF50",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = "#4CAF50";
              target.style.color = "white";
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = "white";
              target.style.color = "#4CAF50";
            }}
          >
            📚 Lesson Map
          </button>
          <button
            onClick={() => {
              setEcoError("");
              setEcoMessage("");
              setEcoFile(null);
              setEcoSelectedAction(null);
              setShowEcoUploadModal(true);
            }}
            style={{
              background: "#4CAF50",
              border: "none",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            📸 Submit Eco Photo
          </button>
        </div>
      </div>

      {joinClassSuccess && (
        <div style={{ background: "#E8F5E9", borderBottom: "1px solid #4CAF50", padding: "10px 24px", color: "#2e7d32", fontWeight: 800 }}>
          {joinClassSuccess}
        </div>
      )}

      {currentClass && (
        <div style={{ background: "white", borderBottom: "1px solid #e0e0e0", padding: "10px 24px", color: "#374151", fontWeight: 700 }}>
          Joined class: <span style={{ color: "#4CAF50" }}>{currentClass.name}</span> <span style={{ color: "#999" }}>({currentClass.code})</span>
        </div>
      )}

      {/* ECO SCENE STRIP */}
      <div style={{
        height: "60px",
        background: "linear-gradient(180deg, #B4E8B4 0%, #A5E0A5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "0 24px",
        borderBottom: "2px solid #4CAF50",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Animated trees */}
        <svg width="40" height="50" viewBox="0 0 40 50" style={{
          animation: "sway 2.5s ease-in-out infinite",
        }}>
          <rect x="17" y="32" width="6" height="18" fill="#6B3F1E" />
          <polygon points="20,8 32,28 8,28" fill="#2D6A4F" />
          <polygon points="20,18 28,32 12,32" fill="#40916C" />
          <polygon points="20,26 25,35 15,35" fill="#52B788" />
        </svg>

        {/* Eco counter */}
        <div style={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#1B4D30",
        }}>
          {userProfile && `Hi ${userProfile.name}! `}
          {stats.ecoWords} eco words typed 🌍
        </div>

        {/* Floating leaves */}
        <div style={{
          position: "absolute",
          right: "5%",
          top: "10px",
          animation: "float 3s ease-in-out infinite",
          fontSize: "20px",
        }}>
          🍃
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        {/* DRILL AND SENTENCE BOX */}
        <div style={{
          background: "white",
          padding: "24px",
          borderRadius: "8px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "6px" }}>DRILL TEXT</div>
            <div style={{
              fontFamily: "Roboto Mono, monospace",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#999",
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
            }}>
              {currentLesson.drill}
            </div>
          </div>

          <div style={{ marginBottom: "0" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "6px" }}>SENTENCE</div>
            <div style={{
              fontFamily: "Roboto Mono, monospace",
              fontSize: "22px",
              lineHeight: 1.8,
              minHeight: "60px",
            }}>
              {currentLesson.sentence.split("").map((char, index) => {
                let color = "#999"; // Grey - not yet typed
                if (index < userInput.length) {
                  color = userInput[index] === char ? "#4CAF50" : "#f44336"; // Green correct, Red error
                }
                const isCurrentPos = index === userInput.length;
                const style: React.CSSProperties = {
                  color,
                  fontWeight: userInput[index] === char ? 600 : 400,
                  display: "inline",
                  position: "relative",
                };
                if (isCurrentPos) {
                  style.borderBottom = "2px solid #2196F3";
                  style.animation = "blink 1s infinite";
                }
                if (userInput[index] !== char && index < userInput.length) {
                  style.background = "rgba(244, 67, 54, 0.2)";
                }
                return <span key={index} style={style}>{char}</span>;
              })}
            </div>
          </div>
        </div>

        {/* TYPING INPUT */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Click here and start typing..."
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            fontFamily: "Roboto Mono, monospace",
            border: "2px solid #4CAF50",
            borderRadius: "8px",
            marginBottom: "24px",
            boxSizing: "border-box",
          }}
          disabled={isComplete}
          autoFocus
        />

        {/* NAVIGATION BUTTONS */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          justifyContent: "center",
        }}>
          <button
            onClick={handlePrevLesson}
            disabled={currentLessonId === 1}
            style={{
              padding: "12px 24px",
              background: currentLessonId === 1 ? "#ccc" : "white",
              border: currentLessonId === 1 ? "1px solid #ddd" : "2px solid #4CAF50",
              color: currentLessonId === 1 ? "#999" : "#4CAF50",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: currentLessonId === 1 ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            ← Previous Lesson
          </button>
          <button
            onClick={() => setShowLessonMap(true)}
            style={{
              padding: "12px 24px",
              background: "white",
              border: "2px solid #2196F3",
              color: "#2196F3",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            📚 See All {lessons.length} Lessons
          </button>
          <button
            onClick={handleNextLesson}
            disabled={currentLessonId === 100}
            style={{
              padding: "12px 24px",
              background: currentLessonId === 100 ? "#ccc" : "#4CAF50",
              border: "none",
              color: "white",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: currentLessonId === 100 ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Next Lesson →
          </button>
        </div>

        {/* VIRTUAL KEYBOARD */}
        <div
          className="overflow-x-auto"
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "8px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div className="min-w-[520px]">
            {KEYBOARD_LAYOUT.map((row) => (
              <div
                key={row.row}
                style={{
                  display: "flex",
                  gap: "6px",
                  marginBottom: "8px",
                  justifyContent: "center",
                }}
              >
              {row.keys.map((key) => {
                const fingerType = FINGER_MAP[key] || "other";
                const isHighlighted = highlightKey === key;
                const isShaking = shakeKey === key;
                return (
                  <div key={key} style={{ textAlign: "center" }}>
                    <button
                      style={{
                        width: "40px",
                        height: "40px",
                        background: isHighlighted ? getGlowColor() : FINGER_COLORS[fingerType],
                        border: isHighlighted ? `2px solid ${getGlowBorder()}` : "1px solid #ccc",
                        borderRadius: "4px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "default",
                        textTransform: "uppercase",
                        transition: "all 0.15s ease",
                        boxShadow: isHighlighted ? `0 0 14px ${getGlowBorder().replace(')', ', 0.4)')}` : "none",
                        animation: isShaking ? "shake 0.3s ease" : "none",
                        position: "relative",
                        color: isHighlighted ? "#fff" : "#000",
                        transform: isHighlighted ? "scale(1.15)" : "scale(1)",
                      }}
                    >
                      {key === ";" ? ";" : key.toUpperCase()}
                      {(key === "f" || key === "j") && (
                        <span style={{
                          position: "absolute",
                          width: "6px",
                          height: "6px",
                          background: "#666",
                          borderRadius: "50%",
                          bottom: "3px",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }} />
                      )}
                    </button>
                    <div style={{ fontSize: "10px", color: "#999", marginTop: "4px" }}>
                      {FINGER_NAMES[fingerType]}
                    </div>
                  </div>
                );
              })}
              </div>
            ))}

          {/* SPACEBAR */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              style={{
                width: "300px",
                height: "40px",
                background: highlightKey === " " ? getGlowColor() : FINGER_COLORS["space"],
                border: highlightKey === " " ? `2px solid ${getGlowBorder()}` : "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "default",
                transition: "all 0.15s ease",
                boxShadow: highlightKey === " " ? `0 0 14px ${getGlowBorder().replace(')', ', 0.4)')}` : "none",
                color: highlightKey === " " ? "#fff" : "#000",
                transform: highlightKey === " " ? "scale(1.15)" : "scale(1)",
              }}
            >
              SPACE
            </button>
          </div>
            <div style={{ fontSize: "10px", color: "#999", marginTop: "4px", textAlign: "center" }}>
              Spacebar
            </div>
          </div>
        </div>

        {/* HAND VISUALIZATION */}
        <div
          className="flex flex-col sm:flex-row"
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "8px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            gap: "24px",
            justifyContent: "center",
          }}
        >
          {renderHandSVG("left")}
          {renderHandSVG("right")}
        </div>

        {/* BOTTOM BAR */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 0",
        }}>
          <div style={{
            fontSize: "14px",
            color: "#4CAF50",
            fontWeight: 600,
            minHeight: "20px",
          }}>
            {messages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
          <button
            onClick={handleReset}
            style={{
              padding: "8px 16px",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: 600,
              color: "#666",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* LESSON COMPLETE OVERLAY */}
      {isComplete && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "500px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            animation: "slideUp 0.4s ease",
          }}>
            <div style={{
              fontSize: "64px",
              marginBottom: "16px",
              animation: "scaleIn 0.6s ease",
            }}>
              ✓
            </div>
            <h2 style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#4CAF50",
              marginBottom: "24px",
            }}>
              Lesson Complete!
            </h2>

            {/* STATS */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
              style={{
                display: "grid",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div style={{
                background: "#F5F5F5",
                padding: "16px",
                borderRadius: "8px",
              }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#4CAF50" }}>
                  {stats.wpm}
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>WPM</div>
              </div>
              <div style={{
                background: "#F5F5F5",
                padding: "16px",
                borderRadius: "8px",
              }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#4CAF50" }}>
                  {stats.accuracy}%
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>Accuracy</div>
              </div>
              <div style={{
                background: "#F5F5F5",
                padding: "16px",
                borderRadius: "8px",
              }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#4CAF50" }}>
                  {stats.streak}
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>Best Streak</div>
              </div>
            </div>

            {/* STARS */}
            <div style={{
              fontSize: "48px",
              marginBottom: "16px",
              letterSpacing: "8px",
            }}>
              {Array(3)
                .fill(0)
                .map((_, i) => (i < stars ? "★" : "☆"))
                .join("")}
            </div>

            {/* ECO REWARD */}
            <div style={{
              background: "#E8F5E9",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#4CAF50",
            }}>
              🌱 {stats.ecoWords} eco words typed - 1 tree closer!
            </div>

            {/* BUTTONS */}
            <div style={{
              display: "flex",
              gap: "12px",
            }}>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "white",
                  border: "2px solid #4CAF50",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#4CAF50",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Try Again
              </button>
              <button
                onClick={handleNextLesson}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "#4CAF50",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "white",
                  cursor: currentLessonId === 100 ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
                disabled={currentLessonId === 100}
              >
                {currentLessonId === 100 ? "🏆 You\'ve Graduated!" : "Next Lesson →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LESSON MAP MODAL */}
      {showLessonMap && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1002,
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            maxWidth: "900px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            animation: "slideUp 0.4s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#4CAF50",
                margin: 0,
              }}>
                📚 All 100 Lessons
              </h2>
              <button
                onClick={() => setShowLessonMap(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>

            {/* PHASES */}
            {phases.map((phase) => {
              const phraseLessons = lessons.filter(l => l.phase === phase.id);
              return (
                <div key={phase.id} style={{ marginBottom: "32px" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: `2px solid ${phase.color}`,
                  }}>
                    <div style={{ fontSize: "32px" }}>{phase.icon}</div>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 700, color: phase.color }}>
                        {phase.name}
                      </div>
                      <div style={{ fontSize: "13px", color: "#666" }}>
                        {phase.description}
                      </div>
                    </div>
                  </div>

                  {/* LESSONS GRID */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "12px",
                  }}>
                    {phraseLessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson.id)}
                        style={{
                          padding: "12px 16px",
                          background: currentLessonId === lesson.id ? phase.color : "white",
                          border: currentLessonId === lesson.id ? "none" : `1px solid #ddd`,
                          borderRadius: "8px",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          color: currentLessonId === lesson.id ? "white" : "#333",
                        }}
                        onMouseOver={(e) => {
                          const target = e.target as HTMLButtonElement;
                          if (currentLessonId !== lesson.id) {
                            target.style.background = "#f5f5f5";
                            target.style.borderColor = phase.color;
                          }
                        }}
                        onMouseOut={(e) => {
                          const target = e.target as HTMLButtonElement;
                          if (currentLessonId !== lesson.id) {
                            target.style.background = "white";
                            target.style.borderColor = "#ddd";
                          }
                        }}
                      >
                        <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                          Lesson {lesson.id}
                        </div>
                        <div style={{ fontSize: "12px", opacity: 0.8, lineHeight: 1.3 }}>
                          {lesson.title}
                        </div>
                        {lesson.targetWPM && (
                          <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px" }}>
                            Goal: {lesson.targetWPM} WPM
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => setShowLessonMap(false)}
              style={{
                width: "100%",
                padding: "14px",
                background: "#4CAF50",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 700,
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
                marginTop: "24px",
              }}
            >
              Got it! Let's Type! 🌿
            </button>
          </div>
        </div>
      )}

      {/* WELCOME MODAL */}
      {showWelcomeModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "500px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            animation: "slideUp 0.4s ease",
          }}>
            <h2 style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#4CAF50",
              marginBottom: "24px",
            }}>
              Welcome to My Green Keys! 🌿
            </h2>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", textAlign: "left", color: "#666" }}>
                What's your name?
              </label>
              <input
                type="text"
                value={welcomeData.name}
                onChange={(e) => setWelcomeData({ ...welcomeData, name: e.target.value })}
                placeholder="Your name..."
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontFamily: "Poppins, sans-serif",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", textAlign: "left", color: "#666" }}>
                How old are you?
              </label>
              <select
                value={welcomeData.age}
                onChange={(e) => setWelcomeData({ ...welcomeData, age: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "14px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {Array.from({ length: 9 }, (_, i) => i + 6).map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "#666" }}>
                Tell us about you:
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setWelcomeData({ ...welcomeData, gender: "boy" })}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: welcomeData.gender === "boy" ? "2px solid #2196F3" : "2px solid #ddd",
                    background: welcomeData.gender === "boy" ? "#E3F2FD" : "white",
                    color: welcomeData.gender === "boy" ? "#2196F3" : "#999",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  👦 I'm a Boy
                </button>
                <button
                  onClick={() => setWelcomeData({ ...welcomeData, gender: "girl" })}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: welcomeData.gender === "girl" ? "2px solid #E91E63" : "2px solid #ddd",
                    background: welcomeData.gender === "girl" ? "#FCE4EC" : "white",
                    color: welcomeData.gender === "girl" ? "#E91E63" : "#999",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  👧 I'm a Girl
                </button>
              </div>
            </div>

            <button
              onClick={handleWelcomeSubmit}
              disabled={!welcomeData.name || !welcomeData.gender}
              style={{
                width: "100%",
                padding: "14px",
                background: welcomeData.name && welcomeData.gender ? "#4CAF50" : "#ccc",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 700,
                color: "white",
                cursor: welcomeData.name && welcomeData.gender ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
              }}
            >
              Let's Start Typing! 🌿
            </button>
          </div>
        </div>
      )}

      {/* TYPING RULES MODAL */}
      {showTypingRulesModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            animation: "slideUp 0.4s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#4CAF50",
                margin: 0,
              }}>
                Typing Rules 📏
              </h2>
              <button
                onClick={() => setShowTypingRulesModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "24px" }}>
              {TYPING_RULES.map((rule, index) => (
                <div key={index} style={{
                  background: "#F5F5F5",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  borderLeft: `4px solid #4CAF50`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ fontSize: "24px", minWidth: "32px" }}>{rule.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#4CAF50",
                        marginBottom: "4px",
                      }}>
                        Rule {index + 1} - {rule.title}
                      </div>
                      <div style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.5,
                      }}>
                        {rule.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTypingRulesModal(false)}
              style={{
                width: "100%",
                padding: "14px",
                background: "#4CAF50",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 700,
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Got it! Let's Type! 🌿
            </button>
          </div>
        </div>
      )}

      {/* ECO PHOTO UPLOAD MODAL */}
      {showEcoUploadModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1003,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "28px",
              borderRadius: "16px",
              width: "min(560px, 92vw)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              animation: "slideUp 0.25s ease",
            }}
          >
            {/* Pencil texture filter defs */}
            <svg
              width="0"
              height="0"
              style={{ position: "absolute" }}
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <filter id="kidsPencilFilterLesson" x="-10%" y="-10%" width="120%" height="120%">
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

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#2c3e50",
                  margin: 0,
                }}
              >
                Submit an eco action photo 🌿
              </h2>
              <button
                onClick={() => setShowEcoUploadModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#999",
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {ecoError && (
              <div
                style={{
                  background: "#ffebee",
                  border: "1px solid #ef5350",
                  color: "#c62828",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                {ecoError}
              </div>
            )}

            {ecoMessage && (
              <div
                style={{
                  background: "#e8f5e9",
                  border: "1px solid #4caf50",
                  color: "#2e7d32",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  marginBottom: "12px",
                  fontSize: "13px",
                }}
              >
                {ecoMessage}
              </div>
            )}

            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#2c3e50",
                  marginBottom: "8px",
                }}
              >
                Choose an eco action
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {ECO_ACTIONS.map((action) => {
                  const selected = ecoSelectedAction === action.type;
                  return (
                    <button
                      key={action.type}
                      type="button"
                      onClick={() => setEcoSelectedAction(action.type)}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        border: selected ? "2px solid #4CAF50" : "1px solid #e0e0e0",
                        background: selected ? "#E8F5E9" : "white",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 700, color: "#2c3e50" }}>
                        {action.label}
                      </span>
                      <span style={{ fontSize: "12px", color: "#4CAF50", fontWeight: 800 }}>
                        +{action.points} eco points
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#2c3e50",
                  marginBottom: "8px",
                }}
              >
                Upload a photo
              </div>
              <input
                type="file"
                accept="image/*"
                disabled={ecoSubmitting}
                onChange={(e) => setEcoFile(e.target.files?.[0] || null)}
              />
              {ecoFile && (
                <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
                  Selected: <strong>{ecoFile.name}</strong>
                </div>
              )}
              {ecoPreviewUrl && (
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "1px solid #e0e0e0",
                    background: "#fff",
                  }}
                >
                  <img
                    src={ecoPreviewUrl}
                    alt="Eco photo preview"
                    style={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      display: "block",
                      filter:
                        "url(#kidsPencilFilterLesson) contrast(140%) saturate(150%) brightness(110%)",
                    }}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmitEcoPhoto}
              disabled={ecoSubmitting}
              style={{
                width: "100%",
                padding: "12px 14px",
                background: ecoSubmitting ? "#bbb" : "#4CAF50",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontSize: "15px",
                fontWeight: 800,
                cursor: ecoSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {ecoSubmitting ? "Submitting..." : "Submit photo"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 49% { border-bottom: 2px solid #2196F3; }
          50%, 100% { border-bottom: 2px solid transparent; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Virtual Pet animations */
        .pet { display: inline-block; transform-origin: 50% 80%; }
        .pet-happy { animation: petBounce 1.15s ease-in-out infinite; }
        .pet-neutral { animation: petIdle 2.2s ease-in-out infinite; }
        .pet-sad { animation: petDroop 1.6s ease-in-out infinite; opacity: 0.9; }
        .pet-pulse { animation: petPulse 0.25s ease-out; }
        .pet-dance { animation: petDance 0.7s ease-in-out infinite; }

        @keyframes petBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.04); }
        }
        @keyframes petIdle {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-2px) rotate(1deg); }
        }
        @keyframes petDroop {
          0%, 100% { transform: translateY(3px) rotate(-4deg) scale(0.98); }
          50% { transform: translateY(5px) rotate(-6deg) scale(0.97); }
        }
        @keyframes petPulse {
          0% { transform: translateY(0) scale(1); }
          60% { transform: translateY(-8px) scale(1.06); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes petDance {
          0% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(10deg) translateY(-4px); }
          50% { transform: rotate(-10deg) translateY(-4px); }
          75% { transform: rotate(10deg) translateY(-2px); }
          100% { transform: rotate(0deg) translateY(0); }
        }

        /* Onboarding visuals */
        .onb-leaf {
          position: absolute;
          top: -30px;
          width: 14px;
          height: 14px;
          border-radius: 0 50% 0 50%;
          background: rgba(255,235,59,0.9);
          opacity: 0.7;
          animation: onbLeafFall linear infinite;
          pointer-events: none;
        }
        @keyframes onbLeafFall {
          0% { transform: translateY(-20px) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(720deg) translateX(60px); }
        }
        .onb-trees {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 180px;
          background: linear-gradient(180deg, transparent 0%, rgba(27,77,48,0.85) 60%, rgba(27,77,48,1) 100%);
        }
        .onb-heroTrees {
          height: 150px;
          border-radius: 18px;
          background:
            radial-gradient(circle at 20% 85%, rgba(255,255,255,0.12) 0%, transparent 48%),
            radial-gradient(circle at 60% 85%, rgba(255,255,255,0.10) 0%, transparent 50%),
            radial-gradient(circle at 85% 82%, rgba(255,255,255,0.09) 0%, transparent 45%),
            linear-gradient(180deg, rgba(76,175,80,0.18) 0%, rgba(33,150,243,0.08) 100%);
          border: 1px solid rgba(0,0,0,0.06);
          position: relative;
          overflow: hidden;
        }
        .onb-heroTrees::after {
          content: "🌳   🌲    🌳   🌲   🌳";
          position: absolute;
          bottom: 10px;
          left: 10px;
          font-size: 26px;
          opacity: 0.95;
          animation: onbTreeSway 2.8s ease-in-out infinite;
          transform-origin: left bottom;
        }
        @keyframes onbTreeSway {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
        .onb-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          animation: onbCardIn 480ms ease both;
        }
        @keyframes onbCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .onb-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76,175,80,0.18);
        }
        .onb-dot-off {
          background: rgba(0,0,0,0.18);
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
