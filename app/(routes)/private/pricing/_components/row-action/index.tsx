import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal, Send, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditPricing from "../edit-pricing";
import ViewPricingModel from "../view-pricingModel";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";

export default function PricingRowAction({
  refreshPackages,
}: {
  refreshPackages: () => void;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const[view,setView]=useState(false);
  const [isDelete,setDelete]=useState(false);
  const [isLoading, setIsLoading] = useState(false);
  

  const displayView = (row: any) => {
    console.log("");
  };

  const deletePricing=()=>
  {

  }

  return (
    <>
      <EditPricing
        sheetOpen={isEditOpen}
        setSheetOpen={setIsEditOpen}
        refreshUsers={refreshPackages}
      />

      <ViewPricingModel
      sheetOpen={view}
      setSheetOpen={setView}
      refreshUsers={refreshPackages}
      />

      <ConfirmationDialog
                      isOpen={isDelete}
                      setIsOpen={setDelete}
                      title="Delete selected user"
                      description="Are you sure you want delete the selected user?"
                      isLoading={isLoading}
                      successAction={deletePricing}
                      successLabel="Delete"
                      successLoadingLabel="Deleting"
                      successVariant={"destructive"}
                  />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* // forTest Is Using Only for Test */}
          <DropdownMenuItem
            className="mb-1"
           onClick={()=>{
            setView(true);
           }}
          >
            <Eye className="h-2 w-2" /> View 
          </DropdownMenuItem>
          <DropdownMenuSeparator className="border-b" />
          <DropdownMenuSeparator className="border-b" />
          <DropdownMenuItem
            onClick={() => {
              setIsEditOpen(true);
            }}
          >
            <Edit className="h-2 w-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator className="border-b" />
          <DropdownMenuItem 
          onClick={()=>{
            setDelete(true);
          }}
          >
            <Trash className="h-2 w-2 text-destructive" />{" "}
            <span className="text-destructive">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
