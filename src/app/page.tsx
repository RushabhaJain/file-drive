"use client";

import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignedOut,
  SignedIn,
  SignOutButton,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UploadFile } from "./_component/upload-file";
import { FileCard } from "./_component/file-card";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const { isLoaded: isUserLoaded, user } = useUser();
  let orgId: string | undefined;
  if (isOrgLoaded && isUserLoaded) {
    orgId = organization?.id ?? user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  const isLoading = files == undefined;
  return (
    <main className="container pt-12">
      {isLoading && (
        <div className="flex flex-col gap-8 w-full items-center mt-12 text-grey-500">
          <Loader2 className="w-32 h-32 animate-spin" />
          <div className="text-2xl">Loading your images...</div>
        </div>
      )}
      {!isLoading && files.length == 0 && (
        <div className="flex flex-col gap-8 w-full items-center mt-12">
          <Image
            alt="an image of picture and directory icon"
            width="400"
            height="300"
            src="/no_files.svg"
          />
          <div className="text-2xl">You have no files, upload one now</div>
          <UploadFile orgId={orgId ? orgId : ""} />
        </div>
      )}
      {!isLoading && files.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">Your Files</h1>
            <UploadFile orgId={orgId ? orgId : ""} />
          </div>
          <div className="grid grid-cols-3 gap-4 py-4">
            {files?.map((file) => (
              <FileCard file={file} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
