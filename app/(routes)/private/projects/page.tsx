import { Input } from "@/components/ui/input";
import { AddProject } from "./_components/add-device";
// import { useState } from "react";

export default function Projects() {

    // const [globalFilter, setGlobalFilter] = useState<any>([]);
    return (
        <main className="mx-4 mt-4">
            <div className="">
                <h2 className="text-medium">Available Projects</h2>
                <span className="text-xs text-gray-600">
                    Let us harness your expertise! Our system will analyze your skills to connect you with
                    projects that are a perfect fit for your background and talents.
                </span>
            </div>
            <div className="w-full">
                <div className="flex items-center py-4 justify-between">
                    <Input
                        placeholder="Filter projects"
                        // value={(globalFilter as string) ?? ""}
                        // onChange={(event) => {
                        //     table.setGlobalFilter(String(event.target.value));
                        // }}
                        className="max-w-sm"
                    />
                    <div className="flex gap-2 ml-2">
                        {/* {getSelectedRows().length ? (
                            <BulkDelete
                                ids={getSelectedRows()}
                                refreshDevices={refreshDevices}
                            />
                        ) : null} */}
                        <AddProject  />
                    </div>
                </div>
            </div>
        </main>
    )
}