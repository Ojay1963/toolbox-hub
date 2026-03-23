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

export type SearchPhraseItem = {
  phrase: string;
  href?: string;
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
  peopleAlsoSearchFor: SearchPhraseItem[];
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

type ToolDraft = Omit<ToolDefinition, "relatedToolSlugs" | "peopleAlsoSearchFor">;

type ToolInput = Omit<ToolDefinition, "relatedToolSlugs" | "faq" | "peopleAlsoSearchFor"> & {
  faq1: string;
  faq2: string;
  faqAnswer1: string;
  faqAnswer2: string;
};

type ServiceBackedToolConfig = {
  requiredEnvVars?: string[];
  requiresRateLimitBackend?: boolean;
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
  const shouldNormalize = true;
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
      {
        question: shouldNormalize ? normalizePublicCopy(input.faq1) : input.faq1,
        answer: shouldNormalize ? normalizePublicCopy(input.faqAnswer1) : input.faqAnswer1,
      },
      {
        question: shouldNormalize ? normalizePublicCopy(input.faq2) : input.faq2,
        answer: shouldNormalize ? normalizePublicCopy(input.faqAnswer2) : input.faqAnswer2,
      },
    ],
  };
}

const toolDraftsPart1: ToolDraft[] = [
  makeTool({ name: "Image Compressor", slug: "image-compressor", category: "image-tools", shortDescription: "Compress images to reduce file size while keeping them ready to share, upload, or publish.", longDescription: "Image Compressor is useful when a photo looks fine but the file is too heavy for a website, email, form, or product page. You can upload a JPG, PNG, or WebP image, lower the file size, preview the result, and decide whether the smaller version still looks good enough for your purpose. A blog publisher might use it to speed up page loading, an online seller might compress product photos before uploading them, and a student might shrink screenshots to fit an assignment portal. For example, a 4 MB phone photo can often be reduced enough for faster sharing without making the subject hard to see. If you also need to change dimensions after compression, the related Image Resizer and Image to WebP Converter pages can help you finish the job in the same workflow.", keywords: ["image compressor", "compress image", "reduce image size", "image size reducer", "compress jpg", "compress png"], howToUse: ["Upload your image file, such as a product photo, blog image, or phone screenshot.", "Choose the compression level or quality setting and compare the preview with the original.", "Download the smaller image when it looks right for sharing, uploading, or publishing."], implementationStatus: "working-local", seoTitle: "Image Compressor - Compress JPG, PNG, and WebP Online", seoDescription: "Compress JPG, PNG, and WebP images online to reduce file size without making downloads or sharing harder. Preview the result before you save it.", faq1: "When should I compress an image instead of resizing it?", faqAnswer1: "Compress an image when the dimensions already work and the main problem is file size. If the picture is also too wide or too tall, use Image Resizer after compression or before it, depending on the result you want.", faq2: "What kind of result should I expect from image compression?", faqAnswer2: "Most images become easier to upload and share, but the exact savings depend on the file type and the picture itself. Photos often shrink well, while simple graphics may need a lighter setting to keep edges clean." }),
  makeTool({ name: "Image Resizer", slug: "image-resizer", category: "image-tools", shortDescription: "Resize images by pixel dimensions for websites, social posts, documents, and quick edits.", longDescription: "Image Resizer helps when you already have the right picture but it does not fit the size you need. That might mean preparing a square profile image, adjusting a banner for a blog post, shrinking a product photo for faster loading, or creating a cleaner attachment for a document or form. You can enter a new width and height, keep the aspect ratio locked, and download a version that better matches your target layout. For example, a large 3000-pixel photo can be resized for a website hero image, while a portrait shot can be turned into a smaller social avatar without manually editing it in design software. If the resized image still feels too heavy, the Image Compressor page can help reduce file size next, and Crop Image is useful when you need to remove extra space before resizing.", keywords: ["image resizer", "resize image", "change image size", "resize photo online", "image size changer"], howToUse: ["Upload your image, such as a profile photo, product image, or blog graphic.", "Enter the new width and height, or keep the aspect ratio locked so the image scales evenly.", "Download the resized image and, if needed, continue to Crop Image or Image Compressor for a more polished result."], implementationStatus: "working-local", seoTitle: "Image Resizer - Resize Images Online by Width and Height", seoDescription: "Resize images online by changing width and height in pixels. Keep the aspect ratio if needed and download the resized image in seconds.", faq1: "What is a practical example of using an image resizer?", faqAnswer1: "A common example is taking a large phone photo and resizing it for a blog post, store listing, or profile image. The tool is also useful when a website or form asks for a specific width and height before upload.", faq2: "Should I crop or resize first?", faqAnswer2: "If the composition is wrong, crop first so the subject stays framed properly. If the composition is fine and only the dimensions need to change, resize first and then compress if you want a lighter file." }),
  makeTool({ name: "Crop Image", slug: "crop-image", category: "image-tools", shortDescription: "Crop an image to remove unwanted edges or focus on one area.", longDescription: "Crop Image is helpful when the picture is basically right but the frame is not. You can trim away empty space, remove distractions near the edges, tighten a portrait, or isolate one part of a screenshot before saving a cleaner version. This is useful for social posts, product images, blog illustrations, profile photos, and document graphics that look better with a tighter composition. For example, you might crop a wide phone photo to focus on one object, or trim a screenshot so only the important section remains. Cropping can also make the next step easier because the exported image often has fewer pixels and may be lighter to share. If you need an exact size after cropping, Image Resizer is a good follow-up, and Image Compressor can help reduce the final file size for web use.", keywords: ["crop image", "image cropper", "trim image"], howToUse: ["Upload an image such as a photo, screenshot, product shot, or design asset.", "Select the crop area to remove distractions or focus on the section you want to keep.", "Export the cropped image, then use Image Resizer or Image Compressor if you need a final size or a lighter file."], implementationStatus: "working-local", seoTitle: "Crop Image Online", seoDescription: "Crop images online with a browser-based workflow for trimming photos and graphics.", faq1: "What is a good reason to crop an image?", faqAnswer1: "Cropping is useful when the subject looks too far away, the edges include clutter, or a screenshot contains extra space you do not want to keep. It helps the image feel more intentional without changing the whole file.", faq2: "Can cropping help before posting online?", faqAnswer2: "Yes. A tighter crop can make a product, person, or document detail easier to see, especially on mobile screens. After cropping, many people also resize or compress the image for faster loading." }),
  makeTool({ name: "JPG to PNG Converter", slug: "jpg-to-png-converter", category: "image-tools", shortDescription: "Convert JPG images into PNG format locally in the browser.", longDescription: "JPG to PNG Converter is useful when you need a PNG file for design, editing, or publishing even though the original image is a JPG. A blogger might convert a header image for easier reuse in graphics software, a store owner might need PNG format for a marketplace upload, and a student might switch a JPG screenshot into PNG before adding notes or edits. The conversion itself is simple: upload the JPG, create the PNG copy, and download the result. For example, if you have a JPG logo sample or a photo that needs to be saved in PNG format for a workflow that prefers that file type, this page gives you a quick way to make the switch. PNG does not automatically create transparency, but it can be a better format for some editing and reuse tasks. If your goal is a smaller file instead, Image Compressor or Image to WebP Converter may be a better fit.", keywords: ["jpg to png", "jpeg to png", "image converter"], howToUse: ["Upload a JPG image, such as a photo, screenshot, or graphic you want in PNG format.", "Convert the file in the browser and review the new PNG version.", "Download the PNG result, or continue to Crop Image or Image Compressor if you want to refine it further."], implementationStatus: "working-local", seoTitle: "JPG to PNG Converter Online", seoDescription: "Convert JPG to PNG online with a browser-first workflow and no unnecessary server dependency.", faq1: "When is JPG to PNG conversion actually useful?", faqAnswer1: "It is helpful when a platform, editor, or design workflow expects PNG instead of JPG. People also use it when they want a PNG copy before further editing, annotation, or reuse in another project.", faq2: "Will converting JPG to PNG improve image quality?", faqAnswer2: "It will not restore detail that was already lost in the JPG. The main benefit is changing the format so the file is easier to use in a workflow that prefers PNG." }),
  makeTool({ name: "PNG to JPG Converter", slug: "png-to-jpg-converter", category: "image-tools", shortDescription: "Convert PNG files into JPG format with local browser-side export.", longDescription: "PNG to JPG Converter is helpful when a PNG file needs to become lighter, easier to email, or more practical for platforms that prefer JPG. This is common with screenshots, exported graphics, and large image files that do not need transparency. A seller might use it to prepare product photos for a listing, a blogger might convert a heavy PNG graphic before uploading it, and a student might change a screenshot into JPG to keep an attachment smaller. For example, if a PNG photo looks fine but takes longer to upload than expected, converting it to JPG can make sharing easier. Because JPG does not support transparency, any transparent areas need to be flattened against a background. If you want to keep transparency, stay with PNG. If you want to shrink the final JPG even more, Image Compressor is a useful next step after conversion.", keywords: ["png to jpg", "png to jpeg", "convert png to jpg"], howToUse: ["Upload a PNG image, such as a screenshot, graphic, or exported design file.", "Set JPG export options if needed and convert the file in the browser.", "Download the JPG result, then use Image Compressor if you want an even smaller file for upload or sharing."], implementationStatus: "working-local", seoTitle: "PNG to JPG Converter Online", seoDescription: "Convert PNG to JPG online with a simple browser-side export workflow.", faq1: "When should I convert PNG to JPG?", faqAnswer1: "Convert PNG to JPG when you want a smaller file for sharing or when the image does not need transparency. It is especially useful for photos, screenshots, and large graphics that look fine against a solid background.", faq2: "What happens if my PNG has a transparent background?", faqAnswer2: "The transparent parts cannot stay transparent in JPG, so they must be placed against a visible background color. If keeping transparency matters, use PNG or WebP instead." }),
  makeTool({ name: "Image to WebP Converter", slug: "image-to-webp-converter", category: "image-tools", shortDescription: "Convert images to WebP for modern web-friendly compression.", longDescription: "Image to WebP Converter is built for people who want lighter images without manually editing them in a full design app. WebP is often a strong choice for blog images, landing pages, store photos, and article graphics because it can keep visual quality while reducing file weight. A site owner might convert banner images before publishing, an online seller might create lighter product photos, and a writer might prepare screenshots for a faster article page. For example, if you have a JPG or PNG that looks good but slows down uploads or page loading, converting it to WebP can be a practical next move. This page keeps the workflow simple: upload an image, choose a quality level, and download a WebP copy. If you need an exact width first, use Image Resizer before converting. If you want to compare with a more familiar format, JPG to PNG Converter and PNG to JPG Converter cover those paths too.", keywords: ["image to webp", "webp converter", "convert image to webp"], howToUse: ["Upload an image you want to prepare for web use, such as a hero image, article graphic, or product photo.", "Choose a WebP quality setting and compare the balance between appearance and file size.", "Download the WebP file and, if needed, use Image Resizer or Image Compressor for an even more tailored result."], implementationStatus: "working-local", seoTitle: "Image to WebP Converter Online", seoDescription: "Convert images to WebP online with a browser-first workflow for modern web optimization.", faq1: "What is a practical reason to convert an image to WebP?", faqAnswer1: "A practical reason is faster web delivery. Many people convert article images, product photos, and landing page graphics to WebP so pages stay lighter without looking obviously worse to visitors.", faq2: "Should I always use WebP instead of JPG or PNG?", faqAnswer2: "Not always. WebP is often a great web format, but JPG or PNG may still be useful depending on your platform, editing workflow, or the need for transparency. It helps to choose the format that fits the job." }),
  makeTool({ name: "Background Remover", slug: "background-remover", category: "image-tools", shortDescription: "Remove the background from a photo or graphic and download a transparent PNG.", longDescription: "Background Remover is useful when you want the subject of a photo without the room, wall, table, or other distractions behind it. This makes it a practical tool for product listings, profile graphics, presentation slides, marketplace images, and quick design mockups. A shop owner might remove the background from a product shot before adding a clean brand color, a creator might cut out a portrait for a thumbnail, and a student might isolate an object for a class project. For example, a simple product photo taken on a desk can become a cleaner transparent PNG that is easier to place on a website or flyer. Results usually look best when the main subject is clear and the background is not too busy. After downloading the transparent PNG, many people continue to Crop Image, Image Resizer, or Image Watermark Tool to finish the final version.", keywords: ["background remover", "remove background", "remove image background", "transparent png maker", "cut out image"], howToUse: ["Upload your image file, such as a product photo, portrait, or simple graphic with a clear subject.", "Run the background removal step and review the preview for edges, shadows, and fine details.", "Download the transparent PNG, then continue to Crop Image or Image Resizer if you want a cleaner final layout."], implementationStatus: "reduced-scope-local", seoTitle: "Background Remover - Remove Background from Images Online", seoDescription: "Remove the background from images online and download a transparent PNG. Great for product photos, portraits, and quick design edits.", statusNote: "Results can vary depending on the image.", faq1: "What is a good example of using a background remover?", faqAnswer1: "A common example is taking a product photo with a busy room behind it and turning it into a cleaner image for a store listing or flyer. It is also useful for portraits, presentation graphics, and simple cutout work.", faq2: "How can I get a cleaner result after removing the background?", faqAnswer2: "Start with an image where the subject stands out clearly from the background. After removal, crop extra space, resize the image for its final use, and check edges closely if the original background included shadows, hair, or detailed textures." }),
  makeTool({ name: "Image Rotator", slug: "image-rotator", category: "image-tools", shortDescription: "Rotate sideways or upside-down images and save a correctly oriented copy.", longDescription: "Image Rotator is for fixing pictures that point the wrong way after upload, download, or export. It is especially useful for phone photos, scanned pages, screenshots, and product images that look correct on one device but appear sideways somewhere else. For example, a portrait photo might open sideways in a form, or a scanned receipt might need a quick 90-degree turn before sharing. This page is different from Crop Image because it changes orientation rather than trimming the frame. It is also different from Image Resizer because the goal is not a new size but a readable, properly aligned image.", keywords: ["image rotator", "rotate image", "turn photo"], howToUse: ["Upload the image that needs to be turned, such as a phone photo, scan, screenshot, or product image.", "Choose the rotation angle that makes the image read correctly, then preview the result.", "Download the corrected copy, or continue to Crop Image if the image also needs trimming."], implementationStatus: "working-local", seoTitle: "Image Rotator Online", seoDescription: "Rotate images online with a simple browser-first tool for quick angle adjustments.", faq1: "When is an image rotator more useful than a crop tool?", faqAnswer1: "It is more useful when the image already has the right content but faces the wrong direction. Cropping changes the frame, while rotation fixes orientation.", faq2: "Will rotating an image change its shape?", faqAnswer2: "It can. A 90-degree or 270-degree rotation swaps width and height, so the final dimensions may look different even though the content stays the same." }),
  makeTool({ name: "Image Watermark Tool", slug: "image-watermark-tool", category: "image-tools", shortDescription: "Add text or logo-style watermarks before saving a new image copy.", longDescription: "Image Watermark Tool is useful when you want an image to stay shareable while still showing ownership, branding, or source information. People often watermark portfolio images, product photos, social graphics, event pictures, and previews sent to clients. For example, a photographer may add a small studio name before posting proofs, while a shop owner may place a light logo on catalog images shared outside the store. This page is different from Background Remover or Crop Image because it does not change the subject or framing. Its job is to add a visible mark that travels with the image.", keywords: ["image watermark", "watermark tool", "add watermark to image"], howToUse: ["Upload the image you want to label, such as a product photo, proof image, or social graphic.", "Add watermark text or a simple logo-style overlay, then place it where it stays visible without covering the main subject.", "Export the new image and keep the original untouched, or continue to Image Resizer if you need a version for a specific platform."], implementationStatus: "working-local", seoTitle: "Image Watermark Tool Online", seoDescription: "Add text or logo-style watermarks to images online with a browser-first workflow.", faq1: "Why would I watermark an image before sharing it?", faqAnswer1: "People usually watermark images when they want to show ownership, add branding, or mark a preview copy before sending it to others. It is common for proofs, catalogs, and social graphics.", faq2: "Should a watermark cover the center of the image?", faqAnswer2: "Not usually. Most people place it where it stays visible but does not hide the main subject, such as a corner, edge, or lightly repeated position." }),
  makeTool({ name: "Image to Base64 Converter", slug: "image-to-base64-converter", category: "image-tools", shortDescription: "Convert an uploaded image into a Base64 string or data URL for inline use.", longDescription: "Image to Base64 Converter is for situations where you need an image as text instead of as a normal file. That can be useful for quick code tests, inline previews, email templates, CSS experiments, or small embedded assets in a project. For example, a developer might turn a small icon into a data URL for testing, or a designer might share one self-contained image snippet during a quick handoff. This page is different from Image Format Converter because it does not change JPG to PNG or WebP. Instead, it changes the file into an encoded text form that can be pasted into code or markup.", keywords: ["image to base64", "base64 image converter", "data url converter"], howToUse: ["Upload the image file you want to encode, especially if you need a small asset in text form.", "Generate the Base64 output and choose whether you want the raw string or a full data URL.", "Copy the encoded result for your code, test page, or markup, and keep the original file if you still need a normal image version."], implementationStatus: "working-local", seoTitle: "Image to Base64 Converter Online", seoDescription: "Convert image files to Base64 online with a browser-side workflow and copy-ready output.", faq1: "When is Base64 useful for an image?", faqAnswer1: "It is useful when you need to paste the image into code, markup, or a quick test without linking to a separate file. Small icons and short experiments are common examples.", faq2: "Should I use Base64 to make an image file smaller?", faqAnswer2: "No. Base64 usually makes the content longer, so it is mainly for convenience and embedding rather than for file-size savings." }),
  makeTool({ name: "PDF Merge", slug: "pdf-merge", category: "pdf-tools", shortDescription: "Merge multiple PDF files into one document in the order you choose.", longDescription: "PDF Merge is useful when several separate files need to become one clean document. That might mean joining invoices into one monthly record, combining class notes into a single study file, or putting a cover page in front of a report before sharing it. Instead of sending multiple attachments, you can upload the PDFs, place them in the right order, and download one finished file. For example, a job seeker might combine a cover sheet, resume, and certificates into one PDF, while a small business owner might merge several scans into one client packet. Keeping everything together also makes printing and archiving easier. If you only need part of a document before merging, PDF Split can help first, and PDF Compressor is useful when the final merged file needs to be lighter for email or upload limits.", keywords: ["pdf merge", "merge pdf", "combine pdf files", "join pdf", "merge pdf files"], howToUse: ["Upload two or more PDF files, such as reports, scans, forms, or pages from the same project.", "Arrange the files in the order you want, for example cover page first and supporting pages after it.", "Merge them and download the combined PDF, then use PDF Compressor if the final file is larger than you want."], implementationStatus: "working-local", seoTitle: "PDF Merge - Combine PDF Files Online", seoDescription: "Merge PDF files online by combining multiple documents into one PDF. Reorder pages or files before you download the final merged document.", faq1: "What is a practical use case for PDF Merge?", faqAnswer1: "A practical use case is combining several related documents into one file before sending or printing them. People often merge resumes and supporting files, invoices for the same month, or scanned pages that belong in one packet.", faq2: "Should I split a file before merging?", faqAnswer2: "If one source PDF contains pages you do not need, splitting first can make the final merged file cleaner. Many people use PDF Split to separate only the needed pages and then merge those selected files into one document." }),
  makeTool({ name: "PDF Split", slug: "pdf-split", category: "pdf-tools", shortDescription: "Split one PDF into multiple files or separate pages.", longDescription: "PDF Split helps when a full document is too much and you only need part of it. You can separate one long PDF into individual pages, save a specific page range, or break a large file into smaller sections that are easier to send, print, or organize. This is useful for contracts, scanned documents, handbooks, forms, and slide exports. For example, a student might split only the chapter pages needed for revision, while an office worker might pull out one signed page from a larger file before sending it. A split file is often easier to share than a full document that includes unrelated material. If you want to combine selected pages again in a new order, PDF Merge is the natural next step, and PDF Compressor can help reduce the final size after you finish arranging the pages.", keywords: ["pdf split", "split pdf pages", "separate pdf"], howToUse: ["Upload a PDF file, such as a report, scan, handbook, or multi-page form.", "Choose the split method, for example single pages or a selected page range.", "Download the resulting PDF files and, if needed, merge the useful parts again with PDF Merge."], implementationStatus: "working-local", seoTitle: "PDF Split Online", seoDescription: "Split PDF files online with a lightweight browser-first workflow.", faq1: "When is PDF Split more useful than PDF Merge?", faqAnswer1: "PDF Split is more useful when the main task is removing pages or isolating part of a document. If you already know which pages matter and want to trim the rest away, splitting first is often the cleaner step.", faq2: "Can splitting help with large PDF files?", faqAnswer2: "Yes. Breaking a large file into smaller parts can make it easier to upload, email, or review. After splitting, you can keep only the pages you need and discard the rest from your workflow." }),
  makeTool({ name: "PDF to Word", slug: "pdf-to-word", category: "pdf-tools", shortDescription: "Convert PDF text into an editable Word document you can download as DOCX.", longDescription: "PDF to Word is useful when you have a text-based PDF that needs editing instead of just reading. It can help with letters, reports, forms, notes, and other documents where you want to update wording, reuse paragraphs, or save time compared with retyping everything from scratch. A teacher might convert a worksheet before changing dates and instructions, a business owner might update an older proposal, and a student might reuse text from class notes in a new draft. For example, a clean typed PDF can often become a DOCX file that is easier to revise in Word-compatible apps. Complex layouts, scanned pages, and image-heavy files may still need cleanup afterward, so it helps to review the result carefully. If your source file is a scan, PDF OCR may be a better starting point, and Word to PDF is useful when you need to turn the edited DOCX back into a shareable PDF.", keywords: ["pdf to word", "pdf to docx", "convert pdf to word", "editable pdf to word", "pdf to word converter"], howToUse: ["Upload a PDF with readable text, such as a typed report, letter, or document you want to revise.", "Convert the file to Word format and wait for the DOCX output to be prepared.", "Download the DOCX file, review the formatting, and edit the text in your preferred Word-compatible app."], implementationStatus: "reduced-scope-local", seoTitle: "PDF to Word Converter - Convert PDF to DOCX Online", seoDescription: "Convert PDF text to Word online and download an editable DOCX file. Best for text-based PDFs that need quick editing or reuse.", statusNote: "Best for text-based PDFs.", faq1: "What kind of PDF works best for PDF to Word conversion?", faqAnswer1: "Typed, text-based PDFs usually work best because the words can be read more cleanly and placed into an editable document. Forms, reports, and letters with straightforward layouts often convert more smoothly than scans or design-heavy pages.", faq2: "What should I do after converting PDF to Word?", faqAnswer2: "Open the DOCX file and review headings, tables, spacing, and page breaks before sharing it. Many people make their edits in Word and then use Word to PDF afterward if they need a polished PDF again." }),
  makeTool({ name: "Word to PDF", slug: "word-to-pdf", category: "pdf-tools", shortDescription: "Convert a Word document to PDF for sharing, printing, or saving a final copy.", longDescription: "Word to PDF is useful when a document is finished and you want a version that is easier to share, print, or keep as a final copy. A PDF is often the better format for resumes, proposals, letters, invoices, handouts, and reports because it is less likely to shift around when opened elsewhere. For example, a job seeker might convert a resume before applying, or a freelancer might turn a proposal into a PDF before sending it to a client. This page helps you upload a DOCX file, convert it, and download a PDF version that is ready for distribution. The result is usually strongest with clean, text-based Word documents, while complex layouts and design-heavy pages may need a quick review afterward. If you later need to edit a PDF again, PDF to Word covers the reverse workflow so the two tools work well together.", keywords: ["word to pdf", "docx to pdf", "convert word to pdf", "word document to pdf", "word to pdf converter"], howToUse: ["Upload your .docx file, such as a resume, letter, proposal, or report.", "Convert the document to PDF and wait for the export to finish.", "Download the finished PDF, review the layout, and use it for sharing, printing, or storing a final version."], implementationStatus: "reduced-scope-local", seoTitle: "Word to PDF Converter - Convert DOCX to PDF Online", seoDescription: "Convert Word to PDF online and download a shareable PDF file. Great for DOCX documents you want to print, send, or save as a final copy.", statusNote: "Complex layouts can look different in the final PDF.", faq1: "Why do people convert Word documents to PDF?", faqAnswer1: "People usually convert Word documents to PDF when they want a more stable version for sending, printing, or keeping as a final copy. It is common for resumes, reports, invoices, and documents that should look consistent on different devices.", faq2: "What should I check after converting Word to PDF?", faqAnswer2: "Review page breaks, headings, tables, and any special fonts or spacing before you share the file. Straightforward documents usually look cleaner than design-heavy files, so a quick final check is always worth it." }),
  makeTool({ name: "PDF Compressor", slug: "pdf-compressor", category: "pdf-tools", shortDescription: "Compress PDF files to reduce size and make them easier to upload, store, or share.", longDescription: "PDF Compressor helps when a document is simply too large for an email attachment, upload form, or storage limit. Instead of recreating the file, you can upload the PDF, run compression, and compare the result before downloading the lighter version. This is useful for scanned forms, reports, contracts, class notes, and image-heavy PDFs that take longer to send than they should. For example, a scanned multi-page file may be difficult to email at its original size, but a compressed copy can be easier to share while still staying readable. Results vary from file to file because some PDFs contain large images while others mostly contain text. If your file includes extra pages you do not need, PDF Split can help first, and PDF Merge is useful when you want to reorganize several smaller files into one final document after compression.", keywords: ["pdf compressor", "compress pdf", "reduce pdf size", "make pdf smaller", "pdf size reducer"], howToUse: ["Upload your PDF file, such as a scanned document, report, invoice set, or image-heavy handout.", "Compress the PDF and compare the smaller version with the original to make sure it still looks right.", "Download the reduced file and use PDF Split or PDF Merge afterward if you also need to reorganize pages."], implementationStatus: "reduced-scope-local", seoTitle: "PDF Compressor - Reduce PDF File Size Online", seoDescription: "Compress PDF files online to reduce file size for email, uploads, and storage. Download the smaller PDF and compare the results.", statusNote: "Results can vary from file to file.", faq1: "What kinds of PDFs usually benefit most from compression?", faqAnswer1: "Scanned PDFs, image-heavy reports, and exported slide files often benefit the most because large visuals take up a lot of space. Text-only documents may still shrink, but usually by a smaller amount.", faq2: "Should I compress or split a PDF first?", faqAnswer2: "If the document contains pages you do not need, splitting first can give you a cleaner and often smaller result. If you need the full document but just want easier sharing, compressing first is the straightforward option." }),
  makeTool({ name: "PDF to JPG", slug: "pdf-to-jpg", category: "pdf-tools", shortDescription: "Convert PDF pages into JPG images with a local page-rendering workflow.", longDescription: "PDF to JPG is useful when you want the content of a PDF as image files instead of a document. That can help with sharing one page as a picture, adding a page to a slide deck, posting a page preview on social media, or reusing a flyer, certificate, or worksheet as an image. For example, a teacher might export one worksheet page to send in a chat, while a designer might turn a PDF proof into JPGs for quick review. Each selected page can become its own image, which makes it easier to save only what you need. If you later want to turn the images back into a document, JPG to PDF is the natural follow-up, and PDF Split can help first if you want to isolate only a few pages from a longer file.", keywords: ["pdf to jpg", "convert pdf to image", "pdf to jpeg"], howToUse: ["Upload a PDF file, such as a flyer, handout, certificate, or multi-page report.", "Choose which pages to export, especially if you only need one section from the document.", "Download one JPG per page or the selected pages, then continue to JPG to PDF later if you want to rebuild a document."], implementationStatus: "working-local", seoTitle: "PDF to JPG Converter Online", seoDescription: "Convert PDF pages to JPG online with a browser-side page export workflow.", faq1: "Why would I convert a PDF page to JPG?", faqAnswer1: "People often convert a PDF page to JPG when they want to share it as an image, add it to a presentation, upload it where documents are less convenient, or quickly preview one page without sending the whole PDF.", faq2: "Should I split the PDF before converting to JPG?", faqAnswer2: "If the file is long and you only need a few pages, splitting first can make the workflow cleaner. It helps you focus on the right pages before turning them into images." }),
  makeTool({ name: "JPG to PDF", slug: "jpg-to-pdf", category: "pdf-tools", shortDescription: "Turn one or more JPG files into a PDF document.", longDescription: "JPG to PDF is useful when several images need to become one document that is easier to share, print, or store. This is common with scanned pages, phone photos of forms, receipts, notes, certificates, and product images that need to travel as a single file. For example, you might photograph several pages with your phone and turn them into one PDF before emailing them, or combine multiple JPG handouts into a single study file. Instead of sending each image separately, you can upload them, arrange the order, and download one finished PDF. If your images need trimming first, Crop Image can help, and PDF Merge is useful later if you want to combine the new PDF with other documents in the same workflow.", keywords: ["jpg to pdf", "image to pdf", "convert jpg to pdf"], howToUse: ["Upload one or more JPG files, such as scanned pages, receipts, notes, or photos you want in one document.", "Arrange page order if needed so the final PDF reads in the right sequence.", "Create and download the PDF, then use PDF Merge afterward if you want to combine it with other PDF files."], implementationStatus: "working-local", seoTitle: "JPG to PDF Converter Online", seoDescription: "Convert JPG images to PDF online with a browser-first document builder workflow.", faq1: "What is a common use case for JPG to PDF?", faqAnswer1: "A common use case is turning several scanned or photographed pages into one document for email, printing, or record keeping. It is also useful for receipts, notes, and image-based forms that are easier to manage as a single PDF.", faq2: "Should I edit the images before turning them into a PDF?", faqAnswer2: "If the images need trimming, rotation, or resizing, editing first usually gives a cleaner final document. Many people crop screenshots or adjust photos before combining them into one PDF." }),
  makeTool({ name: "PDF Page Rotator", slug: "pdf-page-rotator", category: "pdf-tools", shortDescription: "Rotate selected PDF pages or the full document.", longDescription: "PDF Page Rotator rotates all pages or selected pages while keeping the route structure, metadata, and supporting content consistent across the site. It is a focused browser-first workflow for fixing page orientation.", keywords: ["pdf page rotator", "rotate pdf pages", "turn pdf pages"], howToUse: ["Upload a PDF.", "Select the pages and angle.", "Export the rotated PDF."], implementationStatus: "working-local", seoTitle: "PDF Page Rotator Online", seoDescription: "Rotate PDF pages online with a browser-first workflow for fixing page orientation.", faq1: "Can I rotate only one page?", faqAnswer1: "Yes. You can rotate only the pages you choose.", faq2: "Will text remain searchable?", faqAnswer2: "In a proper PDF-page rotation workflow, yes." }),
  makeTool({ name: "PDF Page Number Adder", slug: "pdf-page-number-adder", category: "pdf-tools", shortDescription: "Add page numbers to a PDF with a browser-side workflow.", longDescription: "PDF Page Number Adder lets users choose number placement and export an updated file in a local PDF page-numbering workflow. It keeps the experience straightforward while preserving related content and SEO coverage.", keywords: ["add page numbers to pdf", "pdf page number adder", "pdf numbering"], howToUse: ["Upload a PDF.", "Choose where the page numbers should appear.", "Apply and download the updated PDF."], implementationStatus: "working-local", seoTitle: "PDF Page Number Adder Online", seoDescription: "Add page numbers to PDF files online with a browser-side workflow.", faq1: "Can numbering start from a custom page?", faqAnswer1: "Yes. You can start numbering from a custom page when needed.", faq2: "Will the original file stay unchanged?", faqAnswer2: "Yes. The tool exports a new numbered copy." }),
  makeTool({ name: "Protect PDF", slug: "protect-pdf", category: "pdf-tools", shortDescription: "Add a password to a PDF and download the protected file.", longDescription: "Protect PDF lets you add a password to a PDF for safer sharing and storage. If the tool is unavailable, the page will let you know clearly.", keywords: ["protect pdf", "password protect pdf", "encrypt pdf"], howToUse: ["Upload a PDF file.", "Enter a password.", "Download the protected PDF."], implementationStatus: "reduced-scope-local", seoTitle: "Protect PDF Online", seoDescription: "Protect PDF files online by adding a password and downloading the result.", statusNote: "This tool may not be available on every site setup.", faq1: "Does this add a real password to the PDF?", faqAnswer1: "Yes, when the tool is available it creates a password-protected PDF.", faq2: "What if the tool is unavailable?", faqAnswer2: "If protection is not available, the page will show a clear message instead of trying to process the file." }),
  makeTool({ name: "Word Counter", slug: "word-counter", category: "text-tools", shortDescription: "Count words in pasted or typed text.", longDescription: "Word Counter is a simple browser-side text utility that fits this project especially well. The page is ready for a local implementation that updates counts in real time as the user types or pastes text.", keywords: ["word counter", "count words online", "text word count"], howToUse: ["Paste or type text.", "Review the live word count.", "Adjust your content as needed."], implementationStatus: "working-local", seoTitle: "Word Counter Online", seoDescription: "Count words online with a simple browser-based text tool.", faq1: "Does the count update live?", faqAnswer1: "That is the intended local behavior for this tool.", faq2: "Can I use it for SEO writing?", faqAnswer2: "Yes. Word counting is useful for outlines, article drafts, and content reviews." }),
  makeTool({ name: "Character Counter", slug: "character-counter", category: "text-tools", shortDescription: "Count characters with and without spaces for writing limits and short-form content.", longDescription: "Character Counter helps when a message, caption, title, description, or form field has a length limit and you want to stay within it before posting or submitting. It is useful for social updates, ad copy, product fields, page titles, meta descriptions, and any short text that needs to fit a specific space. For example, a writer might check a social caption before publishing, or a site owner might review a title field that should stay concise. This page is different from Word Counter because the focus is every individual character, not the number of words in the text.", keywords: ["character counter", "count characters", "letter counter"], howToUse: ["Enter or paste the text you want to measure, such as a caption, title, description, or short message.", "Review the total character count and the version without spaces if that is the limit you are working with.", "Adjust the text until it fits the target length, or switch to Word Counter if your real limit is based on words instead."], implementationStatus: "working-local", seoTitle: "Character Counter Online", seoDescription: "Count characters online with a fast browser-first text utility.", faq1: "Can spaces be excluded from the count?", faqAnswer1: "Yes. That is useful when a platform or writing limit counts only visible characters and ignores spaces.", faq2: "Is this helpful for social post limits?", faqAnswer2: "Yes. It is useful whenever a post, caption, or message needs to stay within a fixed character limit." }),
  makeTool({ name: "Case Converter", slug: "case-converter", category: "text-tools", shortDescription: "Switch text between upper, lower, title, and sentence case.", longDescription: "Case Converter helps when text is written in the wrong style and needs quick cleanup before you share, publish, or reuse it. It is useful for headings, pasted notes, product names, lists, email drafts, and copied content that arrives in all caps, all lowercase, or another inconsistent format. For example, someone might fix a heading copied from a spreadsheet, or tidy a paragraph that was pasted from a message in the wrong case. This page is different from Text Replace Tool because it changes the writing style of the text as a whole rather than swapping one word for another.", keywords: ["case converter", "uppercase lowercase", "title case converter"], howToUse: ["Paste the text you want to clean up, such as a heading, note, list, or paragraph.", "Choose the case style that best fits the result you want, such as uppercase, lowercase, title case, or sentence case.", "Copy the converted text, or continue to Text Replace Tool if the wording itself still needs editing."], implementationStatus: "working-local", seoTitle: "Case Converter Online", seoDescription: "Convert text case online with a browser-based uppercase, lowercase, title case, and sentence case tool.", faq1: "When is a case converter useful?", faqAnswer1: "It is useful when pasted text looks inconsistent or is written in the wrong style for a heading, label, sentence, or formatted list.", faq2: "Can title case be perfect for every language?", faqAnswer2: "Not always. Title-case rules vary, so it helps to do a quick final read before publishing." }),
  makeTool({ name: "Remove Duplicate Lines", slug: "remove-duplicate-lines", category: "text-tools", shortDescription: "Clean a text list by removing repeated lines while keeping one copy.", longDescription: "Remove Duplicate Lines is useful when a pasted list contains repeated entries and you want a cleaner version without sorting or editing it by hand. It works well for email lists, keyword lists, product codes, task items, notes, and exported text where the same line appears more than once. For example, someone might clean a copied list of names before sharing it, or remove repeated items from a long keyword draft. This page is different from Text Sorter because the goal is to remove repetition, not to change the order for presentation.", keywords: ["remove duplicate lines", "dedupe lines", "unique line tool"], howToUse: ["Paste the text with one item per line, such as names, tags, codes, or list entries.", "Run the duplicate removal step and review the cleaned result.", "Copy the final list, or use Text Sorter afterward if you also want the remaining lines arranged in order."], implementationStatus: "working-local", seoTitle: "Remove Duplicate Lines Online", seoDescription: "Remove duplicate lines online with a lightweight browser-first text cleanup tool.", faq1: "Will line order be preserved?", faqAnswer1: "Yes. In most cases, the first copy of each line should stay in place while repeated copies are removed.", faq2: "What is a common use case for removing duplicate lines?", faqAnswer2: "A common use case is cleaning copied lists of names, keywords, tags, or IDs before sharing, importing, or working with them further." }),
  makeTool({ name: "Text Sorter", slug: "text-sorter", category: "text-tools", shortDescription: "Sort lines of text alphabetically in ascending or descending order.", longDescription: "Text Sorter helps when a line-based list is easier to review once it is arranged in order. It is useful for names, tags, topics, product entries, simple inventories, notes, and copied text lists that become easier to scan after sorting. For example, someone might alphabetize a tag list before publishing, or sort a batch of names before checking for missing entries. This page is different from Remove Duplicate Lines because it changes the order of the list instead of removing repeated items from it.", keywords: ["text sorter", "sort text lines", "alphabetize text"], howToUse: ["Paste the line-based text you want to organize, such as names, tags, or list entries.", "Choose ascending or descending order depending on how you want the list to read.", "Copy the sorted output, or use Remove Duplicate Lines afterward if you also need to clean repeated entries."], implementationStatus: "working-local", seoTitle: "Text Sorter Online", seoDescription: "Sort lines of text online with a browser-based alphabetical sorting tool.", faq1: "When is a text sorter useful?", faqAnswer1: "It is useful when a list is easier to review, share, or compare after the lines are arranged in order.", faq2: "Can I sort numeric values too?", faqAnswer2: "Yes, but number-like text can sort differently from plain words, so it helps to check the result if the list mixes numbers and text." }),
];
const toolDraftsPart2: ToolDraft[] = [
  makeTool({ name: "JSON Formatter", slug: "json-formatter", category: "developer-tools", shortDescription: "Format, validate, and pretty-print JSON so it is easier to read and fix.", longDescription: "JSON Formatter is helpful any time raw JSON is hard to scan, difficult to debug, or too messy to share with someone else. You can paste a compact response, format it into readable indentation, and quickly spot missing commas, broken quotes, or invalid structure before copying it back into your workflow. This is useful for API responses, config files, exported data, webhook payloads, and examples used in guides or documentation. For example, a single-line JSON response from an app can become much easier to review after formatting, and a malformed object can be easier to fix when the structure is clear. If you need to keep working with the same data afterward, JSON to CSV Converter, CSV to JSON Converter, and JSON Schema Validator make natural next steps from this page.", keywords: ["json formatter", "json validator", "pretty print json", "format json", "json beautifier", "json parser"], howToUse: ["Paste your JSON into the editor, whether it came from an app response, config file, or exported data sample.", "Format or validate the content to make the structure easier to read and any problems easier to spot.", "Copy the cleaned JSON or fix any errors shown before moving on to related tools such as JSON Schema Validator or JSON to CSV Converter."], implementationStatus: "working-local", seoTitle: "JSON Formatter - Format and Validate JSON Online", seoDescription: "Format and validate JSON online with a clean editor that helps you pretty-print JSON, spot errors, and copy the fixed result quickly.", faq1: "What is a simple example of using a JSON formatter?", faqAnswer1: "A simple example is pasting a compact API response that appears on one long line and formatting it so each object, array, and key is easier to inspect. That makes review and correction much faster than reading raw compact JSON.", faq2: "Should I format JSON before sharing it with someone else?", faqAnswer2: "In many cases, yes. Formatted JSON is easier to read in discussions, examples, and documentation because the structure is visible at a glance instead of being buried in a single long line." }),
  makeTool({ name: "Base64 Encoder", slug: "base64-encoder", category: "developer-tools", shortDescription: "Encode plain text into Base64 format for testing, transfer, or quick data handling.", longDescription: "Base64 Encoder is useful when you need a text value in Base64 form for testing, embeds, token work, or data transfer examples. It can help when an app, config, or example expects an encoded string instead of the original plain text. For example, a developer might encode a short value for a demo request, or check how a simple text string will look once encoded. This page is different from Base64 Decoder because it creates the encoded version rather than turning one back into readable text.", keywords: ["base64 encoder", "encode base64", "text to base64"], howToUse: ["Paste or type the plain text you want to encode.", "Run the encoding step and review the Base64 output.", "Copy the result for your example, request, or test workflow, or use Base64 Decoder later if you need to reverse it."], implementationStatus: "working-local", seoTitle: "Base64 Encoder Online", seoDescription: "Encode text to Base64 online with a simple browser-based developer tool.", faq1: "Is Base64 encryption?", faqAnswer1: "No. Base64 changes the representation of the text, but it is not a security method.", faq2: "Can encoded output be decoded later?", faqAnswer2: "Yes. A valid Base64 string can be turned back into readable text with a decoder." }),
  makeTool({ name: "Base64 Decoder", slug: "base64-decoder", category: "developer-tools", shortDescription: "Decode Base64 strings back into readable text.", longDescription: "Base64 Decoder is useful when you have an encoded string and want to see the original readable value again. It helps with token work, debugging, copied config values, test data, and examples where the content was stored or shared in Base64 form. For example, a developer might inspect an encoded sample from a request, or check whether a copied Base64 value still decodes correctly. This page is different from Base64 Encoder because it reverses the encoded string instead of creating one.", keywords: ["base64 decoder", "decode base64", "base64 to text"], howToUse: ["Paste the Base64 string you want to inspect.", "Run the decoding step and review the readable output.", "Copy the decoded text, or return to Base64 Encoder if you need to create a new encoded value instead."], implementationStatus: "working-local", seoTitle: "Base64 Decoder Online", seoDescription: "Decode Base64 text online with a browser-first developer utility.", faq1: "What happens if the Base64 value is invalid?", faqAnswer1: "The tool should show a clear error or warning instead of guessing at the output.", faq2: "What is a common use case for Base64 decoding?", faqAnswer2: "A common use case is checking what an encoded sample, config value, or test string says before using it elsewhere." }),
  makeTool({ name: "CSS Minifier", slug: "css-minifier", category: "developer-tools", shortDescription: "Minify CSS by removing extra whitespace and comments.", longDescription: "CSS Minifier is a realistic browser-side tool as long as the implementation is clear about using a reduced-scope minification approach instead of pretending to be a full production bundler. The page is ready for that honest local version.", keywords: ["css minifier", "minify css", "compress css"], howToUse: ["Paste CSS code.", "Run the minify action.", "Copy the compact output."], implementationStatus: "working-local", seoTitle: "CSS Minifier Online", seoDescription: "Minify CSS online with a browser-side tool and clearly labeled lightweight scope.", statusNote: "Reduced-scope local version only; useful for cleanup, not a replacement for full build-pipeline optimization.", faq1: "Will this be as advanced as a build-tool minifier?", faqAnswer1: "No. A browser-side version can be useful, but it should be labeled as a lightweight minifier.", faq2: "Can comments be removed?", faqAnswer2: "Yes. That is a typical part of CSS minification." }),
  makeTool({ name: "HTML Minifier", slug: "html-minifier", category: "developer-tools", shortDescription: "Minify HTML with a clearly scoped browser-side cleanup workflow.", longDescription: "HTML Minifier can be useful locally for trimming whitespace and basic markup cleanup, but a browser-side version should be labeled honestly as a lightweight minifier. This registry item reflects that scope clearly.", keywords: ["html minifier", "minify html", "compress html"], howToUse: ["Paste HTML markup.", "Run the minify action.", "Copy the cleaned output."], implementationStatus: "working-local", seoTitle: "HTML Minifier Online", seoDescription: "Minify HTML online with a browser-side tool and transparent lightweight scope.", statusNote: "Reduced-scope local version only; intended for simple markup cleanup rather than full production parsing.", faq1: "Will this preserve every edge case?", faqAnswer1: "A simple local minifier may not cover every advanced markup edge case.", faq2: "Why is this reduced-scope?", faqAnswer2: "Because browser-only cleanup is useful, but it is not identical to a full production HTML optimizer." }),
  makeTool({ name: "URL Encoder", slug: "url-encoder", category: "developer-tools", shortDescription: "Encode URL components safely for links and query strings.", longDescription: "URL Encoder helps when text needs to be made safe for a query string, link parameter, or other URL component. It is useful when spaces, symbols, or punctuation would otherwise break the result or be read incorrectly by another tool. For example, a developer might encode a search term before adding it to a URL, or check how a value should appear inside a query parameter. This page is different from URL Decoder because it prepares text for a URL instead of turning encoded text back into a readable form.", keywords: ["url encoder", "percent encode url", "encode url component"], howToUse: ["Paste the text or URL component you want to make safe for a link or query string.", "Run the encoding step and review the result.", "Copy the encoded output for your URL, or use URL Decoder if you need to read an encoded value instead."], implementationStatus: "working-local", seoTitle: "URL Encoder Online", seoDescription: "Encode URL components online with a lightweight browser-first developer tool.", faq1: "Should I encode a full URL or just one part of it?", faqAnswer1: "In most cases, encoding the specific parameter or component is the safer choice than encoding the whole URL blindly.", faq2: "Does this require an API?", faqAnswer2: "No. URL encoding is a straightforward text transformation." }),
  makeTool({ name: "URL Decoder", slug: "url-decoder", category: "developer-tools", shortDescription: "Decode percent-encoded URL text into readable form.", longDescription: "URL Decoder is useful when a link, query string, or copied value contains encoded symbols and you want to read the original text more clearly. It helps with debugging URLs, checking parameters, reviewing redirects, and inspecting copied encoded text from apps or browser tools. For example, a marketer might inspect a campaign parameter, or a developer might decode a copied query value before editing it. This page is different from URL Encoder because it reveals the readable text instead of preparing it for a URL.", keywords: ["url decoder", "decode url", "percent decode"], howToUse: ["Paste the encoded text or URL component you want to read more clearly.", "Run the decoding step and review the readable result.", "Copy the decoded text, or switch to URL Encoder if you need to turn plain text back into a safe URL value."], implementationStatus: "working-local", seoTitle: "URL Decoder Online", seoDescription: "Decode URL-encoded text online with a browser-first developer utility.", faq1: "What if the input is malformed?", faqAnswer1: "The tool should show a clear error or warning instead of pretending the text decoded correctly.", faq2: "When is URL decoding useful?", faqAnswer2: "It is useful when you need to inspect query parameters, encoded search terms, or copied values from links and redirects." }),
  makeTool({ name: "Regex Tester", slug: "regex-tester", category: "developer-tools", shortDescription: "Test regular expressions against sample text and check matches before using them elsewhere.", longDescription: "Regex Tester helps when you want to try a pattern on sample text before placing it into code, validation rules, or search-and-replace work. It is useful for matching IDs, checking formats, finding repeated structures, and catching mistakes in a pattern before it reaches a larger workflow. For example, a developer might test a pattern against a list of emails or IDs, or check why one expression matches too much text. This page is different from Text Compare Tool because it is for pattern matching and validation, not for comparing two versions of text.", keywords: ["regex tester", "regular expression tester", "pattern matcher"], howToUse: ["Enter the regular expression you want to test.", "Add sample text and run the match check.", "Review the matches or errors before using the pattern in your code, form rule, or text workflow."], implementationStatus: "working-local", seoTitle: "Regex Tester Online", seoDescription: "Test regular expressions online with a browser-based developer tool.", faq1: "What kind of result should a regex tester show?", faqAnswer1: "It should show the matches clearly and make it obvious when the pattern is invalid or behaves differently from what you expected.", faq2: "When is a regex tester most useful?", faqAnswer2: "It is most useful before you put a pattern into code, validation logic, or a larger workflow where a mistake would be harder to spot." }),
  makeTool({ name: "Password Generator", slug: "password-generator", category: "generator-tools", shortDescription: "Generate strong random passwords locally in the browser.", longDescription: "Password Generator is for creating new passwords quickly without reusing weak ones you have seen before. It is useful when setting up a new account, replacing an old password, or creating a one-time login for a service, device, or shared tool. Instead of inventing something easy to guess, you can choose the length and character style, generate a fresh password, and copy it into your password manager or sign-up form. For example, someone creating accounts for banking, shopping, and work logins may want different passwords for each account instead of repeating the same pattern everywhere. This page focuses on password creation, while Secure Password Strength Checker is the better nearby tool when you want to inspect an existing password instead of generating a new one.", keywords: ["password generator", "random password", "secure password"], howToUse: ["Choose password options such as length and which character types you want to include.", "Generate a new password and review whether it fits the account or service you are setting up.", "Copy the result and store it safely, or use Secure Password Strength Checker if you want to review a different password."], implementationStatus: "working-local", seoTitle: "Password Generator Online", seoDescription: "Generate secure passwords online with a browser-first random password tool.", faq1: "When should I use a password generator instead of making one myself?", faqAnswer1: "Use a password generator when you want a fresh password that does not follow an obvious personal pattern. It is especially helpful for important accounts where reused or predictable passwords would be risky.", faq2: "What makes a generated password more useful?", faqAnswer2: "A useful password is long enough for the account you are protecting and different from your other passwords. Many people generate one here and then save it in a password manager so they do not need to memorize every detail." }),
  makeTool({ name: "QR Code Generator", slug: "qr-code-generator", category: "generator-tools", shortDescription: "Create QR codes from links, text, contact details, and other short content.", longDescription: "QR Code Generator is useful when you want people to scan something instead of typing it. You can turn a website link, short message, contact details, event information, or simple product content into a QR code that is ready for print or digital sharing. This works well for menus, posters, flyers, packaging, classroom handouts, table signs, and business cards. For example, a restaurant might create a code for an online menu, a shop might link to a product page, and an event organizer might share directions or a registration page. After generating the code, you can download the image and place it wherever scanning would be faster than manual entry. If you want to test the result later, the related QR Code Scanner page is a useful next stop.", keywords: ["qr code generator", "create qr code", "make qr code", "qr code maker", "url qr code generator"], howToUse: ["Enter a URL, text, contact details, or other short content you want people to scan.", "Generate the QR code and check that the preview matches the information you intend to share.", "Download the QR code image for printing or posting, and test it with QR Code Scanner if you want to double-check the result."], implementationStatus: "working-local", seoTitle: "QR Code Generator - Create QR Codes Online", seoDescription: "Create QR codes online for URLs, text, and contact details. Generate a QR code in seconds and download the image for print or sharing.", faq1: "What is a practical example of a QR code?", faqAnswer1: "A practical example is putting a QR code on a flyer so people can open a website or registration page without typing the address. It is also common on menus, posters, packaging, and business cards.", faq2: "How do I make sure a QR code is useful?", faqAnswer2: "Keep the content clear and worth scanning, and test the final code before printing or sharing it widely. A short link, contact card, or simple message usually creates a cleaner and more practical result than cluttered or overly long content." }),
  makeTool({ name: "UUID Generator", slug: "uuid-generator", category: "generator-tools", shortDescription: "Generate one or more UUIDs for development and data tasks.", longDescription: "UUID Generator is useful when you need unique-looking identifiers for records, examples, forms, testing, or data setup. Instead of typing placeholder IDs by hand, you can create one or many UUID values and copy them into your work right away. This is common in sample datasets, app testing, imported records, demo content, and any workflow where separate items should not all share the same identifier. For example, someone preparing test entries for an app might generate a batch of UUIDs before pasting them into a spreadsheet or mock request. This page is focused on creating IDs, while UUID Validator is the better nearby tool when you already have a UUID and want to check whether it is valid.", keywords: ["uuid generator", "guid generator", "random uuid"], howToUse: ["Set how many UUIDs you want to create for your list, sample data, or testing workflow.", "Generate the values and review the output if you need only one or a larger batch.", "Copy the results, or use UUID Validator later if you want to check a UUID you already have."], implementationStatus: "working-local", seoTitle: "UUID Generator Online", seoDescription: "Generate UUIDs online with a browser-based tool for development and testing workflows.", faq1: "What is a practical example of using a UUID generator?", faqAnswer1: "A practical example is creating unique IDs for sample app data, imported records, or test entries before you paste them into a table, form, or request payload. It saves time compared with inventing placeholder IDs manually.", faq2: "How is UUID Generator different from UUID Validator?", faqAnswer2: "UUID Generator creates new values, while UUID Validator checks whether an existing value matches the expected UUID format. They work well together, but they solve different tasks." }),
  makeTool({ name: "Random Name Generator", slug: "random-name-generator", category: "generator-tools", shortDescription: "Generate random names from a local curated name list.", longDescription: "Random Name Generator is useful when you need placeholder names quickly for examples, mockups, drafts, classroom exercises, or creative brainstorming. You can generate a short list of names without pulling data from a live service, which makes the page more predictable for quick idea work. For example, a writer might use it to name background characters, a teacher might create sample names for worksheets, and a designer might fill a mock profile card before real content is ready. This page is focused on person-style names, while Random Username Generator is better when you need handle-style ideas for social or account names instead of ordinary names.", keywords: ["random name generator", "fake name generator", "name picker"], howToUse: ["Choose how many names you want for your draft, mockup, story, or worksheet.", "Generate a random list and review the options that fit your tone or project best.", "Copy the names you need, or switch to Random Username Generator if you want account-style name ideas instead."], implementationStatus: "working-local", seoTitle: "Random Name Generator Online", seoDescription: "Generate random names online with a local bundled-list approach and no database requirement.", faq1: "When is a random name generator useful?", faqAnswer1: "It is useful when you need placeholder names for drafts, examples, classroom material, mock accounts, or creative work. It helps you move faster when real names are not important yet.", faq2: "How is Random Name Generator different from Random Username Generator?", faqAnswer2: "Random Name Generator gives you person-style names, while Random Username Generator is better for handles, login names, and more account-like options. The two pages are related, but they are meant for different naming tasks." }),
  makeTool({ name: "Random Number Generator", slug: "random-number-generator", category: "generator-tools", shortDescription: "Generate random numbers within a selected range.", longDescription: "Random Number Generator is useful when you need a quick pick from a range instead of choosing by hand. That can help with casual drawings, classroom activities, table assignments, game ideas, sample data, or simple decision-making where any valid number in the range will do. For example, you might choose a number between 1 and 100 for a quick game, generate several values for practice questions, or create a short list of random entries to test a form. This page is focused on number output, while Dice Roller is better when you want game-style roll results and Coin Flip Generator is better when the choice is just heads or tails.", keywords: ["random number generator", "number picker", "rng tool"], howToUse: ["Set the minimum and maximum values for the range you want to use.", "Choose how many numbers to generate and whether you want a short list or a single result.", "Copy the result list, or switch to Dice Roller or Coin Flip Generator if your choice fits those formats better."], implementationStatus: "working-local", seoTitle: "Random Number Generator Online", seoDescription: "Generate random numbers online with a browser-first range-based tool.", faq1: "What is a simple use case for a random number generator?", faqAnswer1: "A simple use case is picking a number for a casual game, classroom prompt, or quick decision. It is also useful for creating sample values when testing forms or examples.", faq2: "How is this different from Dice Roller?", faqAnswer2: "Random Number Generator lets you choose your own range, while Dice Roller is shaped around familiar game dice results. If you need a flexible custom range, this page is the better fit." }),
  makeTool({ name: "Age Calculator", slug: "age-calculator", category: "calculator-tools", shortDescription: "Calculate age from a birth date.", longDescription: "Age Calculator is a simple browser-side date math tool and a good match for the project’s architecture. The page is ready for a local UI that shows years, months, and days without any backend dependency.", keywords: ["age calculator", "calculate age", "date of birth calculator"], howToUse: ["Choose a birth date.", "Optionally set a comparison date.", "Review the age result."], implementationStatus: "working-local", seoTitle: "Age Calculator Online", seoDescription: "Calculate age online with a browser-first date-based calculator.", faq1: "Can it handle leap years?", faqAnswer1: "Yes. A proper browser-side implementation can calculate with real calendar dates.", faq2: "Can I use a custom compare date?", faqAnswer2: "Yes. That is part of the intended scope." }),
  makeTool({ name: "BMI Calculator", slug: "bmi-calculator", category: "calculator-tools", shortDescription: "Calculate body mass index from height and weight.", longDescription: "BMI Calculator helps when you want a quick body mass index result from height and weight values. It is useful for personal tracking, general wellness checks, schoolwork, and simple health-related forms where BMI is asked for as a screening number. For example, someone might check a BMI value after updating their weight, or compare results using metric and imperial measurements. This page is different from health advice pages because it gives a formula-based number, not medical guidance or a diagnosis.", keywords: ["bmi calculator", "body mass index calculator", "health calculator"], howToUse: ["Enter your height and weight values.", "Choose the unit system that matches the measurements you have.", "Review the BMI result and category label, then treat it as a general reference rather than a diagnosis."], implementationStatus: "working-local", seoTitle: "BMI Calculator Online", seoDescription: "Calculate BMI online with a simple browser-based body mass index tool.", faq1: "Is BMI medical advice?", faqAnswer1: "No. BMI is a general screening number and should not be treated as a diagnosis on its own.", faq2: "Can metric and imperial both be used?", faqAnswer2: "Yes. That is useful because people often have their measurements in different unit systems." }),
  makeTool({ name: "Loan Calculator", slug: "loan-calculator", category: "calculator-tools", shortDescription: "Estimate monthly loan payments and total repayment.", longDescription: "Loan Calculator is useful when you want a quick estimate before taking out a loan or comparing repayment options. It helps with personal loans, car loans, simple financing examples, and planning how different rates or terms affect the monthly payment. For example, someone might compare a shorter term with a lower monthly payment option before applying elsewhere. This page is different from a lender quote because it gives a planning estimate based on the numbers you enter, not an official offer.", keywords: ["loan calculator", "monthly payment calculator", "emi calculator"], howToUse: ["Enter the loan amount you want to estimate.", "Set the interest rate and repayment term you want to compare.", "Review the monthly payment and total repayment, then adjust the numbers to compare another scenario."], implementationStatus: "working-local", seoTitle: "Loan Calculator Online", seoDescription: "Estimate loan payments online with a browser-first repayment calculator.", faq1: "Will this match a lender quote exactly?", faqAnswer1: "Not always. It is best used as a planning estimate because real loan offers can include fees, rules, or terms not shown here.", faq2: "What is a practical use case for a loan calculator?", faqAnswer2: "A practical use case is comparing monthly payments across different loan amounts, rates, or terms before you decide which option feels manageable." }),
  makeTool({ name: "Percentage Calculator", slug: "percentage-calculator", category: "calculator-tools", shortDescription: "Solve common percentage formulas quickly.", longDescription: "Percentage Calculator helps with the everyday percentage questions people run into at school, work, shopping, and budgeting. It is useful for finding what percentage one number is of another, working out increases and decreases, and checking percentage-based comparisons without doing the math manually. For example, someone might calculate a discount, check a score change, or work out how much of a budget has already been used. This page is different from Discount Calculator because it covers several common percentage tasks instead of focusing only on sale pricing.", keywords: ["percentage calculator", "percent increase", "percent decrease"], howToUse: ["Enter the values for the percentage question you want to solve.", "Review the result and check whether the formula matches the kind of percentage task you have in mind.", "Adjust the numbers to compare scenarios, or use Discount Calculator if your question is specifically about sale pricing."], implementationStatus: "working-local", seoTitle: "Percentage Calculator Online", seoDescription: "Calculate percentages online with a browser-based percentage tool for common formulas.", faq1: "Can one page handle more than one percentage formula?", faqAnswer1: "Yes. That is helpful because people often need percent-of, increase, and decrease calculations in the same workflow.", faq2: "Will results be rounded?", faqAnswer2: "Usually yes, for readability, while still keeping enough precision to be useful." }),
  makeTool({ name: "Date Difference Calculator", slug: "date-difference-calculator", category: "calculator-tools", shortDescription: "Find the number of days between two dates.", longDescription: "Date Difference Calculator helps when you need the gap between two calendar dates without counting it by hand. It is useful for trip planning, project timing, deadlines, contracts, subscriptions, and schoolwork where the span between two dates matters more than a person’s age. For example, someone might count the days until a deadline, or check how long a project stage lasts between a start and finish date. This page is different from Age Calculator because it works with any two dates, not specifically with a birth date.", keywords: ["date difference calculator", "days between dates", "date duration calculator"], howToUse: ["Choose the start date and end date you want to compare.", "Review the difference result and check whether the span matches the planning or timing question you have.", "Use Age Calculator instead if the dates are part of an age-from-birth calculation."], implementationStatus: "working-local", seoTitle: "Date Difference Calculator Online", seoDescription: "Calculate the difference between two dates online with a simple browser-first date tool.", faq1: "Can it show total days?", faqAnswer1: "Yes. Total days are often the simplest way to understand the gap between two dates.", faq2: "Will it handle time zones?", faqAnswer2: "A date-only calculator should stay focused on calendar dates and make that assumption clear." }),
  makeTool({ name: "Length Converter", slug: "length-converter", category: "converter-tools", shortDescription: "Convert between common length and distance units.", longDescription: "Length Converter is for measurements such as height, width, room size, travel distance, and object dimensions. It is useful when you have one unit and need another without doing the math manually. For example, someone following furniture dimensions may want inches and centimeters, a traveler may compare miles and kilometers, and a student may switch meters to feet for homework or planning. This page is focused on physical distance and size, while Weight Converter is for mass, Temperature Converter is for heat scales, and Time Converter is for durations. Keeping those jobs separate makes each converter easier to use for the right task.", keywords: ["length converter", "distance converter", "meters to feet"], howToUse: ["Enter a value such as a height, width, room size, or travel distance.", "Choose the source unit and the target unit you want to compare.", "Read the converted result and, if needed, continue to another converter that matches a different kind of measurement."], implementationStatus: "working-local", seoTitle: "Length Converter Online", seoDescription: "Convert length units online with a browser-first distance conversion tool.", faq1: "What is a common use case for Length Converter?", faqAnswer1: "A common use case is switching between metric and imperial measurements for everyday tasks such as checking room dimensions, comparing product sizes, or converting a person’s height into another unit.", faq2: "How is Length Converter different from Time Converter or Weight Converter?", faqAnswer2: "Length Converter handles physical distance and size only. Time Converter is for durations such as seconds and hours, while Weight Converter is for mass units such as kilograms and pounds." }),
  makeTool({ name: "Weight Converter", slug: "weight-converter", category: "converter-tools", shortDescription: "Convert between common weight and mass units.", longDescription: "Weight Converter is for mass and weight values such as body weight, package weight, recipe measurements, and product quantities. It helps when a value is given in one unit but the person reading it needs another. For example, a shopper may want to compare kilograms and pounds, a seller may convert package weight for shipping notes, and someone following a recipe may need a different unit than the one shown. This page is focused on weight and mass only, which makes it different from Length Converter for size, Temperature Converter for heat, and Time Converter for durations.", keywords: ["weight converter", "mass converter", "kg to lb"], howToUse: ["Enter a weight value such as a package amount, recipe quantity, or personal measurement.", "Pick the source and target units you want to compare.", "Review the converted result and switch to another converter if you are working with a different type of measurement."], implementationStatus: "working-local", seoTitle: "Weight Converter Online", seoDescription: "Convert weight units online with a simple browser-based mass conversion tool.", faq1: "What is a practical example of using Weight Converter?", faqAnswer1: "A practical example is converting kilograms to pounds for shipping, shopping, or personal tracking. It is also useful when recipes, product labels, or forms use a different unit than the one you normally read.", faq2: "How is Weight Converter different from Length Converter?", faqAnswer2: "Weight Converter deals with mass values such as kilograms and pounds, while Length Converter deals with size and distance values such as meters and feet. They may look similar, but they solve different measurement problems." }),
  makeTool({ name: "Temperature Converter", slug: "temperature-converter", category: "converter-tools", shortDescription: "Convert temperatures between Celsius, Fahrenheit, and Kelvin.", longDescription: "Temperature Converter is for weather readings, cooking temperatures, science work, and everyday checks where one heat scale needs to become another. It is especially useful when one source uses Celsius and another uses Fahrenheit, or when a scientific context needs Kelvin. For example, someone reading an oven guide may need to switch from Fahrenheit to Celsius, while a student may need Kelvin for a class exercise. This page is focused on heat scales only, which makes it different from Length Converter for size, Weight Converter for mass, and Time Converter for durations. That distinction helps each converter stay clearer and more useful for the job it is meant to handle.", keywords: ["temperature converter", "celsius to fahrenheit", "kelvin converter"], howToUse: ["Enter a temperature from a weather reading, cooking guide, classroom task, or other source.", "Choose the from and to scales you want to compare, such as Celsius, Fahrenheit, or Kelvin.", "Read the converted value and continue to another converter only if you are switching to a different type of measurement."], implementationStatus: "working-local", seoTitle: "Temperature Converter Online", seoDescription: "Convert temperature units online with a browser-first Celsius, Fahrenheit, and Kelvin tool.", faq1: "When is Temperature Converter most useful?", faqAnswer1: "It is most useful when instructions, weather information, or school work use a temperature scale you do not normally read. A quick conversion can make oven settings, climate readings, and science values easier to understand.", faq2: "How is Temperature Converter different from the other unit converters?", faqAnswer2: "This page is only for heat scales such as Celsius, Fahrenheit, and Kelvin. The nearby converters cover other measurement types like size, weight, and time, so each one answers a different kind of question." }),
  makeTool({ name: "Time Converter", slug: "time-converter", category: "converter-tools", shortDescription: "Convert between common time units such as seconds, minutes, and hours.", longDescription: "Time Converter is for durations, not clock times. It helps when you want to change values such as seconds, minutes, hours, or days into a format that is easier to read for your task. For example, someone timing a workout may want to see total seconds in minutes, a student may convert hours to days for a planning problem, and a content creator may switch long durations into a shorter unit for notes or scheduling. This page is different from Timezone Converter because it does not compare local clocks in different places. It only changes one duration unit into another, which keeps the result simpler and more focused.", keywords: ["time converter", "seconds to minutes", "hours to days"], howToUse: ["Enter a duration value such as seconds, minutes, hours, or days.", "Choose the original unit and the target unit you want to convert into.", "View the result, and use Timezone Converter instead if your real goal is comparing clock times between places."], implementationStatus: "working-local", seoTitle: "Time Converter Online", seoDescription: "Convert time units online with a browser-based seconds, minutes, hours, and days converter.", faq1: "What is a simple example of using Time Converter?", faqAnswer1: "A simple example is converting 90 minutes into hours, or changing a multi-day duration into total hours for planning, scheduling, or homework. It is useful whenever one duration unit is easier to understand than another.", faq2: "How is Time Converter different from Timezone Converter?", faqAnswer2: "Time Converter changes duration units such as minutes and hours. Timezone Converter compares local clock times in different regions, which is a different kind of task." }),
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

const ctrPrioritySlugs = new Set<string>([
  "image-compressor",
  "image-resizer",
  "background-remover",
  "pdf-merge",
  "pdf-split",
  "pdf-compressor",
  "pdf-to-word",
  "word-to-pdf",
  "json-formatter",
  "qr-code-generator",
  "website-speed-test",
  "password-generator",
  "currency-converter",
  "loan-calculator",
  "image-format-converter",
  "markdown-to-html-converter",
  "discount-calculator",
  "user-agent-parser",
  "mobile-friendly-checker",
  "dns-lookup",
]);

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
    label: "Unavailable",
    shortLabel: "Unavailable",
    summary: "This page stays live, but the tool is not available on this site right now.",
  },
  "coming-soon": {
    label: "Unavailable",
    shortLabel: "Unavailable",
    summary: "This page stays simple until the tool is available on this site.",
  },
};

