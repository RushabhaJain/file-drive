"use client";
import { FileBrowser } from "../_component/file-browser";

export default function Files() {
  return <FileBrowser title="Your Files" favoritesOnly={false} />;
}
