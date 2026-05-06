export type EducationToolGroupSlug =
  | "calculators"
  | "writing"
  | "utility"
  | "study-productivity"
  | "quiz-interactive";

export type EducationFaqItem = {
  question: string;
  answer: string;
};

export type EducationTool = {
  name: string;
  slug: string;
  group: EducationToolGroupSlug;
  shortDescription: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  implementation: "full" | "scaffold";
  popular?: boolean;
};

export type EducationToolGroup = {
  slug: EducationToolGroupSlug;
  name: string;
  blurb: string;
};

export const educationToolGroups: EducationToolGroup[] = [
  {
    slug: "calculators",
    name: "Calculators",
    blurb: "Fast academic calculators for grades, percentages, attendance, and study planning.",
  },
  {
    slug: "writing",
    name: "Writing Tools",
    blurb: "SEO-friendly text utilities for editing, formatting, counting, and citation tasks.",
  },
  {
    slug: "utility",
    name: "Utility Tools",
    blurb: "Practical learning helpers for dates, numbers, units, time, and conversions.",
  },
  {
    slug: "study-productivity",
    name: "Study & Productivity",
    blurb: "Lightweight planners, timers, trackers, and study organization tools that work in the browser.",
  },
  {
    slug: "quiz-interactive",
    name: "Quiz & Interactive",
    blurb: "Interactive study tools for flashcards, quizzes, score tracking, and practice.",
  },
];

function createEducationTool(
  name: string,
  slug: string,
  group: EducationToolGroupSlug,
  shortDescription: string,
  keywords: string[],
  options?: {
    implementation?: "full" | "scaffold";
    popular?: boolean;
  },
): EducationTool {
  return {
    name,
    slug,
    group,
    shortDescription,
    seoTitle: `Free ${name} Online`,
    seoDescription: `${name} that works online for free with instant results, mobile-friendly controls, and no sign-up required.`,
    keywords: Array.from(new Set([...keywords, name.toLowerCase(), "free educational tools", "online study tools"])),
    implementation: options?.implementation ?? "scaffold",
    popular: options?.popular ?? false,
  };
}

