export default function sessionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full overflow-hidden bg-background">
      {children}
    </div>
  );
}
