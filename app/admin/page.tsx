import type { Metadata } from "next";
import { Admin } from "@/components/admin/admin";

export const metadata: Metadata = {
  title: "مدیریت گره‌ها | هزارتو",
  robots: { index: false, follow: false },
};

/** Unlisted: nothing on the graph links here. Edits stay in this browser's localStorage. */
export default function Page() {
  return <Admin />;
}
