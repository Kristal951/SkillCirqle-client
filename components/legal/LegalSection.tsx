interface LegalSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export default function LegalSection({
  id,
  title,
  children,
}: LegalSectionProps) {
  return (
    <section id={id} className="bg-surface/50 p-6 rounded-lg my-10">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>

      <div className="text-base text-text-secondary leading-relaxed">
        {children}
      </div>
    </section>
  );
}
