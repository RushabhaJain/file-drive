"use client";

import {
  OrganizationSwitcher,
  SignInButton,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";

export function Header() {
  return (
    <div className="border-b py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <div>File Drive</div>
        </Link>
        <div className="flex items-center gap-4">
          <SignedIn>
            <OrganizationSwitcher />
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}
