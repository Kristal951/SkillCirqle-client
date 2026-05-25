interface LegalBlockProps {
  title: string;
  children: React.ReactNode;
}

export default function LegalBlock({ title, children }: LegalBlockProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>

      <div className="text-base text-text-secondary leading-relaxed">
        {children}
      </div>
    </section>
  );
}