export const educationTools: EducationTool[] = [
  createEducationTool("GPA Calculator", "gpa-calculator", "calculators", "Calculate GPA with courses, credits, and letter grades.", ["gpa calculator", "college gpa calculator", "semester gpa"], {
    implementation: "full",
    popular: true,
  }),
  createEducationTool("CGPA Calculator", "cgpa-calculator", "calculators", "Estimate cumulative GPA across multiple semesters or years.", ["cgpa calculator", "cumulative gpa calculator", "cgpa online"]),
  createEducationTool("Grade Calculator", "grade-calculator", "calculators", "Find your grade percentage from points earned and points possible.", ["grade calculator", "grade percentage calculator", "marks grade"]),
  createEducationTool("Final Grade Calculator", "final-grade-calculator", "calculators", "Work out the final exam score needed to hit a target grade.", ["final grade calculator", "what do i need on my final", "exam grade calculator"]),
  createEducationTool("Percentage Calculator", "percentage-calculator", "calculators", "Quickly calculate percentages, increases, decreases, and totals.", ["percentage calculator", "percent calculator", "percentage increase calculator"], {
    popular: true,
  }),
  createEducationTool("Average Calculator", "average-calculator", "calculators", "Calculate the arithmetic mean of scores, marks, or values.", ["average calculator", "mean calculator", "average marks calculator"]),
  createEducationTool("Weighted Grade Calculator", "weighted-grade-calculator", "calculators", "Combine assignments and tests using weighted percentages.", ["weighted grade calculator", "weighted average grade", "assignment grade calculator"]),
  createEducationTool("Marks Percentage Calculator", "marks-percentage-calculator", "calculators", "Convert marks obtained into a percentage result instantly.", ["marks percentage calculator", "exam percentage calculator", "marks to percentage"]),
  createEducationTool("Attendance Calculator", "attendance-calculator", "calculators", "Track attendance percentage and estimate classes needed to reach a goal.", ["attendance calculator", "attendance percentage calculator", "class attendance tracker"]),
  createEducationTool("Study Hours Calculator", "study-hours-calculator", "calculators", "Plan study hours based on subjects, days, and weekly goals.", ["study hours calculator", "study time calculator", "hours per subject calculator"]),
  createEducationTool("Word Counter", "word-counter", "writing", "Count words, characters, sentences, and paragraphs in real time.", ["word counter", "word count tool", "online word counter"], {
    implementation: "full",
    popular: true,
  }),
  createEducationTool("Character Counter", "character-counter", "writing", "Measure total characters with and without spaces.", ["character counter", "letter counter", "character count tool"]),
  createEducationTool("Paragraph Counter", "paragraph-counter", "writing", "Count paragraphs instantly from pasted or typed text.", ["paragraph counter", "paragraph count", "count paragraphs"]),
  createEducationTool("Text Case Converter", "text-case-converter", "writing", "Convert text to uppercase, lowercase, title case, or sentence case.", ["text case converter", "uppercase lowercase converter", "title case converter"]),
  createEducationTool("Reading Time Calculator", "reading-time-calculator", "writing", "Estimate reading time from word count and speed.", ["reading time calculator", "blog reading time calculator", "speech reading time"]),
  createEducationTool("Sentence Counter", "sentence-counter", "writing", "Count sentences in essays, articles, or homework text.", ["sentence counter", "count sentences", "essay sentence counter"]),
  createEducationTool("Text Sorter (A-Z)", "text-sorter-a-z", "writing", "Sort lines alphabetically for lists, vocab, and notes.", ["text sorter", "alphabetical order tool", "sort lines a-z"]),
  createEducationTool("Remove Duplicate Lines Tool", "remove-duplicate-lines-tool", "writing", "Clean repeated lines from text, lists, and data.", ["remove duplicate lines", "dedupe text lines", "unique lines tool"]),
  createEducationTool("Basic Citation Generator (APA/MLA)", "basic-citation-generator", "writing", "Generate simple APA or MLA-style citation text from manual inputs.", ["citation generator", "apa citation generator", "mla citation generator"]),
  createEducationTool("Paragraph Formatter", "paragraph-formatter", "writing", "Tidy spacing, normalize line breaks, and clean rough paragraphs.", ["paragraph formatter", "format paragraph online", "text cleanup tool"]),
  createEducationTool("Unit Converter", "unit-converter", "utility", "Convert length, weight, temperature, time, and volume values.", ["unit converter", "measurement converter", "length weight temperature converter"], {
    implementation: "full",
    popular: true,
  }),
  createEducationTool("Scientific Calculator", "scientific-calculator", "utility", "Solve common scientific and math operations in the browser.", ["scientific calculator", "online scientific calculator", "math calculator"]),
  createEducationTool("Age Calculator", "age-calculator", "utility", "Calculate age in years, months, and days from a birth date.", ["age calculator", "date of birth calculator", "calculate age online"], {
    popular: true,
  }),
  createEducationTool("Random Number Generator", "random-number-generator", "utility", "Generate random integers for practice, games, or assignments.", ["random number generator", "rng online", "pick random number"]),
  createEducationTool("Time Zone Converter", "time-zone-converter", "utility", "Convert a date and time between major global time zones.", ["time zone converter", "world clock converter", "timezone calculator"]),
  createEducationTool("Date Difference Calculator", "date-difference-calculator", "utility", "Find the difference between two dates in days, weeks, or months.", ["date difference calculator", "days between dates", "date duration calculator"]),
  createEducationTool("Countdown Timer", "countdown-timer", "utility", "Set a live countdown to a deadline, class, or event.", ["countdown timer", "online countdown", "countdown clock"]),
  createEducationTool("Stopwatch Tool", "stopwatch-tool", "utility", "Run a simple stopwatch with lap-ready timing for study sprints.", ["stopwatch tool", "online stopwatch", "study stopwatch"]),
  createEducationTool("Number Base Converter", "number-base-converter", "utility", "Convert numbers between binary, decimal, octal, and hexadecimal.", ["number base converter", "binary to decimal converter", "hex converter"]),
  createEducationTool("Ratio Calculator", "ratio-calculator", "utility", "Simplify ratios and scale them up or down quickly.", ["ratio calculator", "simplify ratio", "ratio solver"]),
  createEducationTool("Study Planner", "study-planner", "study-productivity", "Create a lightweight study plan and save tasks in your browser.", ["study planner", "study plan generator", "online study planner"]),
  createEducationTool("Timetable Generator", "timetable-generator", "study-productivity", "Build a class or revision timetable and store it locally.", ["timetable generator", "class timetable maker", "study timetable"]),
  createEducationTool("Pomodoro Timer", "pomodoro-timer", "study-productivity", "Use focus and break sessions with session tracking.", ["pomodoro timer", "study timer", "focus timer"], {
    implementation: "full",
    popular: true,
  }),
  createEducationTool("Exam Countdown Timer", "exam-countdown-timer", "study-productivity", "Track days and hours left until your next exam.", ["exam countdown timer", "exam timer", "countdown to exam"]),
  createEducationTool("Homework Tracker", "homework-tracker", "study-productivity", "Track assignments, due dates, and completion status locally.", ["homework tracker", "assignment tracker", "homework planner"]),
  createEducationTool("Study Goal Tracker", "study-goal-tracker", "study-productivity", "Set study targets and log progress over time.", ["study goal tracker", "study goals", "goal tracker for students"]),
  createEducationTool("Daily Study Checklist Generator", "daily-study-checklist-generator", "study-productivity", "Generate a daily checklist from subjects and tasks.", ["study checklist generator", "daily study checklist", "student checklist tool"]),
  createEducationTool("Revision Planner", "revision-planner", "study-productivity", "Organize revision topics by date, subject, and status.", ["revision planner", "exam revision planner", "revision schedule"]),
  createEducationTool("Time Blocking Tool", "time-blocking-tool", "study-productivity", "Map study blocks and routines into a simple day plan.", ["time blocking tool", "study schedule maker", "time blocking planner"]),
  createEducationTool("Focus Timer", "focus-timer", "study-productivity", "Run a custom focus countdown with completed-session tracking.", ["focus timer", "concentration timer", "study countdown"]),
  createEducationTool("Quiz Maker (Manual Input)", "quiz-maker", "quiz-interactive", "Write your own questions and answers in a simple quiz builder.", ["quiz maker", "manual quiz maker", "create quiz online"]),
  createEducationTool("Flashcard Creator", "flashcard-creator", "quiz-interactive", "Create and review flashcards saved in LocalStorage.", ["flashcard creator", "study flashcards", "online flashcard maker"]),
  createEducationTool("Random Question Picker", "random-question-picker", "quiz-interactive", "Pick a random question from your own list.", ["random question picker", "random question generator", "pick a question"]),
  createEducationTool("Multiple Choice Quiz Builder", "multiple-choice-quiz-builder", "quiz-interactive", "Build multiple choice practice questions and review answers.", ["multiple choice quiz builder", "mcq maker", "mcq generator"]),
  createEducationTool("True/False Generator", "true-false-generator", "quiz-interactive", "Turn statements into a quick true or false practice set.", ["true false generator", "true or false quiz maker", "boolean quiz tool"]),
  createEducationTool("Score Calculator", "score-calculator", "quiz-interactive", "Calculate quiz scores, percentages, and remaining marks.", ["score calculator", "test score calculator", "quiz score calculator"]),
  createEducationTool("Typing Speed Test", "typing-speed-test", "quiz-interactive", "Measure words per minute and accuracy with a timed typing test.", ["typing speed test", "wpm test", "typing test online"], {
    implementation: "full",
    popular: true,
  }),
  createEducationTool("Memory Game", "memory-game", "quiz-interactive", "Play a lightweight matching game for quick brain breaks.", ["memory game", "matching game online", "brain memory game"]),
  createEducationTool("Brain Quiz", "brain-quiz", "quiz-interactive", "Answer a small general knowledge quiz and see your score.", ["brain quiz", "general knowledge quiz", "quiz game online"]),
  createEducationTool("Daily Challenge Quiz", "daily-challenge-quiz", "quiz-interactive", "Try a new quick quiz challenge that changes by date.", ["daily challenge quiz", "daily quiz", "quiz of the day"]),
];

