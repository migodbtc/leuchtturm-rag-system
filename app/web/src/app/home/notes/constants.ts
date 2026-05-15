import {
  Apple,
  Milk,
  Egg,
  Leaf,
  Dumbbell,
  BookOpen,
  Code2,
  FileText,
  Coffee,
  ShoppingBag,
  Laptop,
  Music,
  Plane,
  Camera,
  Home,
  type LucideIcon,
} from "lucide-react";
import type { NotepadCardData, TaskItemData } from "./_components/NotepadCard";

// Re-export types for convenience
export type { NotepadCardData, TaskItemData };

// ─── Mock notepads ────────────────────────────────────────────────────────────

export const MOCK_NOTEPADS: NotepadCardData[] = [
  {
    id: "grocery-list",
    title: "Grocery List",
    tasks: [
      { icon: Apple as LucideIcon, label: "Apples", checked: false },
      { icon: Milk as LucideIcon, label: "Milk", checked: true },
      { icon: Egg as LucideIcon, label: "Eggs", checked: false },
      { icon: Leaf as LucideIcon, label: "Spinach", checked: true },
      {
        icon: Coffee as LucideIcon,
        label: "Coffee beans",
        checked: false,
        flagged: true,
      },
      {
        icon: ShoppingBag as LucideIcon,
        label: "Bread",
        checked: false,
      },
    ],
  },
  {
    id: "workout-plan",
    title: "Workout Plan",
    tasks: [
      {
        icon: Dumbbell as LucideIcon,
        label: "Bench press 3×10",
        checked: true,
      },
      {
        icon: Dumbbell as LucideIcon,
        label: "Incline dumbbell 3×12",
        checked: true,
      },
      {
        icon: Dumbbell as LucideIcon,
        label: "Cable flyes 4×15",
        checked: false,
      },
      {
        icon: Dumbbell as LucideIcon,
        label: "Tricep pushdowns 3×15",
        checked: false,
      },
      {
        icon: Dumbbell as LucideIcon,
        label: "Overhead press 3×8",
        checked: false,
        flagged: true,
      },
    ],
  },
  {
    id: "reading-list",
    title: "Reading List",
    tasks: [
      {
        icon: BookOpen as LucideIcon,
        label: "Clean Code — Robert C. Martin",
        checked: true,
      },
      {
        icon: BookOpen as LucideIcon,
        label: "The Pragmatic Programmer",
        checked: false,
        flagged: true,
      },
      {
        icon: BookOpen as LucideIcon,
        label: "Designing Data-Intensive Apps",
        checked: false,
      },
      {
        icon: BookOpen as LucideIcon,
        label: "Atomic Habits — James Clear",
        checked: false,
      },
    ],
  },
  {
    id: "sprint-tasks",
    title: "Sprint Tasks",
    tasks: [
      {
        icon: Code2 as LucideIcon,
        label: "Implement RAG pipeline",
        checked: true,
      },
      {
        icon: Code2 as LucideIcon,
        label: "Write unit tests for embedder",
        checked: false,
        flagged: true,
      },
      {
        icon: FileText as LucideIcon,
        label: "Update API docs",
        checked: false,
      },
      {
        icon: Code2 as LucideIcon,
        label: "Review open PRs",
        checked: false,
      },
      {
        icon: Laptop as LucideIcon,
        label: "Set up staging environment",
        checked: true,
      },
    ],
  },
  {
    id: "home-errands",
    title: "Home Errands",
    tasks: [
      {
        icon: Home as LucideIcon,
        label: "Pay electricity bill",
        checked: true,
        flagged: true,
      },
      {
        icon: Home as LucideIcon,
        label: "Fix leaking faucet",
        checked: false,
      },
      {
        icon: Home as LucideIcon,
        label: "Clean the garage",
        checked: false,
      },
      {
        icon: ShoppingBag as LucideIcon,
        label: "Buy new lightbulbs",
        checked: true,
      },
    ],
  },
  {
    id: "travel-prep",
    title: "Travel Prep",
    tasks: [
      {
        icon: Plane as LucideIcon,
        label: "Book flight tickets",
        checked: true,
      },
      {
        icon: Plane as LucideIcon,
        label: "Reserve hotel",
        checked: true,
      },
      {
        icon: Camera as LucideIcon,
        label: "Charge camera batteries",
        checked: false,
      },
      {
        icon: FileText as LucideIcon,
        label: "Print travel itinerary",
        checked: false,
        flagged: true,
      },
      {
        icon: ShoppingBag as LucideIcon,
        label: "Pack bags",
        checked: false,
      },
    ],
  },
  {
    id: "music-practice",
    title: "Music Practice",
    tasks: [
      {
        icon: Music as LucideIcon,
        label: "Scales — 15 min warm-up",
        checked: true,
      },
      {
        icon: Music as LucideIcon,
        label: "Learn 'Clair de Lune' intro",
        checked: false,
        flagged: true,
      },
      {
        icon: Music as LucideIcon,
        label: "Sight-read new sheet music",
        checked: false,
      },
      {
        icon: Music as LucideIcon,
        label: "Record practice session",
        checked: false,
      },
    ],
  },
  {
    id: "study-goals",
    title: "Study Goals",
    tasks: [
      {
        icon: BookOpen as LucideIcon,
        label: "Review lecture notes — Ch. 5",
        checked: true,
      },
      {
        icon: FileText as LucideIcon,
        label: "Submit thesis outline",
        checked: false,
        flagged: true,
      },
      {
        icon: Code2 as LucideIcon,
        label: "Complete practice problems",
        checked: false,
      },
      {
        icon: BookOpen as LucideIcon,
        label: "Read journal articles (×3)",
        checked: false,
      },
    ],
  },
  {
    id: "side-project",
    title: "Side Project",
    tasks: [
      {
        icon: Code2 as LucideIcon,
        label: "Design database schema",
        checked: true,
      },
      {
        icon: Laptop as LucideIcon,
        label: "Scaffold Next.js project",
        checked: true,
      },
      {
        icon: Code2 as LucideIcon,
        label: "Build auth flow",
        checked: false,
        flagged: true,
      },
      {
        icon: FileText as LucideIcon,
        label: "Write README",
        checked: false,
      },
      {
        icon: Code2 as LucideIcon,
        label: "Deploy to Vercel",
        checked: false,
      },
    ],
  },
];
