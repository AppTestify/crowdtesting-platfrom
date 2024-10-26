import { Button } from "@/components/ui/button";



export default function Home() {
  return (
    <>
      <div className="p-5 min-h-screen pb-20 font-[family-name:var(--font-geist-sans)] bg-zinc-950">
        <main>
          <div className="flex items-center justify-between">
            <h1 className="text-white text-2xl">Landing page</h1>
            <div>

              <a href="/auth/sign-in">
                <Button className="mt-2 mr-2">Login</Button>
              </a>
              <a href="/auth/sign-up">
                <Button variant="secondary" className="mt-2 mr-2">Sign up</Button>
              </a>
              <a href="/auth/tester/sign-up">
                <Button variant="secondary" className="mt-2 mr-2">Tester sign up</Button>
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );

}
