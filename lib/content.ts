export const instagramUrl = "https://www.instagram.com/hezartoovr/";
export const linkedinUrl = "https://www.linkedin.com/company/hezartooco";

export const nav = [
  { href: "#maze", label: "نقشه" },
  { href: "#projects", label: "پروژه‌ها" },
  { href: "#event", label: "رویداد" },
  { href: "#faq", label: "پرسش‌ها" },
  { href: "#contact", label: "تماس" },
] as const;

export type RoomId = "center" | "cognition" | "xr" | "play" | "ai";

export const rooms: Record<
  RoomId,
  { label: string; title: string; body: string; keywords: string[] }
> = {
  center: {
    label: "مرکز",
    title: "میانه‌ی هزارتو",
    body: "هزارتو فقط اسم شرکت نیست. هر تجربه‌ی شناختی از یک پیچ شروع می‌شود: یک پرسش، یک حس، یک قاعده. این اتاق مرکز است. چهار راهرو به چهار میدان کار باز می‌شود.",
    keywords: ["هزارتو", "مرکز", "شرکت"],
  },
  cognition: {
    label: "شناخت",
    title: "علوم شناختی",
    body: "یادگیری وقتی معنا دارد که ذهن را درگیر کند. توجه، حافظه، ادراک و تصمیمی که داخل تجربه گرفته می‌شود، نقطه‌ی شروع کار هزارتو است؛ نه یک اسلاید که از کنارش رد شویم.",
    keywords: ["شناخت", "شناختی", "یادگیری", "ذهن", "حافظه", "توجه"],
  },
  xr: {
    label: "واقعیت",
    title: "واقعیت گسترده",
    body: "سکوهای آموزشی و شناختی مبتنی بر واقعیت مجازی این‌جا ساخته می‌شوند. حضور، به‌جای تماشا. فضایی که می‌شود داخلش راه رفت، اشتباه کرد و دوباره ساخت.",
    keywords: ["واقعیت", "مجازی", "هدست", "xr", "vr", "غوطه"],
  },
  play: {
    label: "بازی",
    title: "طراحی بازی",
    body: "بازی‌وارسازی برای هزارتو تزئین روی یک درس نیست. قاعده، بازخورد و پیشرفت ابزارهایی هستند که یک مفهوم شناختی را قابل‌لمس می‌کنند.",
    keywords: ["بازی", "گیم", "بازی‌وار", "gamif"],
  },
  ai: {
    label: "هوش",
    title: "هوش مصنوعی",
    body: "تولید رسانه‌ای هوشمند و روایت تعاملی دیجیتال، میدان دیگر هزارتو است. هوش مصنوعی کنار انسان می‌نشیند تا روایت دقیق‌تر شود، نه اینکه جای پرسش را بگیرد.",
    keywords: ["هوش", "مصنوعی", "رسانه", "روایت", "ai"],
  },
};

export const projects = [
  {
    id: "neurotopia",
    name: "Neurotopia",
    status: "در حال ساخت",
  },
  {
    id: "anavia",
    name: "Anavia",
    status: "در حال ساخت",
  },
] as const;

export const topics = [
  { value: "school", label: "مدرسه و یادگیری" },
  { value: "research", label: "همکاری پژوهشی" },
  { value: "hub", label: "خانه‌ی نوآوری" },
  { value: "event", label: "رویداد" },
  { value: "project", label: "پروژه‌ی مشترک" },
];

export const faqs = [
  {
    id: "what",
    title: "هزارتو دقیقاً چه کار می‌کند؟",
    content:
      "شرکت فناوری و نوآوری شناخت است. سامانه‌های بازی‌وار، محیط‌های یادگیری غوطه‌ور و سکوهای رسانه‌ای هوشمند می‌سازد؛ در چهارراه واقعیت گسترده، هوش مصنوعی، طراحی بازی و علوم شناختی.",
  },
  {
    id: "projects",
    title: "Neurotopia و Anavia چه هستند؟",
    content:
      "دو پروژه‌ی شاخص که شرکت در معرفی عمومی‌اش نام برده و هنوز در حال ساخته‌شدن‌اند. جزئیات محصول را وقتی منتشر نشده، این‌جا اختراع نمی‌کنیم. خبر را از اینستاگرام و لینکدین هزارتو دنبال کنید.",
  },
  {
    id: "shop",
    title: "این صفحه فروشگاه هدست واقعیت مجازی است؟",
    content:
      "نه. هزارتوی این صفحه شرکت فناوری و نوآوری شناخت است و تجهیزات گیمینگ نمی‌فروشد. واقعیت مجازی این‌جا ابزار ساخت تجربه‌ی آموزشی و شناختی است.",
  },
  {
    id: "who",
    title: "با چه کسانی همراه می‌شود؟",
    content:
      "با مدرسه‌ها، مراکز پژوهشی و خانه‌های نوآوری. نخستین حضور عمومی‌اش نشست «هوش؛ از انسان تا کامپیوتر» بود، با پارک علم و فناوری گلستان در کارخانه نوآوری گرگان.",
  },
  {
    id: "message",
    title: "پیام فرم تماس کجا می‌رود؟",
    content:
      "این نسخه‌ی نمایشی سرور ندارد و پیام را جایی ذخیره نمی‌کند. متن را کپی می‌کنید و در اینستاگرام هزارتو می‌فرستید تا به دست شرکت برسد.",
  },
];

export function routeQuery(raw: string): { room: RoomId; miss: boolean } {
  const q = raw
    .trim()
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, "");
  if (!q) return { room: "center", miss: true };
  const order: RoomId[] = ["xr", "play", "ai", "cognition", "center"];
  for (const id of order) {
    if (rooms[id].keywords.some((word) => q.includes(word.replace(/\u200c/g, "")))) {
      return { room: id, miss: false };
    }
  }
  return { room: "center", miss: true };
}
