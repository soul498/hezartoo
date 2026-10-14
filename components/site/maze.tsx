"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { rooms, routeQuery, type RoomId } from "@/lib/content";

const order: RoomId[] = ["cognition", "ai", "center", "play", "xr"];

const place: Record<RoomId, string> = {
  cognition: "col-start-2 row-start-1",
  ai: "col-start-1 row-start-2",
  center: "col-start-2 row-start-2",
  play: "col-start-3 row-start-2",
  xr: "col-start-2 row-start-3",
};

const neighbors: Record<RoomId, Partial<Record<string, RoomId>>> = {
  center: { ArrowUp: "cognition", ArrowDown: "xr", ArrowRight: "ai", ArrowLeft: "play" },
  cognition: { ArrowDown: "center" },
  xr: { ArrowUp: "center" },
  ai: { ArrowLeft: "center" },
  play: { ArrowRight: "center" },
};

export function Maze({
  room,
  onRoom,
}: {
  room: RoomId;
  onRoom: (room: RoomId) => void;
}) {
  const [query, setQuery] = useState("");
  const [miss, setMiss] = useState(false);
  const current = rooms[room];

  useEffect(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;
    if (!active.closest("[aria-label='نقشه‌ی اتاق‌ها']")) return;
    document.getElementById(`room-${room}`)?.focus();
  }, [room]);

  function ask(event: FormEvent) {
    event.preventDefault();
    const next = routeQuery(query);
    setMiss(next.miss);
    onRoom(next.room);
  }

  return (
    <section id="maze" className="scroll-mt-20 py-16">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-medium text-brand">نقشه</p>
        <h2 className="text-3xl">چهار راهرو، یک مرکز</h2>
        <p className="max-w-2xl text-lg">
          این هزارتو معما نیست. یک اتاق را انتخاب کنید، یا واژه‌ای بنویسید تا درِ همان راهرو باز شود.
        </p>
      </div>

      <form onSubmit={ask} className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label="دنبال کدام میدان هستید؟" htmlFor="maze-query" hint="مثلاً واقعیت مجازی، بازی، شناخت یا رسانه">
          <Input
            id="maze-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="واژه‌ای از کار هزارتو"
            startAddon={<Search strokeWidth={1.5} className="size-4" />}
          />
        </Field>
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          برو به اتاق
          <ArrowLeft strokeWidth={2} />
        </Button>
      </form>

      {miss ? (
        <Alert variant="warning" title="این واژه به اتاق مشخصی نرسید" className="mb-6">
          نقشه را با دست انتخاب کنید. مرکز، شناخت، واقعیت، بازی و هوش همین‌جا هستند.
        </Alert>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 md:items-stretch">
        <div
          className="grid grid-cols-3 grid-rows-3 gap-3"
          role="group"
          aria-label="نقشه‌ی اتاق‌ها"
          onKeyDown={(event) => {
            const next = neighbors[room][event.key];
            if (!next) return;
            event.preventDefault();
            onRoom(next);
          }}
        >
          {order.map((id) => {
            const active = id === room;
            return (
              <Button
                key={id}
                id={`room-${id}`}
                variant={active ? "default" : "outline"}
                aria-pressed={active}
                onClick={() => {
                  setMiss(false);
                  onRoom(id);
                }}
                className={`min-h-20 w-full whitespace-normal ${place[id]}`}
              >
                {rooms[id].label}
              </Button>
            );
          })}
        </div>

        <Card className="min-h-48" aria-live="polite">
          <CardHeader>
            <CardTitle className="text-xl">{current.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-foreground">{current.body}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              با جهت‌نما بین اتاق‌های همسایه جابه‌جا شوید. اتاق روشن، جایی است که ایستاده‌اید.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