const educationToolsBySlug = new Map(educationTools.map((tool) => [tool.slug, tool]));

export function getEducationTool(slug: string) {
  return educationToolsBySlug.get(slug);
}

export function getEducationGroup(slug: EducationToolGroupSlug) {
  return educationToolGroups.find((group) => group.slug === slug);
}

export function getEducationToolsByGroup(group: EducationToolGroupSlug) {
  return educationTools.filter((tool) => tool.group === group);
}

export function getPopularEducationTools(limit = 8) {
  return educationTools.filter((tool) => tool.popular).slice(0, limit);
}

export function getRelatedEducationTools(slug: string, limit = 4) {
  const tool = getEducationTool(slug);
  if (!tool) {
    return [];
  }

  const sameGroup = educationTools.filter((item) => item.group === tool.group && item.slug !== slug);
  const popularFirst = sameGroup
    .filter((item) => item.popular)
    .concat(sameGroup.filter((item) => !item.popular));

  return popularFirst.slice(0, limit);
}

export function getEducationHomepageSpotlight(limit = 6) {
  const priorityOrder = [
    "gpa-calculator",
    "word-counter",
    "unit-converter",
    "pomodoro-timer",
    "typing-speed-test",
    "age-calculator",
  ];

  return priorityOrder
    .map((slug) => getEducationTool(slug))
    .filter((tool): tool is EducationTool => Boolean(tool))
    .slice(0, limit);
}

