import {
  Boxes,
  Brain,
  CalendarClock,
  CalendarDays,
  Clapperboard,
  Compass,
  Gamepad2,
  Glasses,
  GraduationCap,
  Handshake,
  Info,
  Mail,
  Mic,
  Shapes,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { SectionId } from "@/lib/content";

export const sectionIcons: Record<SectionId, LucideIcon> = {
  events: CalendarDays,
  about: Info,
  education: GraduationCap,
  product: Boxes,
};

const leafIcons: Record<string, LucideIcon> = {
  "events/hoosh": Mic,
  "events/next": CalendarClock,
  "about/intro": Compass,
  "about/fields": Shapes,
  "about/contact": Mail,
  "education/vr": Glasses,
  "education/gamification": Gamepad2,
  "education/partners": Handshake,
  "product/neurotopia": Brain,
  "product/anavia": Sparkles,
  "product/media": Clapperboard,
};

export function leafIcon(section: SectionId, slug: string): LucideIcon {
  return leafIcons[`${section}/${slug}`] ?? Compass;
}
