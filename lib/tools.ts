import { normalizePublicCopy, normalizePublicList } from "@/lib/public-copy";
import { extraToolDrafts } from "@/lib/tools-extra";

export type ToolCategorySlug =
  | "image-tools"
  | "pdf-tools"
  | "text-tools"
  | "developer-tools"
  | "generator-tools"
  | "calculator-tools"
  | "converter-tools"
  | "internet-tools";

export type ImplementationStatus =
  | "working-local"
  | "planned-local"
  | "reduced-scope-local"
  | "coming-soon";

export type FaqItem = {
  question: string;
  answer: string;
};

export type ToolDefinition = {
  name: string;
  slug: string;
  category: ToolCategorySlug;
  shortDescription: string;
  longDescription: string;
  keywords: string[];
  howToUse: string[];
  faq: FaqItem[];
  relatedToolSlugs: string[];
  implementationStatus: ImplementationStatus;
  seoTitle: string;
  seoDescription: string;
  statusNote?: string;
};

type ImplementationStatusMeta = {
  label: string;
  shortLabel: string;
  summary: string;
};

export type CategoryDefinition = {
  slug: ToolCategorySlug;
  name: string;
  title: string;
  description: string;
  hero: string;
};

type ToolDraft = Omit<ToolDefinition, "relatedToolSlugs">;

type ToolInput = Omit<ToolDefinition, "relatedToolSlugs" | "faq"> & {
  faq1: string;
  faq2: string;
  faqAnswer1: string;
  faqAnswer2: string;
};

type ServiceBackedToolConfig = {
  requiredEnvVars: string[];
  unavailableMessage: string;
  shouldAlwaysNoindex?: boolean;
};

export const categories: CategoryDefinition[] = [
  { slug: "image-tools", name: "Image Tools", title: "Free Online Image Tools", description: "Compress, resize, crop, convert, rotate, and edit images in one place.", hero: "Explore image tools for quick edits, conversions, and downloads." },
  { slug: "pdf-tools", name: "PDF Tools", title: "Free Online PDF Tools", description: "Merge, split, convert, protect, and organize PDF files online.", hero: "Use PDF tools for everyday file edits, conversions, and quick fixes." },
  { slug: "text-tools", name: "Text Tools", title: "Free Online Text Tools", description: "Count, format, sort, and clean text with simple online tools.", hero: "Explore text tools for writing, cleanup, and quick edits." },
  { slug: "developer-tools", name: "Developer Tools", title: "Free Online Developer Tools", description: "Format, encode, decode, validate, and inspect common developer data.", hero: "Use developer tools for quick formatting, testing, and debugging tasks." },
  { slug: "generator-tools", name: "Generator Tools", title: "Free Online Generator Tools", description: "Generate passwords, QR codes, UUIDs, names, and random values.", hero: "Explore generators for quick ideas, codes, IDs, and random picks." },
  { slug: "calculator-tools", name: "Calculator Tools", title: "Free Online Calculator Tools", description: "Calculate payments, dates, percentages, health metrics, and more.", hero: "Use calculators for everyday finance, planning, and quick math." },
  { slug: "converter-tools", name: "Converter Tools", title: "Free Online Converter Tools", description: "Convert units, currencies, temperatures, timestamps, and more.", hero: "Use converters for fast unit, date, and file format changes." },
  { slug: "internet-tools", name: "Internet Tools", title: "Free Online Internet Tools", description: "Check websites, DNS records, links, and other web details.", hero: "Explore internet tools for website checks, lookups, and quick tests." },
];

function makeTool(input: ToolInput): ToolDraft {
  const shouldNormalize = input.implementationStatus !== "coming-soon" && input.implementationStatus !== "planned-local";
  return {
    name: input.name,
    slug: input.slug,
    category: input.category,
    shortDescription: shouldNormalize ? normalizePublicCopy(input.shortDescription) : input.shortDescription,
    longDescription: shouldNormalize ? normalizePublicCopy(input.longDescription) : input.longDescription,
    keywords: input.keywords,
    howToUse: shouldNormalize ? normalizePublicList(input.howToUse) : input.howToUse,
    implementationStatus: input.implementationStatus,
    seoTitle: input.seoTitle,
    seoDescription: shouldNormalize ? normalizePublicCopy(input.seoDescription) : input.seoDescription,
    statusNote: shouldNormalize && input.statusNote ? normalizePublicCopy(input.statusNote) : input.statusNote,
    faq: [
      { question: input.faq1, answer: shouldNormalize ? normalizePublicCopy(input.faqAnswer1) : input.faqAnswer1 },
      { question: input.faq2, answer: shouldNormalize ? normalizePublicCopy(input.faqAnswer2) : input.faqAnswer2 },
    ],
  };
}

