import { notFound } from "next/navigation";
import Link from "next/link";
import { buildBreadcrumbJsonLd, buildMetadata } from "@/lib/seo";

type Variant = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  targetLabel: string;
};

const variants: Variant[] = [
  {
    slug: "compress-to-20kb",
    title: "Compress Image to 20KB Online — Free & Instant",
    description: "Need to get an image under 20KB? Upload your JPG or PNG, lower the quality slider, compress, and download — free, no signup, done in seconds.",
    h1: "Compress Image to 20KB Online — Free",
    intro: "Getting an image under 20KB is a common requirement for passport photo uploads, JAMB application portals, online visa forms, and email signature graphics. The challenge is hitting that limit without making the image unreadable. Upload your JPG, PNG, or WebP to the Toolbox Hub image compressor, lower the quality slider until the output size shows under 20KB, check the preview to confirm the image still looks clear, and download. The whole process takes under a minute and runs entirely in your browser — your file never leaves your device. No signup required. If the image is large in dimensions, reduce them in the image resizer first, then compress.",
    targetLabel: "20KB",
  },
  {
    slug: "compress-to-50kb",
    title: "Compress Image to 50KB Online — Free & Instant",
    description: "Reduce any photo to 50KB online — free. Upload a JPG, PNG or WebP, set the quality, click compress, and download your smaller image in seconds.",
    h1: "Compress Image to 50KB Online — Free",
    intro: "A 50KB file size limit appears on university portal uploads, online application forms, company HR systems, and marketplace product listings. Photographs straight from a phone camera are usually 2–5 MB, which is 40–100 times too large. The Toolbox Hub image compressor lets you upload your JPG, PNG, or WebP, drag the quality slider down, see the estimated output size update in real time, and download the compressed image when it reads under 50KB. Everything happens in your browser with no data sent to a server. If your image is very high resolution, resize the dimensions first using the image resizer — smaller dimensions make it much easier to reach 50KB at a reasonable quality level.",
    targetLabel: "50KB",
  },
  {
    slug: "compress-to-100kb",
    title: "Compress Image to 100KB Online — Free & Instant",
    description: "Compress any photo to 100KB online — free and instant. Upload your image, set the compression level, and download a smaller file in seconds.",
    h1: "Compress Image to 100KB Online — Free",
    intro: "A 100KB size cap is common on government portals, scholarship application forms, CV upload pages, and e-commerce product photo fields. A standard JPG photo is often 1–4 MB, making it 10–40 times too large to submit. With the Toolbox Hub image compressor you upload your photo, adjust the quality slider to reduce the file size, watch the before-and-after preview, and download when the output is under 100KB. No account or software needed — the tool runs in your browser and your image data stays local. For very large photos, try the image resizer first to drop the pixel dimensions to 800–1200 pixels wide, which makes reaching 100KB at good quality straightforward.",
    targetLabel: "100KB",
  },
  {
    slug: "reduce-for-whatsapp",
    title: "Reduce Image Size for WhatsApp — Free Online Tool",
    description: "Shrink photos for WhatsApp in seconds — free. Compress JPG or PNG to share faster, use less data, and keep chats loading quickly. No signup needed.",
    h1: "Reduce Image Size for WhatsApp — Free",
    intro: "WhatsApp automatically compresses photos you send, but the compression is aggressive and often makes images look blurry, especially text screenshots and product photos. Compressing the image yourself before sending gives you control over quality. Upload your JPG or PNG to the Toolbox Hub image compressor, set the quality to 70–80%, download the smaller file, and send it via WhatsApp — the result looks cleaner than WhatsApp's own compression. Smaller files also load faster for recipients on mobile data. This is especially useful for businesses sharing product images, teachers distributing class materials, and anyone sending documents or receipts that need to remain legible. No signup, no install, works from any phone browser.",
    targetLabel: "WhatsApp",
  },
  {
    slug: "reduce-passport-photo",
    title: "Reduce Passport Photo Size Online — Free & Fast",
    description: "Compress passport photos to meet any file size limit — free. Reduce your JPG to 20KB, 50KB or 100KB for JAMB, visa, and online forms instantly.",
    h1: "Reduce Passport Photo Size Online — Free",
    intro: "Passport photo size limits vary by platform: JAMB requires under 30KB, many Nigerian university portals require under 20KB, and international visa forms typically allow 50–100KB. A standard passport photo JPG is usually 200–500KB straight from a camera or scanning app — well above these limits. Upload your passport photo JPG or PNG to the Toolbox Hub image compressor, lower the quality slider, and watch the file size drop. Stop when the preview still shows a clear, recognisable face and the size reads below your target. Download the compressed photo and upload it to your form. If you also need specific dimensions (for example 200×200 pixels), use the image resizer after compressing.",
    targetLabel: "passport photo",
  },
  {
    slug: "compress-below-200kb",
    title: "Compress Image Below 200KB — Free Online Tool",
    description: "Get any image under 200KB online — free and instant. Upload your JPG, PNG or WebP, set the quality, compress, and download in seconds. No signup.",
    h1: "Compress Image Below 200KB — Free",
    intro: "A 200KB limit appears on blog featured image fields, email marketing platforms, social media ad upload tools, and content management systems. Phone photos are usually 2–6 MB, and even resized images can sit at 400–800KB if exported at full quality. The Toolbox Hub image compressor accepts JPG, PNG, and WebP, lets you choose a quality level, and shows you the output size before you download. Set quality to 75–85% for photographs — most images reach under 200KB at that level while still looking sharp. For graphics with solid colours, try PNG at a higher quality setting. Your image is processed entirely in your browser and is never uploaded to any server.",
    targetLabel: "200KB",
  },
];

