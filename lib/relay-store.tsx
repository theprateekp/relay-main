import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Cadence = "weekly" | "monthly" | "quarterly";

export type Person = {
  id: string;
  name: string;
  relationship: string;
  note: string;
  cadence: Cadence;
  nextCheckIn: string;
  lastContacted: string;
  initials: string;
  accent: string;
};

type RelaySnapshot = {
  people: Person[];
  completedToday: number;
};

type RelayContextValue = RelaySnapshot & {
  hydrated: boolean;
  addPerson: (input: {
    name: string;
    relationship: string;
    note: string;
    cadence: Cadence;
  }) => void;
  completeFollowUp: (id: string) => void;
  snoozeFollowUp: (id: string, days?: number) => void;
};

const STORAGE_KEY = "relay.local.v1";
const ACCENTS = ["#FF765F", "#4E7CF4", "#E4A34F", "#6DB59B", "#8F78C8"];

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function cadenceDays(cadence: Cadence) {
  return cadence === "weekly" ? 7 : cadence === "monthly" ? 30 : 90;
}

function initialsFor(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function seededPeople(): Person[] {
  const today = new Date();
  return [
    {
      id: "maya-chen",
      name: "Maya Chen",
      relationship: "Creative partner",
      note: "Send the studio references she asked for.",
      cadence: "weekly",
      nextCheckIn: toIsoDate(addDays(today, 0)),
      lastContacted: toIsoDate(addDays(today, -6)),
      initials: "MC",
      accent: ACCENTS[0],
    },
    {
      id: "jon-bell",
      name: "Jon Bell",
      relationship: "Old friend",
      note: "Ask how the new role is settling in.",
      cadence: "monthly",
      nextCheckIn: toIsoDate(addDays(today, 4)),
      lastContacted: toIsoDate(addDays(today, -26)),
      initials: "JB",
      accent: ACCENTS[1],
    },
    {
      id: "nia-williams",
      name: "Nia Williams",
      relationship: "Mentor",
      note: "Share the launch note and say thank you.",
      cadence: "quarterly",
      nextCheckIn: toIsoDate(addDays(today, 12)),
      lastContacted: toIsoDate(addDays(today, -79)),
      initials: "NW",
      accent: ACCENTS[2],
    },
    {
      id: "leo-martin",
      name: "Leo Martin",
      relationship: "Family",
      note: "Plan the next Sunday walk.",
      cadence: "monthly",
      nextCheckIn: toIsoDate(addDays(today, 19)),
      lastContacted: toIsoDate(addDays(today, -11)),
      initials: "LM",
      accent: ACCENTS[3],
    },
  ];
}

function parseSnapshot(value: string | null): RelaySnapshot | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as RelaySnapshot;
    if (!Array.isArray(parsed.people)) return null;
    return {
      people: parsed.people,
      completedToday: Number(parsed.completedToday ?? 0),
    };
  } catch {
    return null;
  }
}

export function formatDateLabel(value: string) {
  const date = new Date(`${value}T12:00:00`);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return "Today";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function isDueToday(value: string) {
  const today = new Date();
  return new Date(`${value}T12:00:00`).toDateString() === today.toDateString();
}

const RelayContext = createContext<RelayContextValue | null>(null);

export function RelayProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<RelaySnapshot>({
    people: seededPeople(),
    completedToday: 0,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (!mounted) return;
      const saved = parseSnapshot(value);
      if (saved) setSnapshot(saved);
      setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => undefined);
  }, [hydrated, snapshot]);

  const actions = useMemo<RelayContextValue>(
    () => ({
      ...snapshot,
      hydrated,
      addPerson: ({ name, relationship, note, cadence }) => {
        const cleanName = name.trim();
        if (!cleanName) return;
        const today = new Date();
        const person: Person = {
          id: `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
          name: cleanName,
          relationship: relationship.trim() || "Connection",
          note: note.trim() || "Make space for a thoughtful check-in.",
          cadence,
          nextCheckIn: toIsoDate(addDays(today, cadenceDays(cadence))),
          lastContacted: toIsoDate(today),
          initials: initialsFor(cleanName),
          accent: ACCENTS[snapshot.people.length % ACCENTS.length],
        };
        setSnapshot((current) => ({ ...current, people: [person, ...current.people] }));
      },
      completeFollowUp: (id) => {
        const today = new Date();
        setSnapshot((current) => ({
          ...current,
          completedToday: current.completedToday + 1,
          people: current.people.map((person) =>
            person.id === id
              ? {
                  ...person,
                  lastContacted: toIsoDate(today),
                  nextCheckIn: toIsoDate(addDays(today, cadenceDays(person.cadence))),
                }
              : person,
          ),
        }));
      },
      snoozeFollowUp: (id, days = 3) => {
        setSnapshot((current) => ({
          ...current,
          people: current.people.map((person) =>
            person.id === id
              ? { ...person, nextCheckIn: toIsoDate(addDays(new Date(`${person.nextCheckIn}T12:00:00`), days)) }
              : person,
          ),
        }));
      },
    }),
    [hydrated, snapshot],
  );

  return <RelayContext.Provider value={actions}>{children}</RelayContext.Provider>;
}

export function useRelay() {
  const value = useContext(RelayContext);
  if (!value) throw new Error("useRelay must be used inside RelayProvider");
  return value;
}
