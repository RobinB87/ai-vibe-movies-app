type Props = {
  label: string;
  color: string;
  onClick: () => void;
};

const colorClasses: Record<Props["color"], string> = {
  red: "bg-red-500 hover:bg-red-700",
  blue: "bg-blue-500 hover:bg-blue-700",
};

export default function Button({ label, color, onClick }: Props) {
  const handleClick = () => {
    onClick();
  };

  return (
    <button
      type="submit"
      className={`${colorClasses[color]} text-white font-bold py-2 px-4 rounded`}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
