export default function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const isEmpty = value === "Not selected" || value === "Not provided";
  return (
    <div>
      <p className="text-xs uppercase text-text-secondary">{label}</p>
      <p
        className={`font-medium mt-1 text-sm ${
          isEmpty ? "text-text-secondary italic" : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
