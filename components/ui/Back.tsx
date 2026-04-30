import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();

  return (
    <button
      className="flex gap-2 px-2 py-1 bg-surface/50 hover:bg-surface rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary items-center transition-all w-max"
      onClick={() => router.back()}
    >
      <span className="material-symbols-outlined">keyboard_arrow_left</span>
      Back
    </button>
  );
};

export default BackButton;