const toolDraftsPart1: ToolDraft[] = [
  makeTool({ name: "Image Compressor", slug: "image-compressor", category: "image-tools", shortDescription: "Reduce image file size with a browser-side compression workflow.", longDescription: "The Image Compressor page is structured for a local compression experience where users can upload an image, choose a quality target, preview the result, and download a smaller file. This tool is well suited to browser-side canvas-based processing and fits the current architecture cleanly.", keywords: ["image compressor", "compress image", "reduce image size"], howToUse: ["Upload an image file.", "Choose a target quality or compression level.", "Preview and download the compressed result."], implementationStatus: "working-local", seoTitle: "Image Compressor Online", seoDescription: "Compress images online with a browser-first workflow designed for fast file-size reduction and simple downloads.", faq1: "Will this tool upload my image?", faqAnswer1: "The intended implementation is local browser-side processing so files do not need to leave the device.", faq2: "Can compressed images lose quality?", faqAnswer2: "Yes. Compression can reduce visual quality depending on the settings used." }),
  makeTool({ name: "Image Resizer", slug: "image-resizer", category: "image-tools", shortDescription: "Resize images by width and height with a simple local workflow.", longDescription: "Image Resizer lets users change image dimensions, preserve aspect ratio, and export the result in a straightforward browser-side workflow. It is a clean fit for the shared architecture and keeps the experience fast and simple.", keywords: ["image resizer", "resize image online", "change image size"], howToUse: ["Upload an image.", "Enter the new dimensions.", "Download the resized image."], implementationStatus: "working-local", seoTitle: "Image Resizer Online", seoDescription: "Resize images online with a clean browser-first interface for changing width and height.", faq1: "Can I keep the aspect ratio?", faqAnswer1: "Yes. The tool offers an aspect-ratio lock for cleaner resizing.", faq2: "Does resizing improve image quality?", faqAnswer2: "No. Resizing changes dimensions, but it does not recreate lost detail." }),
  makeTool({ name: "Crop Image", slug: "crop-image", category: "image-tools", shortDescription: "Crop an image to remove unwanted edges or focus on one area.", longDescription: "Crop Image is a local image-editing utility that lets users define a crop box and export only the selected region. It works naturally with a browser canvas workflow and the site’s reusable tool template.", keywords: ["crop image", "image cropper", "trim image"], howToUse: ["Upload an image.", "Select or enter the crop area.", "Export the cropped image."], implementationStatus: "working-local", seoTitle: "Crop Image Online", seoDescription: "Crop images online with a browser-based workflow for trimming photos and graphics.", faq1: "Will the original file be changed?", faqAnswer1: "No. The tool creates a new cropped output file for download.", faq2: "Can cropping reduce file size?", faqAnswer2: "It often can, because the exported image contains fewer pixels than the original." }),
  makeTool({ name: "JPG to PNG Converter", slug: "jpg-to-png-converter", category: "image-tools", shortDescription: "Convert JPG images into PNG format locally in the browser.", longDescription: "JPG to PNG Converter reads a JPG file, redraws it in the browser, and exports a PNG copy without server processing. It is a lightweight format-conversion workflow that fits the shared architecture well.", keywords: ["jpg to png", "jpeg to png", "image converter"], howToUse: ["Upload a JPG image.", "Convert the file in the browser.", "Download the PNG result."], implementationStatus: "working-local", seoTitle: "JPG to PNG Converter Online", seoDescription: "Convert JPG to PNG online with a browser-first workflow and no unnecessary server dependency.", faq1: "Does PNG always make files smaller?", faqAnswer1: "No. PNG may be larger than JPG depending on the image content.", faq2: "Will transparency be created automatically?", faqAnswer2: "No. Converting JPG to PNG changes the file format, but it does not reconstruct missing transparency." }),
  makeTool({ name: "PNG to JPG Converter", slug: "png-to-jpg-converter", category: "image-tools", shortDescription: "Convert PNG files into JPG format with local browser-side export.", longDescription: "The PNG to JPG Converter is a strong fit for local implementation because the browser can redraw uploaded images and export them as JPG. The registry and page template are ready for that client-side conversion component.", keywords: ["png to jpg", "png to jpeg", "convert png to jpg"], howToUse: ["Upload a PNG image.", "Set JPG export options if needed.", "Download the converted JPG file."], implementationStatus: "working-local", seoTitle: "PNG to JPG Converter Online", seoDescription: "Convert PNG to JPG online with a simple browser-side export workflow.", faq1: "What happens to transparent pixels?", faqAnswer1: "JPG does not support transparency, so transparent areas need to be flattened against a background color.", faq2: "Can JPG reduce file size?", faqAnswer2: "Often yes, especially for photographic images." }),
  makeTool({ name: "Image to WebP Converter", slug: "image-to-webp-converter", category: "image-tools", shortDescription: "Convert images to WebP for modern web-friendly compression.", longDescription: "This page is wired for a local image-to-WebP converter that would use browser-supported canvas export where available. It fits the registry model well and helps support web-optimization use cases without adding server infrastructure.", keywords: ["image to webp", "webp converter", "convert image to webp"], howToUse: ["Upload an image.", "Choose a WebP quality setting.", "Download the WebP file."], implementationStatus: "working-local", seoTitle: "Image to WebP Converter Online", seoDescription: "Convert images to WebP online with a browser-first workflow for modern web optimization.", faq1: "Why use WebP?", faqAnswer1: "WebP can provide smaller file sizes than older formats in many cases.", faq2: "Does browser support matter?", faqAnswer2: "Yes. The local implementation depends on browser support for WebP export." }),
  makeTool({ name: "Background Remover", slug: "background-remover", category: "image-tools", shortDescription: "Remove image backgrounds through a server-assisted workflow when the deployment has background removal enabled.", longDescription: "Background Remover now supports a backend-assisted workflow for turning uploaded images into transparent PNGs. Because the actual cutout depends on a configured segmentation service, the page stays honest about deployment requirements and avoids pretending that lightweight browser-only processing can produce the same result.", keywords: ["background remover", "remove image background", "cut out subject"], howToUse: ["Upload an image file.", "Run background removal through the server route.", "Preview and download the transparent PNG result."], implementationStatus: "reduced-scope-local", seoTitle: "Background Remover Online", seoDescription: "Remove image backgrounds online with a server-assisted workflow that returns a transparent PNG and handles service availability clearly.", statusNote: "Server-assisted workflow. This tool works when a background-removal service is enabled for the current deployment.", faq1: "Does this run fully in the browser?", faqAnswer1: "No. The current implementation uses a backend route so the heavier background-removal step can be handled outside the browser.", faq2: "Will every image cut out perfectly?", faqAnswer2: "Not always. Final quality still depends on the configured removal service and the complexity of the source image." }),
  makeTool({ name: "Image Rotator", slug: "image-rotator", category: "image-tools", shortDescription: "Rotate images by common angles in a local browser workflow.", longDescription: "Image Rotator is a browser-side utility for turning images by 90, 180, or 270 degrees and exporting the result. It fits neatly into the shared tool-page architecture and does not require external APIs.", keywords: ["image rotator", "rotate image", "turn photo"], howToUse: ["Upload an image.", "Choose a rotation angle.", "Download the rotated file."], implementationStatus: "working-local", seoTitle: "Image Rotator Online", seoDescription: "Rotate images online with a simple browser-first tool for quick angle adjustments.", faq1: "Can I rotate without uploading my image?", faqAnswer1: "Yes. The tool is designed for local browser processing.", faq2: "Will dimensions change after rotation?", faqAnswer2: "They may, depending on the angle and export format." }),
  makeTool({ name: "Image Watermark Tool", slug: "image-watermark-tool", category: "image-tools", shortDescription: "Add text or simple image watermarks before exporting a new copy.", longDescription: "Image Watermark Tool places text or logo overlays on uploaded images in a browser-first workflow. It keeps editing local while making it easy to position a watermark and export a fresh copy.", keywords: ["image watermark", "watermark tool", "add watermark to image"], howToUse: ["Upload an image.", "Add watermark text or a simple overlay.", "Position it and export the result."], implementationStatus: "working-local", seoTitle: "Image Watermark Tool Online", seoDescription: "Add text or logo-style watermarks to images online with a browser-first workflow.", faq1: "Will the original be overwritten?", faqAnswer1: "No. The tool generates a new downloadable image.", faq2: "Can I use a logo watermark?", faqAnswer2: "Yes. You can use simple logo-style overlays as part of the watermark workflow." }),
  makeTool({ name: "Image to Base64 Converter", slug: "image-to-base64-converter", category: "image-tools", shortDescription: "Convert an uploaded image file into a Base64 data string.", longDescription: "This tool page is designed for a local implementation that reads an uploaded image file and outputs a Base64 string or data URL. It is a clean browser-side use case and aligns well with the registry-driven architecture.", keywords: ["image to base64", "base64 image converter", "data url converter"], howToUse: ["Upload an image file.", "Generate the Base64 output.", "Copy the encoded string or data URL."], implementationStatus: "working-local", seoTitle: "Image to Base64 Converter Online", seoDescription: "Convert image files to Base64 online with a browser-side workflow and copy-ready output.", faq1: "Is Base64 smaller than the original file?", faqAnswer1: "No. Base64 usually increases size compared with the binary file.", faq2: "Why would I use this?", faqAnswer2: "It can be useful for embeds, quick testing, and inline data URLs." }),
  makeTool({ name: "PDF Merge", slug: "pdf-merge", category: "pdf-tools", shortDescription: "Combine multiple PDFs into a single merged document.", longDescription: "PDF Merge combines multiple PDF files into a single browser-processed document while keeping metadata, FAQs, and related links consistent across the site. It is a practical local workflow for common merge tasks.", keywords: ["pdf merge", "merge pdf files", "combine pdf"], howToUse: ["Upload two or more PDF files.", "Arrange the order if needed.", "Merge and download the combined PDF."], implementationStatus: "working-local", seoTitle: "PDF Merge Online", seoDescription: "Merge PDF files online with a browser-first workflow and a clean production-ready page structure.", faq1: "Can this run without a server?", faqAnswer1: "Yes. A local browser-side merge is practical for many normal-sized PDF files.", faq2: "Do very large files have limits?", faqAnswer2: "Yes. Browser memory limits can affect larger PDF workflows." }),
  makeTool({ name: "PDF Split", slug: "pdf-split", category: "pdf-tools", shortDescription: "Split one PDF into multiple files or separate pages.", longDescription: "PDF Split lets users break a PDF into single pages or selected page groups in a browser-first workflow. It fits well into the shared architecture while keeping the route structure, metadata, and related links stable.", keywords: ["pdf split", "split pdf pages", "separate pdf"], howToUse: ["Upload a PDF file.", "Choose the split method.", "Download the resulting PDF files."], implementationStatus: "working-local", seoTitle: "PDF Split Online", seoDescription: "Split PDF files online with a lightweight browser-first workflow.", faq1: "Can I split by page range?", faqAnswer1: "Yes. The tool supports splitting by selected pages or ranges.", faq2: "Does splitting require an account?", faqAnswer2: "No. The site is intentionally built without auth." }),
  makeTool({ name: "PDF to Word", slug: "pdf-to-word", category: "pdf-tools", shortDescription: "Convert selectable PDF text into a real DOCX download through a server route.", longDescription: "PDF to Word now uses a server-side conversion workflow that extracts selectable text from uploaded PDFs and packages that content into a DOCX file for download. It is more capable than the old plain-text export, but it still stays honest about scanned PDFs and complex page layouts that need OCR or richer document reconstruction.", keywords: ["pdf to word", "extract pdf text", "pdf to docx"], howToUse: ["Upload a PDF with selectable text.", "Convert the file through the server route.", "Review the extracted text preview and download the DOCX file."], implementationStatus: "reduced-scope-local", seoTitle: "PDF to Word Online", seoDescription: "Convert selectable PDF text into a DOCX download online with a server-assisted workflow and honest layout limits.", statusNote: "Server-assisted conversion. This route creates a DOCX file from extracted PDF text, but scanned PDFs still need OCR and complex formatting may simplify.", faq1: "Does this create a real DOCX file now?", faqAnswer1: "Yes. The current server route generates a DOCX download from extracted PDF text.", faq2: "Will scanned PDFs work well?", faqAnswer2: "Not by themselves. Scanned or image-only PDFs still need OCR before usable Word content can be created." }),
  makeTool({ name: "Word to PDF", slug: "word-to-pdf", category: "pdf-tools", shortDescription: "Convert DOCX files into readable PDF output through a server-assisted workflow.", longDescription: "Word to PDF now uses a server-side conversion route that extracts readable DOCX text and formats it into a clean PDF for download. The implementation is honest about complex layouts and advanced Word formatting, which may simplify during export, but it now produces a real PDF instead of a placeholder-only page.", keywords: ["word to pdf", "docx to pdf", "convert word to pdf"], howToUse: ["Upload a .docx file.", "Run the server-assisted conversion.", "Download the generated PDF file."], implementationStatus: "reduced-scope-local", seoTitle: "Word to PDF Converter Online", seoDescription: "Convert DOCX files to PDF online with a server-assisted workflow that produces a real PDF and explains formatting limits clearly.", statusNote: "Server-assisted conversion. The current workflow focuses on readable DOCX text and may simplify advanced layouts during PDF generation.", faq1: "Does this create a real PDF now?", faqAnswer1: "Yes. The current implementation generates a downloadable PDF on the server.", faq2: "Will every Word layout match perfectly?", faqAnswer2: "Not always. Advanced layouts, tables, and design-heavy documents may simplify in this first server-assisted version." }),
  makeTool({ name: "PDF Compressor", slug: "pdf-compressor", category: "pdf-tools", shortDescription: "Reduce PDF size with a clearly scoped server-assisted optimization approach.", longDescription: "PDF Compressor now uses a backend route to rebuild uploaded PDFs into a cleaner optimized copy. It can reduce size for some files, but it stays honest about the fact that true compression quality still depends heavily on the source document structure.", keywords: ["pdf compressor", "compress pdf", "reduce pdf size"], howToUse: ["Upload a PDF file.", "Run the available optimization mode.", "Download the optimized result and compare file size."], implementationStatus: "reduced-scope-local", seoTitle: "PDF Compressor Online", seoDescription: "Compress PDF files online with a reduced-scope server-assisted workflow and honest size-reduction expectations.", statusNote: "Reduced-scope optimization. Results still depend heavily on the source PDF structure.", faq1: "Will every PDF compress well?", faqAnswer1: "No. Compression results vary a lot depending on how the original PDF was created.", faq2: "Why is this marked reduced-scope?", faqAnswer2: "Because the current workflow can help some files, but it cannot guarantee strong compression for all PDF types." }),
  makeTool({ name: "PDF to JPG", slug: "pdf-to-jpg", category: "pdf-tools", shortDescription: "Convert PDF pages into JPG images with a local page-rendering workflow.", longDescription: "PDF to JPG converts PDF pages into image exports in a browser-first workflow when page rendering is available. It reuses the site's shared tool-page structure while keeping the process lightweight and easy to follow.", keywords: ["pdf to jpg", "convert pdf to image", "pdf to jpeg"], howToUse: ["Upload a PDF file.", "Choose which pages to export.", "Download one JPG per page or the selected pages."], implementationStatus: "working-local", seoTitle: "PDF to JPG Converter Online", seoDescription: "Convert PDF pages to JPG online with a browser-side page export workflow.", faq1: "Will each page become a separate image?", faqAnswer1: "Yes. Each selected page can be exported as a separate JPG image.", faq2: "Can image quality vary?", faqAnswer2: "Yes. Export settings and page complexity affect image output quality." }),
  makeTool({ name: "JPG to PDF", slug: "jpg-to-pdf", category: "pdf-tools", shortDescription: "Turn one or more JPG files into a PDF document.", longDescription: "JPG to PDF places uploaded images into PDF pages inside the browser and exports a downloadable document. It is a practical local workflow for combining images into a single PDF without extra server processing.", keywords: ["jpg to pdf", "image to pdf", "convert jpg to pdf"], howToUse: ["Upload one or more JPG files.", "Arrange page order if needed.", "Create and download the PDF."], implementationStatus: "working-local", seoTitle: "JPG to PDF Converter Online", seoDescription: "Convert JPG images to PDF online with a browser-first document builder workflow.", faq1: "Can I combine multiple images into one PDF?", faqAnswer1: "Yes. You can combine multiple images into a single PDF file.", faq2: "Will image dimensions affect page layout?", faqAnswer2: "Yes. The final PDF layout depends on image sizing and page-fit rules." }),
  makeTool({ name: "PDF Page Rotator", slug: "pdf-page-rotator", category: "pdf-tools", shortDescription: "Rotate selected PDF pages or the full document.", longDescription: "PDF Page Rotator rotates all pages or selected pages while keeping the route structure, metadata, and supporting content consistent across the site. It is a focused browser-first workflow for fixing page orientation.", keywords: ["pdf page rotator", "rotate pdf pages", "turn pdf pages"], howToUse: ["Upload a PDF.", "Select the pages and angle.", "Export the rotated PDF."], implementationStatus: "working-local", seoTitle: "PDF Page Rotator Online", seoDescription: "Rotate PDF pages online with a browser-first workflow for fixing page orientation.", faq1: "Can I rotate only one page?", faqAnswer1: "Yes. You can rotate only the pages you choose.", faq2: "Will text remain searchable?", faqAnswer2: "In a proper PDF-page rotation workflow, yes." }),
  makeTool({ name: "PDF Page Number Adder", slug: "pdf-page-number-adder", category: "pdf-tools", shortDescription: "Add page numbers to a PDF with a browser-side workflow.", longDescription: "PDF Page Number Adder lets users choose number placement and export an updated file in a local PDF page-numbering workflow. It keeps the experience straightforward while preserving related content and SEO coverage.", keywords: ["add page numbers to pdf", "pdf page number adder", "pdf numbering"], howToUse: ["Upload a PDF.", "Choose where the page numbers should appear.", "Apply and download the updated PDF."], implementationStatus: "working-local", seoTitle: "PDF Page Number Adder Online", seoDescription: "Add page numbers to PDF files online with a browser-side workflow.", faq1: "Can numbering start from a custom page?", faqAnswer1: "Yes. You can start numbering from a custom page when needed.", faq2: "Will the original file stay unchanged?", faqAnswer2: "Yes. The tool exports a new numbered copy." }),
  makeTool({ name: "Protect PDF", slug: "protect-pdf", category: "pdf-tools", shortDescription: "Protect PDFs through a server-assisted encryption workflow when the deployment has PDF protection enabled.", longDescription: "Protect PDF is now wired to a backend route that can send the uploaded file and chosen password to a configured PDF protection service. The page remains transparent about deployment requirements, so it reports service availability clearly instead of pretending to encrypt files when no service is available.", keywords: ["protect pdf", "password protect pdf", "encrypt pdf"], howToUse: ["Upload a PDF file.", "Enter a password and run the server-assisted protection step.", "Download the protected PDF when the backend service is available."], implementationStatus: "reduced-scope-local", seoTitle: "Protect PDF Online", seoDescription: "Protect PDF files online with a server-assisted workflow that uses a configured backend encryption service and shows clear availability messages.", statusNote: "Server-assisted workflow. This tool works when a PDF protection service endpoint is enabled for the current deployment.", faq1: "Does this protect PDFs directly in the browser?", faqAnswer1: "No. The encryption step is handled through a backend route so the browser does not fake or weaken the protection flow.", faq2: "Will it work without server configuration?", faqAnswer2: "No. The page is wired for real protection, but it still needs a configured backend service before downloads are available." }),
  makeTool({ name: "Word Counter", slug: "word-counter", category: "text-tools", shortDescription: "Count words in pasted or typed text.", longDescription: "Word Counter is a simple browser-side text utility that fits this project especially well. The page is ready for a local implementation that updates counts in real time as the user types or pastes text.", keywords: ["word counter", "count words online", "text word count"], howToUse: ["Paste or type text.", "Review the live word count.", "Adjust your content as needed."], implementationStatus: "working-local", seoTitle: "Word Counter Online", seoDescription: "Count words online with a simple browser-based text tool.", faq1: "Does the count update live?", faqAnswer1: "That is the intended local behavior for this tool.", faq2: "Can I use it for SEO writing?", faqAnswer2: "Yes. Word counting is useful for outlines, article drafts, and content reviews." }),
  makeTool({ name: "Character Counter", slug: "character-counter", category: "text-tools", shortDescription: "Count characters with and without spaces.", longDescription: "Character Counter is well suited to a lightweight local implementation. This page is structured for a future text area that calculates total characters, characters without spaces, and other simple metrics without external services.", keywords: ["character counter", "count characters", "letter counter"], howToUse: ["Enter or paste text.", "See the total character count.", "Use the result for writing or formatting limits."], implementationStatus: "working-local", seoTitle: "Character Counter Online", seoDescription: "Count characters online with a fast browser-first text utility.", faq1: "Can spaces be excluded?", faqAnswer1: "Yes. The intended implementation should show both totals.", faq2: "Is this helpful for social post limits?", faqAnswer2: "Yes. Character counts are often useful for captions and message limits." }),
  makeTool({ name: "Case Converter", slug: "case-converter", category: "text-tools", shortDescription: "Switch text between upper, lower, title, and sentence case.", longDescription: "Case Converter is a classic browser-side text tool and an easy fit for the site’s shared architecture. The page is ready for a local UI that transforms pasted text instantly and lets the user copy the result.", keywords: ["case converter", "uppercase lowercase", "title case converter"], howToUse: ["Paste your text.", "Choose a case style.", "Copy the converted output."], implementationStatus: "working-local", seoTitle: "Case Converter Online", seoDescription: "Convert text case online with a browser-based uppercase, lowercase, title case, and sentence case tool.", faq1: "Will this run locally?", faqAnswer1: "Yes. Case conversion is an ideal local text utility.", faq2: "Can title case be perfect for every language?", faqAnswer2: "No. Title-casing rules vary, so the implementation should keep expectations realistic." }),
  makeTool({ name: "Remove Duplicate Lines", slug: "remove-duplicate-lines", category: "text-tools", shortDescription: "Clean a text list by removing repeated lines.", longDescription: "This tool page is prepared for a future browser-side utility that removes duplicate lines from pasted text while preserving the first occurrence. It is a clean, practical fit for the registry-driven structure.", keywords: ["remove duplicate lines", "dedupe lines", "unique line tool"], howToUse: ["Paste text with one item per line.", "Run the duplicate-removal action.", "Copy the cleaned list."], implementationStatus: "working-local", seoTitle: "Remove Duplicate Lines Online", seoDescription: "Remove duplicate lines online with a lightweight browser-first text cleanup tool.", faq1: "Will line order be preserved?", faqAnswer1: "That is the expected behavior for the intended local implementation.", faq2: "Does this work for large lists?", faqAnswer2: "Yes, within normal browser memory limits." }),
  makeTool({ name: "Text Sorter", slug: "text-sorter", category: "text-tools", shortDescription: "Sort lines of text alphabetically in ascending or descending order.", longDescription: "Text Sorter is another strong browser-side fit. This page is ready for a local text utility that sorts line-based lists and supports simple ordering options without involving any backend.", keywords: ["text sorter", "sort text lines", "alphabetize text"], howToUse: ["Paste line-based text.", "Choose ascending or descending order.", "Copy the sorted output."], implementationStatus: "working-local", seoTitle: "Text Sorter Online", seoDescription: "Sort lines of text online with a browser-based alphabetical sorting tool.", faq1: "Is sorting case-sensitive?", faqAnswer1: "The intended local implementation can use a case-insensitive sort for more useful default behavior.", faq2: "Can I sort numeric values?", faqAnswer2: "Yes, though plain-text sorting and numeric sorting can behave differently." }),
];
const toolDraftsPart2: Array<Omit<ToolDefinition, "relatedToolSlugs">> = [
  makeTool({ name: "JSON Formatter", slug: "json-formatter", category: "developer-tools", shortDescription: "Format and validate JSON in the browser.", longDescription: "JSON Formatter is an excellent browser-side tool that can be added later with minimal complexity. The page is already wired for SEO and related-content structure, so only the UI logic needs to be plugged in next.", keywords: ["json formatter", "json validator", "pretty print json"], howToUse: ["Paste JSON into the editor.", "Format or validate it.", "Copy the cleaned output or fix any errors."], implementationStatus: "working-local", seoTitle: "JSON Formatter Online", seoDescription: "Format and validate JSON online with a clean browser-first developer tool.", faq1: "Can invalid JSON be corrected automatically?", faqAnswer1: "A formatter can validate input, but it should not pretend to guess broken syntax.", faq2: "Does this need a server?", faqAnswer2: "No. JSON formatting works well fully in the browser." }),
  makeTool({ name: "Base64 Encoder", slug: "base64-encoder", category: "developer-tools", shortDescription: "Encode plain text into Base64 format.", longDescription: "The Base64 Encoder page is set up for a lightweight local text utility that encodes plain text into Base64. It is a simple browser-native use case and fits the project well.", keywords: ["base64 encoder", "encode base64", "text to base64"], howToUse: ["Paste or type plain text.", "Run the encoding action.", "Copy the Base64 output."], implementationStatus: "working-local", seoTitle: "Base64 Encoder Online", seoDescription: "Encode text to Base64 online with a simple browser-based developer tool.", faq1: "Is Base64 encryption?", faqAnswer1: "No. Base64 is encoding, not encryption.", faq2: "Can encoded output be decoded later?", faqAnswer2: "Yes. Base64 is reversible when the input is valid." }),
  makeTool({ name: "Base64 Decoder", slug: "base64-decoder", category: "developer-tools", shortDescription: "Decode Base64 strings back into readable text.", longDescription: "This page is prepared for a browser-side Base64 Decoder that takes encoded input and outputs plain text. It keeps the scope focused and honest while remaining easy to implement later.", keywords: ["base64 decoder", "decode base64", "base64 to text"], howToUse: ["Paste a Base64 string.", "Run the decoding action.", "Review and copy the decoded text."], implementationStatus: "working-local", seoTitle: "Base64 Decoder Online", seoDescription: "Decode Base64 text online with a browser-first developer utility.", faq1: "What if the Base64 value is invalid?", faqAnswer1: "The tool should show an error rather than faking output.", faq2: "Can this decode binary files?", faqAnswer2: "The planned scope focuses on text-based decoding first." }),
  makeTool({ name: "CSS Minifier", slug: "css-minifier", category: "developer-tools", shortDescription: "Minify CSS by removing extra whitespace and comments.", longDescription: "CSS Minifier is a realistic browser-side tool as long as the implementation is clear about using a reduced-scope minification approach instead of pretending to be a full production bundler. The page is ready for that honest local version.", keywords: ["css minifier", "minify css", "compress css"], howToUse: ["Paste CSS code.", "Run the minify action.", "Copy the compact output."], implementationStatus: "working-local", seoTitle: "CSS Minifier Online", seoDescription: "Minify CSS online with a browser-side tool and clearly labeled lightweight scope.", statusNote: "Reduced-scope local version only; useful for cleanup, not a replacement for full build-pipeline optimization.", faq1: "Will this be as advanced as a build-tool minifier?", faqAnswer1: "No. A browser-side version can be useful, but it should be labeled as a lightweight minifier.", faq2: "Can comments be removed?", faqAnswer2: "Yes. That is a typical part of CSS minification." }),
  makeTool({ name: "HTML Minifier", slug: "html-minifier", category: "developer-tools", shortDescription: "Minify HTML with a clearly scoped browser-side cleanup workflow.", longDescription: "HTML Minifier can be useful locally for trimming whitespace and basic markup cleanup, but a browser-side version should be labeled honestly as a lightweight minifier. This registry item reflects that scope clearly.", keywords: ["html minifier", "minify html", "compress html"], howToUse: ["Paste HTML markup.", "Run the minify action.", "Copy the cleaned output."], implementationStatus: "working-local", seoTitle: "HTML Minifier Online", seoDescription: "Minify HTML online with a browser-side tool and transparent lightweight scope.", statusNote: "Reduced-scope local version only; intended for simple markup cleanup rather than full production parsing.", faq1: "Will this preserve every edge case?", faqAnswer1: "A simple local minifier may not cover every advanced markup edge case.", faq2: "Why is this reduced-scope?", faqAnswer2: "Because browser-only cleanup is useful, but it is not identical to a full production HTML optimizer." }),
  makeTool({ name: "URL Encoder", slug: "url-encoder", category: "developer-tools", shortDescription: "Encode URL components safely for links and query strings.", longDescription: "URL Encoder is a clean browser-side utility that fits naturally into this project. The page is ready for a future client component that encodes text with standard URL-safe rules.", keywords: ["url encoder", "percent encode url", "encode url component"], howToUse: ["Paste text or a URL component.", "Run the encode action.", "Copy the encoded output."], implementationStatus: "working-local", seoTitle: "URL Encoder Online", seoDescription: "Encode URL components online with a lightweight browser-first developer tool.", faq1: "Should I encode a full URL or just parameters?", faqAnswer1: "Most often, encoding individual components is the safer approach.", faq2: "Does this require an API?", faqAnswer2: "No. URL encoding works fully in the browser." }),
  makeTool({ name: "URL Decoder", slug: "url-decoder", category: "developer-tools", shortDescription: "Decode percent-encoded URL text into readable form.", longDescription: "This page is prepared for a future browser-side URL Decoder. It will fit neatly into the shared developer-tools architecture and help users inspect query parameters and encoded strings quickly.", keywords: ["url decoder", "decode url", "percent decode"], howToUse: ["Paste encoded text.", "Run the decode action.", "Review and copy the readable result."], implementationStatus: "working-local", seoTitle: "URL Decoder Online", seoDescription: "Decode URL-encoded text online with a browser-first developer utility.", faq1: "What if the input is malformed?", faqAnswer1: "The tool should show a clear error instead of pretending the data decoded correctly.", faq2: "Can this decode full URLs?", faqAnswer2: "Yes, as long as the encoded parts are valid." }),
  makeTool({ name: "Regex Tester", slug: "regex-tester", category: "developer-tools", shortDescription: "Test regular expressions against sample text.", longDescription: "Regex Tester is a strong fit for a browser-only implementation because JavaScript regular expressions can run directly in the page. The route and registry are ready for the future interactive UI component.", keywords: ["regex tester", "regular expression tester", "pattern matcher"], howToUse: ["Enter a regular expression.", "Add sample text.", "Review matches and errors."], implementationStatus: "working-local", seoTitle: "Regex Tester Online", seoDescription: "Test regular expressions online with a browser-based developer tool.", faq1: "Which regex engine would be used?", faqAnswer1: "A browser-side implementation would use the JavaScript regex engine.", faq2: "Can invalid patterns be handled?", faqAnswer2: "Yes. The tool should surface syntax errors clearly." }),
  makeTool({ name: "Password Generator", slug: "password-generator", category: "generator-tools", shortDescription: "Generate strong random passwords locally in the browser.", longDescription: "Password Generator is a natural browser-side tool. The future UI can use browser randomness, configurable length, and character sets while reusing the site’s existing page template and SEO setup.", keywords: ["password generator", "random password", "secure password"], howToUse: ["Choose password options.", "Generate a new password.", "Copy the result."], implementationStatus: "working-local", seoTitle: "Password Generator Online", seoDescription: "Generate secure passwords online with a browser-first random password tool.", faq1: "Should this use secure randomness?", faqAnswer1: "Yes. A proper implementation should use the browser’s secure random APIs.", faq2: "Can symbols be optional?", faqAnswer2: "Yes. That is a common generator setting." }),
  makeTool({ name: "QR Code Generator", slug: "qr-code-generator", category: "generator-tools", shortDescription: "Generate QR codes from text or links.", longDescription: "The QR Code Generator page is structured for a future local implementation that creates QR codes directly in the browser and allows easy download. It fits the registry architecture without requiring a remote API.", keywords: ["qr code generator", "make qr code", "generate qr code"], howToUse: ["Enter text or a URL.", "Generate the QR code.", "Download or use the image."], implementationStatus: "working-local", seoTitle: "QR Code Generator Online", seoDescription: "Generate QR codes online with a browser-first tool for text and URL encoding.", faq1: "Can this work without an external API?", faqAnswer1: "Yes. QR generation is practical fully in the browser.", faq2: "What types of text can be encoded?", faqAnswer2: "URLs, plain text, and short structured data are common use cases." }),
  makeTool({ name: "UUID Generator", slug: "uuid-generator", category: "generator-tools", shortDescription: "Generate one or more UUIDs for development and data tasks.", longDescription: "UUID Generator is simple, useful, and fully compatible with a browser-first approach. The page is already structured for a future tool that creates copy-ready UUID lists with minimal UI complexity.", keywords: ["uuid generator", "guid generator", "random uuid"], howToUse: ["Set how many UUIDs you want.", "Generate the values.", "Copy the results."], implementationStatus: "working-local", seoTitle: "UUID Generator Online", seoDescription: "Generate UUIDs online with a browser-based tool for development and testing workflows.", faq1: "Can this work fully locally?", faqAnswer1: "Yes. UUID generation is well suited to browser-side logic.", faq2: "Is this useful for testing?", faqAnswer2: "Yes. UUIDs are common in app development, fixtures, and examples." }),
  makeTool({ name: "Random Name Generator", slug: "random-name-generator", category: "generator-tools", shortDescription: "Generate random names from a local curated name list.", longDescription: "Random Name Generator is planned as a local tool that picks from a bundled list of names rather than pretending to use live data. That keeps the feature honest, fast, and aligned with the project’s no-database approach.", keywords: ["random name generator", "fake name generator", "name picker"], howToUse: ["Choose how many names you want.", "Generate a random list.", "Copy the names you need."], implementationStatus: "working-local", seoTitle: "Random Name Generator Online", seoDescription: "Generate random names online with a local bundled-list approach and no database requirement.", faq1: "Will names come from a live API?", faqAnswer1: "No. A good local implementation should use a bundled curated list.", faq2: "Are these real people?", faqAnswer2: "No. The intended use is sample names, placeholders, and idea generation." }),
  makeTool({ name: "Random Number Generator", slug: "random-number-generator", category: "generator-tools", shortDescription: "Generate random numbers within a selected range.", longDescription: "Random Number Generator is a straightforward local utility that fits the site cleanly. The page is ready for a future browser-side UI with range controls, quantity settings, and duplicate options.", keywords: ["random number generator", "number picker", "rng tool"], howToUse: ["Set the minimum and maximum values.", "Choose how many numbers to generate.", "Copy the result list."], implementationStatus: "working-local", seoTitle: "Random Number Generator Online", seoDescription: "Generate random numbers online with a browser-first range-based tool.", faq1: "Can duplicates be disabled?", faqAnswer1: "That is the intended option for the local implementation.", faq2: "Is this suitable for giveaways and draws?", faqAnswer2: "It can be useful for casual selection tasks, but high-stakes systems should use audited processes." }),
  makeTool({ name: "Age Calculator", slug: "age-calculator", category: "calculator-tools", shortDescription: "Calculate age from a birth date.", longDescription: "Age Calculator is a simple browser-side date math tool and a good match for the project’s architecture. The page is ready for a local UI that shows years, months, and days without any backend dependency.", keywords: ["age calculator", "calculate age", "date of birth calculator"], howToUse: ["Choose a birth date.", "Optionally set a comparison date.", "Review the age result."], implementationStatus: "working-local", seoTitle: "Age Calculator Online", seoDescription: "Calculate age online with a browser-first date-based calculator.", faq1: "Can it handle leap years?", faqAnswer1: "Yes. A proper browser-side implementation can calculate with real calendar dates.", faq2: "Can I use a custom compare date?", faqAnswer2: "Yes. That is part of the intended scope." }),
  makeTool({ name: "BMI Calculator", slug: "bmi-calculator", category: "calculator-tools", shortDescription: "Calculate body mass index from height and weight.", longDescription: "BMI Calculator is well suited to a browser-only math workflow. The page is set up for a future client component that supports metric or imperial units and outputs a clear BMI score with category labels.", keywords: ["bmi calculator", "body mass index calculator", "health calculator"], howToUse: ["Enter height and weight.", "Choose the unit system if needed.", "Read the BMI score and category."], implementationStatus: "working-local", seoTitle: "BMI Calculator Online", seoDescription: "Calculate BMI online with a simple browser-based body mass index tool.", faq1: "Is BMI medical advice?", faqAnswer1: "No. BMI is a screening metric, not a diagnosis.", faq2: "Can metric and imperial both be supported?", faqAnswer2: "Yes. That is the intended implementation scope." }),
  makeTool({ name: "Loan Calculator", slug: "loan-calculator", category: "calculator-tools", shortDescription: "Estimate monthly loan payments and total repayment.", longDescription: "Loan Calculator fits the architecture well because the core logic is simple client-side math. The future implementation can support principal, interest rate, and term inputs with immediate payment estimates.", keywords: ["loan calculator", "monthly payment calculator", "emi calculator"], howToUse: ["Enter the loan amount.", "Set the rate and term.", "Review the monthly payment and totals."], implementationStatus: "working-local", seoTitle: "Loan Calculator Online", seoDescription: "Estimate loan payments online with a browser-first repayment calculator.", faq1: "Will this match a lender quote exactly?", faqAnswer1: "No. It should be presented as an estimate based on standard formulas.", faq2: "Does this need an API?", faqAnswer2: "No. Loan calculations are straightforward browser-side math." }),
  makeTool({ name: "Percentage Calculator", slug: "percentage-calculator", category: "calculator-tools", shortDescription: "Solve common percentage formulas quickly.", longDescription: "This page is structured for a local percentage calculator covering percent-of, increase, decrease, and related formulas. It is a simple but high-utility addition that fits the registry-based architecture well.", keywords: ["percentage calculator", "percent increase", "percent decrease"], howToUse: ["Enter the values for the formula you need.", "Review the calculated percentage result.", "Adjust inputs to compare scenarios."], implementationStatus: "working-local", seoTitle: "Percentage Calculator Online", seoDescription: "Calculate percentages online with a browser-based percentage tool for common formulas.", faq1: "Can one page handle multiple percentage formulas?", faqAnswer1: "Yes. That is the intended design for the local implementation.", faq2: "Will results be rounded?", faqAnswer2: "Yes, typically for readability while keeping useful precision." }),
  makeTool({ name: "Date Difference Calculator", slug: "date-difference-calculator", category: "calculator-tools", shortDescription: "Find the number of days between two dates.", longDescription: "Date Difference Calculator is a practical browser-side date utility that complements the age calculator. The route and registry are ready for a future UI that shows days, weeks, months, or other useful date-gap metrics.", keywords: ["date difference calculator", "days between dates", "date duration calculator"], howToUse: ["Choose a start date.", "Choose an end date.", "Review the difference result."], implementationStatus: "working-local", seoTitle: "Date Difference Calculator Online", seoDescription: "Calculate the difference between two dates online with a simple browser-first date tool.", faq1: "Can it show total days?", faqAnswer1: "Yes. That should be part of the core implementation.", faq2: "Will it handle time zones?", faqAnswer2: "A simple date-only version should make its assumptions clear and focus on calendar differences." }),
  makeTool({ name: "Length Converter", slug: "length-converter", category: "converter-tools", shortDescription: "Convert between common length and distance units.", longDescription: "Length Converter is a classic local unit-conversion tool. The page is ready for a browser-side UI that handles metric and imperial units while reusing the site’s shared metadata and content structure.", keywords: ["length converter", "distance converter", "meters to feet"], howToUse: ["Enter a value.", "Choose the source unit.", "Choose the target unit and read the result."], implementationStatus: "working-local", seoTitle: "Length Converter Online", seoDescription: "Convert length units online with a browser-first distance conversion tool.", faq1: "Does this support metric and imperial units?", faqAnswer1: "Yes. That is the intended conversion scope.", faq2: "Are decimal values allowed?", faqAnswer2: "Yes. Unit converters should support fractional inputs." }),
  makeTool({ name: "Weight Converter", slug: "weight-converter", category: "converter-tools", shortDescription: "Convert between common weight and mass units.", longDescription: "Weight Converter is another straightforward browser-side utility. This page reserves a place for a local conversion component without changing the route structure later.", keywords: ["weight converter", "mass converter", "kg to lb"], howToUse: ["Enter a weight value.", "Pick the source and target units.", "Review the converted result."], implementationStatus: "working-local", seoTitle: "Weight Converter Online", seoDescription: "Convert weight units online with a simple browser-based mass conversion tool.", faq1: "Can it convert kilograms and pounds?", faqAnswer1: "Yes. That is expected in the local implementation.", faq2: "Is this suitable for cooking and shipping estimates?", faqAnswer2: "Yes, as a general-purpose conversion tool." }),
  makeTool({ name: "Temperature Converter", slug: "temperature-converter", category: "converter-tools", shortDescription: "Convert temperatures between Celsius, Fahrenheit, and Kelvin.", longDescription: "Temperature Converter is a clean fit for local browser-side logic. The page is ready for a future client component that handles common temperature scales with immediate results.", keywords: ["temperature converter", "celsius to fahrenheit", "kelvin converter"], howToUse: ["Enter a temperature.", "Choose the from and to scales.", "Read the converted value."], implementationStatus: "working-local", seoTitle: "Temperature Converter Online", seoDescription: "Convert temperature units online with a browser-first Celsius, Fahrenheit, and Kelvin tool.", faq1: "Can it convert negative temperatures?", faqAnswer1: "Yes. A proper local implementation should support them.", faq2: "Why is Kelvin different?", faqAnswer2: "Kelvin is an absolute scale, so negative Kelvin values are not physically valid." }),
  makeTool({ name: "Time Converter", slug: "time-converter", category: "converter-tools", shortDescription: "Convert between common time units such as seconds, minutes, and hours.", longDescription: "Time Converter is a practical unit-conversion tool that works fully locally. The route and page are ready for a future UI that handles seconds, minutes, hours, days, and other common time units.", keywords: ["time converter", "seconds to minutes", "hours to days"], howToUse: ["Enter a time value.", "Choose the original unit.", "Choose the target unit and view the result."], implementationStatus: "working-local", seoTitle: "Time Converter Online", seoDescription: "Convert time units online with a browser-based seconds, minutes, hours, and days converter.", faq1: "Is this a timezone tool?", faqAnswer1: "No. This tool converts time units, not clock times across regions.", faq2: "Can it convert days and hours?", faqAnswer2: "Yes. That is part of the intended scope." }),
  makeTool({ name: "Currency Converter", slug: "currency-converter", category: "converter-tools", shortDescription: "Convert currencies with backend-fetched latest or historical exchange rates.", longDescription: "Currency Converter now uses a backend provider adapter instead of bundled static rates. Users can request the latest available rate or a historical date, review the provider name, and see the exact effective date or timestamp returned for the quote. The page stays honest about daily-updated reference feeds versus more current provider timestamps and does not present the output as trading advice.", keywords: ["currency converter", "exchange rate converter", "historical currency converter"], howToUse: ["Enter an amount.", "Choose the base and target currencies.", "Optionally choose a historical date, then review the converted amount, provider, and effective rate time."], implementationStatus: "working-local", seoTitle: "Currency Converter Online", seoDescription: "Convert currencies online with backend-fetched latest or historical exchange rates, provider labels, and clearly shown effective dates.", statusNote: "Uses a backend provider adapter with caching. If no premium provider is configured, the tool falls back to Frankfurter daily-updated reference rates.", faq1: "Are the rates real-time?", faqAnswer1: "Not always. The page labels the provider and whether the returned rate is latest, daily-updated, or historical so users can see the actual freshness of the data.", faq2: "Can I use this for trading decisions?", faqAnswer2: "No. The converter is useful for reference and planning, but it is not a brokerage or execution platform." }),
  makeTool({ name: "IP Address Lookup", slug: "ip-address-lookup", category: "internet-tools", shortDescription: "Limited browser-side IP information page with honest scope boundaries.", longDescription: "A browser cannot reliably perform a full public IP lookup with rich geolocation details without external services. The honest local version of this tool should focus on limited browser-visible network information, possible local/private IP candidates, and clear labeling about what is and is not available.", keywords: ["ip address lookup", "my ip tool", "browser ip info"], howToUse: ["Open the page to review available browser-detected information.", "Check the scope note for what the browser can and cannot reveal.", "Use the limited local details only as a basic reference."], implementationStatus: "reduced-scope-local", seoTitle: "IP Address Lookup Online", seoDescription: "IP address lookup page with honest browser-side scope notes and no fake public-IP capability.", statusNote: "Reduced-scope local version only; browser-visible network info is possible, but full public-IP lookup typically needs an external service.", faq1: "Can the browser always show my public IP?", faqAnswer1: "No. A reliable public IP lookup usually depends on an external service.", faq2: "Why keep this as reduced-scope?", faqAnswer2: "Because pretending to provide full IP lookup without the needed data source would be misleading." }),
  makeTool({ name: "DNS Lookup", slug: "dns-lookup", category: "internet-tools", shortDescription: "Look up common DNS records through a server route.", longDescription: "DNS Lookup now uses backend DNS resolution so the page can return real records for entered hostnames instead of relying on browser-only limitations. It supports common record types such as A, AAAA, MX, NS, TXT, CNAME, CAA, SRV, and SOA while keeping the same SEO and route structure.", keywords: ["dns lookup", "dns checker", "domain dns records"], howToUse: ["Enter a hostname.", "Run the DNS lookup from the server route.", "Review or copy the returned record set."], implementationStatus: "working-local", seoTitle: "DNS Lookup Online", seoDescription: "Look up DNS records online with a server-backed DNS resolver for common record types.", statusNote: "Uses a backend DNS resolver so the browser can inspect real records without pretending to do low-level DNS work locally.", faq1: "Does this use real DNS resolution now?", faqAnswer1: "Yes. The backend resolves common DNS record types for the hostname you enter.", faq2: "Can this query every specialized record type?", faqAnswer2: "It focuses on the most useful record types first, while keeping the route open for broader coverage later." }),
];

