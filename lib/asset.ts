/** Public files are not prefixed by Next when the src is a plain string, so add the GitHub Pages base path. */
export function asset(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
