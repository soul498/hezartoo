"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import { Dialog } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";
import { ButtonLink } from "@/components/site/button-link";
import { Contact } from "@/components/site/contact";
import { Header } from "@/components/site/header";
import { Lockup } from "@/components/site/logo";
import { Maze } from "@/components/site/maze";
import { faqs, instagramUrl, linkedinUrl, projects, type RoomId } from "@/lib/content";

function scrollToId(id: string) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export function HomePage() {
  const [room, setRoom] = useState<RoomId>("center");
  const [project, setProject] = useState<(typeof projects)[number] | null>(null);

  return (
    <>
      <Header />
      <main id="content">
        <div id="top" className="mx-auto w-full max-w-5xl px-4">
          <section className="grid items-center gap-8 py-16 md:grid-cols-2 md:py-24">
            <div className="order-2 flex flex-col items-start gap-6 md:order-1">
              <p className="text-sm text-muted-foreground">شرکت فناوری و نوآوری شناخت</p>
              <h1 className="text-3xl md:text-5xl">علم به بازی می‌رسد و رسانه تجربه می‌شود</h1>
              <p className="text-lg">
                هزارتو سامانه‌های بازی‌وار، محیط‌های یادگیری غوطه‌ور و سکوهای رسانه‌ای هوشمند می‌سازد. شناخت، روایت و فناوری سر یک میز می‌نشینند.
              </p>
              <p className="text-base">
                از سکوهای آموزشی و شناختی در واقعیت مجازی تا تولید رسانه‌ای با هوش مصنوعی و روایت دیجیتال تعاملی. استارتاپی در حال رشد، با نخستین حضور عمومی در اسفند ۱۴۰۳.
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button size="lg" onClick={() => scrollToId("maze")}>
                  قدم در نقشه
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollToId("projects")}>
                  پروژه‌های شاخص
                </Button>
              </div>
            </div>
            <Lockup className="order-1 md:order-2" />
          </section>

          <Maze room={room} onRoom={setRoom} />

          <section id="projects" className="scroll-mt-20 py-16">
            <div className="mb-6 flex flex-col gap-2">
              <p className="text-sm font-medium text-brand">پروژه‌ها</p>
              <h2 className="text-3xl">دو نام، هنوز در راه</h2>
              <p className="max-w-2xl text-lg">
                Neurotopia و Anavia پروژه‌های شاخص هزارتو هستند. شرح محصول‌شان هنوز عمومی نشده و این صفحه برایشان ویژگی نمی‌سازد.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardDescription>{item.status}</CardDescription>
                    <CardTitle className="text-xl">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="text-base">
                      نام این پروژه در معرفی رسمی شرکت آمده است. جزئیات را وقتی خود هزارتو منتشر کند، همین‌جا و در اینستاگرام می‌شود خواند.
                    </p>
                    <Button variant="outline" onClick={() => setProject(item)} className="w-full sm:w-auto">
                      همین‌قدر که عمومی است
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="event" className="scroll-mt-20 py-16">
            <div className="mb-6 flex flex-col gap-2">
              <p className="text-sm font-medium text-brand">رویداد</p>
              <h2 className="text-3xl">هوش؛ از انسان تا کامپیوتر</h2>
              <p className="max-w-2xl text-lg">
                نخستین رویداد عمومی هزارتو، با همکاری پارک علم و فناوری گلستان. موضوع، مسیر تکامل هوش از مغز انسان تا هوش مصنوعی بود.
              </p>
            </div>
            <Card>
              <CardHeader>
                <div className="mb-2 flex flex-wrap gap-3">
                  <Badge variant="brand">برگزار شده</Badge>
                  <Badge variant="secondary">۲۲ اسفند ۱۴۰۳</Badge>
                  <Badge variant="secondary">گرگان</Badge>
                </div>
                <CardTitle className="text-xl">کارخانه نوآوری گرگان، سالن رویدادها</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="session" variant="underline">
                  <TabsList aria-label="جزئیات رویداد">
                    <TabsTrigger value="session" className="min-h-11">
                      نشست
                    </TabsTrigger>
                    <TabsTrigger value="speakers" className="min-h-11">
                      سخنران‌ها
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="session">
                    <ul className="flex flex-col gap-3 text-base">
                      <li>چهارشنبه ۲۲ اسفند ۱۴۰۳، ساعت ۱۰ تا ۱۲</li>
                      <li>میزبان مکان: کارخانه نوآوری گرگان</li>
                      <li>همراه برگزارکننده: پارک علم و فناوری گلستان</li>
                    </ul>
                    <Separator className="my-4" />
                    <p className="text-base">
                      نشست برای پژوهشگران، دانشجویان و علاقه‌مندان هوش مصنوعی، علوم شناختی و فناوری‌های نوین برگزار شد.
                    </p>
                  </TabsContent>
                  <TabsContent value="speakers">
                    <ul className="flex flex-col gap-4 text-base">
                      <li>
                        <span className="block font-semibold">امیرحسین فیضی</span>
                        پژوهشگر و کاندیدای دکتری علوم اعصاب شناختی
                      </li>
                      <li>
                        <span className="block font-semibold">مهرشاد عیسایی</span>
                        پژوهشگر بینایی ماشین و پردازش زبان طبیعی
                      </li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          <section id="faq" className="scroll-mt-20 py-16">
            <div className="mb-6 flex flex-col gap-2">
              <p className="text-sm font-medium text-brand">پرسش‌ها</p>
              <h2 className="text-3xl">قبل از اینکه پیام بدهید</h2>
            </div>
            <Accordion
              items={faqs.map((item) => ({
                id: item.id,
                title: item.title,
                content: item.content,
              }))}
            />
          </section>

          <Contact />
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 text-sm">
          <p className="text-base font-semibold text-foreground">شرکت فناوری و نوآوری شناخت هزارتو</p>
          <p className="text-muted-foreground">HEZARTOO · نخستین حضور عمومی، اسفند ۱۴۰۳</p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink href={instagramUrl} target="_blank" rel="noreferrer" variant="ghost">
              اینستاگرام
            </ButtonLink>
            <Tooltip content="معرفی رسمی شرکت">
              <ButtonLink href={linkedinUrl} target="_blank" rel="noreferrer" variant="ghost">
                لینکدین
              </ButtonLink>
            </Tooltip>
            <ButtonLink href="https://vibefarsi.ir/components" target="_blank" rel="noreferrer" variant="ghost">
              کامپوننت‌های وایب‌فارسی
            </ButtonLink>
          </div>
          <Separator />
          <p className="text-muted-foreground">
            رابط این صفحه با کامپوننت‌های راست‌چین وایب‌فارسی ساخته شده و نسخه‌ی نمایشی‌اش روی گیت‌هاب پیجز است.
          </p>
        </div>
      </footer>

      <Dialog
        open={project !== null}
        onOpenChange={(open) => {
          if (!open) setProject(null);
        }}
        title={project?.name}
        description="پروژه‌ی شاخص در حال ساخت"
        footer={
          <ButtonLink href={instagramUrl} target="_blank" rel="noreferrer">
            دنبال کردن در اینستاگرام
          </ButtonLink>
        }
      >
        <p className="text-base">
          هزارتو این نام را کنار پروژه‌های شاخص خود آورده است. تا وقتی شرح محصول منتشر نشود، همین صفحه فقط به دامنه‌ی کار شرکت برمی‌گردد: واقعیت مجازی آموزشی و شناختی، رسانه‌ی هوشمند، و روایت تعاملی.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">منبع نام پروژه: معرفی شرکت در لینکدین.</p>
      </Dialog>

      {process.env.NODE_ENV !== "production" ? (
        <p className="px-4 pb-6 text-center text-sm text-muted-foreground">پیش‌نمایش محلی · اتاق: {room}</p>
      ) : null}
    </>
  );
}
