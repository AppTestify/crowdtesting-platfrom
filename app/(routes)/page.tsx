import { Button } from "@/components/ui/button";



export default function Home() {
  // const router = useRouter();
  // eslint-disable-next-line
  // const { data: session }: any = useSession();

  // useEffect(() => {
  //   if (!session) {
  //     navigateToAuth();
  //   }
  // }, [])

  // const navigateToAuth = () => {
  //   router.push(`/auth`);
  // }

  return (
    <>
      <div className="p-5 min-h-screen pb-20 font-[family-name:var(--font-geist-sans)] bg-zinc-950">
        <main>
          <h1 className="text-white text-2xl">Landing page</h1>
          <a href="/auth/sign-up">
            <Button variant="secondary" className="mt-2">Auth</Button></a>
        </main>
      </div>
    </>
  );

}
