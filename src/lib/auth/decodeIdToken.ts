export const decodeIdToken = (
  id_token: string
): { userId: string; email: string } => {
  const payload = JSON.parse(
    Buffer.from(id_token.split(".")[1], "base64").toString()
  );
  const userId = payload.sub; // ← これを userId に使う
  const email = payload.email;

  return {
    userId,
    email,
  };
};
