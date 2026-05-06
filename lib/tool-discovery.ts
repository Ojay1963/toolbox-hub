import {
  educationTools,
  getEducationGroup,
  getPopularEducationTools,
  type EducationTool,
} from "@/lib/education-tools";
import {
  categories,
  getCategory,
  getIndexableTools,
  getPopularTools,
  getToolsByCategory,
  shouldIndexTool,
  type ToolDefinition,
} from "@/lib/tools";

export type DiscoveryCategory = {
  slug: string;
  name: string;
  description: string;
  hero: string;
  href: string;
  count: number;
};

export type DiscoveryToolEntry = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  keywords: string[];
  href: string;
  categoryKey: string;
  categoryLabel: string;
  badgeLabel: string;
};

export const educationDiscoveryCategory: DiscoveryCategory = {
  slug: "education-tools",
  name: "Educational Tools",
  description: "Browse study, writing, quiz, calculator, and productivity tools for students and teachers.",
  hero: "Explore free educational tools for grades, study planning, revision, and classroom support.",
  href: "/tools/education#education-directory",
  count: educationTools.length,
};

export const discoveryCategories: DiscoveryCategory[] = [
  educationDiscoveryCategory,
  ...categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    description: category.description,
    hero: category.hero,
    href: `/category/${category.slug}#tools-list`,
    count: getToolsByCategory(category.slug).filter((tool) => shouldIndexTool(tool)).length,
  })),
];

function toPrimaryEntry(tool: ToolDefinition): DiscoveryToolEntry {
  const category = getCategory(tool.category);

  return {
    id: `tool:${tool.slug}`,
    slug: tool.slug,
    name: tool.name,
    shortDescription: tool.shortDescription,
    longDescription: tool.longDescription,
    keywords: tool.keywords,
    href: `/tools/${tool.slug}`,
    categoryKey: tool.category,
    categoryLabel: category?.name ?? tool.category.replace(/-/g, " "),
    badgeLabel: category?.name ?? tool.category.replace(/-/g, " "),
  };
}

function toEducationEntry(tool: EducationTool): DiscoveryToolEntry {
  const group = getEducationGroup(tool.group);

  return {
    id: `education:${tool.slug}`,
    slug: tool.slug,
    name: tool.name,
    shortDescription: tool.shortDescription,
    longDescription: tool.seoDescription,
    keywords: [
      ...tool.keywords,
      "educational tools",
      "student tools",
      group?.name ?? "education",
    ],
    href: `/tools/education/${tool.slug}`,
    categoryKey: educationDiscoveryCategory.slug,
    categoryLabel: educationDiscoveryCategory.name,
    badgeLabel: group ? `${educationDiscoveryCategory.name} • ${group.name}` : educationDiscoveryCategory.name,
  };
}

export function getDiscoveryEntries() {
  return [
    ...getIndexableTools().map(toPrimaryEntry),
    ...educationTools.map(toEducationEntry),
  ];
}

export function getDiscoveryToolCount() {
  return getIndexableTools().length + educationTools.length;
}

export function getDiscoverySuggestedEntries(limit = 8) {
  const combined = [
    ...getPopularTools(Math.max(limit, 8)).map(toPrimaryEntry),
    ...getPopularEducationTools(Math.max(4, Math.ceil(limit / 3))).map(toEducationEntry),
  ];

  return combined
    .filter((entry, index, collection) => collection.findIndex((candidate) => candidate.id === entry.id) === index)
    .slice(0, limit);
}
