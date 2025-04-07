import { createCookieSessionStorage } from "@remix-run/node";
import config from "./servicesConfig.json";

type SessionData = {
  token: string;
  darkMode: boolean;
};

type SessionFlashData = {
  error: string;
};

export const ssoSession =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      cookie: {
        name: "__session",
        domain: config.domain,
        // httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "lax",
        secrets: [config.secret || "s3cr3t"],
        // secure: true,
      },
    }
  );

export const checkSsoSession = async (request: Request) => {
  const session = await ssoSession.getSession(request.headers.get("Cookie"));
  if (!session.has("token")) {
    return null;
  }
  const response = await fetch(config.ssoServerUrl + "info/0", {
    headers: {
      Authorization: "Bearer " + session.get("token"),
    },
    method: "GET",
  });

  if (response.status == 200) {
    return response.json();
  }
  return null;
};