const toolDrafts = [...toolDraftsPart1, ...toolDraftsPart2, ...extraToolDrafts];
const toolDraftOrder = new Map(toolDrafts.map((tool, index) => [tool.slug, index]));
const popularToolPriority = new Map(
  [
    "word-counter",
    "image-compressor",
    "pdf-merge",
    "json-formatter",
    "password-generator",
    "qr-code-generator",
    "loan-calculator",
    "currency-converter",
    "image-format-converter",
    "markdown-to-html-converter",
    "discount-calculator",
    "user-agent-parser",
  ].map((slug, index) => [slug, index]),
);

const implementationStatusMeta: Record<ImplementationStatus, ImplementationStatusMeta> = {
  "working-local": {
    label: "Working",
    shortLabel: "Working",
    summary: "This tool is ready to use with the current browser-side or server-assisted workflow.",
  },
  "reduced-scope-local": {
    label: "Reduced scope",
    shortLabel: "Reduced scope",
    summary: "This tool works today, but it stays explicit about limits, browser constraints, or service dependencies.",
  },
  "planned-local": {
    label: "Planned",
    shortLabel: "Planned",
    summary: "This page is live in the directory, and the full tool workflow is still being connected.",
  },
  "coming-soon": {
    label: "Coming soon",
    shortLabel: "Coming soon",
    summary: "This page stays transparent until a reliable implementation is ready.",
  },
};

