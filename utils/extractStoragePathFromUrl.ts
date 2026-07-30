function extractStoragePath(rawProofUrl: string) {
  if (!rawProofUrl.startsWith("http")) return rawProofUrl;
  const match = rawProofUrl.match(
    /\/object\/(?:sign|public)\/[^/]+\/(.+?)(\?|$)/,
  );
  return match ? decodeURIComponent(match[1]) : null;
}