const serviceBackedToolConfig = new Map<string, ServiceBackedToolConfig>([
  [
    "background-remover",
    {
      requiredEnvVars: ["REMOVE_BG_API_KEY"],
      requiresRateLimitBackend: true,
      shouldAlwaysNoindex: true,
      unavailableMessage:
        "Background removal is currently unavailable on this deployment. The page stays live so the workflow remains documented, but the tool should not be featured or indexed until the service is enabled.",
    },
  ],
  [
    "remove-background-from-image",
    {
      requiredEnvVars: ["REMOVE_BG_API_KEY"],
      requiresRateLimitBackend: true,
      unavailableMessage:
        "Background removal is currently unavailable on this deployment. The page stays live so the workflow remains documented, but the tool should not be featured or indexed until the service is enabled.",
    },
  ],
  [
    "pdf-compressor",
    {
      requiresRateLimitBackend: true,
      shouldAlwaysNoindex: true,
      unavailableMessage:
        "PDF compression is currently unavailable on this deployment. The page stays live, but it should not be featured or indexed until file-processing access is ready.",
    },
  ],
  [
    "pdf-to-word",
    {
      requiresRateLimitBackend: true,
      shouldAlwaysNoindex: true,
      unavailableMessage:
        "PDF to Word conversion is currently unavailable on this deployment. The page stays live, but it should not be featured or indexed until file-processing access is ready.",
    },
  ],
  [
    "pdf-ocr-placeholder",
    {
      requiredEnvVars: ["OCR_SPACE_API_KEY"],
      requiresRateLimitBackend: true,
      unavailableMessage:
        "PDF OCR is currently unavailable on this site. The route stays available, but it should not be indexed until OCR is enabled under the final public slug.",
      shouldAlwaysNoindex: true,
    },
  ],
  [
    "protect-pdf",
    {
      requiredEnvVars: ["PDF_PROTECT_SERVICE_URL"],
      requiresRateLimitBackend: true,
      unavailableMessage:
        "PDF protection is currently unavailable on this deployment. The page stays live with clear scope notes, but it should not be indexed or featured until the backend protection service is enabled.",
    },
  ],
  [
    "website-screenshot-tool",
    {
      requiredEnvVars: ["SCREENSHOT_SERVICE_URL"],
      requiresRateLimitBackend: true,
      shouldAlwaysNoindex: true,
      unavailableMessage:
        "Website screenshots are currently unavailable on this site. The route stays live, but it should not be indexed or featured until screenshot capture is enabled.",
    },
  ],
  [
    "website-speed-test",
    {
      requiredEnvVars: ["PAGESPEED_API_KEY"],
      requiresRateLimitBackend: true,
      shouldAlwaysNoindex: true,
      unavailableMessage:
        "Website speed testing is currently unavailable on this deployment. The page stays live, but it should not be indexed or featured until PageSpeed access is enabled.",
    },
  ],
  [
    "mobile-friendly-checker",
    {
      requiredEnvVars: ["PAGESPEED_API_KEY"],
      requiresRateLimitBackend: true,
      unavailableMessage:
        "Mobile-friendly checking is currently unavailable on this deployment. The page stays live, but it should not be indexed or featured until PageSpeed access is enabled.",
    },
  ],
  [
    "word-to-pdf",
    {
      requiresRateLimitBackend: true,
      shouldAlwaysNoindex: true,
      unavailableMessage:
        "Word to PDF conversion is currently unavailable on this deployment. The page stays live, but it should not be featured or indexed until file-processing access is ready.",
    },
  ],
  [
    "currency-converter",
    {
      requiresRateLimitBackend: true,
      unavailableMessage:
        "Currency conversion is currently unavailable on this deployment. The page stays live, but it should not be featured or indexed until live quote access is ready.",
    },
  ],
  [
    "dns-lookup",
    {
      requiresRateLimitBackend: true,
      unavailableMessage:
        "DNS lookup is currently unavailable on this deployment. The page stays live, but it should not be featured or indexed until lookup access is ready.",
    },
  ],
]);

