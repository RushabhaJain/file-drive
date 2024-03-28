import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Doc } from "../../../../convex/_generated/dataModel";
import { formatRelative } from "date-fns";

import {
  FileImage,
  FileImageIcon,
  FileText,
  FileTextIcon,
  Sheet,
  SheetIcon,
} from "lucide-react";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { FileCardActions } from "./file-card-actions";

export function FileCard({
  file,
}: {
  file: Doc<"files"> & { isFavorite: boolean };
}) {
  const fileUrl = useQuery(api.files.getFileUrl, {
    storageId: file.storageId,
  });
  const typeIcons = {
    csv: <Sheet />,
    pdf: <FileText />,
    image: <FileImage />,
  } as Record<Doc<"files">["type"], ReactNode>;
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 text-base font-normal">
          <div>{typeIcons[file.type]}</div>
          <p>{file.title}</p>
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardActions file={file} isFavorite={file.isFavorite} />
        </div>
      </CardHeader>
      <CardContent
        className="h-[200px] flex justify-center items-center"
        style={{ overflow: "hidden" }}
      >
        {file.type == "image" && fileUrl == undefined && (
          <FileImageIcon className="w-20 h-20" />
        )}
        {file.type == "image" && fileUrl && (
          <Image alt={file.title} width="200" height="100" src={fileUrl} />
        )}
        {file.type == "pdf" && <FileTextIcon className="w-20 h-20" />}
        {file.type == "csv" && <SheetIcon className="w-20 h-20" />}
      </CardContent>
      <CardFooter className="flex justify-between items-center py-4">
        <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image} />
          </Avatar>
          {userProfile?.name}
        </div>
        <div className="text-xs text-gray-700">
          Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
        </div>
      </CardFooter>
    </Card>
  );
}