const serviceBackedToolConfig = new Map<string, ServiceBackedToolConfig>([
  [
    "background-remover",
    {
      requiredEnvVars: ["REMOVE_BG_API_KEY"],
      unavailableMessage:
        "Background removal is currently unavailable on this deployment. The page stays live so the workflow remains documented, but the tool should not be featured or indexed until the service is enabled.",
    },
  ],
  [
    "remove-background-from-image",
    {
      requiredEnvVars: ["REMOVE_BG_API_KEY"],
      unavailableMessage:
        "Background removal is currently unavailable on this deployment. The page stays live so the workflow remains documented, but the tool should not be featured or indexed until the service is enabled.",
    },
  ],
  [
    "pdf-ocr-placeholder",
    {
      requiredEnvVars: ["OCR_SPACE_API_KEY"],
      unavailableMessage:
        "PDF OCR is currently unavailable on this deployment. The route stays available for future activation, but it should not be indexed until OCR is enabled under a production-ready slug.",
      shouldAlwaysNoindex: true,
    },
  ],
  [
    "protect-pdf",
    {
      requiredEnvVars: ["PDF_PROTECT_SERVICE_URL"],
      unavailableMessage:
        "PDF protection is currently unavailable on this deployment. The page stays live with clear scope notes, but it should not be indexed or featured until the backend protection service is enabled.",
    },
  ],
  [
    "website-screenshot-tool",
    {
      requiredEnvVars: ["SCREENSHOT_SERVICE_URL"],
      unavailableMessage:
        "Website screenshots are currently unavailable on this deployment. The route stays live for future activation, but it should not be indexed or featured until screenshot capture is enabled.",
    },
  ],
]);