function resolveImplementationStatus(tool: ToolDraft): ImplementationStatus {
  return tool.implementationStatus;
}

function getServiceBackedToolConfig(slug: string) {
  return serviceBackedToolConfig.get(slug);
}

function hasRateLimitBackendConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim();

  return Boolean(url && token);
}

export function getToolRequiredEnvVars(toolOrSlug: Pick<ToolDefinition, "slug"> | string) {
  const slug = typeof toolOrSlug === "string" ? toolOrSlug : toolOrSlug.slug;
  const config = getServiceBackedToolConfig(slug);

  return [
    ...(config?.requiredEnvVars ?? []),
    ...(config?.requiresRateLimitBackend ? ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"] : []),
  ];
}

export function getMissingToolEnvVars(toolOrSlug: Pick<ToolDefinition, "slug"> | string) {
  const slug = typeof toolOrSlug === "string" ? toolOrSlug : toolOrSlug.slug;
  const config = getServiceBackedToolConfig(slug);
  const missingEnvVars = (config?.requiredEnvVars ?? []).filter((envVar) => !process.env[envVar]?.trim());

  if (config?.requiresRateLimitBackend && !hasRateLimitBackendConfig()) {
    missingEnvVars.push("UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN");
  }

  return missingEnvVars;
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

function buildToolPurposeFaq(tool: ToolDraft): FaqItem {
  return {
    question: `What does ${tool.name.toLowerCase()} help with?`,
    answer: normalizePublicCopy(tool.shortDescription),
  };
}

function buildCategorySpecificFaqs(tool: ToolDraft): FaqItem[] {
  switch (tool.category) {
    case "image-tools":
      return [
        {
          question: `What kind of image works best in ${tool.name.toLowerCase()}?`,
          answer: "Images with a clear subject, readable details, and a format that matches the task usually give the cleanest result.",
        },
        {
          question: `When should I use ${tool.name.toLowerCase()} instead of another image tool?`,
          answer: `${tool.name} is the better choice when the main goal matches this page directly. If you need a different image edit, use the related image tools linked on the page.`,
        },
      ];
    case "pdf-tools":
      return [
        {
          question: `What kind of PDF works best in ${tool.name.toLowerCase()}?`,
          answer: "Clean files with readable pages, clear page order, and only the content you actually need are usually the easiest to work with.",
        },
        {
          question: `What should I check before downloading from ${tool.name.toLowerCase()}?`,
          answer: "Check the page order, readability, and file size so the finished PDF matches the version you want to share or save.",
        },
      ];
    case "text-tools":
      return [
        {
          question: `What type of text is best to paste into ${tool.name.toLowerCase()}?`,
          answer: "Plain text works best because it keeps the result easier to review, copy, and reuse without extra formatting getting in the way.",
        },
        {
          question: `When is ${tool.name.toLowerCase()} more useful than editing text by hand?`,
          answer: `${tool.name} is most useful when the text is long enough or repetitive enough that a quick tool result is faster than manual cleanup.`,
        },
      ];
    case "developer-tools":
      return [
        {
          question: `What should I paste into ${tool.name.toLowerCase()}?`,
          answer: "Paste only the part you want to inspect, format, convert, or validate so the result stays easier to read and review.",
        },
        {
          question: `What should I review before copying the result from ${tool.name.toLowerCase()}?`,
          answer: "Check the output structure, formatting, and any warnings shown on the page before you paste the result into another workflow.",
        },
      ];
    case "generator-tools":
      return [
        {
          question: `When is ${tool.name.toLowerCase()} a good starting point?`,
          answer: `${tool.name} works best when you want quick ideas, sample output, or a fast first draft that you can keep or adjust afterward.`,
        },
        {
          question: `Should I treat the result from ${tool.name.toLowerCase()} as final?`,
          answer: "That depends on the task. Many generated results work best as a starting point that you review, test, or refine before using.",
        },
      ];
    case "calculator-tools":
      return [
        {
          question: `What details matter most before using ${tool.name.toLowerCase()}?`,
          answer: "Use the right values, units, dates, or rates before you calculate so the result matches the situation you are checking.",
        },
        {
          question: `Is the result from ${tool.name.toLowerCase()} an estimate or a direct calculation?`,
          answer: "Some pages give direct math results, while others are best treated as planning estimates. Review the page details before relying on the output.",
        },
      ];
    case "converter-tools":
      return [
        {
          question: `What input gives the best result in ${tool.name.toLowerCase()}?`,
          answer: "Clear values and the correct source format or unit help you get a more useful result on the first try.",
        },
        {
          question: `When should I use ${tool.name.toLowerCase()} instead of a different converter?`,
          answer: `Use ${tool.name} when this page matches the exact unit, value, or file change you need. If the task is different, one of the related converters will be a better fit.`,
        },
      ];
    case "internet-tools":
      return [
        {
          question: `Why can results vary in ${tool.name.toLowerCase()}?`,
          answer: "Website conditions, input quality, service availability, and timing can all affect the result shown on the page.",
        },
        {
          question: `What should I check if ${tool.name.toLowerCase()} does not give the result I expected?`,
          answer: "Check the URL, hostname, or input first, then try again and compare the result with a related site-checking tool if needed.",
        },
      ];
    default:
      return [];
  }
}

const relatedToolSlugOverrides = new Map<string, string[]>([
  ["image-compressor", ["image-resizer", "image-to-webp-converter", "crop-image", "jpg-to-png-converter"]],
  ["image-resizer", ["image-compressor", "crop-image", "image-rotator", "image-to-webp-converter"]],
  ["background-remover", ["crop-image", "image-watermark-tool", "image-resizer", "jpg-to-png-converter"]],
  ["image-format-converter", ["jpg-to-png-converter", "png-to-jpg-converter", "image-to-webp-converter", "image-compressor", "image-resizer"]],
  ["image-color-picker", ["color-contrast-checker", "image-format-converter", "crop-image", "image-watermark-tool", "image-resizer"]],
  ["image-brightness-adjuster", ["image-contrast-adjuster", "image-grayscale-converter", "image-compressor", "crop-image", "image-resizer"]],
  ["image-contrast-adjuster", ["image-brightness-adjuster", "image-grayscale-converter", "image-compressor", "crop-image", "image-resizer"]],
  ["image-grayscale-converter", ["image-contrast-adjuster", "image-brightness-adjuster", "crop-image", "image-compressor", "image-format-converter"]],
  ["pdf-merge", ["pdf-split", "pdf-compressor", "image-to-pdf-converter", "jpg-to-pdf", "pdf-page-rotator"]],
  ["pdf-compressor", ["pdf-merge", "pdf-split", "protect-pdf", "pdf-to-jpg", "pdf-page-number-adder"]],
  ["pdf-to-word", ["word-to-pdf", "pdf-compressor", "pdf-merge", "pdf-ocr-placeholder"]],
  ["word-to-pdf", ["pdf-to-word", "pdf-compressor", "protect-pdf", "pdf-merge", "image-to-pdf-converter"]],
  ["image-to-pdf-converter", ["jpg-to-pdf", "pdf-merge", "pdf-compressor", "pdf-to-jpg", "crop-image"]],
  ["json-formatter", ["json-schema-validator", "json-to-csv-converter", "csv-to-json-converter", "xml-to-json-converter", "yaml-formatter"]],
  ["qr-code-generator", ["qr-code-scanner", "barcode-scanner", "url-encoder", "image-to-base64-converter", "uuid-generator"]],
  ["website-speed-test", ["mobile-friendly-checker", "website-screenshot-tool", "dns-lookup", "url-status-checker", "user-agent-parser"]],
  ["password-generator", ["secure-password-strength-checker", "random-token-generator", "secure-token-generator", "random-api-key-generator", "secret-key-generator"]],
  ["uuid-generator", ["uuid-validator", "random-token-generator", "secret-key-generator", "json-formatter", "random-number-generator"]],
  ["random-name-generator", ["random-username-generator", "nickname-generator", "product-name-generator", "domain-name-generator", "blog-title-generator"]],
  ["random-number-generator", ["dice-roller", "coin-flip-generator", "wheel-spinner-random-picker", "random-team-generator", "uuid-generator"]],
  ["barcode-generator", ["qr-code-generator", "barcode-scanner", "qr-code-scanner", "image-to-base64-converter", "url-encoder"]],
  ["random-username-generator", ["random-name-generator", "username-generator", "nickname-generator", "password-generator", "domain-name-generator"]],
  ["length-converter", ["weight-converter", "temperature-converter", "time-converter", "file-size-converter", "currency-converter"]],
  ["weight-converter", ["length-converter", "temperature-converter", "time-converter", "file-size-converter", "currency-converter"]],
  ["temperature-converter", ["length-converter", "weight-converter", "time-converter", "timezone-converter", "currency-converter"]],
  ["time-converter", ["timezone-converter", "unix-timestamp-converter", "length-converter", "temperature-converter", "weight-converter"]],
]);

const peopleAlsoSearchForOverrides = new Map<string, SearchPhraseItem[]>([
  ["image-compressor", [
    { phrase: "compress image online" },
    { phrase: "reduce image size" },
    { phrase: "compress jpg online" },
    { phrase: "compress png image" },
    { phrase: "resize image", href: "/tools/image-resizer" },
    { phrase: "convert image to webp", href: "/tools/image-to-webp-converter" },
  ]],
  ["image-resizer", [
    { phrase: "resize image online" },
    { phrase: "change image size" },
    { phrase: "resize photo in pixels" },
    { phrase: "compress image online", href: "/tools/image-compressor" },
    { phrase: "crop image online", href: "/tools/crop-image" },
  ]],
  ["background-remover", [
    { phrase: "remove background online" },
    { phrase: "make transparent png" },
    { phrase: "cut out image background" },
    { phrase: "resize image", href: "/tools/image-resizer" },
    { phrase: "crop image", href: "/tools/crop-image" },
  ]],
  ["pdf-merge", [
    { phrase: "merge pdf files online" },
    { phrase: "combine pdf files" },
    { phrase: "join pdf pages" },
    { phrase: "split pdf", href: "/tools/pdf-split" },
    { phrase: "compress pdf", href: "/tools/pdf-compressor" },
  ]],
  ["pdf-compressor", [
    { phrase: "compress pdf online" },
    { phrase: "reduce pdf file size" },
    { phrase: "make pdf smaller" },
    { phrase: "merge pdf", href: "/tools/pdf-merge" },
    { phrase: "pdf to word", href: "/tools/pdf-to-word" },
  ]],
  ["pdf-to-word", [
    { phrase: "convert pdf to word" },
    { phrase: "pdf to docx online" },
    { phrase: "editable pdf to word" },
    { phrase: "word to pdf", href: "/tools/word-to-pdf" },
    { phrase: "pdf ocr", href: "/tools/pdf-ocr-placeholder" },
  ]],
  ["word-to-pdf", [
    { phrase: "convert word to pdf" },
    { phrase: "docx to pdf online" },
    { phrase: "save word as pdf" },
    { phrase: "pdf to word", href: "/tools/pdf-to-word" },
    { phrase: "protect pdf", href: "/tools/protect-pdf" },
  ]],
  ["json-formatter", [
    { phrase: "format json online" },
    { phrase: "json validator" },
    { phrase: "pretty print json" },
    { phrase: "json schema validator", href: "/tools/json-schema-validator" },
    { phrase: "json to csv", href: "/tools/json-to-csv-converter" },
  ]],
  ["qr-code-generator", [
    { phrase: "create qr code online" },
    { phrase: "make qr code from url" },
    { phrase: "qr code generator free" },
    { phrase: "qr code scanner", href: "/tools/qr-code-scanner" },
    { phrase: "barcode scanner", href: "/tools/barcode-scanner" },
  ]],
  ["website-speed-test", [
    { phrase: "website speed test online" },
    { phrase: "page speed checker" },
    { phrase: "test site performance" },
    { phrase: "mobile friendly checker", href: "/tools/mobile-friendly-checker" },
    { phrase: "website screenshot tool", href: "/tools/website-screenshot-tool" },
  ]],
]);

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
  const manualOverrides = relatedToolSlugOverrides.get(tool.slug) ?? [];
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

  return [...new Set([...manualOverrides, ...sameCategoryMatches, ...crossCategoryMatches])]
    .filter((slug) => slug !== tool.slug)
    .slice(0, isExpandedSeoTool(tool.slug) ? 8 : 6);
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
        ? "Use a related available tool if you need this task today."
        : "Review the output, then copy, download, or continue to a related tool if needed.",
    );
  }

  if (steps.length < 4) {
    steps.push(
      implementationStatus === "reduced-scope-local"
        ? "Results can vary depending on the file, site, or input."
        : "Adjust the input values or settings until the output matches the result you need.",
    );
  }

  if (!steps.some((step) => /related tool|category page|same category/i.test(step))) {
    steps.push(`Use the related tools area or the ${categoryName.toLowerCase()} page if you need a nearby workflow after this step.`);
  }

  return normalizePublicList(steps.slice(0, isExpandedSeoTool(tool) ? 6 : 5));
}

