"use client";

import { Mail } from '@/app/_components/mail/_components/mail'
import { accounts, mails } from '@/app/_components/mail/data'
import React, { useEffect } from 'react'

export default function MailLayout() {

    useEffect(() => {
        localStorage.setItem("selecetdMailId", "");
    }, []);

    return (
        <div>
            <Mail
                accounts={accounts}
                navCollapsedSize={4}
            />
        </div>
    )
}
