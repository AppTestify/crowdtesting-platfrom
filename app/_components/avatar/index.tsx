import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AvatarImg({ img }: { img: string }) {
  const imgSrc = img ? img : "https://github.com/shadcn.png";
  return (
    <Avatar>
      <AvatarImage src={imgSrc} alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}