function enrichFaq(tool: ToolDraft, implementationStatus: ImplementationStatus) {
  const faq = [...tool.faq];
  const categoryName = getCategoryName(tool.category);
  const extraFaq: FaqItem[] = [buildToolPurposeFaq(tool), ...buildCategorySpecificFaqs(tool)];

  if (isExpandedSeoTool(tool)) {
    extraFaq.unshift(
      {
        question: `What should I expect after using ${tool.name.toLowerCase()}?`,
        answer: `You should get a focused result for this task, plus clear next steps if you need another related tool afterward.`,
      },
      {
        question: `What nearby ${categoryName.toLowerCase()} should I try after ${tool.name.toLowerCase()}?`,
        answer: `Use the related tools section and the ${categoryName.toLowerCase()} page if you want a nearby workflow after this one.`,
      },
    );
  }

  if (implementationStatus === "reduced-scope-local") {
    extraFaq.unshift({
      question: `Are there any limits to ${tool.name.toLowerCase()}?`,
      answer: `Yes. Some results may vary depending on the file, website, or input you use.`,
    });
  }

  if (implementationStatus === "coming-soon") {
    extraFaq.unshift({
      question: `Why is ${tool.name.toLowerCase()} unavailable right now?`,
      answer: `This page stays simple because the tool is not active on this site right now.`,
    });
  }

  for (const item of extraFaq) {
    if (!faq.some((existing) => existing.question.toLowerCase() === item.question.toLowerCase())) {
      faq.push(item);
    }
  }

  return faq.slice(0, isExpandedSeoTool(tool) ? 6 : 5).map((item) => ({
    question: item.question,
    answer: normalizePublicCopy(item.answer),
  }));
}

