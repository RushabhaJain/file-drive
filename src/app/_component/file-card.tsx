import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileImage,
  FileImageIcon,
  FileText,
  FileTextIcon,
  MoreVertical,
  Sheet,
  SheetIcon,
  TrashIcon,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

function FileCardActions({ file }: { file: Doc<"files"> }) {
  const [confirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const deleteFile = useMutation(api.files.deleteFile);
  return (
    <>
      <AlertDialog open={confirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove your
              data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({ fileId: file._id });
                toast({
                  variant: "default",
                  title: "File deleted",
                  description: "File is gone from the system",
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex gap-1 text-red-600 items-center cursor-pointer"
            onClick={() => {
              setIsConfirmOpen(true);
            }}
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function FileCard({ file }: { file: Doc<"files"> }) {
  const fileUrl = useQuery(api.files.getFileUrl, {
    storageId: file.storageId,
  });
  const typeIcons = {
    csv: <Sheet />,
    pdf: <FileText />,
    image: <FileImage />,
  } as Record<Doc<"files">["type"], ReactNode>;
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2">
          <div>{typeIcons[file.type]}</div>
          <p>{file.title}</p>
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardActions file={file} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type == "image" && fileUrl == undefined && (
          <FileImageIcon className="w-20 h-20" />
        )}
        {file.type == "image" && fileUrl && (
          <Image alt={file.title} width="200" height="100" src={fileUrl} />
        )}
        {file.type == "pdf" && <FileTextIcon className="w-20 h-20" />}
        {file.type == "csv" && <SheetIcon className="w-20 h-20" />}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          onClick={() => {
            if (fileUrl) {
              window.open(fileUrl, "_blank");
            }
          }}
        >
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
