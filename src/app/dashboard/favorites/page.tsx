"use client";
import { FileBrowser } from "../_component/file-browser";

export default function Favorites() {
  return <FileBrowser title="Favorites" favoritesOnly={true} />;
}
