import type { NotepadCardData, TaskItemData } from "./_components/NotepadCard";

// Re-export types for convenience
export type { NotepadCardData, TaskItemData };

// ─── Mock notepads ────────────────────────────────────────────────────────────

export const MOCK_NOTEPADS: NotepadCardData[] = [
  {
    id: "grocery-list",
    title: "Grocery List",
    tasks: [
      { label: "Apples", checked: false, mode: "checkbox" },
      { label: "Milk", checked: true, mode: "checkbox" },
      { label: "Eggs", checked: false, mode: "checkbox" },
      { label: "Spinach", checked: true, mode: "checkbox" },
      { label: "Coffee beans", checked: false, flagged: true, mode: "checkbox" },
      { label: "Bread", checked: false, mode: "list" },
    ],
  },
  {
    id: "workout-plan",
    title: "Workout Plan",
    tasks: [
      { label: "Bench press 3×10", checked: true, mode: "checkbox" },
      { label: "Incline dumbbell 3×12", checked: true, mode: "checkbox" },
      { label: "Cable flyes 4×15", checked: false, mode: "checkbox" },
      { label: "Tricep pushdowns 3×15", checked: false, mode: "checkbox" },
      { label: "Overhead press 3×8", checked: false, flagged: true, mode: "checkbox" },
    ],
  },
  {
    id: "reading-list",
    title: "Reading List",
    tasks: [
      { label: "Clean Code — Robert C. Martin", checked: true, mode: "list" },
      { label: "The Pragmatic Programmer", checked: false, flagged: true, mode: "list" },
      { label: "Designing Data-Intensive Apps", checked: false, mode: "list" },
      { label: "Atomic Habits — James Clear", checked: false, mode: "list" },
    ],
  },
  {
    id: "sprint-tasks",
    title: "Sprint Tasks",
    tasks: [
      { label: "Implement RAG pipeline", checked: true, mode: "checkbox" },
      { label: "Write unit tests for embedder", checked: false, flagged: true, mode: "checkbox" },
      { label: "Update API docs", checked: false, mode: "checkbox" },
      { label: "Review open PRs", checked: false, mode: "checkbox" },
      { label: "Set up staging environment", checked: true, mode: "checkbox" },
    ],
  },
  {
    id: "home-errands",
    title: "Home Errands",
    tasks: [
      { label: "Pay electricity bill", checked: true, flagged: true, mode: "checkbox" },
      { label: "Fix leaking faucet", checked: false, mode: "checkbox" },
      { label: "Clean the garage", checked: false, mode: "checkbox" },
      { label: "Buy new lightbulbs", checked: true, mode: "checkbox" },
    ],
  },
  {
    id: "travel-prep",
    title: "Travel Prep",
    tasks: [
      { label: "Book flight tickets", checked: true, mode: "checkbox" },
      { label: "Reserve hotel", checked: true, mode: "checkbox" },
      { label: "Charge camera batteries", checked: false, mode: "checkbox" },
      { label: "Print travel itinerary", checked: false, flagged: true, mode: "list" },
      { label: "Pack bags", checked: false, mode: "list" },
    ],
  },
  {
    id: "music-practice",
    title: "Music Practice",
    tasks: [
      { label: "Scales — 15 min warm-up", checked: true, mode: "checkbox" },
      { label: "Learn 'Clair de Lune' intro", checked: false, flagged: true, mode: "checkbox" },
      { label: "Sight-read new sheet music", checked: false, mode: "list" },
      { label: "Record practice session", checked: false, mode: "list" },
    ],
  },
  {
    id: "study-goals",
    title: "Study Goals",
    tasks: [
      { label: "Review lecture notes — Ch. 5", checked: true, mode: "checkbox" },
      { label: "Submit thesis outline", checked: false, flagged: true, mode: "checkbox" },
      { label: "Complete practice problems", checked: false, mode: "checkbox" },
      { label: "Read journal articles (×3)", checked: false, mode: "list" },
    ],
  },
  {
    id: "side-project",
    title: "Side Project",
    tasks: [
      { label: "Design database schema", checked: true, mode: "checkbox" },
      { label: "Scaffold Next.js project", checked: true, mode: "checkbox" },
      { label: "Build auth flow", checked: false, flagged: true, mode: "checkbox" },
      { label: "Write README", checked: false, mode: "list" },
      { label: "Deploy to Vercel", checked: false, mode: "checkbox" },
    ],
  },
];
