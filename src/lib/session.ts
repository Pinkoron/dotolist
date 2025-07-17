import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  cookieName: "myapp_session",
  password: "super-secure-password-that-is-long-enough", // 32文字以上
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
