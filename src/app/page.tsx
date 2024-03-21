"use client";

import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignedOut,
  SignedIn,
  SignOutButton,
  useOrganization,
  useSession,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const createFile = useMutation(api.files.createFile);
  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const { isLoaded: isUserLoaded, user } = useUser();
  let orgId: string | undefined;
  if (isOrgLoaded && isUserLoaded) {
    orgId = organization?.id ?? user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button
        onClick={() => {
          if (!orgId) return;
          createFile({
            title: "Hello World",
            orgId,
          });
        }}
      >
        Upload File
      </Button>
      {files?.map((file) => (
        <div key={file._id}>{file.title}</div>
      ))}
      <SignedOut>
        <SignInButton mode="modal">
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </SignedIn>
    </main>
  );
}
