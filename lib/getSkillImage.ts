export const getSkillImage = (skill: string) => {
  const map: Record<string, string> = {
    React: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    "Node.js": "https://images.unsplash.com/photo-1627398242454-45a1465c2479",
    Photography: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd",
    Drawing: "https://images.unsplash.com/photo-1541961017774-22349e4a1262",
    English: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8",
  };

  return (
    map[skill] || "https://images.unsplash.com/photo-1555066931-4365d14bab8c"
  );
};
