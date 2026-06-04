import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { AdPlaceholder } from "@/components/ui/ad-placeholder";
import { CategorySidebar } from "@/components/ui/category-sidebar";
import { FaqList } from "@/components/ui/faq-list";
import { ToolCard } from "@/components/ui/tool-card";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqJsonLd,
  buildMetadata,
} from "@/lib/seo";
import {
  categories,
  getCategory,
  getPopularTools,
  getRecentTools,
  getToolsByCategory,
  getTrendingTools,
  shouldIndexTool,
} from "@/lib/tools";

const categoryPageTitles: Record<string, string> = {
  "image-tools": "Free Image Tools — Compress, Resize, Convert & Edit Images Online | Toolbox Hub",
  "pdf-tools": "Free PDF Tools — Merge, Split, Convert & Compress PDFs Online | Toolbox Hub",
  "text-tools": "Free Text Tools — Word Counter, Formatter, Sorter & More | Toolbox Hub",
  "developer-tools": "Free Developer Tools — JSON Formatter, Base64 Encoder & More | Toolbox Hub",
  "generator-tools": "Free Generator Tools — QR Code, Password, UUID & More | Toolbox Hub",
  "calculator-tools": "Free Calculator Tools — Loan, GPA, Percentage & More | Toolbox Hub",
  "converter-tools": "Free Converter Tools — Unit, Currency & File Converter Online | Toolbox Hub",
  "internet-tools": "Free Internet Tools — DNS Lookup, Speed Test & More | Toolbox Hub",
};

const categoryPageDescriptions: Record<string, string> = {
  "image-tools": "Free online image tools for compressing, resizing, cropping, converting, and editing images in your browser. No signup required. Compress JPG, resize PNG, remove backgrounds, make GIFs, and more.",
  "pdf-tools": "Free online PDF tools to merge, split, compress, convert, and edit PDF files instantly in your browser. No signup required. Merge PDFs, convert to Word, compress large files, and extract pages.",
  "text-tools": "Free online text tools for word counting, character counting, case conversion, sorting lines, and formatting text. No signup required. Work with written content faster in your browser.",
  "developer-tools": "Free online developer tools for formatting JSON, encoding Base64, hashing files, validating regex, and more. No signup required. Fast browser-based utilities for everyday development tasks.",
  "generator-tools": "Free online generator tools for QR codes, passwords, UUIDs, random usernames, placeholder text, and more. No signup required. Generate useful values instantly in your browser.",
  "calculator-tools": "Free online calculators for loans, GPA, percentages, BMI, age, dates, and everyday math. No signup required. Get instant results in your browser for personal finance, school, and planning.",
  "converter-tools": "Free online converter tools for units, currencies, temperatures, timestamps, and file formats. No signup required. Convert between common values quickly in your browser.",
  "internet-tools": "Free online internet tools for DNS lookups, website speed tests, mobile-friendly checks, and URL inspections. No signup required. Run quick web checks in your browser.",
};

const categoryActionH1s: Record<string, string> = {
  "image-tools": "Free Image Tools — Compress, Resize, Convert and Edit Images Online",
  "pdf-tools": "Free PDF Tools — Merge, Split, Convert and Compress PDFs Online",
  "text-tools": "Free Text Tools — Word Counter, Formatter, Sorter and More",
  "developer-tools": "Free Developer Tools — JSON Formatter, Base64 Encoder and More",
  "generator-tools": "Free Generator Tools — QR Code, Password, UUID and More",
  "calculator-tools": "Free Calculator Tools — Loan Calculator, GPA, Percentage and More",
  "converter-tools": "Free Converter Tools — Unit, Currency and File Converter Online",
  "internet-tools": "Free Internet Tools — DNS Lookup, Speed Test and More",
};

