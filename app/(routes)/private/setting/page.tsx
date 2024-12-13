import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'
import GeneralSettings from './_components/general-settings'
import IdFormatSettings from './_components/id-format-settings'
import SupportMail from './_components/support-mail'
import DocumentApproval from './_components/document-approval'

export default function Setting() {
    return (
        <div className='p-3'>
            <div className="border-b pb-3">
                <h2 className="font-medium text-xl text-primary">Setting Overview</h2>
                <span className="text-xs text-gray-600">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Distinctio rem rerum
                    nesciunt tempora illo doloremque nisi laudantium quaerat, porro blanditiis.
                </span>
            </div>
            <Tabs defaultValue="general-settings" className="w-full mt-4">
                <TabsList className="grid w-[550px] grid-cols-4">
                    <TabsTrigger value="general-settings">General settings</TabsTrigger>
                    <TabsTrigger value="id-format-settings">ID format settings</TabsTrigger>
                    <TabsTrigger value="support-mail">Support mail</TabsTrigger>
                    <TabsTrigger value="document-approval">Document approval</TabsTrigger>
                </TabsList>
                <TabsContent value="general-settings">
                    <GeneralSettings />
                </TabsContent>
                <TabsContent value="id-format-settings">
                    <IdFormatSettings />
                </TabsContent>
                <TabsContent value="support-mail">
                    <SupportMail />
                </TabsContent>
                <TabsContent value="document-approval">
                    <DocumentApproval />
                </TabsContent>
            </Tabs>
        </div>
    )
}