function resolveImplementationStatus(tool: ToolDraft): ImplementationStatus {
  return tool.implementationStatus;
}

function getServiceBackedToolConfig(slug: string) {
  return serviceBackedToolConfig.get(slug);
}

export function getToolRequiredEnvVars(toolOrSlug: Pick<ToolDefinition, "slug"> | string) {
  const slug = typeof toolOrSlug === "string" ? toolOrSlug : toolOrSlug.slug;
  return getServiceBackedToolConfig(slug)?.requiredEnvVars ?? [];
}

export function getMissingToolEnvVars(toolOrSlug: Pick<ToolDefinition, "slug"> | string) {
  return getToolRequiredEnvVars(toolOrSlug).filter((envVar) => !process.env[envVar]?.trim());
}

export function isToolAvailableOnDeployment(toolOrSlug: Pick<ToolDefinition, "slug"> | string) {
  return getMissingToolEnvVars(toolOrSlug).length === 0;
}

function resolveStatusNote(tool: Pick<ToolDefinition, "slug" | "statusNote">) {
  const config = getServiceBackedToolConfig(tool.slug);
  if (!config || isToolAvailableOnDeployment(tool)) {
    return tool.statusNote;
  }

  return config.unavailableMessage;
}

function getToolOrderIndex(slug: string) {
  return toolDraftOrder.get(slug) ?? Number.MAX_SAFE_INTEGER;
}