const categoryIntros: Record<string, string> = {
  "image-tools":
    "Toolbox Hub image tools cover every common image editing task from a single free directory. Compress JPGs and PNGs before uploading them to a website, resize photos to match a template or profile size, crop portraits to remove distracting edges, convert between JPG, PNG, and WebP for the format that fits your workflow, and use tools like the background remover, watermark tool, and GIF maker for more specialised jobs. Every image tool runs in your browser with no signup required, so you can complete a quick edit without installing software or creating an account. Browse the full list below and use the search box to narrow results to the specific task you need.",
  "pdf-tools":
    "Toolbox Hub PDF tools give you a fast and free way to handle the most common PDF editing tasks in the browser. Merge multiple PDF files into one document for cleaner sharing, split a long file into smaller sections, compress a PDF that is too large to email, convert between PDF and Word for editing, and extract or rebuild pages with the JPG conversion tools. Each tool runs in your browser without requiring an account or installation. Whether you need to prepare a file for a client, combine pages for a report, or reduce a scan for an upload limit, the tools below cover the standard PDF workflows people reach for most often.",
  "text-tools":
    "Toolbox Hub text tools are built for writers, students, developers, and anyone who works with written content and needs a fast browser-based result. Count words and characters, check reading time, convert text between cases, sort or deduplicate lines, remove extra whitespace, and perform other quick text edits without copying content into a heavy application. Every tool runs in your browser with no account required. Whether you are preparing blog copy, cleaning up a data export, checking an assignment word count, or formatting a list for a project, the text tools below cover the common tasks that come up most often in everyday writing and editing workflows.",
  "developer-tools":
    "Toolbox Hub developer tools are designed for quick browser-based tasks that developers, designers, and technical users hit regularly. Format and validate JSON with clear error messages, encode and decode Base64 strings, convert between color formats, check regular expressions, hash files, inspect MIME types, and work through a range of other lightweight utility tasks without leaving the browser or installing a separate app. Every tool runs client-side where possible and does not require a login. Use these tools for fast formatting during development, quick conversions during debugging, or lightweight checks when you need a clean result before moving on to the next task.",
  "generator-tools":
    "Toolbox Hub generator tools let you create passwords, QR codes, UUIDs, random usernames, placeholder text, random colors, and more — all in a free browser-based workflow with no signup required. Generators are useful when you need a specific value quickly without writing code or opening a heavier tool. Generate a strong password for a new account, create a QR code for a URL or contact card, build a unique identifier for a project, or grab random placeholder names and colors for a design mockup. Every generator page explains the output format clearly and lets you copy or download the result immediately. Browse the full list below or search the category to find the specific generator you need.",
  "calculator-tools":
    "Toolbox Hub calculator tools cover the common financial, health, educational, and date-based calculations that come up in everyday planning. Calculate loan payments and total interest for a mortgage or car purchase, check a GPA for a school term, find percentages for a tip or discount, estimate a BMI, plan around dates with an age calculator, and work through other standard number tasks without installing anything. Each calculator runs in your browser with no account required. Whether you need a quick answer for a purchase decision, a school assignment, or a personal finance check, the tools below give you clear results with explanations of what the numbers mean.",
  "converter-tools":
    "Toolbox Hub converter tools make it fast to switch between units, formats, and values in a free browser-based workflow. Convert length, weight, temperature, area, and speed between metric and imperial units, switch between currencies, change timestamps and time zones, and handle other common conversions without downloading a separate app. Every converter runs in your browser with no signup required so you can get a result immediately. Whether you are checking a recipe measurement, planning an international trip, working on a technical document, or switching between file formats, the tools below cover the most frequently needed conversions in one accessible directory.",
  "internet-tools":
    "Toolbox Hub internet tools help you check, test, and inspect web-related details directly from your browser. Look up DNS records for a domain, test a website's speed and performance, check whether a site is mobile-friendly, inspect URL redirect chains, verify SSL details, and run other lightweight web checks that come up in site management, development, and technical troubleshooting. Each tool is free to use and does not require an account. Whether you are diagnosing a domain issue, preparing a site for launch, checking a live URL, or testing basic web performance, the tools below cover the standard internet checks that developers and site owners need most often.",
};

