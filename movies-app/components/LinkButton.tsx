import Link from "next/link";

type Props = {
  href: string;
  label: string;
  color?: string;
};

export default function LinkButton({ href, label, color = "blue" }: Props) {
  return (
    <Link href={href} className={`bg-${color}-500 hover:bg-${color}-700 text-white font-bold py-2 px-4 rounded`}>
      {label}
    </Link>
  );
}
