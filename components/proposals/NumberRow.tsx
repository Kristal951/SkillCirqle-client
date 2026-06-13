const NumberRow = ({ number, title }: { number: number; title: string }) => {
  return (
    <header className="flex items-center gap-3">
      <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-text-primary font-black border border-border shadow-inner">
        {number}
      </span>
      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
        {title}
      </h2>
    </header>
  );
};

export default NumberRow;
