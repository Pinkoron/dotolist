export const checkSession = async (): Promise<boolean> => {
  try {
    const res = await fetch("/api/auth/token-expiry", {
      credentials: "include",
    });
    if (res.ok) {
      const expUnix = new Date(await res.json());
      const now = new Date();

      const hoursPassed =
        (expUnix.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursPassed <= -24) {
        window.location.href = "/logout";
        return false;
      } else if (hoursPassed <= 0.083) {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        return refreshRes.ok;
      }
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error("セッションチェック失敗:", err);
    return false;
  }
};

export async function callApi(url: string, options?: RequestInit) {
  const ok = await checkSession();
  if (!ok) throw new Error("セッションが有効ではありません");

  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
