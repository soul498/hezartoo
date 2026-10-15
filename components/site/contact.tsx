"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ButtonLink } from "@/components/site/button-link";
import { instagramUrl, topics } from "@/lib/content";

type Errors = {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
};

const topicLabel = Object.fromEntries(topics.map((item) => [item.value, item.label]));

export function Contact() {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const composed = [
    "پیام از وب‌سایت هزارتو",
    `نام: ${name.trim()}`,
    org.trim() ? `سازمان: ${org.trim()}` : null,
    email.trim() ? `ایمیل: ${email.trim()}` : null,
    `موضوع: ${topicLabel[topic] ?? ""}`,
    "",
    message.trim(),
  ]
    .filter((line) => line !== null)
    .join("\n");

  function validate(): Errors {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "نام را کامل‌تر بنویسید.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "ایمیل را مثل name@example.com بنویسید.";
    }
    if (!topic) next.topic = "موضوع را انتخاب کنید.";
    if (message.trim().length < 12) next.message = "پیام باید دست‌کم ۱۲ نویسه باشد.";
    return next;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setCopied(false);
    setCopyError(false);
    setOpen(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(composed);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  return (
    <div id="contact">
      <Alert variant="info" title="این صفحه پیام را ذخیره نمی‌کند" className="mb-6">
        نسخه‌ی نمایشی سرور ندارد. بعد از نوشتن، متن کپی می‌شود تا در اینستاگرام بفرستید.
      </Alert>

      <form onSubmit={onSubmit} className="grid max-w-2xl gap-4" noValidate>
        <Field label="نام" htmlFor="name">
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            error={errors.name}
          />
        </Field>
        <Field label="سازمان" htmlFor="org" hint="اگر از طرف یک مدرسه، آزمایشگاه یا خانه نوآوری می‌نویسید">
          <Input id="org" name="organization" value={org} onChange={(event) => setOrg(event.target.value)} />
        </Field>
        <Field label="ایمیل" htmlFor="email" hint="اختیاری است. اگر بنویسید، داخل متن کپی‌شده می‌آید تا جواب ممکن شود">
          <Input
            id="email"
            name="email"
            type="email"
            dir="ltr"
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
        </Field>
        <Field label="موضوع" htmlFor="topic">
          <Select
            id="topic"
            name="topic"
            value={topic}
            placeholder="انتخاب کنید"
            options={topics}
            onChange={(event) => setTopic(event.target.value)}
          />
          {errors.topic ? <p className="text-sm text-destructive">{errors.topic}</p> : null}
        </Field>
        <Field label="پیام" htmlFor="message">
          <Textarea
            id="message"
            name="message"
            value={message}
            maxLength={500}
            showCount
            autoResize
            onChange={(event) => setMessage(event.target.value)}
          />
          {errors.message ? <p className="text-sm text-destructive">{errors.message}</p> : null}
        </Field>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          آماده‌کردن پیام
        </Button>
      </form>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="پیام آماده است"
        description="متن را کپی کنید و در اینستاگرام هزارتو بفرستید."
        className="max-w-lg"
        footer={
          <>
            <Button onClick={copy}>{copied ? "کپی شد" : "کپی متن"}</Button>
            <ButtonLink href={instagramUrl} target="_blank" rel="noreferrer" variant="outline">
              رفتن به اینستاگرام
            </ButtonLink>
          </>
        }
      >
        <p className="whitespace-pre-wrap text-sm text-foreground">{composed}</p>
        {copyError ? (
          <Alert variant="destructive" title="کپی خودکار ممکن نشد" className="mt-4">
            متن بالا را دستی انتخاب کنید و کپی بگیرید.
          </Alert>
        ) : null}
      </Dialog>
    </div>
  );
}
