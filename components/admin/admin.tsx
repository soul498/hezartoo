"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Leaf, Section, SectionId } from "@/lib/content";
import {
  hasOverride,
  resetSections,
  saveSections,
  useSections,
} from "@/lib/content-store";
import { fa, cn } from "@/lib/utils";
import { MAX_CHILDREN } from "@/lib/world";

type Selection =
  | { kind: "section"; section: SectionId }
  | { kind: "leaf"; section: SectionId; slug: string }
  | { kind: "new"; section: SectionId };

const LABEL_MAX = 24;

type Draft = { label: string; title: string; text: string; status: string };
type Errors = Partial<Record<keyof Draft, string>>;

function validate(draft: Draft): Errors {
  const errors: Errors = {};
  if (!draft.label.trim()) errors.label = "عنوان دایره را بنویسید.";
  else if (draft.label.trim().length > LABEL_MAX)
    errors.label = `عنوان دایره حداکثر ${fa(LABEL_MAX)} نویسه باشد تا داخل دایره جا شود.`;
  if (!draft.title.trim()) errors.title = "عنوان صفحه را بنویسید.";
  if (!draft.text.trim())
    errors.text = "توضیح را بنویسید؛ همان متنی است که وسط صفحه می‌آید.";
  return errors;
}

/** Paragraphs are separated by an empty line in the editor. */
function toParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function update(
  sections: Section[],
  id: SectionId,
  change: (section: Section) => Section,
) {
  saveSections(sections.map((s) => (s.id === id ? change(s) : s)));
}

