import { Doc } from "../../../../convex/_generated/dataModel";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DownloadIcon,
  MoreVertical,
  StarHalf,
  StarIcon,
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
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Protect } from "@clerk/nextjs";

export function FileCardActions({
  file,
  isFavorite,
}: {
  file: Doc<"files">;
  isFavorite: boolean;
}) {
  const [confirmOpen, setIsConfirmOpen] = useState(false);
  const { toast } = useToast();

  const deleteFile = useMutation(api.files.deleteFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);
  const fileUrl = useQuery(api.files.getFileUrl, {
    storageId: file.storageId,
  });
  const me = useQuery(api.users.getMe);

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
            className="flex gap-1 items-center cursor-pointer"
            onClick={async () => {
              toggleFavorite({
                fileId: file._id,
              });
            }}
          >
            {isFavorite && (
              <>
                <StarHalf className="w-4 h-4" /> UnFavorite{" "}
              </>
            )}
            {!isFavorite && (
              <>
                <StarIcon className="w-4 h-4" /> Favorite
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex gap-1 items-center cursor-pointer"
            onClick={() => {
              if (fileUrl) {
                window.open(fileUrl, "_blank");
              }
            }}
          >
            <DownloadIcon className="w-4 h-4" />
            Download
          </DropdownMenuItem>
          <Protect
            condition={(check) => {
              return (
                check({
                  role: "org:admin",
                }) || file.userId === me?._id
              );
            }}
            fallback={<></>}
          >
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex gap-1 text-red-600 items-center cursor-pointer"
                onClick={() => {
                  setIsConfirmOpen(true);
                }}
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </>
          </Protect>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
