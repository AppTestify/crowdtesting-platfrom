import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

export default function AdminProfileOverview({ user }: { user: any }) {
    return (
        <div>
            <form className="flex flex-col">
                <div>
                    <div className="flex flex-col mb-3 gap-1">
                        <span className="text-lg">Personal information</span>
                        <span className="text-gray-500 text-xs">
                            Your personal information helps us tailor projects and resources
                            to better suit your background and expertise.
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <div className='w-full'>
                            <Label>First Name</Label>
                            <Input />
                        </div>
                        <div className='w-full'>
                            <Label>Last Name</Label>
                            <Input />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
