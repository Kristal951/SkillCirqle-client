interface LegalBlockProps {
  children: React.ReactNode;
}

export default function LegalBlockWrapper({ children }: LegalBlockProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 mt-8">
        {children}
    </div>
  );
}