export function getEducationHowTo(tool: EducationTool) {
  return [
    `Open the ${tool.name} and enter your values or text into the fields above.`,
    "Review the live result panel as the tool updates instantly in your browser.",
    "Use the copy button to save the current result or summary for notes and assignments.",
    `Reset the tool at any time to start a fresh ${tool.name.toLowerCase()} session.`,
  ];
}

function groupAudience(group: EducationToolGroupSlug) {
  switch (group) {
    case "calculators":
      return "students, parents, and teachers who need a quick academic calculation without opening a spreadsheet";
    case "writing":
      return "students, writers, bloggers, and researchers who need fast text cleanup or counting";
    case "utility":
      return "learners who need quick conversions, date math, timing, and practical calculations";
    case "study-productivity":
      return "students building better routines, calmer revision plans, and more consistent study habits";
    case "quiz-interactive":
      return "self-learners and classrooms that want interactive practice without signing up for a platform";
  }
}

function groupBenefit(group: EducationToolGroupSlug) {
  switch (group) {
    case "calculators":
      return "The tool keeps the workflow simple, shows results right away, and helps you check numbers before you submit work or plan your next target grade.";
    case "writing":
      return "Because everything runs in the browser, you can paste text, clean it up, and copy the result instantly without downloading anything.";
    case "utility":
      return "That makes it useful for homework, revision, labs, travel planning, and everyday school tasks where speed matters.";
    case "study-productivity":
      return "It is built for quick daily use, which means you can return to it often without friction and keep momentum on busy weeks.";
    case "quiz-interactive":
      return "It works well for lightweight practice sessions, classroom warm-ups, and personal revision where simple tools often perform best.";
  }
}

export function getEducationArticle(tool: EducationTool) {
  const relatedNames = getRelatedEducationTools(tool.slug, 3).map((item) => item.name).join(", ");
  const audience = groupAudience(tool.group);
  const benefit = groupBenefit(tool.group);

  return [
    `${tool.name} is a free educational tool designed for ${audience}. Instead of forcing you into a signup wall or a slow dashboard, this page gives you a direct workspace that works on mobile, tablet, and desktop. You can enter your numbers or text, see live feedback, and copy the result in seconds. That makes the tool useful for quick homework checks, lesson planning, classroom support, revision sessions, or everyday study admin when you simply need a reliable answer without extra friction.`,
    `Many people search for tools like ${tool.name.toLowerCase()} because they want a fast, clear result with no extra setup. This page is built around that need. The interface stays lightweight, the controls are easy to understand, and the output updates immediately as you type. ${benefit} If you are comparing options, the goal here is not to overwhelm you with advanced settings. It is to help you finish the task quickly and move back to studying, teaching, writing, or planning.`,
    `Toolbox Hub keeps this ${tool.name.toLowerCase()} free to use and focused on browser-side processing whenever possible. That means your input stays on your device for normal use, and you can come back from any modern browser without learning a new system. The page also includes a clear how-to section, related tools, and common questions so the tool does more than just calculate a number. It gives you enough context to use the result with confidence, especially when you are working under time pressure.`,
    relatedNames
      ? `If your workflow expands beyond this task, you can continue with related education tools such as ${relatedNames}. Together, these tools make it easier to handle grades, writing, scheduling, quizzes, and study organization from one place. Whether you are preparing for exams, cleaning up coursework, tracking progress, or managing day-to-day student tasks, ${tool.name} gives you a quick starting point and a dependable result without asking for payment, software installs, or account creation.`
      : `${tool.name} fits neatly into a larger study workflow built around free browser tools. Whether you are preparing for exams, cleaning up coursework, tracking progress, or managing day-to-day student tasks, this page gives you a quick starting point and a dependable result without asking for payment, software installs, or account creation.`,
  ];
}

export function getEducationFaq(tool: EducationTool): EducationFaqItem[] {
  return [
    {
      question: `Is this ${tool.name.toLowerCase()} really free to use?`,
      answer: `Yes. The ${tool.name} is free to use in your browser without subscriptions, account creation, or API keys.`,
    },
    {
      question: `Does the ${tool.name.toLowerCase()} work on mobile?`,
      answer: `Yes. The page is mobile-friendly, so you can use the ${tool.name.toLowerCase()} on phones, tablets, and desktop browsers.`,
    },
    {
      question: `Can I copy the result from the ${tool.name.toLowerCase()}?`,
      answer: "Yes. Every education tool includes a copy action so you can move the current result into notes, messages, or assignments quickly.",
    },
    {
      question: `Does the ${tool.name.toLowerCase()} save my data?`,
      answer: tool.group === "study-productivity" || tool.slug === "flashcard-creator"
        ? "This tool can store your planner or practice data in LocalStorage on your device so you can come back later."
        : "Most calculations and text actions run instantly in the browser without needing a backend or account.",
    },
  ];
}