export function isExpandedSeoTool(toolOrSlug: Pick<ToolDefinition, "slug"> | string) {
  const slug = typeof toolOrSlug === "string" ? toolOrSlug : toolOrSlug.slug;
  const order = getToolOrderIndex(slug);
  return order >= 150 && order < 200;
}

function getCategoryName(slug: ToolCategorySlug) {
  return categories.find((category) => category.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

function extractTopicTokens(tool: ToolDraft) {
  return new Set(
    [tool.name, ...tool.keywords]
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2 && !["tool", "tools", "online", "free", "converter", "calculator"].includes(token)),
  );
}

function buildRelatedToolSlugs(tool: ToolDraft) {
  const sourceTokens = extractTopicTokens(tool);
  const sameCategoryMatches = toolDrafts
    .filter((candidate) => candidate.category === tool.category && candidate.slug !== tool.slug)
    .map((candidate) => {
      const candidateTokens = extractTopicTokens(candidate);
      const overlap = Array.from(sourceTokens).filter((token) => candidateTokens.has(token)).length;
      return { candidate, overlap };
    })
    .sort((left, right) => {
      const overlapDifference = right.overlap - left.overlap;
      if (overlapDifference !== 0) {
        return overlapDifference;
      }
      return getPopularityScore(right.candidate as ToolDefinition) - getPopularityScore(left.candidate as ToolDefinition);
    })
    .map(({ candidate }) => candidate.slug);

  const crossCategoryMatches = toolDrafts
    .filter((candidate) => candidate.category !== tool.category && candidate.slug !== tool.slug)
    .map((candidate) => {
      const candidateTokens = extractTopicTokens(candidate);
      const overlap = Array.from(sourceTokens).filter((token) => candidateTokens.has(token)).length;
      return { candidate, overlap };
    })
    .filter(({ overlap }) => overlap > 0)
    .sort((left, right) => {
      const overlapDifference = right.overlap - left.overlap;
      if (overlapDifference !== 0) {
        return overlapDifference;
      }
      return getPopularityScore(right.candidate as ToolDefinition) - getPopularityScore(left.candidate as ToolDefinition);
    })
    .map(({ candidate }) => candidate.slug);

  return [...new Set([...sameCategoryMatches, ...crossCategoryMatches])].slice(0, isExpandedSeoTool(tool.slug) ? 8 : 6);
}

function enrichHowToUse(tool: ToolDraft, implementationStatus: ImplementationStatus) {
  const steps = [...tool.howToUse];
  const categoryName = getCategoryName(tool.category);

  if (!steps.some((step) => /open|visit|go to/i.test(step))) {
    steps.unshift(`Open the ${tool.name} page from the ${categoryName.toLowerCase()} section.`);
  }

  if (!steps.some((step) => /copy|download|save|review/i.test(step))) {
    steps.push(
      implementationStatus === "coming-soon"
        ? "Review the current scope note and return when a reliable implementation is available."
        : "Review the output, then copy, download, or continue to a related tool if needed.",
    );
  }

  if (steps.length < 4) {
    steps.push(
      implementationStatus === "reduced-scope-local"
        ? "Check the scope note so you know what the browser can and cannot do for this workflow."
        : "Adjust the input values or settings until the output matches the result you need.",
    );
  }

  if (!steps.some((step) => /related tool|category page|same category/i.test(step))) {
    steps.push(`Use the related tools area or the ${categoryName.toLowerCase()} page if you need a nearby workflow after this step.`);
  }

  return steps.slice(0, isExpandedSeoTool(tool) ? 6 : 5);
}

function enrichFaq(tool: ToolDraft, implementationStatus: ImplementationStatus) {
  const faq = [...tool.faq];
  const categoryName = getCategoryName(tool.category);

  const extraFaq: FaqItem[] = [
    {
      question: `Can I use ${tool.name.toLowerCase()} on mobile?`,
      answer: `${tool.name} is built to work on modern mobile and desktop browsers with the same route, content structure, and core workflow.`,
    },
    {
      question: `Does ${tool.name.toLowerCase()} need an account or signup?`,
      answer: `No. ${tool.name} follows the same no-auth approach as the rest of the ${categoryName.toLowerCase()} directory.`,
    },
    {
      question: `Are there related tools if ${tool.name.toLowerCase()} is not the exact fit?`,
      answer: `Yes. Each ${tool.name} page links to related tools and its parent category so you can move to a similar workflow quickly.`,
    },
    {
      question: `What kind of task is ${tool.name.toLowerCase()} best for?`,
      answer: `${tool.name} is best used for focused ${getCategoryName(tool.category).toLowerCase()} workflows where you want a quick browser-based result, a clear explanation of scope, and easy links to nearby tools.`,
    },
  ];

  if (isExpandedSeoTool(tool)) {
    extraFaq.unshift(
      {
        question: `What output should I expect from ${tool.name.toLowerCase()}?`,
        answer: `${tool.name} is designed to return a focused result for this workflow, plus internal links to nearby tools if you need a related next step.`,
      },
      {
        question: `Where can I find similar ${categoryName.toLowerCase()} after using ${tool.name.toLowerCase()}?`,
        answer: `Use the related tools area, the category page, and the internal links block to continue into nearby ${categoryName.toLowerCase()} workflows without starting over.`,
      },
    );
  }

  if (implementationStatus === "reduced-scope-local") {
    extraFaq.unshift({
      question: `Why is ${tool.name.toLowerCase()} marked reduced scope?`,
      answer: `This tool is intentionally honest about browser limitations and only exposes the parts of the workflow that can be delivered reliably without external infrastructure.`,
    });
  }

  if (implementationStatus === "coming-soon") {
    extraFaq.unshift({
      question: `Why is ${tool.name.toLowerCase()} still coming soon?`,
      answer: `The site avoids fake outputs, so this page stays transparent until a reliable implementation is practical within the current architecture.`,
    });
  }

  for (const item of extraFaq) {
    if (!faq.some((existing) => existing.question.toLowerCase() === item.question.toLowerCase())) {
      faq.push(item);
    }
  }

  return faq.slice(0, isExpandedSeoTool(tool) ? 6 : 5);
}

function enrichSeoTitle(tool: ToolDraft) {
  const title = tool.seoTitle.trim();
  if (isExpandedSeoTool(tool) && title.length < 55) {
    return `${tool.name} Online Free - ${getCategoryName(tool.category)} | Toolbox Hub`;
  }
  if (title.length >= 45) {
    return title;
  }
  return `${tool.name} Online Free | ${getCategoryName(tool.category)} | Toolbox Hub`;
}

function enrichSeoDescription(tool: ToolDraft, implementationStatus: ImplementationStatus) {
  const base = tool.seoDescription.trim();
  if (isExpandedSeoTool(tool) && base.length >= 110) {
    return `${base} Includes how-to steps, FAQ answers, and links to related tools in the same topic cluster.`;
  }
  if (base.length >= 130) {
    return base;
  }

  const scopeLine =
    implementationStatus === "coming-soon"
      ? " Honest scope notes included."
      : implementationStatus === "reduced-scope-local"
        ? " Includes clear reduced-scope notes."
        : " Browser-first and easy to use.";

  return `${tool.shortDescription} Use ${tool.name.toLowerCase()} online with how-to steps, FAQs, related tools, and links to the ${getCategoryName(tool.category).toLowerCase()} directory.${scopeLine}`;
}

function enrichLongDescription(tool: ToolDraft, implementationStatus: ImplementationStatus) {
  const categoryName = getCategoryName(tool.category);
  const scopeSentence =
    implementationStatus === "coming-soon"
      ? ` The page stays useful for SEO and navigation while clearly explaining why a reliable implementation is still pending.`
      : implementationStatus === "reduced-scope-local"
        ? ` The page also explains the current browser-only limits so visitors know exactly what results are realistic.`
        : ` The page includes practical guidance, related tools, and internal links so visitors can complete nearby tasks without starting over.`;

  if (tool.longDescription.length > 240) {
    return `${tool.longDescription}${scopeSentence}${isExpandedSeoTool(tool) ? ` The page also strengthens internal linking so visitors can keep exploring related ${categoryName.toLowerCase()} tasks.` : ""}`;
  }

  return `${tool.longDescription} ${tool.name} belongs to the ${categoryName.toLowerCase()} section, which helps users discover similar workflows, related conversions, and alternative tools from the same route structure.${scopeSentence}`;
}

function enrichKeywords(tool: ToolDraft) {
  const categoryName = getCategoryName(tool.category);
  const extraKeywords = [
    `${tool.name.toLowerCase()} online`,
    `free ${tool.name.toLowerCase()}`,
    `${categoryName.toLowerCase()} online`,
    ...(isExpandedSeoTool(tool)
      ? [
        `how to use ${tool.name.toLowerCase()}`,
        `${tool.name.toLowerCase()} faq`,
        `${tool.name.toLowerCase()} tool`,
      ]
      : []),
  ];

  return [...new Set([...tool.keywords, ...extraKeywords])];
}

export const tools: ToolDefinition[] = toolDrafts.map((tool) => ({
  ...tool,
  implementationStatus: resolveImplementationStatus(tool),
})).map((tool) => ({
  ...tool,
  statusNote: resolveStatusNote(tool),
  seoTitle: enrichSeoTitle(tool),
  seoDescription: enrichSeoDescription(tool, tool.implementationStatus),
  longDescription: enrichLongDescription(tool, tool.implementationStatus),
  keywords: enrichKeywords(tool),
  howToUse: enrichHowToUse(tool, tool.implementationStatus),
  faq: enrichFaq(tool, tool.implementationStatus),
  relatedToolSlugs: buildRelatedToolSlugs(tool),
}));

const toolBySlugMap = new Map(tools.map((tool) => [tool.slug, tool]));
const toolsByCategoryMap = new Map<ToolCategorySlug, ToolDefinition[]>(
  categories.map((category) => [category.slug, tools.filter((tool) => tool.category === category.slug)]),
);
const popularToolsCache = new Map<string, ToolDefinition[]>();
const recentToolsCache = new Map<string, ToolDefinition[]>();
const trendingToolsCache = new Map<string, ToolDefinition[]>();

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getTool(slug: string) {
  return toolBySlugMap.get(slug);
}

export function getToolsByCategory(category: ToolCategorySlug) {
  return toolsByCategoryMap.get(category) ?? [];
}

function getPopularityScore(tool: ToolDefinition) {
  let score = 0;

  if (tool.implementationStatus === "working-local") score += 100;
  if (tool.implementationStatus === "reduced-scope-local") score += 60;
  if (tool.implementationStatus === "planned-local") score += 20;
  if (tool.implementationStatus === "coming-soon") score += 5;

  const priorityIndex = popularToolPriority.get(tool.slug);
  if (priorityIndex !== undefined) {
    score += 200 - priorityIndex * 10;
  }

  score += Math.max(0, 120 - (toolDraftOrder.get(tool.slug) ?? 999));
  return score;
}

export function getPopularTools(limit = 8, category?: ToolCategorySlug) {
  const cacheKey = `${category ?? "all"}:${limit}`;
  const cached = popularToolsCache.get(cacheKey);
  if (cached) return cached;

  const result = tools
    .filter((tool) => (category ? tool.category === category : true))
    .filter((tool) => !isAliasToolSlug(tool.slug))
    .filter((tool) => isToolAvailableOnDeployment(tool))
    .sort((left, right) => {
      const popularityDifference = getPopularityScore(right) - getPopularityScore(left);
      if (popularityDifference !== 0) {
        return popularityDifference;
      }
      return left.name.localeCompare(right.name);
    })
    .slice(0, limit);

  popularToolsCache.set(cacheKey, result);
  return result;
}

export function getRecentTools(limit = 8, category?: ToolCategorySlug) {
  const cacheKey = `${category ?? "all"}:${limit}`;
  const cached = recentToolsCache.get(cacheKey);
  if (cached) return cached;

  const result = [...tools]
    .filter((tool) => (category ? tool.category === category : true))
    .filter((tool) => !isAliasToolSlug(tool.slug))
    .filter((tool) => isToolAvailableOnDeployment(tool))
    .sort((left, right) => (toolDraftOrder.get(right.slug) ?? 0) - (toolDraftOrder.get(left.slug) ?? 0))
    .slice(0, limit);

  recentToolsCache.set(cacheKey, result);
  return result;
}

export function getTrendingTools(limit = 8, category?: ToolCategorySlug) {
  const cacheKey = `${category ?? "all"}:${limit}`;
  const cached = trendingToolsCache.get(cacheKey);
  if (cached) return cached;

  const result = [...tools]
    .filter((tool) => (category ? tool.category === category : true))
    .filter((tool) => !isAliasToolSlug(tool.slug))
    .filter((tool) => isToolAvailableOnDeployment(tool))
    .map((tool) => {
      const popularityScore = getPopularityScore(tool);
      const recencyBoost = Math.max(0, 80 - ((toolDraftOrder.get(tool.slug) ?? tools.length) * 0.35));
      const implementationBoost =
        tool.implementationStatus === "working-local"
          ? 35
          : tool.implementationStatus === "reduced-scope-local"
            ? 15
            : 0;

      return {
        tool,
        score: popularityScore + recencyBoost + implementationBoost,
      };
    })
    .sort((left, right) => right.score - left.score || left.tool.name.localeCompare(right.tool.name))
    .slice(0, limit)
    .map((entry) => entry.tool);

  trendingToolsCache.set(cacheKey, result);
  return result;
}

const canonicalToolSlugOverrides = new Map<string, string>([
  ["remove-background-from-image", "background-remover"],
  ["pdf-to-word-converter", "pdf-to-word"],
  ["word-to-pdf-converter", "word-to-pdf"],
]);

const deprioritizedToolSlugs = new Set<string>([
  "background-remover",
  "barcode-scanner",
  "qr-code-scanner",
  "ip-address-lookup",
  "http-status-code-checker",
  "url-status-checker",
  "url-redirect-checker",
  "webpage-source-viewer",
]);

export function getCanonicalToolSlug(slug: string) {
  return canonicalToolSlugOverrides.get(slug) ?? slug;
}

export function isAliasToolSlug(slug: string) {
  return canonicalToolSlugOverrides.has(slug);
}

export function shouldIndexTool(toolOrSlug: Pick<ToolDefinition, "slug" | "implementationStatus"> | string) {
  const tool = typeof toolOrSlug === "string" ? getTool(toolOrSlug) : toolOrSlug;
  if (!tool) {
    return false;
  }

  const config = getServiceBackedToolConfig(tool.slug);

  if (tool.implementationStatus === "coming-soon") {
    return false;
  }

  if (isAliasToolSlug(tool.slug)) {
    return false;
  }

  if (config?.shouldAlwaysNoindex) {
    return false;
  }

  if (config && !isToolAvailableOnDeployment(tool)) {
    return false;
  }

  return true;
}

export function shouldIncludeToolInSitemap(toolOrSlug: Pick<ToolDefinition, "slug" | "implementationStatus"> | string) {
  return shouldIndexTool(toolOrSlug);
}

export function isDeprioritizedTool(toolOrSlug: Pick<ToolDefinition, "slug"> | string) {
  const slug = typeof toolOrSlug === "string" ? toolOrSlug : toolOrSlug.slug;
  return deprioritizedToolSlugs.has(slug);
}

export function getImplementationStatusMeta(
  toolOrStatus: Pick<ToolDefinition, "implementationStatus"> | ImplementationStatus,
) {
  const status = typeof toolOrStatus === "string" ? toolOrStatus : toolOrStatus.implementationStatus;
  return implementationStatusMeta[status];
}

export function countToolsByImplementationStatus(
  statuses: ImplementationStatus | ImplementationStatus[],
  category?: ToolCategorySlug,
) {
  const statusList = Array.isArray(statuses) ? statuses : [statuses];

  return tools.filter((tool) => {
    if (category && tool.category !== category) {
      return false;
    }

    return statusList.includes(tool.implementationStatus);
  }).length;
}

export function getIndexableTools() {
  return tools.filter((tool) => shouldIndexTool(tool));
}

