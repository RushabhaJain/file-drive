import Link from "next/link";
import { FileIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavBar } from "./_component/nav-bar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex gap-8 my-8 px-8">
      <NavBar />
      <div className="w-full">{children}</div>
    </div>
  );
}