function enrichSeoTitle(tool: ToolDraft) {
  const title = tool.seoTitle.trim();
  const shouldAddFree = ctrPrioritySlugs.has(tool.slug) && !/^free\b/i.test(title);
  const ctrTitle = shouldAddFree ? `Free ${title}` : title;

  if (ctrTitle.length <= 60 && ctrPrioritySlugs.has(tool.slug)) {
    return ctrTitle;
  }

  if (isExpandedSeoTool(tool) && title.length < 55) {
    return `${tool.name} Online Free - ${getCategoryName(tool.category)} | Toolbox Hub`;
  }
  if (title.length >= 45) {
    return ctrTitle;
  }
  return shouldAddFree
    ? `Free ${tool.name} Online | ${getCategoryName(tool.category)} | Toolbox Hub`
    : `${tool.name} Online Free | ${getCategoryName(tool.category)} | Toolbox Hub`;
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
      ? " Use a related available tool if you need this task today."
      : implementationStatus === "reduced-scope-local"
        ? " Clear, simple limits are explained."
        : ctrPrioritySlugs.has(tool.slug)
          ? " Fast, simple, and easy to use."
          : " Fast and easy to use.";

  return normalizePublicCopy(`${tool.shortDescription} Use ${tool.name.toLowerCase()} online with how-to steps, FAQs, related tools, and links to the ${getCategoryName(tool.category).toLowerCase()} directory.${scopeLine}`);
}