const SearchBox = dynamic(() => import("@/components/ui/search-box").then((module) => module.SearchBox));
const CategoryDirectory = dynamic(() => import("@/components/ui/category-directory").then((module) => module.CategoryDirectory));

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) {
    return {};
  }
  const categoryTools = getToolsByCategory(category.slug).filter((tool) => shouldIndexTool(tool));

  const pageTitle = categoryPageTitles[category.slug] ?? `${category.title} — Free Online Tools | Toolbox Hub`;
  const pageDescription = categoryPageDescriptions[category.slug]
    ?? `${category.description} Browse clear how-to steps, FAQs, and related links for tools in this category.`;

  return buildMetadata({
    title: pageTitle,
    description: pageDescription,
    pathname: `/category/${category.slug}`,
    keywords: [
      category.name,
      category.title,
      "free online tools",
      "no signup required",
      "browser-based tools",
      ...categoryTools.slice(0, 5).map((tool) => tool.name),
    ],
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) {
    notFound();
  }

  const categoryTools = getToolsByCategory(category.slug).filter((tool) => shouldIndexTool(tool));
  const popularInCategory = getPopularTools(6, category.slug);
  const recentInCategory = getRecentTools(4, category.slug);
  const trendingInCategory = getTrendingTools(4, category.slug);
  const spotlightTools =
    category.slug === "image-tools"
      ? ["background-remover", "gif-maker", "image-color-palette-generator", "blur-image-tool"]
        .map((slug) => categoryTools.find((tool) => tool.slug === slug))
        .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool))
      : [];
  const relatedCategories = categories.filter((item) => item.slug !== category.slug).slice(0, 4);
  const featuredLinks = popularInCategory.slice(0, 4);
  const categoryFaqMap: Record<string, { question: string; answer: string }[]> = {
    "image-tools": [
      {
        question: "What image formats do the image tools support?",
        answer: "The image tools work with the most common formats used on the web and in everyday workflows: JPG, PNG, WebP, GIF, BMP, and TIFF. The format converter handles switching between any of these. WebP is the recommended output for web use because it produces smaller files than JPG or PNG at the same visual quality.",
      },
      {
        question: "Do the image tools upload my files to a server?",
        answer: "No. Every image tool on this page processes your file directly in your browser using your own device. Nothing is uploaded to a server, and nothing is stored after you close the tab. This means your photos and graphics stay private even when you use tools like Background Remover or EXIF Data Remover.",
      },
      {
        question: "What is the difference between compressing and resizing an image?",
        answer: "Compressing reduces the file size by removing data the eye is unlikely to notice, while keeping the dimensions the same. Resizing changes the pixel width and height of the image. For the smallest possible file, resize the image to its final display size first, then compress it. The Image Resizer and Image Compressor work well together in that order.",
      },
      {
        question: "How do I remove a background from an image online for free?",
        answer: "Open the Background Remover tool, upload your image, and the tool will detect and remove the background automatically. The result downloads as a PNG with a transparent background. This is useful for product photos, profile pictures, and design assets where you need the subject placed on a different colour or background.",
      },
      {
        question: "What is EXIF data and should I remove it before sharing photos?",
        answer: "EXIF data is metadata embedded in photo files by cameras and phones. It can include the GPS coordinates where the photo was taken, the device model, the date and time, and camera settings. Before posting photos publicly online, it is a good idea to strip this metadata using the EXIF Data Remover to protect your location and device information.",
      },
      {
        question: "How do I convert an image to WebP for my website?",
        answer: "Open the Image to WebP Converter, upload your JPG or PNG file, and download the WebP output. WebP files are typically 25–35% smaller than JPG and PNG at the same quality level, which speeds up page load times. Most modern browsers — Chrome, Firefox, Edge, and Safari — fully support WebP, so it is safe to use as the primary image format on any current website.",
      },
      {
        question: "Can I add a watermark to my photos without Photoshop?",
        answer: "Yes. The Image Watermark Tool lets you upload a photo, type your watermark text, choose the position, and download the result — no Photoshop or account needed. This is useful for photographers, content creators, and businesses that want to protect images before sharing them online.",
      },
      {
        question: "What is the best way to make a GIF from a video clip?",
        answer: "Use the Video to GIF Converter. Upload a short video clip, select the portion you want to turn into a GIF, and download the result. GIFs work well for short animations, product previews, and social media content. Keep the clip under 5–10 seconds for a manageable file size — longer GIFs become very large very quickly.",
      },
    ],
    "pdf-tools": [
      {
        question: "How do I merge multiple PDF files into one document?",
        answer: "Open the PDF Merge tool, upload the files you want to combine, arrange them in the order you need, and click merge. The result downloads as a single PDF. This is useful for combining invoices, combining chapters, or assembling a report from separately written sections. If the merged file is too large to email, run it through the PDF Compressor next.",
      },
      {
        question: "Can I split a PDF into individual pages or sections?",
        answer: "Yes. The PDF Split tool lets you extract specific pages or divide a PDF into separate files. You can pull out a single page, split at a specific page number, or extract a range. This is useful when you need to share only part of a document, extract a signed page from a contract, or separate chapters of a book.",
      },
      {
        question: "What is the best way to reduce a PDF file size?",
        answer: "The PDF Compressor reduces file size by optimising embedded images and removing redundant data. This is the fastest route for shrinking a PDF that is too large to attach to an email or upload to a portal. If the PDF contains large embedded photos, converting those images to WebP before creating the PDF will often produce a smaller result than compressing afterwards.",
      },
      {
        question: "How do I convert a PDF to a Word document I can edit?",
        answer: "Open the PDF to Word tool, upload your PDF, and download the .docx file. The tool preserves the text content so you can continue editing in Microsoft Word, Google Docs, or any compatible editor. Heavily formatted PDFs with tables, columns, or complex layouts may need minor cleanup after conversion — this is normal and not a limitation unique to any specific converter.",
      },
      {
        question: "Do the PDF tools send my documents to an external server?",
        answer: "Some PDF operations — particularly PDF to Word conversion and PDF password protection — require a backend process to complete. These use secure connections and do not retain your files after processing. Tools like PDF Page Rotator and JPG to PDF run in your browser without any server contact. Each tool page indicates clearly whether processing happens locally or requires a remote step.",
      },
      {
        question: "How do I add page numbers to a PDF?",
        answer: "Use the PDF Page Number Adder. Upload your PDF, choose where you want the numbers to appear (top left, bottom centre, etc.), and download the updated document. This is useful for reports, academic submissions, legal documents, and any file that needs clear pagination for navigation or reference.",
      },
      {
        question: "Can I protect a PDF with a password for free?",
        answer: "Yes. The Protect PDF tool adds a password to your file so that only someone with the correct password can open it. This is suitable for contracts, financial documents, and any PDF that should not be readable by anyone who happens to have the file. Password-protected PDFs open in any standard PDF viewer — the reader just sees a password prompt before the document loads.",
      },
      {
        question: "How do I convert a PDF to JPG images?",
        answer: "Open the PDF to JPG tool and upload your document. Each page of the PDF is converted to a separate JPG image. This is useful for sharing individual pages on social media, embedding PDF content into a website that does not support PDF embeds, or extracting pages for use in a presentation.",
      },
    ],
    "text-tools": [
      {
        question: "How do I count words in a document online?",
        answer: "Paste or type your text into the Word Counter tool and it shows the word count, character count, sentence count, paragraph count, and estimated reading time instantly. There is no character limit — you can paste an entire essay, article, or report. The reading time estimate uses an average adult reading speed of 200–238 words per minute.",
      },
      {
        question: "What does a case converter do?",
        answer: "A case converter changes the capitalisation of text. Common options include UPPER CASE (all capitals), lower case (all small letters), Title Case (first letter of each word capitalised), Sentence case (first letter of each sentence capitalised), and alternating case. This is useful for formatting headings, cleaning up data exports, and fixing text that was typed with Caps Lock on.",
      },
      {
        question: "How do I remove duplicate lines from a list?",
        answer: "Paste your list into the Remove Duplicate Lines tool and it strips every repeated line, keeping only the first occurrence of each. This is useful when combining lists from different sources, cleaning up URL lists, and deduplicating email or contact exports before importing them into a CRM.",
      },
      {
        question: "Can I sort a list alphabetically online?",
        answer: "Yes. The Text Sorter arranges lines in alphabetical or reverse alphabetical order. You can also sort numerically if the lines start with numbers. Paste any list — names, URLs, keywords, product titles — and download or copy the sorted result in seconds.",
      },
      {
        question: "What is a URL slug and how do I convert text to one?",
        answer: "A URL slug is the lowercase, hyphenated version of a title used in web addresses. For example, the title 'Best Free Image Tools Online' becomes 'best-free-image-tools-online'. The Text to Slug Converter handles this automatically: it lowercases the text, replaces spaces with hyphens, and removes characters that are not valid in URLs. This is useful for content management systems, blog platforms, and any workflow where you create URLs from text.",
      },
      {
        question: "How do I reverse the words or letters in a sentence?",
        answer: "Use the Text Reverser tool. You can reverse either the full string character by character (so 'Hello World' becomes 'dlroW olleH') or reverse the order of the words (so 'Hello World' becomes 'World Hello'). This is used in coding exercises, data formatting, puzzle creation, and occasional creative writing workflows.",
      },
      {
        question: "What is the difference between a word counter and a character counter?",
        answer: "A word counter counts the number of separate words separated by spaces. A character counter counts every individual character including spaces, punctuation, and letters. Character counts are important for social media posts (Twitter's 280-character limit), SMS messages (160 characters per segment), and meta descriptions (typically kept under 160 characters for SEO). The Word Counter tool on Toolbox Hub shows both figures simultaneously.",
      },
    ],
    "developer-tools": [
      {
        question: "What does a JSON formatter do and when should I use one?",
        answer: "A JSON formatter takes raw or minified JSON text and adds consistent indentation and line breaks to make it readable. Minified JSON puts everything on one line to reduce file size — useful in production, but impossible to read when debugging. Paste a minified API response or config file into the JSON Formatter and it instantly becomes scannable. The formatter also validates the input and flags any syntax errors that would prevent it from parsing.",
      },
      {
        question: "What is Base64 encoding used for?",
        answer: "Base64 encoding converts binary data (images, files, arbitrary bytes) into a string of printable ASCII characters. It is used when binary data needs to travel through systems that only handle text — email attachments, data URLs in CSS, JSON payloads that embed image content, and HTTP Basic Authentication headers all rely on Base64. The Base64 Encoder and Base64 Decoder on Toolbox Hub handle both directions instantly in your browser.",
      },
      {
        question: "How do I test a regular expression online?",
        answer: "Open the Regex Tester, paste your pattern into the pattern field, and paste the text you want to test in the test field. The tool highlights every match in real time and shows capture group results. This is useful for verifying email validation patterns, extracting data from log files, and building search-and-replace rules for code editors.",
      },
      {
        question: "What is a JWT and how do I decode one without a library?",
        answer: "A JSON Web Token (JWT) is a compact, URL-safe string used to transmit authentication and authorization data between systems. It has three Base64-encoded parts separated by dots: a header, a payload, and a signature. The JWT Decoder on Toolbox Hub separates these three parts and shows the decoded header and payload in readable JSON — useful for debugging auth flows, inspecting token expiry, and checking claim values during development. Note: decoding reveals the data but does not verify the signature without the secret key.",
      },
      {
        question: "What is the difference between URL encoding and HTML encoding?",
        answer: "URL encoding (also called percent-encoding) replaces characters that are not valid in a URL with a percent sign followed by a two-digit hex code. A space becomes %20, an ampersand becomes %26. HTML encoding replaces characters that have special meaning in HTML markup with entity references. An ampersand becomes &amp;, a less-than sign becomes &lt;. Use URL encoding for query strings and links; use HTML encoding when inserting text into HTML to prevent injection issues.",
      },
      {
        question: "How do I generate an MD5 or SHA256 hash online?",
        answer: "Open the MD5 Generator or SHA256 Generator tool, type or paste the input text, and copy the resulting hash. Hashing is one-way — you cannot recover the original text from the hash. MD5 is fast and still used for checksums and non-security file verification. SHA256 is stronger and is used for password storage, digital signatures, and data integrity checks. For security-sensitive applications, always use SHA256 or stronger — MD5 is considered cryptographically broken.",
      },
      {
        question: "How do I convert JSON to CSV or CSV to JSON?",
        answer: "Use the JSON to CSV Converter to flatten a JSON array into a spreadsheet-ready CSV file, or the CSV to JSON Converter to turn a CSV export into structured JSON. These are useful when moving data between APIs (which typically use JSON) and spreadsheet tools like Excel or Google Sheets (which use CSV). The converters handle the mapping automatically as long as the input is well-formed.",
      },
      {
        question: "What is HTML minification and does it affect how a page looks?",
        answer: "HTML minification removes whitespace, comments, and redundant characters from HTML source code to reduce file size. It does not change how the page renders — browsers ignore extra whitespace when rendering HTML. A minified HTML file loads slightly faster because fewer bytes travel over the network. The HTML Minifier tool on Toolbox Hub handles this in one step without any configuration needed.",
      },
    ],
    "generator-tools": [
      {
        question: "How do I generate a strong password online?",
        answer: "Open the Password Generator, choose the length (12 characters minimum is a reasonable baseline for most accounts; 16 or more for anything sensitive), and select which character types to include: uppercase letters, lowercase letters, numbers, and symbols. The generator creates a cryptographically random password in your browser — it is not sent to any server. Copy the result and store it in a password manager rather than writing it down or reusing it across accounts.",
      },
      {
        question: "What is a UUID and when do I need to generate one?",
        answer: "A UUID (Universally Unique Identifier) is a 128-bit value formatted as a 32-character hex string divided into five groups by hyphens, like 550e8400-e29b-41d4-a716-446655440000. UUIDs are used as unique IDs in databases, distributed systems, file names, API keys, and anywhere you need an identifier that is statistically guaranteed not to collide with others. The UUID Generator creates Version 4 UUIDs, which are random and the most widely used type.",
      },
      {
        question: "How do I create a QR code from a URL for free?",
        answer: "Open the QR Code Generator, paste the URL (or any text you want to encode), and download the QR code image. QR codes work for URLs, contact information (vCard), Wi-Fi credentials, plain text, and more. The generated image is a standard format that any smartphone camera app can scan. Use a sufficiently high resolution if the code will be printed — a minimum of 300×300 pixels for print materials.",
      },
      {
        question: "What is Lorem Ipsum and why do designers use it?",
        answer: "Lorem Ipsum is placeholder text derived from a work by Cicero, used in design and publishing since the 1500s. It has roughly normal letter distribution and word lengths, which makes a layout look more realistic than blocks of repeated text like 'text text text'. Designers use it when the actual content is not available yet, so the layout can be evaluated without the reader being distracted by the meaning of the words. The Lorem Ipsum Generator on Toolbox Hub lets you specify how many paragraphs, words, or sentences you need.",
      },
      {
        question: "How do I generate a random username?",
        answer: "The Username Generator combines adjectives, nouns, or words from themed word lists to create readable usernames that are not based on your real name. You can typically regenerate until you find one that fits the tone you want — casual, professional, or themed. Generated usernames are useful for test accounts, gaming handles, anonymous forum profiles, and placeholder data for development.",
      },
      {
        question: "Can I generate random colors for a design project?",
        answer: "Yes. The Random Color Generator produces hex codes, RGB values, and HSL values for random colours. This is useful for picking accent colours for a quick mockup, generating test data for a data visualisation, or exploring colour options when you do not have a specific palette in mind. Regenerate as many times as needed — the tool creates a new colour each time.",
      },
      {
        question: "What is a passphrase generator and is it more secure than a password?",
        answer: "A passphrase is a sequence of random words strung together, like 'maple-thunder-orbit-fence'. Passphrases are often more secure than short complex passwords because length matters more than character variety for brute-force resistance — a 5-word passphrase has far more possible combinations than an 8-character random string. They are also easier to remember and type. The Random Password Phrase Generator on Toolbox Hub creates these multi-word combinations.",
      },
    ],
    "calculator-tools": [
      {
        question: "How does the loan calculator work?",
        answer: "Enter the loan amount, the annual interest rate, and the loan term in months or years. The calculator uses the standard amortisation formula to compute the fixed monthly payment and the total amount paid over the life of the loan, including total interest. This is useful for comparing mortgage options, car finance quotes, and personal loan offers before you sign anything.",
      },
      {
        question: "Is a BMI calculator accurate for everyone?",
        answer: "BMI (Body Mass Index) is a simple ratio of weight to height squared and gives a rough population-level screening number. It does not account for muscle mass, bone density, age, sex, or body composition. A heavily muscled person may have a high BMI without excess body fat. A person with low muscle mass may have a normal BMI despite unhealthy fat levels. Use the BMI Calculator as a starting data point, not a clinical diagnosis — a doctor or dietitian can give a more complete assessment.",
      },
      {
        question: "How do I calculate the percentage of a number online?",
        answer: "Open the Percentage Calculator and enter the values you need. The tool handles three common percentage questions: what is X% of Y, X is what percentage of Y, and percentage increase or decrease between two numbers. For example, to find 15% of 340, enter 15 in the first field and 340 in the second — the answer is 51.",
      },
      {
        question: "What is compound interest and how is it calculated?",
        answer: "Compound interest is interest calculated on both the original principal and the accumulated interest from previous periods. It grows faster than simple interest because each period you earn interest on a larger base. The formula is A = P(1 + r/n)^(nt), where P is the principal, r is the annual interest rate as a decimal, n is the number of times interest compounds per year, and t is the time in years. The Compound Interest Calculator handles this automatically — enter the principal, rate, compounding frequency, and term to see the final balance and total interest earned.",
      },
      {
        question: "How do I find the number of days between two dates?",
        answer: "Open the Date Difference Calculator, enter the start and end dates, and it shows the number of days, weeks, months, and years between them. This is useful for calculating deadlines, figuring out how long a subscription or warranty runs, computing age in days, and planning project timelines.",
      },
      {
        question: "How do I calculate a tip percentage?",
        answer: "Enter the bill amount and the tip percentage into the Tip Calculator. The tool shows the tip amount, the total per bill, and optionally splits the total between multiple people. Common tip percentages are 10% for basic service, 15–18% for standard restaurant service, and 20% or more for excellent service. The calculator saves the mental arithmetic in the moment.",
      },
      {
        question: "What is the difference between a discount calculator and a profit margin calculator?",
        answer: "A discount calculator starts from the original price and a discount percentage and tells you the sale price and the amount saved. A profit margin calculator starts from the cost and the selling price and tells you the gross profit and the profit margin as a percentage. Use the Discount Calculator as a buyer to evaluate deals; use the Profit Margin Calculator as a seller to set prices that cover costs and hit a target margin.",
      },
      {
        question: "How do I calculate VAT on a price?",
        answer: "The VAT Calculator lets you add or remove VAT from a figure. Enter the amount and the VAT rate (for example, 20% in the UK or 7.5% in Nigeria) and choose whether the amount already includes VAT or not. If VAT is not included, the tool adds it and shows the VAT-inclusive price. If VAT is already included, the tool extracts the VAT portion and shows the pre-VAT price.",
      },
    ],
    "converter-tools": [
      {
        question: "Can I convert between metric and imperial units for free?",
        answer: "Yes. The converter tools cover length (metres, feet, inches, kilometres, miles), weight (kilograms, pounds, ounces, stones), temperature (Celsius, Fahrenheit, Kelvin), area, speed, and more. All unit conversions run in your browser instantly with no signup required. Choose the category you need, enter the value, and copy the result.",
      },
      {
        question: "How do I convert Celsius to Fahrenheit online?",
        answer: "Open the Temperature Converter, enter the value in Celsius, and the Fahrenheit equivalent appears immediately. The formula is F = (C × 9/5) + 32. Common reference points: 0°C = 32°F (water freezes), 100°C = 212°F (water boils), 37°C = 98.6°F (typical body temperature), 20°C = 68°F (comfortable room temperature).",
      },
      {
        question: "What is binary-to-decimal conversion used for?",
        answer: "Binary is the base-2 number system used by computers, where all values are represented as sequences of 0s and 1s. Decimal is the base-10 system humans use for everyday arithmetic. Conversion between the two comes up in computer science education, low-level programming, working with bitfields and bitmasks, understanding memory addresses, and network configuration tasks like subnet masks. The Binary to Decimal Converter handles the conversion instantly, and the Decimal to Binary Converter does the reverse.",
      },
      {
        question: "How do I convert a hex color code to RGB?",
        answer: "Open the Hex to RGB Converter and enter the hex code (with or without the # prefix). The tool outputs the R, G, B values as separate numbers between 0 and 255. For example, #1a73e8 converts to R: 26, G: 115, B: 232. This is useful when working between design tools that display hex values and code that needs RGB function notation for CSS, Canvas, or SVG.",
      },
      {
        question: "How do I convert between time zones online?",
        answer: "The Time Converter lets you enter a time in one zone and see the equivalent in another. This is useful for scheduling international calls and meetings, understanding when a global deadline falls in your local time, and converting timestamps in log files. Select the source and target time zones from the dropdown menus, enter the time, and the converted result appears immediately.",
      },
      {
        question: "Can I convert currency amounts between countries?",
        answer: "Yes. The Currency Converter fetches live exchange rates and converts between a wide range of currencies including USD, EUR, GBP, NGN, JPY, CAD, AUD, and others. Enter the amount, choose the source and target currencies, and the converted value updates immediately. Exchange rates fluctuate constantly, so for large transactions always verify with your bank or exchange service before committing.",
      },
      {
        question: "What is the difference between text encoding and file format conversion?",
        answer: "Text encoding conversion changes how characters are represented internally — for example, converting between ASCII, UTF-8, and other encoding schemes, or encoding text as Base64. File format conversion changes the container format of a file — for example, converting a PNG image to a JPG, or a CSV to a JSON file. Toolbox Hub covers both: the developer tools handle encoding and decoding of text and data, while the image and PDF tools handle file format conversions.",
      },
    ],
    "internet-tools": [
      {
        question: "What is a DNS lookup and when would I need to do one?",
        answer: "DNS (Domain Name System) translates human-readable domain names like toolboxhubapp.com into the IP addresses that computers use to connect. A DNS lookup retrieves the records associated with a domain — A records (IPv4 addresses), AAAA records (IPv6), MX records (mail servers), CNAME records (aliases), TXT records (verification strings), and more. DNS lookups are useful when troubleshooting email delivery issues, verifying that DNS changes have propagated, confirming domain ownership records, and diagnosing connectivity problems.",
      },
      {
        question: "How do I test my website speed online?",
        answer: "Open the Website Speed Test tool, enter your URL, and run the test. The tool measures how long the page takes to load and reports key performance metrics. Slow load times hurt both user experience and search engine rankings — Google uses page speed as a ranking signal for both desktop and mobile searches. Common causes of slow pages include uncompressed images, unminified CSS and JavaScript, slow server response times, and too many external resource requests.",
      },
      {
        question: "What does a mobile-friendly checker test?",
        answer: "The Mobile Friendly Checker tests whether a web page is usable on a smartphone screen. It checks whether the page uses a responsive layout that adapts to small screens, whether tap targets (buttons, links) are large enough to use with a finger, whether text is readable without zooming, and whether the page avoids horizontal scrolling. Google's mobile-first indexing means a page's mobile version is the one used for ranking, so passing this check is important for SEO.",
      },
      {
        question: "How do I check where a URL redirects?",
        answer: "The URL Redirect Checker follows a URL through every HTTP redirect in the chain and shows each step with its HTTP status code. A 301 redirect is a permanent redirect, a 302 is temporary, and a 307 is a temporary redirect that preserves the request method. Checking redirect chains is useful for diagnosing broken links, verifying that old URLs are pointing to the correct new destinations, and auditing site migrations where hundreds of redirects were set up.",
      },
      {
        question: "What is a User Agent string and how do I parse one?",
        answer: "A User Agent string is a line of text that your browser sends to every website you visit, identifying the browser name, version, operating system, and rendering engine. Websites use this to serve appropriate content, track browser usage, and block certain automated clients. The User Agent Parser on Toolbox Hub breaks the string into its components and displays them in plain English — useful for debugging browser-specific issues, checking what a custom client reports, and understanding web analytics data.",
      },
      {
        question: "What is an HTTP status code?",
        answer: "HTTP status codes are three-digit numbers that a server returns with every response to tell the browser (or API client) what happened. 200 means success. 301 and 302 are redirects. 400 means a bad request, 401 means unauthorised, 403 means forbidden, 404 means the page was not found. 500 is a server error, 502 is a bad gateway, and 503 means the service is temporarily unavailable. Knowing what each code means is essential for debugging websites, APIs, and crawl issues flagged in tools like Google Search Console.",
      },
      {
        question: "What is a MIME type and how do I look one up?",
        answer: "A MIME type (Multipurpose Internet Mail Extensions type) is a label that tells a browser or server what kind of data a file contains. For example, image/jpeg tells the browser a file is a JPG image, application/json tells an API client the response is JSON, and text/html tells the browser the content is an HTML page. MIME types are set in HTTP response headers and are important for file uploads, API responses, and any system that needs to handle different file types correctly. The MIME Type Lookup tool shows the correct MIME type for any file extension.",
      },
    ],
  };
  const categoryFaq = categoryFaqMap[category.slug] ?? [
    {
      question: `What kind of tools are in ${category.name}?`,
      answer: `${category.name} includes tools for common tasks in this category, all collected in one place. Each tool runs in your browser and does not require an account.`,
    },
    {
      question: `Do I need to create an account to use ${category.name.toLowerCase()}?`,
      answer: "No. Every tool on Toolbox Hub is free to use and does not require signup, login, or any personal information.",
    },
    {
      question: `How do I find related tools outside ${category.name}?`,
      answer: "Use the category links in the sidebar and the cross-links at the bottom of this page. You can also search the full directory from the homepage.",
    },
  ];
  const crossLinks = getPopularTools(6).filter((tool) => tool.category !== category.slug).slice(0, 6);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: category.name, pathname: `/category/${category.slug}` },
  ]);
  const categoryCollectionJsonLd = buildCollectionPageJsonLd({
    name: category.title,
    description: category.description,
    pathname: `/category/${category.slug}`,
    items: categoryTools.map((tool) => ({
      name: tool.name,
      pathname: `/tools/${tool.slug}`,
    })),
  });
  const categoryFaqJsonLd = buildFaqJsonLd(categoryFaq);

  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryCollectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryFaqJsonLd) }}
      />
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <CategorySidebar
          activeCategory={category.slug}
          title="Browse Categories"
          description="Move between sections without losing your place in the directory."
        />
        <div className="min-w-0 space-y-8">
      <section className="site-hero mobile-category-hero app-panel min-w-0 rounded-[2rem] p-7 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--primary-dark)]">
                Category hub
              </span>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--primary-dark)]">
              {category.name}
            </p>
            <h1 className="mobile-category-title mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              {categoryActionH1s[category.slug] ?? category.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              {categoryIntros[category.slug] ?? category.hero}
            </p>
            <div className="mobile-category-actions mt-6 flex flex-wrap gap-3">
              <Link
                href="#tools-list"
                className="mobile-category-action-link rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--primary-dark)]"
              >
                View all tools
              </Link>
              <Link
                href="#category-search"
                className="mobile-category-action-link rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)] dark:bg-slate-800 dark:border-slate-700/60"
              >
                Search this category
              </Link>
              {featuredLinks.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="mobile-category-action-link rounded-full border border-[color:var(--border)] bg-white/92 px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)] dark:bg-slate-800 dark:border-slate-700/60"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
            {spotlightTools.length ? (
              <div className="mt-6 rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--primary-dark)]">
                  Spotlight
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-tight">Featured image tools</h2>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                  Jump straight into the image tools people usually want first.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {spotlightTools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="rounded-[1.25rem] border border-[color:var(--border)] bg-white/90 px-4 py-4 transition hover:border-[color:var(--primary)] dark:bg-slate-800/80 dark:border-slate-700/60"
                    >
                      <p className="text-sm font-bold tracking-tight text-[color:var(--foreground)]">{tool.name}</p>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{tool.shortDescription}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="min-w-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl bg-[color:var(--soft)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
                Browse tools
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                Open the featured picks below or use the directory search to narrow this category quickly.
              </p>
            </div>
            <div className="rounded-3xl bg-[color:var(--surface-alt)] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
                Helpful next steps
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                Each category page includes related links, search, and lighter browsing paths for mobile and desktop.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="category-search" className="mt-8 scroll-mt-28">
        <SearchBox
          tools={categoryTools}
          title={`Search inside ${category.name}`}
          description={`Search only within ${category.name.toLowerCase()} tools and jump to the right page faster.`}
          maxResults={6}
          compact
          suggestedTools={[...popularInCategory, ...recentInCategory].filter(
            (tool, index, collection) => collection.findIndex((candidate) => candidate.slug === tool.slug) === index,
          )}
        />
      </section>

      <section id="tools-list" className="site-card mobile-tools-list-section app-panel scroll-mt-28 rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
              Tools list
            </p>
            <h2 className="site-section-title mt-2 text-2xl font-bold tracking-tight">
              All {category.name.toLowerCase()} tools
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
              Start here if you want the full list right away. Open any tool directly or filter the list to narrow it down.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <CategoryDirectory
            tools={categoryTools}
            title="Browse the full category"
            description="Search inside this category and reveal more tools only when you need them."
          />
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
                Featured tools
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Start with the strongest options
              </h2>
            </div>
            <Link href="/" className="text-sm font-semibold text-[color:var(--primary)]">
              Back to homepage
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {popularInCategory.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
        <div className="min-w-0 space-y-6">
          <AdPlaceholder
            slot={`category-${category.slug}-sidebar`}
            label="Advertisement"
            format="sidebar"
          />
          <section className="site-card app-panel rounded-[2rem] p-6">
            <h2 className="site-section-title text-lg font-bold tracking-tight">Category overview</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              {category.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedCategories.map((item) => (
                <Link
                  key={item.slug}
                  href={`/category/${item.slug}`}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-alt)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--foreground)]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
          <section className="site-card app-panel rounded-[2rem] p-6">
            <h2 className="site-section-title text-lg font-bold tracking-tight">Explore more</h2>
            <div className="mt-4 space-y-3">
              {crossLinks.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="block text-sm text-[color:var(--muted)] transition hover:text-[color:var(--primary)]"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </section>
          <section className="site-card app-panel rounded-[2rem] p-6">
            <h2 className="site-section-title text-lg font-bold tracking-tight">Trending in {category.name}</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              A few useful picks in this category.
            </p>
            <div className="mt-4 space-y-3">
              {trendingInCategory.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="block text-sm text-[color:var(--muted)] transition hover:text-[color:var(--primary)]"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </section>
          <section className="site-card app-panel rounded-[2rem] p-6">
            <h2 className="site-section-title text-lg font-bold tracking-tight">Recent additions</h2>
            <div className="mt-4 space-y-3">
              {recentInCategory.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="block text-sm text-[color:var(--muted)] transition hover:text-[color:var(--primary)]"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="mt-10">
        <AdPlaceholder
          slot={`category-${category.slug}-content-banner`}
          label="Advertisement"
          format="leaderboard"
        />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="site-card app-panel rounded-[2rem] p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary-dark)]">
            Category FAQ
          </p>
          <h2 className="site-section-title mt-2 text-3xl font-black tracking-tight">Questions about {category.name}</h2>
          <div className="mt-6">
            <FaqList items={categoryFaq} />
          </div>
        </div>
        <div className="site-card app-panel rounded-[2rem] p-6">
          <h2 className="site-section-title text-lg font-bold tracking-tight">Explore nearby categories</h2>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            Move between related sections to find another tool without starting your search over.
          </p>
          <div className="mt-4 space-y-3">
            {relatedCategories.map((item) => (
              <Link
                key={item.slug}
                href={`/category/${item.slug}`}
                className="block text-sm font-semibold text-[color:var(--foreground)] transition hover:text-[color:var(--primary)]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
}
