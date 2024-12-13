import { getApprovalFilesService } from '@/app/_services/file.service';
import toasterService from '@/app/_services/toaster-service'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'
import VerifyDocument from './_components/verify';
import UnVerifyDocument from './_components/un-verify';

export default function DocumentApproval() {




    return (
        <div className='w-full'>
            <div className="flex flex-col mb-3 gap-1 mt-2">
                <span className="text-lg">Document approval</span>
                <span className="text-gray-500 text-xs">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Pariatur error magni cumque in nostrum atque, tempora optio neque est numquam.
                </span>
            </div>
            <Tabs defaultValue="unVerify" className=" mt-3">
                <TabsList className="grid w-full grid-cols-2 w-[400px]">
                    <TabsTrigger value="unVerify">Un Verify document</TabsTrigger>
                    <TabsTrigger value="verify">Verify document</TabsTrigger>
                </TabsList>
                <TabsContent value="unVerify">
                    <VerifyDocument />
                </TabsContent>
                <TabsContent value="verify">
                    <UnVerifyDocument />
                </TabsContent>
            </Tabs>
        </div>
    )
}
