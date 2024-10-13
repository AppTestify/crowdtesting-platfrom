import Image from "next/image";
import BarComponent from "../_components/bar-chart-widget";

export default function Home() {
  return (
    <div className="in-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main>
        <h1>Cloud Testing</h1>
        <BarComponent />
      </main>
    </div>
  );
}
