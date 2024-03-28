import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { SearchBar } from "./search-bar";
import { UploadFile } from "./upload-file";
import { FileCard } from "./file-card";
import { GridIcon, Loader2, RowsIcon } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileTable } from "./file-table";
import { columns } from "./columns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doc } from "../../../../convex/_generated/dataModel";

function Placeholder() {
  return (
    <div className="flex flex-col gap-8 w-full items-center mt-24">
      <Image
        alt="an image of a picture and directory icon"
        width="300"
        height="300"
        src="/no_files.svg"
      />
      <div className="text-2xl">You have no files, upload one now</div>
    </div>
  );
}

export const FileBrowser = ({
  title,
  favoritesOnly = false,
}: {
  title: string;
  favoritesOnly: boolean;
}) => {
  const [query, setQuery] = useState("");

  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const { isLoaded: isUserLoaded, user } = useUser();

  const [type, setType] = useState<Doc<"files">["type"] | "all">("all");

  let orgId: string | undefined;
  if (isOrgLoaded && isUserLoaded) {
    orgId = organization?.id ?? user?.id;
  }

  const files = useQuery(
    api.files.getFiles,
    orgId
      ? {
          orgId,
          query: query.trim(),
          onlyFavorites: favoritesOnly,
          type: type === "all" ? undefined : type,
        }
      : "skip"
  );

  const favoriteFiles = useQuery(
    api.files.getFavoriteFiles,
    orgId ? { orgId } : "skip"
  );

  const isLoading = files == undefined;

  const modifiedFiles =
    files?.map((file) => ({
      ...file,
      isFavorite: (favoriteFiles ?? []).some(
        (favoriteFile) =>
          favoriteFile.fileId === file._id && favoriteFile.orgId === file.orgId
      ),
    })) ?? [];

  const isQueried = query.trim().length > 0;

  if (files && favoriteFiles) {
  }

  return (
    <>
      {!isLoading && (isQueried || modifiedFiles.length > 0) && (
        <>
          <div className="flex justify-between items-center my-4">
            <h1 className="text-4xl font-bold">{title}</h1>
            <SearchBar query={query} setQuery={setQuery} />
            <UploadFile orgId={orgId ? orgId : ""} />
          </div>
          <Tabs defaultValue="grid">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="grid" className="flex gap-2 items-center">
                  <GridIcon />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="table" className="flex gap-2 items-center">
                  <RowsIcon />
                  Table
                </TabsTrigger>
              </TabsList>
              <Select
                value={type}
                onValueChange={(newType) => {
                  setType(newType as any);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TabsContent value="grid">
              <div className="grid grid-cols-4 gap-4 py-4">
                {modifiedFiles?.map((file) => (
                  <FileCard file={file} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="table">
              <FileTable columns={columns} data={modifiedFiles} />
            </TabsContent>
          </Tabs>
        </>
      )}
      {isLoading && (
        <div className="flex flex-col gap-8 w-full items-center mt-12 text-grey-500">
          <Loader2 className="w-32 h-32 animate-spin" />
          <div className="text-2xl">Loading your images...</div>
        </div>
      )}
      {isQueried && !isLoading && modifiedFiles.length == 0 && <Placeholder />}
      {!isQueried && !isLoading && modifiedFiles.length == 0 && (
        <div className="flex flex-col gap-8 w-full items-center mt-12">
          <Placeholder />
          <UploadFile orgId={orgId ? orgId : ""} />
        </div>
      )}
    </>
  );
};
