"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { EducationTool } from "@/lib/education-tools";

type Note = {
  id: string;
  title: string;
  detail: string;
  extra?: string;
  done?: boolean;
};

type Flashcard = {
  id: string;
  front: string;
  back: string;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  answer: string;
  options?: string[];
};

type Block = {
  id: string;
  label: string;
  start: string;
  end: string;
  note?: string;
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function copyText(value: string) {
  if (!value.trim() || typeof navigator === "undefined" || !navigator.clipboard) {
    return Promise.resolve(false);
  }

  return navigator.clipboard.writeText(value).then(() => true).catch(() => false);
}

function useCopyFeedback() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (value: string) => {
    const success = await copyText(value);
    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return { copied, handleCopy };
}

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // Ignore local storage parsing issues and keep defaults.
    } finally {
      setLoaded(true);
    }
  }, [key]);

  useEffect(() => {
    if (!loaded || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, loaded, value]);

  return [value, setValue, loaded] as const;
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function countWords(value: string) {
  const matches = value.trim().match(/\b[\w'-]+\b/g);
  return matches ? matches.length : 0;
}

function countSentences(value: string) {
  const matches = value.match(/[^.!?]+[.!?]+/g);
  if (matches) {
    return matches.length;
  }

  return value.trim() ? 1 : 0;
}

function countParagraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
}

function sentenceCase(value: string) {
  return value
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
}

function gcd(a: number, b: number): number {
  let left = Math.abs(Math.trunc(a));
  let right = Math.abs(Math.trunc(b));

  while (right !== 0) {
    const temp = right;
    right = left % right;
    left = temp;
  }

  return left || 1;
}

function ActionBar({
  onCopy,
  onReset,
  copied,
}: {
  onCopy: () => void;
  onReset: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onCopy}
        className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
      >
        {copied ? "Copied" : "Copy result"}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
      >
        Reset
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[color:var(--foreground)]">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--primary)] ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-36 w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--primary)] ${props.className ?? ""}`}
    />
  );
}

function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--primary)] ${props.className ?? ""}`}
    />
  );
}

function ResultCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-2 text-lg font-bold tracking-tight text-[color:var(--foreground)]">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-6 text-[color:var(--muted)]">{hint}</p> : null}
    </div>
  );
}

function Workspace({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-5">
      <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-white/90 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">Tool panel</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[color:var(--foreground)]">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{description}</p>
      </div>
      <div className="grid gap-5">{children}</div>
    </div>
  );
}

function GpaCalculatorTool() {
  const [courses, setCourses] = usePersistentState("education-gpa-courses", [
    { id: uid("course"), name: "Course 1", credits: "3", grade: "A" },
    { id: uid("course"), name: "Course 2", credits: "3", grade: "B+" },
  ]);
  const { copied, handleCopy } = useCopyFeedback();

  const gradePoints: Record<string, number> = {
    "A+": 4,
    A: 4,
    "A-": 3.7,
    "B+": 3.3,
    B: 3,
    "B-": 2.7,
    "C+": 2.3,
    C: 2,
    "C-": 1.7,
    D: 1,
    F: 0,
  };

  const { gpa, credits } = useMemo(() => {
    const totalCredits = courses.reduce((sum, item) => sum + parseNumber(item.credits), 0);
    const qualityPoints = courses.reduce(
      (sum, item) => sum + parseNumber(item.credits) * (gradePoints[item.grade] ?? 0),
      0,
    );

    return {
      gpa: totalCredits ? round(qualityPoints / totalCredits, 2) : 0,
      credits: round(totalCredits, 1),
    };
  }, [courses]);

  const summary = `Estimated GPA: ${gpa}\nTotal credits: ${credits}`;

  return (
    <Workspace title="GPA Calculator" description="Add each course, assign credits, and choose the letter grade to estimate your GPA on a 4.0 scale.">
      <div className="grid gap-4">
        {courses.map((course, index) => (
          <div key={course.id} className="grid gap-3 rounded-[1.5rem] border border-[color:var(--border)] bg-white p-4 sm:grid-cols-[1.5fr_0.8fr_0.9fr_auto] sm:items-end">
            <Field label={`Course ${index + 1}`}>
              <TextInput
                value={course.name}
                onChange={(event) =>
                  setCourses((current) =>
                    current.map((item) => item.id === course.id ? { ...item, name: event.target.value } : item),
                  )
                }
              />
            </Field>
            <Field label="Credits">
              <TextInput
                type="number"
                min="0"
                step="0.5"
                value={course.credits}
                onChange={(event) =>
                  setCourses((current) =>
                    current.map((item) => item.id === course.id ? { ...item, credits: event.target.value } : item),
                  )
                }
              />
            </Field>
            <Field label="Grade">
              <Select
                value={course.grade}
                onChange={(event) =>
                  setCourses((current) =>
                    current.map((item) => item.id === course.id ? { ...item, grade: event.target.value } : item),
                  )
                }
              >
                {Object.keys(gradePoints).map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </Select>
            </Field>
            <button
              type="button"
              onClick={() => setCourses((current) => current.filter((item) => item.id !== course.id))}
              className="rounded-full border border-[color:var(--border)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            setCourses((current) => current.concat({ id: uid("course"), name: `Course ${current.length + 1}`, credits: "3", grade: "A" }))
          }
          className="rounded-full bg-[color:var(--surface-alt)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--soft)]"
        >
          Add course
        </button>
        <ActionBar
          copied={copied}
          onCopy={() => void handleCopy(summary)}
          onReset={() => setCourses([{ id: uid("course"), name: "Course 1", credits: "3", grade: "A" }])}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard label="Estimated GPA" value={gpa.toFixed(2)} hint="Based on the current 4.0 letter-grade mapping." />
        <ResultCard label="Total Credits" value={credits.toFixed(1)} hint="Useful for checking how much the semester is weighted." />
      </div>
    </Workspace>
  );
}

function WordCounterTool() {
  const [text, setText] = usePersistentState("education-word-counter", "");
  const { copied, handleCopy } = useCopyFeedback();

  const stats = useMemo(() => {
    const words = countWords(text);
    const characters = text.length;
    const noSpaces = text.replace(/\s/g, "").length;
    const paragraphs = countParagraphs(text);
    const sentences = text.trim() ? countSentences(text) : 0;
    const readingMinutes = words / 200;

    return {
      words,
      characters,
      noSpaces,
      paragraphs,
      sentences,
      readingTime: words ? `${Math.max(1, Math.ceil(readingMinutes))} min` : "0 min",
    };
  }, [text]);

  const summary = `Words: ${stats.words}\nCharacters: ${stats.characters}\nCharacters without spaces: ${stats.noSpaces}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nReading time: ${stats.readingTime}`;

  return (
    <Workspace title="Word Counter" description="Paste text and get live counts for words, characters, sentences, paragraphs, and reading time.">
      <Field label="Text">
        <TextArea value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste or type text here..." />
      </Field>
      <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => setText("")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ResultCard label="Words" value={String(stats.words)} />
        <ResultCard label="Characters" value={String(stats.characters)} />
        <ResultCard label="No Spaces" value={String(stats.noSpaces)} />
        <ResultCard label="Sentences" value={String(stats.sentences)} />
        <ResultCard label="Paragraphs" value={String(stats.paragraphs)} />
        <ResultCard label="Reading Time" value={stats.readingTime} />
      </div>
    </Workspace>
  );
}

const unitFamilies = {
  length: {
    label: "Length",
    units: {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      mi: 1609.34,
      ft: 0.3048,
      in: 0.0254,
    },
  },
  weight: {
    label: "Weight",
    units: {
      kg: 1,
      g: 0.001,
      lb: 0.453592,
      oz: 0.0283495,
    },
  },
  time: {
    label: "Time",
    units: {
      s: 1,
      min: 60,
      hr: 3600,
      day: 86400,
    },
  },
  volume: {
    label: "Volume",
    units: {
      l: 1,
      ml: 0.001,
      cup: 0.236588,
      gal: 3.78541,
    },
  },
} as const;

function convertTemperature(value: number, from: string, to: string) {
  const celsius = from === "c"
    ? value
    : from === "f"
      ? (value - 32) * (5 / 9)
      : value - 273.15;

  if (to === "c") {
    return celsius;
  }

  if (to === "f") {
    return (celsius * 9) / 5 + 32;
  }

  return celsius + 273.15;
}

function UnitConverterTool() {
  const [family, setFamily] = useState<keyof typeof unitFamilies | "temperature">("length");
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("km");
  const { copied, handleCopy } = useCopyFeedback();

  useEffect(() => {
    if (family === "temperature") {
      setFrom("c");
      setTo("f");
      return;
    }

    const firstTwo = Object.keys(unitFamilies[family].units).slice(0, 2);
    setFrom(firstTwo[0] ?? "");
    setTo(firstTwo[1] ?? firstTwo[0] ?? "");
  }, [family]);

  const result = useMemo(() => {
    const input = parseNumber(value);
    if (family === "temperature") {
      return round(convertTemperature(input, from, to), 4);
    }

    const selectedFamily = unitFamilies[family];
    const units = selectedFamily.units as Record<string, number>;
    const inBase = input * (units[from] ?? 1);
    return round(inBase / (units[to] ?? 1), 4);
  }, [family, from, to, value]);

  const summary = `${value} ${from} = ${result} ${to}`;

  return (
    <Workspace title="Unit Converter" description="Switch between length, weight, time, volume, and temperature with instant conversion results.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Category">
          <Select value={family} onChange={(event) => setFamily(event.target.value as keyof typeof unitFamilies | "temperature")}>
            <option value="length">Length</option>
            <option value="weight">Weight</option>
            <option value="temperature">Temperature</option>
            <option value="time">Time</option>
            <option value="volume">Volume</option>
          </Select>
        </Field>
        <Field label="Value">
          <TextInput type="number" value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
        <Field label="From">
          <Select value={from} onChange={(event) => setFrom(event.target.value)}>
            {(family === "temperature" ? ["c", "f", "k"] : Object.keys(unitFamilies[family].units)).map((unit) => (
              <option key={unit} value={unit}>
                {unit.toUpperCase()}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="To">
          <Select value={to} onChange={(event) => setTo(event.target.value)}>
            {(family === "temperature" ? ["c", "f", "k"] : Object.keys(unitFamilies[family].units)).map((unit) => (
              <option key={unit} value={unit}>
                {unit.toUpperCase()}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <ActionBar
        copied={copied}
        onCopy={() => void handleCopy(summary)}
        onReset={() => {
          setFamily("length");
          setValue("1");
          setFrom("m");
          setTo("km");
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard label="Converted Value" value={`${result} ${to.toUpperCase()}`} />
        <ResultCard label="Formula" value={summary} hint="Great for science, math, and homework checks." />
      </div>
    </Workspace>
  );
}

function PomodoroTimerTool() {
  const [focusMinutes, setFocusMinutes] = usePersistentState("education-pomodoro-focus", 25);
  const [breakMinutes, setBreakMinutes] = usePersistentState("education-pomodoro-break", 5);
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = usePersistentState("education-pomodoro-sessions", 0);
  const { copied, handleCopy } = useCopyFeedback();

  useEffect(() => {
    setSecondsLeft((mode === "focus" ? focusMinutes : breakMinutes) * 60);
  }, [focusMinutes, breakMinutes, mode]);

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          if (mode === "focus") {
            setSessions((count) => count + 1);
            setMode("break");
            return breakMinutes * 60;
          }

          setMode("focus");
          return focusMinutes * 60;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [breakMinutes, focusMinutes, mode, running, setSessions]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const summary = `Pomodoro mode: ${mode}\nTimer: ${minutes}:${seconds}\nCompleted focus sessions: ${sessions}`;

  return (
    <Workspace title="Pomodoro Timer" description="Run focused study sessions with a simple work-break cycle and keep a count of completed rounds.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Focus minutes">
          <TextInput
            type="number"
            min="1"
            value={String(focusMinutes)}
            onChange={(event) => setFocusMinutes(Math.max(1, Math.trunc(parseNumber(event.target.value))))}
          />
        </Field>
        <Field label="Break minutes">
          <TextInput
            type="number"
            min="1"
            value={String(breakMinutes)}
            onChange={(event) => setBreakMinutes(Math.max(1, Math.trunc(parseNumber(event.target.value))))}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard label="Current Mode" value={mode === "focus" ? "Focus" : "Break"} />
        <ResultCard label="Timer" value={`${minutes}:${seconds}`} hint="Keeps running while the tab stays open." />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setRunning((current) => !current)}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode((current) => current === "focus" ? "break" : "focus");
            setRunning(false);
          }}
          className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
        >
          Switch mode
        </button>
        <ActionBar
          copied={copied}
          onCopy={() => void handleCopy(summary)}
          onReset={() => {
            setRunning(false);
            setMode("focus");
            setSecondsLeft(focusMinutes * 60);
            setSessions(0);
          }}
        />
      </div>
      <ResultCard label="Completed Focus Sessions" value={String(sessions)} hint="Saved locally so your streak can survive a refresh." />
    </Workspace>
  );
}

const typingPrompts = [
  "Consistent practice beats last-minute cramming when exams are close.",
  "Clear notes and focused sessions usually improve revision quality.",
  "A calm study plan helps students finish more work with less stress.",
];

function TypingSpeedTestTool() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [text, setText] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const { copied, handleCopy } = useCopyFeedback();
  const prompt = typingPrompts[promptIndex];

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running]);

  const typedWords = countWords(text);
  const targetWords = prompt.split(/\s+/).length;
  const matches = prompt
    .split("")
    .filter((char, index) => text[index] === char).length;
  const accuracy = text.length ? round((matches / text.length) * 100, 1) : 0;
  const elapsedMinutes = (60 - secondsLeft || 1) / 60;
  const wpm = running || secondsLeft === 0 ? round(typedWords / elapsedMinutes, 1) : 0;
  const summary = `Prompt: ${prompt}\nTyped words: ${typedWords}\nWPM: ${wpm}\nAccuracy: ${accuracy}%`;

  return (
    <Workspace title="Typing Speed Test" description="Type the prompt below, track your timer, and measure words per minute with a simple accuracy check.">
      <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Prompt</p>
        <p className="mt-3 text-base leading-8 text-[color:var(--foreground)]">{prompt}</p>
      </div>
      <Field label="Type here">
        <TextArea
          value={text}
          onChange={(event) => {
            if (!running) {
              setRunning(true);
            }

            setText(event.target.value);
          }}
          placeholder="Start typing to begin the timer..."
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResultCard label="Time Left" value={`${secondsLeft}s`} />
        <ResultCard label="Words Typed" value={String(typedWords)} />
        <ResultCard label="WPM" value={String(wpm)} />
        <ResultCard label="Accuracy" value={`${accuracy}%`} hint={`Prompt length: ${targetWords} words`} />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setPromptIndex((current) => (current + 1) % typingPrompts.length);
            setText("");
            setSecondsLeft(60);
            setRunning(false);
          }}
          className="rounded-full bg-[color:var(--surface-alt)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-[color:var(--soft)]"
        >
          New prompt
        </button>
        <ActionBar
          copied={copied}
          onCopy={() => void handleCopy(summary)}
          onReset={() => {
            setText("");
            setSecondsLeft(60);
            setRunning(false);
          }}
        />
      </div>
    </Workspace>
  );
}

function SimpleCalculatorTool({
  title,
  description,
  fields,
  compute,
  storageKey,
}: {
  title: string;
  description: string;
  fields: Array<{ key: string; label: string; type?: "number" | "text" }>;
  compute: (values: Record<string, string>) => { main: string; extra?: string; summary: string };
  storageKey: string;
}) {
  const initialState = fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.key] = "";
    return accumulator;
  }, {});
  const [values, setValues] = usePersistentState(storageKey, initialState);
  const { copied, handleCopy } = useCopyFeedback();
  const result = compute(values);

  return (
    <Workspace title={title} description={description}>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <Field key={field.key} label={field.label}>
            <TextInput
              type={field.type ?? "number"}
              value={values[field.key]}
              onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
            />
          </Field>
        ))}
      </div>
      <ActionBar copied={copied} onCopy={() => void handleCopy(result.summary)} onReset={() => setValues(initialState)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard label="Result" value={result.main} />
        <ResultCard label="Details" value={result.extra ?? "Update the fields to calculate a live result."} />
      </div>
    </Workspace>
  );
}

function TextWorkspaceTool({
  title,
  description,
  storageKey,
  transform,
}: {
  title: string;
  description: string;
  storageKey: string;
  transform: (value: string) => { output: string; cards: Array<{ label: string; value: string; hint?: string }> };
}) {
  const [text, setText] = usePersistentState(storageKey, "");
  const { copied, handleCopy } = useCopyFeedback();
  const result = transform(text);

  return (
    <Workspace title={title} description={description}>
      <Field label="Input text">
        <TextArea value={text} onChange={(event) => setText(event.target.value)} />
      </Field>
      <ActionBar copied={copied} onCopy={() => void handleCopy(result.output)} onReset={() => setText("")} />
      <Field label="Result">
        <TextArea readOnly value={result.output} className="min-h-28 bg-[color:var(--surface-alt)]" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {result.cards.map((card) => (
          <ResultCard key={card.label} label={card.label} value={card.value} hint={card.hint} />
        ))}
      </div>
    </Workspace>
  );
}

function StoredNotesTool({
  title,
  description,
  storageKey,
  fields,
  emptyLabel,
}: {
  title: string;
  description: string;
  storageKey: string;
  fields: Array<{ key: "title" | "detail" | "extra"; label: string; type?: string }>;
  emptyLabel: string;
}) {
  const [notes, setNotes] = usePersistentState<Note[]>(storageKey, []);
  const [draft, setDraft] = useState({ title: "", detail: "", extra: "" });
  const { copied, handleCopy } = useCopyFeedback();

  const summary = notes.length
    ? notes.map((item) => `${item.title}${item.extra ? ` | ${item.extra}` : ""} - ${item.detail}${item.done ? " (done)" : ""}`).join("\n")
    : emptyLabel;

  return (
    <Workspace title={title} description={description}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <Field key={field.key} label={field.label}>
            <TextInput
              type={field.type ?? "text"}
              value={draft[field.key] ?? ""}
              onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
            />
          </Field>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (!draft.title.trim() || !draft.detail.trim()) {
              return;
            }

            setNotes((current) =>
              current.concat({
                id: uid("note"),
                title: draft.title.trim(),
                detail: draft.detail.trim(),
                extra: draft.extra.trim(),
                done: false,
              }),
            );
            setDraft({ title: "", detail: "", extra: "" });
          }}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          Add item
        </button>
        <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => setNotes([])} />
      </div>
      <div className="grid gap-3">
        {notes.length ? notes.map((item) => (
          <div key={item.id} className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold tracking-tight text-[color:var(--foreground)]">{item.title}</p>
                {item.extra ? <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--primary-dark)]">{item.extra}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setNotes((current) => current.filter((entry) => entry.id !== item.id))}
                className="text-sm font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--primary)]"
              >
                Remove
              </button>
            </div>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{item.detail}</p>
            <button
              type="button"
              onClick={() => setNotes((current) => current.map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry))}
              className="mt-3 rounded-full bg-[color:var(--surface-alt)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--foreground)]"
            >
              {item.done ? "Completed" : "Mark done"}
            </button>
          </div>
        )) : (
          <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-white p-5 text-sm leading-7 text-[color:var(--muted)]">
            {emptyLabel}
          </div>
        )}
      </div>
    </Workspace>
  );
}

function FlashcardCreatorTool() {
  const [cards, setCards] = usePersistentState<Flashcard[]>("education-flashcards", []);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const { copied, handleCopy } = useCopyFeedback();
  const summary = cards.length ? cards.map((card) => `${card.front} -> ${card.back}`).join("\n") : "No flashcards yet.";

  return (
    <Workspace title="Flashcard Creator" description="Create simple front-and-back flashcards and keep them saved in your browser for revision.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Front">
          <TextInput value={front} onChange={(event) => setFront(event.target.value)} />
        </Field>
        <Field label="Back">
          <TextInput value={back} onChange={(event) => setBack(event.target.value)} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (!front.trim() || !back.trim()) {
              return;
            }

            setCards((current) => current.concat({ id: uid("flashcard"), front: front.trim(), back: back.trim() }));
            setFront("");
            setBack("");
          }}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          Add flashcard
        </button>
        <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => setCards([])} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.length ? cards.map((card) => {
          const showingBack = activeId === card.id;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveId((current) => current === card.id ? null : card.id)}
              className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-5 text-left transition hover:border-[color:var(--primary)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{showingBack ? "Back" : "Front"}</p>
              <p className="mt-3 text-base font-bold tracking-tight text-[color:var(--foreground)]">{showingBack ? card.back : card.front}</p>
            </button>
          );
        }) : (
          <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-white p-5 text-sm leading-7 text-[color:var(--muted)] sm:col-span-2">
            Add your first flashcard to start revising.
          </div>
        )}
      </div>
    </Workspace>
  );
}

function RandomQuestionPickerTool() {
  const [value, setValue] = usePersistentState("education-random-questions", "");
  const [picked, setPicked] = useState("");
  const { copied, handleCopy } = useCopyFeedback();
  const questions = splitLines(value);

  return (
    <Workspace title="Random Question Picker" description="Paste one question per line and let the tool pick a random prompt for revision or discussion.">
      <Field label="Question list">
        <TextArea value={value} onChange={(event) => setValue(event.target.value)} placeholder="One question per line" />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (!questions.length) {
              setPicked("");
              return;
            }

            setPicked(questions[Math.floor(Math.random() * questions.length)] ?? "");
          }}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          Pick question
        </button>
        <ActionBar copied={copied} onCopy={() => void handleCopy(picked)} onReset={() => { setValue(""); setPicked(""); }} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard label="Questions Loaded" value={String(questions.length)} />
        <ResultCard label="Picked Question" value={picked || "No question picked yet"} />
      </div>
    </Workspace>
  );
}

function MultipleChoiceQuizBuilderTool() {
  const [questions, setQuestions] = usePersistentState<QuizQuestion[]>("education-mcq-builder", []);
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState("");
  const [answer, setAnswer] = useState("");
  const { copied, handleCopy } = useCopyFeedback();
  const summary = questions.length
    ? questions.map((item) => `${item.prompt}\nOptions: ${(item.options ?? []).join(", ")}\nAnswer: ${item.answer}`).join("\n\n")
    : "No questions yet.";

  return (
    <Workspace title="Multiple Choice Quiz Builder" description="Write a prompt, enter options separated by commas, and set the correct answer for quick revision sets.">
      <div className="grid gap-4">
        <Field label="Question">
          <TextInput value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        </Field>
        <Field label="Options (comma separated)">
          <TextInput value={options} onChange={(event) => setOptions(event.target.value)} />
        </Field>
        <Field label="Correct answer">
          <TextInput value={answer} onChange={(event) => setAnswer(event.target.value)} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (!prompt.trim() || !answer.trim()) {
              return;
            }

            setQuestions((current) =>
              current.concat({
                id: uid("mcq"),
                prompt: prompt.trim(),
                answer: answer.trim(),
                options: options.split(",").map((item) => item.trim()).filter(Boolean),
              }),
            );
            setPrompt("");
            setOptions("");
            setAnswer("");
          }}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          Add question
        </button>
        <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => setQuestions([])} />
      </div>
      <div className="grid gap-4">
        {questions.length ? questions.map((item, index) => (
          <div key={item.id} className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Question {index + 1}</p>
            <p className="mt-2 text-base font-bold tracking-tight text-[color:var(--foreground)]">{item.prompt}</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">Options: {(item.options ?? []).join(", ")}</p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--primary-dark)]">Answer: {item.answer}</p>
          </div>
        )) : (
          <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-white p-5 text-sm leading-7 text-[color:var(--muted)]">
            Add a question to begin building your quiz.
          </div>
        )}
      </div>
    </Workspace>
  );
}

function MemoryGameTool() {
  const symbols = ["A", "B", "C", "D", "A", "B", "C", "D"];
  const [cards, setCards] = useState(() => symbols.sort(() => Math.random() - 0.5).map((symbol, index) => ({
    id: `card-${index}`,
    symbol,
    open: false,
    matched: false,
  })));
  const [moves, setMoves] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const { copied, handleCopy } = useCopyFeedback();
  const completed = cards.every((card) => card.matched);
  const summary = `Memory game moves: ${moves}\nCompleted: ${completed ? "yes" : "no"}`;

  useEffect(() => {
    if (selected.length !== 2) {
      return;
    }

    const [firstId, secondId] = selected;
    const first = cards.find((card) => card.id === firstId);
    const second = cards.find((card) => card.id === secondId);

    if (!first || !second) {
      return;
    }

    if (first.symbol === second.symbol) {
      setCards((current) => current.map((card) => selected.includes(card.id) ? { ...card, matched: true } : card));
      setSelected([]);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      setCards((current) => current.map((card) => selected.includes(card.id) ? { ...card, open: false } : card));
      setSelected([]);
    }, 700);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [cards, selected]);

  return (
    <Workspace title="Memory Game" description="Flip matching pairs for a quick brain break that still feels study-friendly and lightweight.">
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            disabled={card.open || card.matched || selected.length === 2}
            onClick={() => {
              setCards((current) => current.map((entry) => entry.id === card.id ? { ...entry, open: true } : entry));
              setSelected((current) => current.concat(card.id));
              setMoves((current) => current + 1);
            }}
            className="aspect-square rounded-[1.25rem] border border-[color:var(--border)] bg-white text-xl font-black text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
          >
            {card.open || card.matched ? card.symbol : "?"}
          </button>
        ))}
      </div>
      <ActionBar
        copied={copied}
        onCopy={() => void handleCopy(summary)}
        onReset={() => {
          setCards(symbols.sort(() => Math.random() - 0.5).map((symbol, index) => ({
            id: `card-${index}`,
            symbol,
            open: false,
            matched: false,
          })));
          setMoves(0);
          setSelected([]);
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard label="Moves" value={String(moves)} />
        <ResultCard label="Status" value={completed ? "Completed" : "In progress"} />
      </div>
    </Workspace>
  );
}

const brainQuestions = [
  { question: "What planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter"], answer: "Mars" },
  { question: "How many sides does a hexagon have?", options: ["5", "6", "8"], answer: "6" },
  { question: "Water freezes at what temperature in Celsius?", options: ["0", "10", "32"], answer: "0" },
];

function BrainQuizTool() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const { copied, handleCopy } = useCopyFeedback();
  const current = brainQuestions[index];
  const summary = `Brain quiz score: ${score} out of ${brainQuestions.length}`;

  return (
    <Workspace title="Brain Quiz" description="Answer a few general knowledge questions and keep a simple score while you practice.">
      <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Question {index + 1}</p>
        <p className="mt-3 text-lg font-bold tracking-tight text-[color:var(--foreground)]">{current.question}</p>
        <div className="mt-4 grid gap-3">
          {current.options.map((option) => (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => {
                setAnswered(true);
                if (option === current.answer) {
                  setScore((value) => value + 1);
                }
              }}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-4 py-3 text-left text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (index < brainQuestions.length - 1) {
              setIndex((currentIndex) => currentIndex + 1);
              setAnswered(false);
            }
          }}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          Next question
        </button>
        <ActionBar
          copied={copied}
          onCopy={() => void handleCopy(summary)}
          onReset={() => {
            setIndex(0);
            setScore(0);
            setAnswered(false);
          }}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard label="Score" value={`${score}/${brainQuestions.length}`} />
        <ResultCard label="Correct Answer" value={answered ? current.answer : "Answer to reveal"} />
      </div>
    </Workspace>
  );
}

function DailyChallengeQuizTool() {
  const dayIndex = new Date().getDate() % brainQuestions.length;
  const question = brainQuestions[dayIndex];
  const [choice, setChoice] = useState("");
  const { copied, handleCopy } = useCopyFeedback();
  const summary = `Daily challenge: ${question.question}\nYour answer: ${choice || "Not answered"}\nCorrect answer: ${question.answer}`;

  return (
    <Workspace title="Daily Challenge Quiz" description="A tiny question of the day experience that changes based on the calendar date.">
      <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Today&apos;s challenge</p>
        <p className="mt-3 text-lg font-bold tracking-tight text-[color:var(--foreground)]">{question.question}</p>
        <div className="mt-4 grid gap-3">
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setChoice(option)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                choice === option
                  ? "border-[color:var(--primary)] bg-[color:var(--soft)] text-[color:var(--primary-dark)]"
                  : "border-[color:var(--border)] bg-[color:var(--surface-alt)] text-[color:var(--foreground)]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => setChoice("")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard label="Your Answer" value={choice || "Not answered"} />
        <ResultCard label="Correct Answer" value={choice ? question.answer : "Select an option first"} />
      </div>
    </Workspace>
  );
}

function renderTool(tool: EducationTool) {
  switch (tool.slug) {
    case "gpa-calculator":
      return <GpaCalculatorTool />;
    case "word-counter":
      return <WordCounterTool />;
    case "unit-converter":
      return <UnitConverterTool />;
    case "pomodoro-timer":
      return <PomodoroTimerTool />;
    case "typing-speed-test":
      return <TypingSpeedTestTool />;
    case "cgpa-calculator":
      return (
        <SimpleCalculatorTool
          title="CGPA Calculator"
          description="Add total grade points and total credits to estimate cumulative GPA."
          storageKey="education-cgpa"
          fields={[
            { key: "points", label: "Total quality points" },
            { key: "credits", label: "Total credits" },
          ]}
          compute={(values) => {
            const points = parseNumber(values.points);
            const credits = parseNumber(values.credits);
            const cgpa = credits ? round(points / credits, 2) : 0;
            return {
              main: credits ? cgpa.toFixed(2) : "0.00",
              extra: `${points} quality points across ${credits} credits`,
              summary: `CGPA: ${cgpa.toFixed(2)}`,
            };
          }}
        />
      );
    case "grade-calculator":
      return (
        <SimpleCalculatorTool
          title="Grade Calculator"
          description="Enter points earned and total points possible to get your current percentage grade."
          storageKey="education-grade"
          fields={[
            { key: "earned", label: "Points earned" },
            { key: "possible", label: "Total points possible" },
          ]}
          compute={(values) => {
            const earned = parseNumber(values.earned);
            const possible = parseNumber(values.possible);
            const percent = possible ? round((earned / possible) * 100, 2) : 0;
            return {
              main: `${percent.toFixed(2)}%`,
              extra: `${earned} out of ${possible}`,
              summary: `Grade: ${percent.toFixed(2)}%`,
            };
          }}
        />
      );
    case "final-grade-calculator":
      return (
        <SimpleCalculatorTool
          title="Final Grade Calculator"
          description="Estimate the exam score needed to hit your target overall grade."
          storageKey="education-final-grade"
          fields={[
            { key: "current", label: "Current grade %" },
            { key: "target", label: "Target overall grade %" },
            { key: "finalWeight", label: "Final exam weight %" },
          ]}
          compute={(values) => {
            const current = parseNumber(values.current);
            const target = parseNumber(values.target);
            const finalWeight = parseNumber(values.finalWeight) / 100;
            const required = finalWeight ? round((target - current * (1 - finalWeight)) / finalWeight, 2) : 0;
            return {
              main: `${required.toFixed(2)}%`,
              extra: "Required score on the final exam",
              summary: `Required final grade: ${required.toFixed(2)}%`,
            };
          }}
        />
      );
    case "percentage-calculator":
      return (
        <SimpleCalculatorTool
          title="Percentage Calculator"
          description="Calculate what percentage one number is of another."
          storageKey="education-percentage"
          fields={[
            { key: "part", label: "Part value" },
            { key: "whole", label: "Whole value" },
          ]}
          compute={(values) => {
            const part = parseNumber(values.part);
            const whole = parseNumber(values.whole);
            const percent = whole ? round((part / whole) * 100, 2) : 0;
            return {
              main: `${percent.toFixed(2)}%`,
              extra: `${part} is ${percent.toFixed(2)}% of ${whole}`,
              summary: `${part} is ${percent.toFixed(2)}% of ${whole}`,
            };
          }}
        />
      );
    case "average-calculator":
      return (
        <TextWorkspaceTool
          title="Average Calculator"
          description="Enter one number per line to calculate the mean value."
          storageKey="education-average"
          transform={(value) => {
            const numbers = splitLines(value).map(parseNumber);
            const total = numbers.reduce((sum, item) => sum + item, 0);
            const average = numbers.length ? round(total / numbers.length, 2) : 0;
            return {
              output: numbers.length ? String(average) : "",
              cards: [
                { label: "Entries", value: String(numbers.length) },
                { label: "Total", value: String(round(total, 2)) },
                { label: "Average", value: String(average) },
              ],
            };
          }}
        />
      );
    case "weighted-grade-calculator":
      return (
        <SimpleCalculatorTool
          title="Weighted Grade Calculator"
          description="Enter assignment score, assignment weight, exam score, and exam weight for a quick weighted result."
          storageKey="education-weighted-grade"
          fields={[
            { key: "assignment", label: "Assignment grade %" },
            { key: "assignmentWeight", label: "Assignment weight %" },
            { key: "exam", label: "Exam grade %" },
            { key: "examWeight", label: "Exam weight %" },
          ]}
          compute={(values) => {
            const assignment = parseNumber(values.assignment);
            const assignmentWeight = parseNumber(values.assignmentWeight) / 100;
            const exam = parseNumber(values.exam);
            const examWeight = parseNumber(values.examWeight) / 100;
            const result = assignment * assignmentWeight + exam * examWeight;
            return {
              main: `${round(result, 2).toFixed(2)}%`,
              extra: "Weighted total from the current two-part setup",
              summary: `Weighted grade: ${round(result, 2).toFixed(2)}%`,
            };
          }}
        />
      );
    case "marks-percentage-calculator":
      return (
        <SimpleCalculatorTool
          title="Marks Percentage Calculator"
          description="Turn marks obtained into a percentage instantly."
          storageKey="education-marks-percent"
          fields={[
            { key: "marks", label: "Marks obtained" },
            { key: "total", label: "Total marks" },
          ]}
          compute={(values) => {
            const marks = parseNumber(values.marks);
            const total = parseNumber(values.total);
            const result = total ? round((marks / total) * 100, 2) : 0;
            return {
              main: `${result.toFixed(2)}%`,
              extra: `${marks} / ${total}`,
              summary: `Marks percentage: ${result.toFixed(2)}%`,
            };
          }}
        />
      );
    case "attendance-calculator":
      return (
        <SimpleCalculatorTool
          title="Attendance Calculator"
          description="Check your attendance percentage and estimate how many classes you need to reach a target."
          storageKey="education-attendance"
          fields={[
            { key: "attended", label: "Classes attended" },
            { key: "total", label: "Total classes" },
            { key: "target", label: "Target attendance %" },
          ]}
          compute={(values) => {
            const attended = parseNumber(values.attended);
            const total = parseNumber(values.total);
            const target = parseNumber(values.target);
            const current = total ? round((attended / total) * 100, 2) : 0;
            const needed = target ? Math.max(0, Math.ceil((target * total - 100 * attended) / (100 - target))) : 0;
            return {
              main: `${current.toFixed(2)}%`,
              extra: needed ? `${needed} more classes needed to reach ${target}%` : "Target already reached or unavailable",
              summary: `Attendance: ${current.toFixed(2)}%`,
            };
          }}
        />
      );
    case "study-hours-calculator":
      return (
        <SimpleCalculatorTool
          title="Study Hours Calculator"
          description="Estimate weekly study hours from subjects, hours per subject, and study days."
          storageKey="education-study-hours"
          fields={[
            { key: "subjects", label: "Number of subjects" },
            { key: "hours", label: "Hours per subject each week" },
            { key: "days", label: "Study days per week" },
          ]}
          compute={(values) => {
            const subjects = parseNumber(values.subjects);
            const hours = parseNumber(values.hours);
            const days = parseNumber(values.days);
            const weekly = round(subjects * hours, 2);
            const daily = days ? round(weekly / days, 2) : 0;
            return {
              main: `${weekly} hrs/week`,
              extra: `${daily} hrs/day across ${days} days`,
              summary: `Weekly study hours: ${weekly}`,
            };
          }}
        />
      );
    case "character-counter":
      return (
        <TextWorkspaceTool
          title="Character Counter"
          description="Count characters with and without spaces from any text sample."
          storageKey="education-character-counter"
          transform={(value) => ({
            output: value,
            cards: [
              { label: "Characters", value: String(value.length) },
              { label: "No Spaces", value: String(value.replace(/\s/g, "").length) },
              { label: "Words", value: String(countWords(value)) },
            ],
          })}
        />
      );
    case "paragraph-counter":
      return (
        <TextWorkspaceTool
          title="Paragraph Counter"
          description="Paste text and count paragraphs instantly."
          storageKey="education-paragraph-counter"
          transform={(value) => ({
            output: value,
            cards: [
              { label: "Paragraphs", value: String(countParagraphs(value)) },
              { label: "Words", value: String(countWords(value)) },
              { label: "Characters", value: String(value.length) },
            ],
          })}
        />
      );
    case "text-case-converter":
      return (
        <TextWorkspaceTool
          title="Text Case Converter"
          description="Switch text between uppercase, lowercase, title case, and sentence case."
          storageKey="education-case-converter"
          transform={(value) => {
            const output = `UPPERCASE:\n${value.toUpperCase()}\n\nlowercase:\n${value.toLowerCase()}\n\nTitle Case:\n${titleCase(value)}\n\nSentence case:\n${sentenceCase(value)}`;
            return {
              output,
              cards: [
                { label: "Words", value: String(countWords(value)) },
                { label: "Characters", value: String(value.length) },
                { label: "Paragraphs", value: String(countParagraphs(value)) },
              ],
            };
          }}
        />
      );
    case "reading-time-calculator":
      return (
        <TextWorkspaceTool
          title="Reading Time Calculator"
          description="Estimate reading time using a simple 200-words-per-minute baseline."
          storageKey="education-reading-time"
          transform={(value) => {
            const words = countWords(value);
            const minutes = words ? Math.max(1, Math.ceil(words / 200)) : 0;
            return {
              output: value,
              cards: [
                { label: "Words", value: String(words) },
                { label: "Reading Time", value: `${minutes} min` },
                { label: "Sentences", value: String(value.trim() ? countSentences(value) : 0) },
              ],
            };
          }}
        />
      );
    case "sentence-counter":
      return (
        <TextWorkspaceTool
          title="Sentence Counter"
          description="Count how many sentences appear in your text sample."
          storageKey="education-sentence-counter"
          transform={(value) => ({
            output: value,
            cards: [
              { label: "Sentences", value: String(value.trim() ? countSentences(value) : 0) },
              { label: "Words", value: String(countWords(value)) },
              { label: "Characters", value: String(value.length) },
            ],
          })}
        />
      );
    case "text-sorter-a-z":
      return (
        <TextWorkspaceTool
          title="Text Sorter (A-Z)"
          description="Sort lines alphabetically for notes, names, or vocabulary lists."
          storageKey="education-text-sorter"
          transform={(value) => {
            const lines = splitLines(value);
            const output = [...lines].sort((left, right) => left.localeCompare(right)).join("\n");
            return {
              output,
              cards: [
                { label: "Lines", value: String(lines.length) },
                { label: "Unique Lines", value: String(new Set(lines).size) },
                { label: "Words", value: String(countWords(output)) },
              ],
            };
          }}
        />
      );
    case "remove-duplicate-lines-tool":
      return (
        <TextWorkspaceTool
          title="Remove Duplicate Lines Tool"
          description="Remove repeated lines while keeping the first occurrence."
          storageKey="education-dedupe-lines"
          transform={(value) => {
            const lines = splitLines(value);
            const output = [...new Set(lines)].join("\n");
            return {
              output,
              cards: [
                { label: "Original Lines", value: String(lines.length) },
                { label: "Unique Lines", value: String(new Set(lines).size) },
                { label: "Duplicates Removed", value: String(lines.length - new Set(lines).size) },
              ],
            };
          }}
        />
      );
    case "basic-citation-generator":
      return (
        <BasicCitationGenerator />
      );
    case "paragraph-formatter":
      return (
        <TextWorkspaceTool
          title="Paragraph Formatter"
          description="Normalize spacing, trim lines, and create cleaner paragraphs."
          storageKey="education-paragraph-formatter"
          transform={(value) => {
            const output = value
              .split(/\r?\n/)
              .map((line) => line.trim().replace(/\s+/g, " "))
              .filter((line, index, array) => line || (array[index - 1] && array[index - 1] !== ""))
              .join("\n");
            return {
              output,
              cards: [
                { label: "Paragraphs", value: String(countParagraphs(output)) },
                { label: "Words", value: String(countWords(output)) },
                { label: "Characters", value: String(output.length) },
              ],
            };
          }}
        />
      );
    case "scientific-calculator":
      return <ScientificCalculatorTool />;
    case "age-calculator":
      return <AgeCalculatorTool />;
    case "random-number-generator":
      return <RandomNumberGeneratorTool />;
    case "time-zone-converter":
      return <TimeZoneConverterTool />;
    case "date-difference-calculator":
      return <DateDifferenceCalculatorTool />;
    case "countdown-timer":
      return <CountdownTimerTool />;
    case "stopwatch-tool":
      return <StopwatchTool />;
    case "number-base-converter":
      return <NumberBaseConverterTool />;
    case "ratio-calculator":
      return <RatioCalculatorTool />;
    case "study-planner":
      return <StoredNotesTool title="Study Planner" description="Plan study sessions with subject, task, and time notes saved locally." storageKey="education-study-planner" fields={[{ key: "title", label: "Subject" }, { key: "detail", label: "Task" }, { key: "extra", label: "Study date" }]} emptyLabel="No study sessions planned yet." />;
    case "timetable-generator":
      return <StoredNotesTool title="Timetable Generator" description="Create a simple weekly timetable with subject, time, and room or note details." storageKey="education-timetable" fields={[{ key: "title", label: "Class or subject" }, { key: "detail", label: "Time range" }, { key: "extra", label: "Day" }]} emptyLabel="No timetable blocks added yet." />;
    case "exam-countdown-timer":
      return <StoredNotesTool title="Exam Countdown Timer" description="Track upcoming exams with dates and countdown notes saved in your browser." storageKey="education-exams" fields={[{ key: "title", label: "Exam name" }, { key: "detail", label: "Target date (YYYY-MM-DD)" }, { key: "extra", label: "Subject" }]} emptyLabel="No exams added yet." />;
    case "homework-tracker":
      return <StoredNotesTool title="Homework Tracker" description="Track homework items, due dates, and completion status locally." storageKey="education-homework" fields={[{ key: "title", label: "Assignment" }, { key: "detail", label: "What to do" }, { key: "extra", label: "Due date" }]} emptyLabel="No homework tasks tracked yet." />;
    case "study-goal-tracker":
      return <StoredNotesTool title="Study Goal Tracker" description="Set subject goals and check off completed milestones as you progress." storageKey="education-study-goals" fields={[{ key: "title", label: "Goal" }, { key: "detail", label: "Progress note" }, { key: "extra", label: "Deadline" }]} emptyLabel="No study goals yet." />;
    case "daily-study-checklist-generator":
      return <ChecklistGeneratorTool />;
    case "revision-planner":
      return <StoredNotesTool title="Revision Planner" description="Organize topics, dates, and revision notes in a lightweight study board." storageKey="education-revision-planner" fields={[{ key: "title", label: "Topic" }, { key: "detail", label: "Revision task" }, { key: "extra", label: "Planned date" }]} emptyLabel="No revision topics added yet." />;
    case "time-blocking-tool":
      return <TimeBlockingTool />;
    case "focus-timer":
      return <FocusTimerTool />;
    case "quiz-maker":
      return <SimpleQuizMakerTool />;
    case "flashcard-creator":
      return <FlashcardCreatorTool />;
    case "random-question-picker":
      return <RandomQuestionPickerTool />;
    case "multiple-choice-quiz-builder":
      return <MultipleChoiceQuizBuilderTool />;
    case "true-false-generator":
      return <TrueFalseGeneratorTool />;
    case "score-calculator":
      return (
        <SimpleCalculatorTool
          title="Score Calculator"
          description="Calculate quiz score percentages from points earned and total points."
          storageKey="education-score-calculator"
          fields={[
            { key: "score", label: "Points earned" },
            { key: "total", label: "Total points" },
          ]}
          compute={(values) => {
            const score = parseNumber(values.score);
            const total = parseNumber(values.total);
            const percent = total ? round((score / total) * 100, 2) : 0;
            return {
              main: `${percent.toFixed(2)}%`,
              extra: `${score} out of ${total}`,
              summary: `Score: ${percent.toFixed(2)}%`,
            };
          }}
        />
      );
    case "memory-game":
      return <MemoryGameTool />;
    case "brain-quiz":
      return <BrainQuizTool />;
    case "daily-challenge-quiz":
      return <DailyChallengeQuizTool />;
    default:
      return (
        <Workspace title={tool.name} description={tool.shortDescription}>
          <ResultCard label="Status" value="Tool coming through shared scaffold" hint="This route has been wired into the education system, but the specific renderer was not matched." />
        </Workspace>
      );
  }
}

function BasicCitationGenerator() {
  const [style, setStyle] = useState("apa");
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [source, setSource] = useState("");
  const { copied, handleCopy } = useCopyFeedback();
  const citation = style === "apa"
    ? `${author} (${year}). ${title}. ${source}.`.replace(/\s+/g, " ").trim()
    : `${author}. "${title}." ${source}, ${year}.`.replace(/\s+/g, " ").trim();

  return (
    <Workspace title="Basic Citation Generator (APA/MLA)" description="Build a simple manual citation for quick school use when you already know the source details.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Style">
          <Select value={style} onChange={(event) => setStyle(event.target.value)}>
            <option value="apa">APA</option>
            <option value="mla">MLA</option>
          </Select>
        </Field>
        <Field label="Author">
          <TextInput value={author} onChange={(event) => setAuthor(event.target.value)} />
        </Field>
        <Field label="Title">
          <TextInput value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="Year">
          <TextInput value={year} onChange={(event) => setYear(event.target.value)} />
        </Field>
        <Field label="Website or publisher">
          <TextInput value={source} onChange={(event) => setSource(event.target.value)} />
        </Field>
      </div>
      <ActionBar copied={copied} onCopy={() => void handleCopy(citation)} onReset={() => { setStyle("apa"); setAuthor(""); setTitle(""); setYear(""); setSource(""); }} />
      <Field label="Citation">
        <TextArea readOnly value={citation} className="min-h-28 bg-[color:var(--surface-alt)]" />
      </Field>
    </Workspace>
  );
}

function ScientificCalculatorTool() {
  const [value, setValue] = useState("0");
  const [second, setSecond] = useState("0");
  const [operation, setOperation] = useState("sqrt");
  const { copied, handleCopy } = useCopyFeedback();
  const input = parseNumber(value);
  const secondary = parseNumber(second);
  let result: number;

  switch (operation) {
    case "sqrt":
      result = Math.sqrt(Math.max(0, input));
      break;
    case "square":
      result = input ** 2;
      break;
    case "sin":
      result = Math.sin((input * Math.PI) / 180);
      break;
    case "cos":
      result = Math.cos((input * Math.PI) / 180);
      break;
    case "log":
      result = input > 0 ? Math.log10(input) : 0;
      break;
    case "pow":
      result = input ** secondary;
      break;
    default:
      result = 0;
  }

  const summary = `Operation: ${operation}\nResult: ${round(result, 6)}`;

  return (
    <Workspace title="Scientific Calculator" description="Use common scientific functions without opening a heavier calculator app.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Primary value">
          <TextInput type="number" value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
        <Field label="Operation">
          <Select value={operation} onChange={(event) => setOperation(event.target.value)}>
            <option value="sqrt">Square root</option>
            <option value="square">Square</option>
            <option value="sin">Sine (degrees)</option>
            <option value="cos">Cosine (degrees)</option>
            <option value="log">Log base 10</option>
            <option value="pow">Power</option>
          </Select>
        </Field>
        <Field label="Second value">
          <TextInput type="number" value={second} onChange={(event) => setSecond(event.target.value)} />
        </Field>
      </div>
      <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => { setValue("0"); setSecond("0"); setOperation("sqrt"); }} />
      <ResultCard label="Result" value={String(round(result, 6))} />
    </Workspace>
  );
}

function AgeCalculatorTool() {
  const [birthDate, setBirthDate] = useState("");
  const { copied, handleCopy } = useCopyFeedback();

  const result = useMemo(() => {
    if (!birthDate) {
      return null;
    }

    const birth = new Date(`${birthDate}T00:00:00`);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years, months, days };
  }, [birthDate]);

  const summary = result ? `Age: ${result.years} years, ${result.months} months, ${result.days} days` : "";

  return (
    <Workspace title="Age Calculator" description="Enter a birth date to estimate age in years, months, and days.">
      <Field label="Birth date">
        <TextInput type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
      </Field>
      <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => setBirthDate("")} />
      <ResultCard label="Age" value={result ? `${result.years}y ${result.months}m ${result.days}d` : "Select a date"} />
    </Workspace>
  );
}

function RandomNumberGeneratorTool() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("10");
  const [count, setCount] = useState("1");
  const [result, setResult] = useState<number[]>([]);
  const { copied, handleCopy } = useCopyFeedback();

  return (
    <Workspace title="Random Number Generator" description="Pick a min and max value, then generate one or many random integers.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Minimum">
          <TextInput type="number" value={min} onChange={(event) => setMin(event.target.value)} />
        </Field>
        <Field label="Maximum">
          <TextInput type="number" value={max} onChange={(event) => setMax(event.target.value)} />
        </Field>
        <Field label="How many numbers">
          <TextInput type="number" value={count} onChange={(event) => setCount(event.target.value)} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            const minimum = Math.trunc(parseNumber(min));
            const maximum = Math.trunc(parseNumber(max));
            const size = Math.max(1, Math.trunc(parseNumber(count)));
            const numbers = Array.from({ length: size }, () =>
              Math.floor(Math.random() * (maximum - minimum + 1)) + minimum,
            );
            setResult(numbers);
          }}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          Generate
        </button>
        <ActionBar copied={copied} onCopy={() => void handleCopy(result.join(", "))} onReset={() => setResult([])} />
      </div>
      <ResultCard label="Numbers" value={result.length ? result.join(", ") : "Generate numbers"} />
    </Workspace>
  );
}

function TimeZoneConverterTool() {
  const [datetime, setDatetime] = useState("");
  const [fromZone, setFromZone] = useState("UTC");
  const [toZone, setToZone] = useState("America/New_York");
  const zones = ["UTC", "America/New_York", "Europe/London", "Europe/Paris", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"];
  const { copied, handleCopy } = useCopyFeedback();

  const converted = useMemo(() => {
    if (!datetime) {
      return "";
    }

    const sourceDate = new Date(datetime);
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: toZone,
    }).format(sourceDate);
  }, [datetime, toZone]);

  const summary = converted ? `From ${fromZone} to ${toZone}: ${converted}` : "";

  return (
    <Workspace title="Time Zone Converter" description="Convert a date and time across common global time zones for classes, calls, and exams.">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date and time">
          <TextInput type="datetime-local" value={datetime} onChange={(event) => setDatetime(event.target.value)} />
        </Field>
        <Field label="From zone">
          <Select value={fromZone} onChange={(event) => setFromZone(event.target.value)}>
            {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </Select>
        </Field>
        <Field label="To zone">
          <Select value={toZone} onChange={(event) => setToZone(event.target.value)}>
            {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </Select>
        </Field>
      </div>
      <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => setDatetime("")} />
      <ResultCard label="Converted Time" value={converted || "Pick a date and time"} hint="The displayed output uses the selected target time zone." />
    </Workspace>
  );
}

function DateDifferenceCalculatorTool() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const { copied, handleCopy } = useCopyFeedback();

  const result = useMemo(() => {
    if (!start || !end) {
      return null;
    }

    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    const diff = Math.abs(endDate.getTime() - startDate.getTime());
    const days = Math.ceil(diff / 86400000);
    return { days, weeks: round(days / 7, 2), months: round(days / 30.44, 2) };
  }, [end, start]);

  const summary = result ? `${result.days} days, ${result.weeks} weeks, ${result.months} months` : "";

  return (
    <Workspace title="Date Difference Calculator" description="Measure the gap between two dates in days, weeks, and months.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date">
          <TextInput type="date" value={start} onChange={(event) => setStart(event.target.value)} />
        </Field>
        <Field label="End date">
          <TextInput type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
        </Field>
      </div>
      <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => { setStart(""); setEnd(""); }} />
      <div className="grid gap-4 sm:grid-cols-3">
        <ResultCard label="Days" value={result ? String(result.days) : "0"} />
        <ResultCard label="Weeks" value={result ? String(result.weeks) : "0"} />
        <ResultCard label="Months" value={result ? String(result.months) : "0"} />
      </div>
    </Workspace>
  );
}

function CountdownTimerTool() {
  const [target, setTarget] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const { copied, handleCopy } = useCopyFeedback();

  useEffect(() => {
    if (!running || !target) {
      return;
    }

    const timer = window.setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(target).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff === 0) {
        setRunning(false);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, target]);

  const summary = `Countdown: ${secondsLeft} seconds remaining`;

  return (
    <Workspace title="Countdown Timer" description="Count down to a class, event, revision block, or deadline with a live timer.">
      <Field label="Target date and time">
        <TextInput type="datetime-local" value={target} onChange={(event) => setTarget(event.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (!target) {
              return;
            }
            setRunning(true);
          }}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          Start countdown
        </button>
        <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => { setTarget(""); setSecondsLeft(0); setRunning(false); }} />
      </div>
      <ResultCard label="Time Remaining" value={`${secondsLeft}s`} />
    </Workspace>
  );
}

function StopwatchTool() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const { copied, handleCopy } = useCopyFeedback();

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const summary = `Stopwatch: ${seconds} seconds`;

  return (
    <Workspace title="Stopwatch Tool" description="Run a simple stopwatch for study sprints, speaking practice, or class activities.">
      <ResultCard label="Elapsed Time" value={`${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`} />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setRunning((current) => !current)}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          {running ? "Pause" : "Start"}
        </button>
        <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => { setRunning(false); setSeconds(0); }} />
      </div>
    </Workspace>
  );
}

function NumberBaseConverterTool() {
  const [value, setValue] = useState("");
  const [base, setBase] = useState("10");
  const { copied, handleCopy } = useCopyFeedback();
  const decimal = value ? Number.parseInt(value, Number.parseInt(base, 10)) : 0;
  const summary = `Decimal: ${decimal}\nBinary: ${decimal.toString(2)}\nHex: ${decimal.toString(16).toUpperCase()}`;

  return (
    <Workspace title="Number Base Converter" description="Convert between binary, decimal, octal, and hexadecimal values.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Value">
          <TextInput value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
        <Field label="Input base">
          <Select value={base} onChange={(event) => setBase(event.target.value)}>
            <option value="2">Binary</option>
            <option value="8">Octal</option>
            <option value="10">Decimal</option>
            <option value="16">Hexadecimal</option>
          </Select>
        </Field>
      </div>
      <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => { setValue(""); setBase("10"); }} />
      <div className="grid gap-4 sm:grid-cols-3">
        <ResultCard label="Decimal" value={Number.isNaN(decimal) ? "Invalid" : String(decimal)} />
        <ResultCard label="Binary" value={Number.isNaN(decimal) ? "Invalid" : decimal.toString(2)} />
        <ResultCard label="Hex" value={Number.isNaN(decimal) ? "Invalid" : decimal.toString(16).toUpperCase()} />
      </div>
    </Workspace>
  );
}

function RatioCalculatorTool() {
  const [left, setLeft] = useState("4");
  const [right, setRight] = useState("8");
  const { copied, handleCopy } = useCopyFeedback();
  const a = parseNumber(left);
  const b = parseNumber(right);
  const divisor = gcd(a, b);
  const summary = `Simplified ratio: ${a / divisor}:${b / divisor}`;

  return (
    <Workspace title="Ratio Calculator" description="Simplify a ratio and quickly see its lowest terms.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Left side">
          <TextInput type="number" value={left} onChange={(event) => setLeft(event.target.value)} />
        </Field>
        <Field label="Right side">
          <TextInput type="number" value={right} onChange={(event) => setRight(event.target.value)} />
        </Field>
      </div>
      <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => { setLeft("4"); setRight("8"); }} />
      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard label="Simplified Ratio" value={`${a / divisor}:${b / divisor}`} />
        <ResultCard label="Scale Factor" value={String(divisor)} />
      </div>
    </Workspace>
  );
}

function ChecklistGeneratorTool() {
  const [subjects, setSubjects] = usePersistentState("education-daily-checklist", "");
  const [checked, setChecked] = usePersistentState<Record<string, boolean>>("education-daily-checklist-state", {});
  const { copied, handleCopy } = useCopyFeedback();
  const items = splitLines(subjects).map((item, index) => ({ id: `check-${index}`, label: `Review ${item}` }));
  const summary = items.map((item) => `${checked[item.id] ? "[x]" : "[ ]"} ${item.label}`).join("\n");

  return (
    <Workspace title="Daily Study Checklist Generator" description="Enter subjects or tasks one per line and turn them into a simple checklist.">
      <Field label="Subjects or tasks">
        <TextArea value={subjects} onChange={(event) => setSubjects(event.target.value)} placeholder="Math\nScience\nHistory" />
      </Field>
      <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => { setSubjects(""); setChecked({}); }} />
      <div className="grid gap-3">
        {items.length ? items.map((item) => (
          <label key={item.id} className="flex items-center gap-3 rounded-[1.25rem] border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[color:var(--foreground)]">
            <input
              type="checkbox"
              checked={checked[item.id] ?? false}
              onChange={(event) => setChecked((current) => ({ ...current, [item.id]: event.target.checked }))}
            />
            <span>{item.label}</span>
          </label>
        )) : (
          <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-white p-5 text-sm leading-7 text-[color:var(--muted)]">
            Add a few subjects or tasks to generate your checklist.
          </div>
        )}
      </div>
    </Workspace>
  );
}

function TimeBlockingTool() {
  const [blocks, setBlocks] = usePersistentState<Block[]>("education-time-blocks", []);
  const [draft, setDraft] = useState({ label: "", start: "", end: "", note: "" });
  const { copied, handleCopy } = useCopyFeedback();
  const summary = blocks.map((block) => `${block.start}-${block.end} ${block.label}${block.note ? ` | ${block.note}` : ""}`).join("\n");

  return (
    <Workspace title="Time Blocking Tool" description="Build a simple day plan with start time, end time, and a short study note.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Block label">
          <TextInput value={draft.label} onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))} />
        </Field>
        <Field label="Start">
          <TextInput type="time" value={draft.start} onChange={(event) => setDraft((current) => ({ ...current, start: event.target.value }))} />
        </Field>
        <Field label="End">
          <TextInput type="time" value={draft.end} onChange={(event) => setDraft((current) => ({ ...current, end: event.target.value }))} />
        </Field>
        <Field label="Note">
          <TextInput value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (!draft.label.trim() || !draft.start || !draft.end) {
              return;
            }

            setBlocks((current) => current.concat({ id: uid("block"), label: draft.label.trim(), start: draft.start, end: draft.end, note: draft.note.trim() }));
            setDraft({ label: "", start: "", end: "", note: "" });
          }}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          Add block
        </button>
        <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => setBlocks([])} />
      </div>
      <div className="grid gap-3">
        {blocks.length ? blocks.map((block) => (
          <div key={block.id} className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-4">
            <p className="text-base font-bold tracking-tight text-[color:var(--foreground)]">{block.label}</p>
            <p className="mt-2 text-sm text-[color:var(--primary-dark)]">{block.start} - {block.end}</p>
            {block.note ? <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{block.note}</p> : null}
          </div>
        )) : (
          <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-white p-5 text-sm leading-7 text-[color:var(--muted)]">
            Add a block to build your time plan.
          </div>
        )}
      </div>
    </Workspace>
  );
}

function FocusTimerTool() {
  const [minutes, setMinutes] = useState("15");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = usePersistentState("education-focus-completed", 0);
  const { copied, handleCopy } = useCopyFeedback();

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setRunning(false);
          setCompleted((count) => count + 1);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, setCompleted]);

  return (
    <Workspace title="Focus Timer" description="Set a custom focus countdown and keep a local count of completed sessions.">
      <Field label="Focus minutes">
        <TextInput type="number" value={minutes} onChange={(event) => setMinutes(event.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setSecondsLeft(Math.max(1, Math.trunc(parseNumber(minutes))) * 60);
            setRunning(true);
          }}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          Start focus timer
        </button>
        <ActionBar copied={copied} onCopy={() => void handleCopy(`Focus timer: ${secondsLeft} seconds left`)} onReset={() => { setSecondsLeft(0); setRunning(false); setCompleted(0); }} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ResultCard label="Time Left" value={`${secondsLeft}s`} />
        <ResultCard label="Completed Sessions" value={String(completed)} />
      </div>
    </Workspace>
  );
}

function SimpleQuizMakerTool() {
  const [questions, setQuestions] = usePersistentState<QuizQuestion[]>("education-quiz-maker", []);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const { copied, handleCopy } = useCopyFeedback();
  const summary = questions.map((item) => `${item.prompt} -> ${item.answer}`).join("\n");

  return (
    <Workspace title="Quiz Maker (Manual Input)" description="Create simple question-and-answer sets for quick review.">
      <div className="grid gap-4">
        <Field label="Question">
          <TextInput value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        </Field>
        <Field label="Answer">
          <TextInput value={answer} onChange={(event) => setAnswer(event.target.value)} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (!prompt.trim() || !answer.trim()) {
              return;
            }

            setQuestions((current) => current.concat({ id: uid("quiz"), prompt: prompt.trim(), answer: answer.trim() }));
            setPrompt("");
            setAnswer("");
          }}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          Add question
        </button>
        <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => setQuestions([])} />
      </div>
      <div className="grid gap-3">
        {questions.length ? questions.map((item) => (
          <div key={item.id} className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-4">
            <p className="text-base font-bold tracking-tight text-[color:var(--foreground)]">{item.prompt}</p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{item.answer}</p>
          </div>
        )) : (
          <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-white p-5 text-sm leading-7 text-[color:var(--muted)]">
            Add a question and answer to build your first quiz set.
          </div>
        )}
      </div>
    </Workspace>
  );
}

function TrueFalseGeneratorTool() {
  const [statement, setStatement] = useState("");
  const [items, setItems] = usePersistentState<QuizQuestion[]>("education-true-false", []);
  const { copied, handleCopy } = useCopyFeedback();
  const summary = items.map((item) => `${item.prompt} -> ${item.answer}`).join("\n");

  return (
    <Workspace title="True/False Generator" description="Turn statements into a simple true or false revision set and save them locally.">
      <Field label="Statement">
        <TextInput value={statement} onChange={(event) => setStatement(event.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (!statement.trim()) {
              return;
            }

            setItems((current) => current.concat({ id: uid("tf"), prompt: statement.trim(), answer: Math.random() > 0.5 ? "True" : "False" }));
            setStatement("");
          }}
          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
        >
          Add statement
        </button>
        <ActionBar copied={copied} onCopy={() => void handleCopy(summary)} onReset={() => setItems([])} />
      </div>
      <div className="grid gap-3">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-[1.5rem] border border-[color:var(--border)] bg-white p-4">
            <p className="text-base font-bold tracking-tight text-[color:var(--foreground)]">{item.prompt}</p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--primary-dark)]">{item.answer}</p>
          </div>
        )) : (
          <div className="rounded-[1.5rem] border border-dashed border-[color:var(--border)] bg-white p-5 text-sm leading-7 text-[color:var(--muted)]">
            Add a statement to create a practice card.
          </div>
        )}
      </div>
    </Workspace>
  );
}

export function EducationToolRenderer({ tool }: { tool: EducationTool }) {
  return renderTool(tool);
}
