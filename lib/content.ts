export const instagramUrl = "https://www.instagram.com/hezartoovr/";

/** Physical side of the hub the section hangs from. Not flipped by RTL. */
export type Side = "top" | "bottom" | "left" | "right";

export type SectionId = "events" | "about" | "education" | "product";

export type Leaf = {
  slug: string;
  /** Short label drawn under the dot on the graph. */
  label: string;
  title: string;
  status?: string;
  body: string[];
  facts?: { label: string; value: string }[];
  people?: { name: string; role: string }[];
  items?: { title: string; body: string }[];
  /** Other pages drawn as extra circles around the leaf; `short` goes inside the circle, `label` is its accessible name. */
  links?: { href: string; short: string; label: string }[];
  contact?: boolean;
};

export type Section = {
  id: SectionId;
  side: Side;
  label: string;
  title: string;
  summary: string;
  leaves: Leaf[];
};

export const sections: Section[] = [
  {
    id: "events",
    side: "top",
    label: "رویداد",
    title: "رویدادها",
    summary: "نخستین حضور عمومی هزارتو و خبر رویدادهای بعدی.",
    leaves: [
      {
        slug: "hoosh",
        label: "هوش؛ از انسان تا کامپیوتر",
        title: "هوش؛ از انسان تا کامپیوتر",
        status: "برگزار شد",
        body: [
          "نخستین رویداد عمومی هزارتو، با همراهی پارک علم و فناوری گلستان. دو سخنران از دو سوی یک پرسش: هوش در مغز انسان و هوش در ماشین.",
        ],
        facts: [
          { label: "تاریخ", value: "چهارشنبه ۲۲ اسفند ۱۴۰۳" },
          { label: "ساعت", value: "۱۰ تا ۱۲" },
          { label: "مکان", value: "کارخانه نوآوری گرگان، سالن رویدادها" },
          { label: "همراه", value: "پارک علم و فناوری گلستان" },
        ],
        people: [
          {
            name: "امیرحسین فیضی",
            role: "پژوهشگر و کاندیدای دکتری علوم اعصاب شناختی",
          },
          {
            name: "مهرشاد عیسایی",
            role: "پژوهشگر بینایی ماشین و پردازش زبان طبیعی",
          },
        ],
      },
      {
        slug: "next",
        label: "رویداد بعدی",
        title: "رویداد بعدی",
        status: "هنوز اعلام نشده",
        body: [
          "تاریخ و موضوع رویداد بعدی هنوز اعلام نشده است. خبرش اول در اینستاگرام هزارتو منتشر می‌شود.",
        ],
      },
    ],
  },
  {
    id: "about",
    side: "bottom",
    label: "درباره ما",
    title: "درباره‌ی هزارتو",
    summary:
      "شرکت فناوری و نوآوری شناخت؛ این‌که چه می‌سازد و چطور می‌شود با آن حرف زد.",
    leaves: [
      {
        slug: "intro",
        label: "معرفی",
        title: "معرفی و مأموریت",
        body: [
          "هزارتو شرکت فناوری و نوآوری شناخت است. سکوهای آموزشی و شناختی مبتنی بر واقعیت مجازی، سامانه‌های بازی‌وار، تولید رسانه‌ای هوشمند و روایت تعاملی دیجیتال می‌سازد.",
          "کار هزارتو در محل برخورد واقعیت گسترده، هوش مصنوعی، طراحی بازی و علوم شناختی است: تجربه‌ای که ذهن را درگیر کند، نه این‌که فقط تماشایش کنیم.",
          "هزارتوی این صفحه فروشگاه هدست و تجهیزات گیمینگ نیست. واقعیت مجازی این‌جا ابزار ساخت تجربه‌ی آموزشی و شناختی است.",
        ],
      },
      {
        slug: "fields",
        label: "حوزه‌ها",
        title: "چهار حوزه‌ی کار",
        body: ["هر پروژه‌ی هزارتو از ترکیب این چهار حوزه ساخته می‌شود."],
        items: [
          {
            title: "واقعیت گسترده",
            body: "سکوهای آموزشی و شناختی مبتنی بر واقعیت مجازی؛ حضور به‌جای تماشا.",
          },
          {
            title: "هوش مصنوعی",
            body: "تولید رسانه‌ای هوشمند و روایت تعاملی دیجیتال، با هوش مصنوعی کنار انسان.",
          },
          {
            title: "طراحی بازی",
            body: "قاعده، بازخورد و پیشرفت؛ ابزارهایی که یک مفهوم را قابل‌لمس می‌کنند.",
          },
          {
            title: "علوم شناختی",
            body: "توجه، حافظه، ادراک و تصمیم؛ نقطه‌ی شروع طراحی هر تجربه.",
          },
        ],
      },
      {
        slug: "contact",
        label: "تماس",
        title: "تماس با هزارتو",
        body: [
          "مدرسه، پژوهش، خانه‌ی نوآوری یا یک پروژه‌ی مشترک. پیام را این‌جا می‌نویسید و در اینستاگرام هزارتو می‌فرستید.",
        ],
        contact: true,
      },
    ],
  },
  {
    id: "education",
    side: "left",
    label: "آموزش",
    title: "آموزش",
    summary:
      "یادگیری‌ای که داخلش می‌شود راه رفت، بازی کرد و دوباره امتحان کرد.",
    leaves: [
      {
        slug: "vr",
        label: "واقعیت مجازی",
        title: "یادگیری غوطه‌ور در واقعیت مجازی",
        body: [
          "هزارتو سکوهای آموزشی و شناختی مبتنی بر واقعیت مجازی می‌سازد. حضور، به‌جای تماشا: فضایی که می‌شود داخلش راه رفت، اشتباه کرد و دوباره ساخت.",
        ],
      },
      {
        slug: "gamification",
        label: "بازی‌وارسازی",
        title: "بازی‌وارسازی",
        body: [
          "بازی‌وارسازی برای هزارتو تزئین روی یک درس نیست. قاعده، بازخورد و پیشرفت ابزارهایی هستند که یک مفهوم شناختی را قابل‌لمس می‌کنند.",
        ],
      },
      {
        slug: "partners",
        label: "همکاری‌ها",
        title: "همکاری با مدرسه‌ها و مراکز پژوهشی",
        body: [
          "هزارتو با مدرسه‌ها، مراکز پژوهشی و خانه‌های نوآوری همکاری می‌کند. اگر از طرف یکی از این مجموعه‌ها می‌نویسید، از گره تماس پیام بدهید.",
        ],
        links: [
          { href: "/about/contact", short: "تماس", label: "رفتن به گره تماس" },
        ],
      },
    ],
  },
  {
    id: "product",
    side: "right",
    label: "محصول",
    title: "محصول‌ها",
    summary: "دو پروژه‌ی شاخص در حال ساخت، و خط رسانه‌ی هوشمند هزارتو.",
    leaves: [
      {
        slug: "neurotopia",
        label: "Neurotopia",
        title: "Neurotopia",
        status: "در حال ساخت",
        body: [
          "یکی از دو پروژه‌ی شاخص هزارتو که هنوز در حال ساخت است. شرح محصول هنوز منتشر نشده و این‌جا چیزی از خودمان به آن اضافه نمی‌کنیم.",
          "خبر رونمایی را از اینستاگرام و لینکدین هزارتو دنبال کنید.",
        ],
      },
      {
        slug: "anavia",
        label: "Anavia",
        title: "Anavia",
        status: "در حال ساخت",
        body: [
          "دومین پروژه‌ی شاخص هزارتو، آن هم در حال ساخت. تا وقتی جزئیاتش منتشر نشود، همین قدر می‌دانیم که در دامنه‌ی کار شرکت است: واقعیت مجازی آموزشی و شناختی، رسانه‌ی هوشمند و روایت تعاملی.",
          "خبر رونمایی را از اینستاگرام و لینکدین هزارتو دنبال کنید.",
        ],
      },
      {
        slug: "media",
        label: "رسانه‌ی هوشمند",
        title: "رسانه‌ی هوشمند و روایت تعاملی",
        body: [
          "تولید رسانه‌ای هوشمند و روایت تعاملی دیجیتال، میدان دیگر کار هزارتو است. هوش مصنوعی کنار انسان می‌نشیند تا روایت دقیق‌تر شود، نه این‌که جای پرسش را بگیرد.",
        ],
      },
    ],
  },
];

export const topics = [
  { value: "school", label: "مدرسه و یادگیری" },
  { value: "research", label: "همکاری پژوهشی" },
  { value: "hub", label: "خانه‌ی نوآوری" },
  { value: "event", label: "رویداد" },
  { value: "project", label: "پروژه‌ی مشترک" },
];

export function getSection(id: string): Section | undefined {
  return sections.find((section) => section.id === id);
}

export function getLeaf(sectionId: string, slug: string) {
  const section = getSection(sectionId);
  const leaf = section?.leaves.find((item) => item.slug === slug);
  return section && leaf ? { section, leaf } : undefined;
}