function getVariant(slug: string) {
  return variants.find((v) => v.slug === slug);
}

export function generateStaticParams() {
  return variants.map((v) => ({ variant: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  const data = getVariant(variant);
  if (!data) return {};
  return buildMetadata({
    title: data.title,
    description: data.description,
    pathname: `/tools/image-compressor/${data.slug}`,
    keywords: [data.title.toLowerCase(), "compress image online", "reduce image size", "free image compressor"],
  });
}

export default async function ImageCompressorVariantPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  const data = getVariant(variant);
  if (!data) notFound();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", pathname: "/" },
    { name: "Tools", pathname: "/tools" },
    { name: "Image Compressor", pathname: "/tools/image-compressor" },
    { name: data.h1, pathname: `/tools/image-compressor/${data.slug}` },
  ]);

  return (
    <div className="site-shell mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="mb-6 text-sm text-[color:var(--muted)]">
        <Link href="/tools" className="hover:text-[color:var(--primary)]">Tools</Link>
        <span className="mx-2">/</span>
        <Link href="/tools/image-compressor" className="hover:text-[color:var(--primary)]">Image Compressor</Link>
        <span className="mx-2">/</span>
        <span className="text-[color:var(--foreground)]">{data.targetLabel}</span>
      </nav>

      <section className="app-panel rounded-[2rem] p-7 sm:p-10">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{data.h1}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--muted)]">{data.intro}</p>

        <div className="mt-8">
          <h2 className="text-xl font-bold tracking-tight">How to compress your image</h2>
          <ol className="mt-4 space-y-4 text-[color:var(--muted)]">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-bold text-white">1</span>
              <p className="pt-1">Open the <Link href="/tools/image-compressor" className="font-semibold text-[color:var(--primary)] underline-offset-4 hover:underline">Image Compressor</Link> and click <strong className="text-[color:var(--foreground)]">Upload image</strong> to select your JPG, PNG, or WebP file.</p>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-bold text-white">2</span>
              <p className="pt-1">Use the <strong className="text-[color:var(--foreground)]">quality slider</strong> to lower the compression level. Watch the estimated output size update and check the before-and-after preview to confirm quality.</p>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-bold text-white">3</span>
              <p className="pt-1">Click <strong className="text-[color:var(--foreground)]">Compress image</strong>, confirm the output file size is within your limit, then click <strong className="text-[color:var(--foreground)]">Download</strong> to save the smaller file.</p>
            </li>
          </ol>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/tools/image-compressor"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow transition hover:opacity-90"
          >
            Open Image Compressor
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--primary)]"
          >
            Browse all tools
          </Link>
        </div>
      </section>
    </div>
  );
}
