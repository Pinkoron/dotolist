import { SessionOptions } from "iron-session";

const sessionPassword = process.env.SESSION_SECRET;

if (!sessionPassword || sessionPassword.length < 32) {
  throw new Error(
    "SESSION_SECRET is not set or too short (minimum 32 characters required)"
  );
}

export const sessionOptions: SessionOptions = {
  cookieName: "myapp_session",
  password: sessionPassword, // 32文字以上
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export type SessionData = {
  oauth_state?: string;
  user?: {
    email: string;
    userId: string;
    accessToken: string;
    expUnix: Date;
  };
};
