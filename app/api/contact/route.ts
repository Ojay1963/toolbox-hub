import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMaxRequests = 5;
const requestLog = new Map<string, number[]>();

function cleanupRequests(key: string, now: number) {
  const timestamps = requestLog.get(key) ?? [];
  const fresh = timestamps.filter((timestamp) => now - timestamp < rateLimitWindowMs);
  requestLog.set(key, fresh);
  return fresh;
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function normalizePort(value?: string) {
  if (!value) {
    return 587;
  }

  const port = Number(value);
  return Number.isFinite(port) ? port : 587;
}

function createTransporter() {
  const host = process.env.CONTACT_SMTP_HOST;
  const user = process.env.CONTACT_SMTP_USER;
  const pass = process.env.CONTACT_SMTP_PASS;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || user;

  if (!host || !user || !pass || !fromEmail) {
    return null;
  }

  const port = normalizePort(process.env.CONTACT_SMTP_PORT);
  const secure = process.env.CONTACT_SMTP_SECURE === "true" || port === 465;

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    }),
    fromEmail,
    fromName: process.env.CONTACT_FROM_NAME || "Toolbox Hub",
  };
}

export async function POST(request: Request) {
  const recipient = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  const mailConfig = createTransporter();

  if (!recipient || !mailConfig) {
    return NextResponse.json(
      { message: "Contact form is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  const now = Date.now();
  const clientKey = getClientKey(request);
  const recentRequests = cleanupRequests(clientKey, now);

  if (recentRequests.length >= rateLimitMaxRequests) {
    return NextResponse.json(
      { message: "Too many messages sent recently. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    message?: string;
    company?: string;
  };

  const name = body.name?.trim() || "";
  const email = body.email?.trim() || "";
  const message = body.message?.trim() || "";
  const company = body.company?.trim() || "";

  if (company) {
    return NextResponse.json({ message: "Message sent successfully" });
  }

  if (!name || name.length < 2 || name.length > 80) {
    return NextResponse.json({ message: "Please enter your name." }, { status: 400 });
  }

  if (!emailRegex.test(email) || email.length > 120) {
    return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  }

  if (!message || message.length < 20 || message.length > 3000) {
    return NextResponse.json(
      { message: "Please enter a message with at least 20 characters." },
      { status: 400 },
    );
  }

  try {
    await mailConfig.transporter.sendMail({
      to: recipient,
      from: `"${mailConfig.fromName}" <${mailConfig.fromEmail}>`,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    requestLog.set(clientKey, [...recentRequests, now]);
    return NextResponse.json({ message: "Message sent successfully" });
  } catch {
    return NextResponse.json(
      { message: "Unable to send your message right now. Please try again later." },
      { status: 500 },
    );
  }
}
