"use client";

import { OrganizationSwitcher, SignedIn } from "@clerk/clerk-react";
import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <div className="border-b py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>File Drive</div>
        <SignedIn>
          <OrganizationSwitcher />
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