export function Admin() {
  const sections = useSections();
  const edited = hasOverride(sections);
  const editorRef = useRef<HTMLElement>(null);
  const [selected, setSelectedState] = useState<Selection>({
    kind: "section",
    section: sections[0].id,
  });
  const [resetOpen, setResetOpen] = useState(false);

  /** On one column the editor sits under the whole tree, so bring it up to the reader. */
  function setSelected(next: Selection, reveal = true) {
    setSelectedState(next);
    if (!reveal || window.matchMedia("(min-width: 48rem)").matches) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    requestAnimationFrame(() =>
      editorRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      }),
    );
  }
  const [notice, setNotice] = useState("");

  const section = sections.find((s) => s.id === selected.section)!;
  const leaf =
    selected.kind === "leaf"
      ? section.leaves.find((l) => l.slug === selected.slug)
      : undefined;
  const current: Selection =
    selected.kind === "leaf" && !leaf
      ? { kind: "section", section: section.id }
      : selected;

  function move(id: SectionId, index: number, by: -1 | 1) {
    update(sections, id, (s) => {
      const leaves = [...s.leaves];
      const [item] = leaves.splice(index, 1);
      leaves.splice(index + by, 0, item);
      return { ...s, leaves };
    });
    setNotice(
      "ترتیب ذخیره شد؛ دایره‌ها روی نقشه به همین ترتیب دور شاخه می‌چرخند.",
    );
  }

  return (
    <main
      id="content"
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:py-12"
    >
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold sm:text-3xl">مدیریت گره‌ها</h1>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-control px-2 text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            دیدن نقشه
            <ArrowLeft aria-hidden="true" strokeWidth={2} className="size-4" />
          </Link>
        </div>
        <p className="max-w-3xl text-base text-foreground/85">
          ترتیب، عنوان و توضیح گره‌های هر شاخه را این‌جا عوض کنید. تغییرها فقط
          در همین مرورگر ذخیره می‌شوند و نقشه‌ی عمومی در همین مرورگر از آن‌ها
          می‌خواند؛ در مرورگرهای دیگر همان محتوای اصلی دیده می‌شود.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full",
                edited ? "bg-brand" : "bg-muted-foreground",
              )}
            />
            {edited ? "نسخه‌ی ویرایش‌شده در این مرورگر" : "محتوای اصلی سایت"}
          </span>
          {edited ? (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setResetOpen(true)}
            >
              بازگرداندن محتوای اصلی
            </Button>
          ) : null}
        </div>
        <p
          role="status"
          aria-live="polite"
          className="min-h-7 text-sm text-brand"
        >
          {notice}
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-5">
        <nav aria-label="شاخه‌ها" className="md:col-span-2">
          <p className="mb-3 text-sm text-muted-foreground">خانه</p>
          <ol className="flex flex-col gap-6 border-s-2 border-border ps-4">
            {sections.map((s) => (
              <li key={s.id} className="flex flex-col gap-2">
                <TreeButton
                  active={
                    current.kind === "section" && current.section === s.id
                  }
                  onClick={() =>
                    setSelected({ kind: "section", section: s.id })
                  }
                  className="font-bold"
                >
                  {s.label}
                </TreeButton>
                <ol
                  className="flex flex-col gap-1 border-s border-border ps-4"
                  aria-label={`زیرگره‌های ${s.label}`}
                >
                  {s.leaves.map((l, i) => (
                    <li key={l.slug} className="flex items-center gap-1">
                      <TreeButton
                        active={
                          current.kind === "leaf" &&
                          current.section === s.id &&
                          current.slug === l.slug
                        }
                        onClick={() =>
                          setSelected({
                            kind: "leaf",
                            section: s.id,
                            slug: l.slug,
                          })
                        }
                        className="min-w-0 flex-1"
                      >
                        <span className="text-muted-foreground">
                          {fa(i + 1)}.
                        </span>{" "}
                        <bdi className="truncate">{l.label}</bdi>
                      </TreeButton>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-11"
                        aria-label={`بالا بردن ${l.label}`}
                        disabled={i === 0}
                        onClick={() => move(s.id, i, -1)}
                      >
                        <ArrowUp aria-hidden="true" strokeWidth={2} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-11"
                        aria-label={`پایین بردن ${l.label}`}
                        disabled={i === s.leaves.length - 1}
                        onClick={() => move(s.id, i, 1)}
                      >
                        <ArrowDown aria-hidden="true" strokeWidth={2} />
                      </Button>
                    </li>
                  ))}
                  <li>
                    <TreeButton
                      active={
                        current.kind === "new" && current.section === s.id
                      }
                      onClick={() =>
                        setSelected({ kind: "new", section: s.id })
                      }
                      disabled={s.leaves.length >= MAX_CHILDREN}
                      className="text-brand"
                    >
                      <Plus
                        aria-hidden="true"
                        strokeWidth={2}
                        className="size-4"
                      />
                      افزودن زیرگره
                    </TreeButton>
                  </li>
                </ol>
              </li>
            ))}
          </ol>
        </nav>

        <section
          ref={editorRef}
          aria-label="ویرایش گره"
          className="scroll-mt-4 md:col-span-3"
        >
          {current.kind === "section" ? (
            <Editor
              key={`s-${section.id}-${section.label}-${section.title}-${section.summary}`}
              heading={`شاخه‌ی ${section.label}`}
              meta={`${fa(section.leaves.length)} زیرگره از حداکثر ${fa(MAX_CHILDREN)}`}
              initial={{
                label: section.label,
                title: section.title,
                text: section.summary,
                status: "",
              }}
              href={`/${section.id}`}
              submitLabel="ذخیره‌ی شاخه"
              onSubmit={(d) => {
                update(sections, section.id, (s) => ({
                  ...s,
                  label: d.label,
                  title: d.title,
                  summary: d.text.replace(/\s*\n\s*/g, " "),
                }));
                setNotice(`شاخه‌ی «${d.label}» ذخیره شد.`);
              }}
            />
          ) : current.kind === "leaf" && leaf ? (
            <LeafEditor
              key={`l-${section.id}-${leaf.slug}-${JSON.stringify(leaf)}`}
              section={section}
              leaf={leaf}
              onSave={(next) => {
                update(sections, section.id, (s) => ({
                  ...s,
                  leaves: s.leaves.map((l) =>
                    l.slug === leaf.slug ? next : l,
                  ),
                }));
                setNotice(`گره «${next.label}» ذخیره شد.`);
              }}
              onRemove={() => {
                update(sections, section.id, (s) => ({
                  ...s,
                  leaves: s.leaves.filter((l) => l.slug !== leaf.slug),
                }));
                setSelected({ kind: "section", section: section.id });
                setNotice(
                  `گره «${leaf.label}» از شاخه‌ی ${section.label} حذف شد.`,
                );
              }}
            />
          ) : (
            <Editor
              key={`n-${section.id}`}
              heading={`زیرگره‌ی تازه در ${section.label}`}
              meta="آخر فهرست می‌نشیند؛ بعد می‌شود جایش را عوض کرد."
              initial={{ label: "", title: "", text: "", status: "" }}
              submitLabel="افزودن به شاخه"
              withStatus
              onSubmit={(d) => {
                const slug = `n${Date.now().toString(36)}`;
                const next: Leaf = {
                  slug,
                  label: d.label,
                  title: d.title,
                  body: toParagraphs(d.text),
                  ...(d.status ? { status: d.status } : {}),
                };
                update(sections, section.id, (s) => ({
                  ...s,
                  leaves: [...s.leaves, next],
                }));
                setSelected({ kind: "leaf", section: section.id, slug });
                setNotice(
                  `گره «${d.label}» به شاخه‌ی ${section.label} اضافه شد.`,
                );
              }}
            />
          )}
        </section>
      </div>

      <Dialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        role="alertdialog"
        title="بازگرداندن محتوای اصلی؟"
        description="همه‌ی ترتیب‌ها، عنوان‌ها، توضیح‌ها و گره‌هایی که در این مرورگر عوض کرده‌اید پاک می‌شوند."
        footer={
          <>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => {
                resetSections();
                setResetOpen(false);
                setSelected(
                  { kind: "section", section: sections[0].id },
                  false,
                );
                setNotice("محتوای اصلی برگشت.");
              }}
            >
              بازگرداندن
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setResetOpen(false)}
            >
              انصراف
            </Button>
          </>
        }
      />
    </main>
  );
}

