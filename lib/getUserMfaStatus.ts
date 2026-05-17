export const getMfaStatus = async (supabase: any) => {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;

  const verified = data.all.some((f: any) => f.status === "verified");
  const pending = data.all.some((f: any) => f.status !== "verified");

  return {
    enabled: verified,
    pending: !verified && pending,
  };
};
