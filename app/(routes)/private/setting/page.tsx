import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'
import GeneralSettings from './_components/general-settings'
import IdFormatSettings from './_components/id-format-settings'

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
                <TabsList className="grid w-[400px] grid-cols-2">
                    <TabsTrigger value="general-settings">General settings</TabsTrigger>
                    <TabsTrigger value="id-format-settings">ID format settings</TabsTrigger>
                </TabsList>
                <TabsContent value="general-settings">
                    <GeneralSettings />
                </TabsContent>
                <TabsContent value="id-format-settings">
                    <IdFormatSettings />
                </TabsContent>
            </Tabs>
        </div>
    )
}