function enrichLongDescription(tool: ToolDraft, implementationStatus: ImplementationStatus) {
  const categoryName = getCategoryName(tool.category);
  const scopeSentence =
    implementationStatus === "coming-soon"
      ? ` This page helps you find the tool and check back when it is ready.`
      : implementationStatus === "reduced-scope-local"
        ? ` Results can vary depending on the file, website, or input, and the page explains those limits clearly.`
        : ctrPrioritySlugs.has(tool.slug)
          ? ` The page includes practical guidance, related tools, and helpful links so visitors can quickly move to the next step without starting over.`
          : ` The page includes practical guidance, related tools, and helpful links so visitors can complete nearby tasks without starting over.`;

  if (tool.longDescription.length > 240) {
    return normalizePublicCopy(`${tool.longDescription}${scopeSentence}${isExpandedSeoTool(tool) ? ` The page also links to related ${categoryName.toLowerCase()} tasks.` : ""}`);
  }

  return normalizePublicCopy(`${tool.longDescription} ${tool.name} belongs to the ${categoryName.toLowerCase()} section, which helps users discover similar workflows, related conversions, and alternative tools in the same area.${scopeSentence}`);
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

function toSearchPhrase(value: string) {
  return value
    .toLowerCase()
    .replace(/[|/]/g, " ")
    .replace(/[^a-z0-9\s&+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isUsefulSearchPhrase(phrase: string, tool: ToolDraft) {
  const normalized = toSearchPhrase(phrase);
  if (!normalized || normalized.length < 8) {
    return false;
  }

  const titlePhrase = toSearchPhrase(tool.seoTitle);
  if (normalized === titlePhrase || normalized === toSearchPhrase(tool.name)) {
    return false;
  }

  return true;
}

function buildPeopleAlsoSearchFor(tool: ToolDraft): SearchPhraseItem[] {
  const manual = peopleAlsoSearchForOverrides.get(tool.slug);
  if (manual) {
    return manual.slice(0, 8);
  }

  const baseName = tool.name.toLowerCase();
  const baseKeyword = tool.keywords[0]?.toLowerCase() ?? baseName;
  const categoryQuery =
    tool.category === "image-tools"
      ? "edit image online"
      : tool.category === "pdf-tools"
        ? "pdf tools online"
        : tool.category === "text-tools"
          ? "text tools online"
          : tool.category === "developer-tools"
            ? "developer tools online"
            : tool.category === "generator-tools"
              ? "generator tools online"
              : tool.category === "calculator-tools"
                ? "calculator online"
                : tool.category === "converter-tools"
                  ? "convert online"
                  : "website tools online";

  const phraseCandidates = [
    `${baseKeyword} online`,
    `free ${baseKeyword}`,
    `best ${baseKeyword}`,
    tool.keywords[1] ? `${tool.keywords[1].toLowerCase()} online` : "",
    tool.keywords[2] ? `${tool.keywords[2].toLowerCase()} tool` : "",
    categoryQuery,
  ]
    .map((phrase) => toSearchPhrase(phrase))
    .filter((phrase) => isUsefulSearchPhrase(phrase, tool));

  const linkedRelated = (relatedToolSlugOverrides.get(tool.slug) ?? [])
    .slice(0, 3)
    .map((slug) => toolDrafts.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is ToolDefinition => Boolean(candidate))
    .map((candidate) => ({
      phrase: toSearchPhrase(candidate.name),
      href: `/tools/${candidate.slug}`,
    }));

  const phrases: SearchPhraseItem[] = [];
  for (const phrase of phraseCandidates) {
    if (!phrases.some((item) => item.phrase === phrase)) {
      phrases.push({ phrase });
    }
  }

  for (const item of linkedRelated) {
    if (!phrases.some((phrase) => phrase.phrase === item.phrase)) {
      phrases.push(item);
    }
  }

  return phrases.slice(0, 6);
}

export const tools: ToolDefinition[] = toolDrafts.map((tool) => ({
  ...tool,
  implementationStatus: resolveImplementationStatus(tool),
})).map((tool) => {
  const resolvedStatusNote = resolveStatusNote(tool);

  return {
    ...tool,
    statusNote:
      tool.implementationStatus === "coming-soon"
        ? resolvedStatusNote
        : resolvedStatusNote
          ? normalizePublicCopy(resolvedStatusNote)
          : undefined,
    seoTitle: enrichSeoTitle(tool),
    seoDescription: enrichSeoDescription(tool, tool.implementationStatus),
    longDescription: enrichLongDescription(tool, tool.implementationStatus),
    keywords: enrichKeywords(tool),
    howToUse: enrichHowToUse(tool, tool.implementationStatus),
    faq: enrichFaq(tool, tool.implementationStatus),
    peopleAlsoSearchFor: buildPeopleAlsoSearchFor(tool),
    relatedToolSlugs: buildRelatedToolSlugs(tool),
  };
});

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
    .filter((tool) => shouldIndexTool(tool))
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
    .filter((tool) => shouldIndexTool(tool))
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
    .filter((tool) => shouldIndexTool(tool))
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
  "pdf-compressor",
  "pdf-to-word",
  "word-to-pdf",
  "website-screenshot-tool",
  "website-speed-test",
  "barcode-scanner",
  "qr-code-scanner",
  "ip-address-lookup",
  "http-status-code-checker",
  "url-status-checker",
  "url-redirect-checker",
  "webpage-source-viewer",
]);

const noindexWeakToolSlugs = new Set<string>([
  "barcode-scanner",
  "qr-code-scanner",
  "ip-address-lookup",
  "http-status-code-checker",
  "url-status-checker",
  "url-redirect-checker",
  "webpage-source-viewer",
  "text-line-counter",
  "random-sentence-generator",
  "lorem-ipsum-generator",
  "text-duplicate-remover",
  "username-generator",
  "nickname-generator",
  "fake-address-generator",
  "random-color-palette-generator",
  "age-difference-calculator",
  "meeting-time-finder",
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

  if (noindexWeakToolSlugs.has(tool.slug)) {
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