function TreeButton({
  active,
  className,
  children,
  ...props
}: { active: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-control px-3 text-start text-base transition-colors duration-(--motion) ease-motion",
        "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        active && "bg-accent text-foreground ring-1 ring-brand/60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function LeafEditor({
  section,
  leaf,
  onSave,
  onRemove,
}: {
  section: Section;
  leaf: Leaf;
  onSave: (leaf: Leaf) => void;
  onRemove: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Editor
        heading={`گره ${leaf.label}`}
        meta={`زیرگره‌ی ${section.label}`}
        initial={{
          label: leaf.label,
          title: leaf.title,
          text: leaf.body.join("\n\n"),
          status: leaf.status ?? "",
        }}
        href={`/${section.id}/${leaf.slug}`}
        submitLabel="ذخیره‌ی گره"
        withStatus
        onSubmit={(d) => {
          const { status: _old, ...rest } = leaf;
          void _old;
          onSave({
            ...rest,
            label: d.label,
            title: d.title,
            body: toParagraphs(d.text),
            ...(d.status ? { status: d.status } : {}),
          });
        }}
        extra={
          <Button
            variant="outline"
            size="lg"
            className="text-destructive"
            onClick={() => setConfirm(true)}
          >
            <Trash2 aria-hidden="true" strokeWidth={2} />
            حذف این گره
          </Button>
        }
      />
      <Dialog
        open={confirm}
        onOpenChange={setConfirm}
        role="alertdialog"
        title={`حذف «${leaf.label}»؟`}
        description={`این گره و صفحه‌اش از شاخه‌ی ${section.label} برداشته می‌شود. با «بازگرداندن محتوای اصلی» برمی‌گردد.`}
        footer={
          <>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => {
                setConfirm(false);
                onRemove();
              }}
            >
              حذف
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setConfirm(false)}
            >
              انصراف
            </Button>
          </>
        }
      />
    </>
  );
}

function Editor({
  heading,
  meta,
  initial,
  href,
  submitLabel,
  withStatus = false,
  onSubmit,
  extra,
}: {
  heading: string;
  meta: string;
  initial: Draft;
  href?: string;
  submitLabel: string;
  withStatus?: boolean;
  onSubmit: (draft: Draft) => void;
  extra?: React.ReactNode;
}) {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const set = (field: keyof Draft) => (event: { target: { value: string } }) =>
    setDraft((d) => ({ ...d, [field]: event.target.value }));

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        const found = validate(draft);
        setErrors(found);
        if (Object.keys(found).length) return;
        onSubmit({
          label: draft.label.trim(),
          title: draft.title.trim(),
          text: draft.text.trim(),
          status: draft.status.trim(),
        });
      }}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">
          <bdi>{heading}</bdi>
        </h2>
        <p className="text-sm text-muted-foreground">{meta}</p>
      </div>
      <Field
        label="عنوان داخل دایره"
        htmlFor="label"
        hint="کوتاه بنویسید؛ داخل دایره می‌شکند و دایره بزرگ‌تر می‌شود."
      >
        <Input
          id="label"
          value={draft.label}
          onChange={set("label")}
          error={errors.label}
          maxLength={40}
          className="h-11"
        />
      </Field>
      <Field label="عنوان صفحه" htmlFor="title">
        <Input
          id="title"
          value={draft.title}
          onChange={set("title")}
          error={errors.title}
          className="h-11"
        />
      </Field>
      {withStatus ? (
        <Field
          label="وضعیت"
          htmlFor="status"
          hint="اختیاری؛ مثل «در حال ساخت» یا «برگزار شد»."
        >
          <Input
            id="status"
            value={draft.status}
            onChange={set("status")}
            className="h-11"
          />
        </Field>
      ) : null}
      <Field
        label="توضیح"
        htmlFor="text"
        hint="وسط صفحه، زیر عنوان می‌آید. بندها را با یک خط خالی از هم جدا کنید."
      >
        <Textarea
          id="text"
          value={draft.text}
          onChange={set("text")}
          autoResize
          className="min-h-32 text-base"
          aria-invalid={errors.text ? true : undefined}
        />
        {errors.text ? (
          <p className="text-sm text-destructive">{errors.text}</p>
        ) : null}
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="brand" size="lg">
          {submitLabel}
        </Button>
        {extra}
        {href ? (
          <Link
            href={href}
            className="inline-flex h-11 items-center gap-2 rounded-control px-2 text-sm font-semibold text-foreground/85 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            دیدن روی نقشه
            <ArrowLeft aria-hidden="true" strokeWidth={2} className="size-4" />
          </Link>
        ) : null}
      </div>
    </form>
  );
}
