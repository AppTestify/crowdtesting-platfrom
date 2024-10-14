"use client";
import { useSession } from "next-auth/react";
import { Header } from "../_components/header";
import BarComponent from "../_components/bar-chart-widget";
import { SignUpForm } from "../_components/sing-up";

export default function Home() {
  // eslint-disable-next-line
  const { data: session }: any = useSession();

  if (session) {
    return (
      <>
        <div className="in-h-screen pb-20 font-[family-name:var(--font-geist-sans)]">
          <main>
            <Header user={session.user} />
            <h1>Cloud Testing</h1>
            <BarComponent />
          </main>
        </div>
      </>
    );
  }
  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <SignUpForm />
    </div>
  );
}
