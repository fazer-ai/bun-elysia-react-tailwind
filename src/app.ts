import cors from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import Elysia from "elysia";
import { helmet } from "elysia-helmet";
import api from "@/api";
import { cspDirectives } from "@/api/lib/csp";
import logger from "@/api/lib/logger";
import { localeMiddleware } from "@/api/middlewares/locale";
import {
  rateLimitMiddleware,
  staticRateLimitMiddleware,
} from "@/api/middlewares/rateLimit";
import config from "@/config";

const HASHED_ASSET_PATTERN = /-[a-z0-9]{8,}\.[\w]+$/i;

const app = new Elysia()
  .use(
    helmet({
      contentSecurityPolicy: {
        directives: cspDirectives,
        // NOTE: In dev, run CSP in Report-Only so violations surface in the
        // browser console without blocking. Catches third-party-integration
        // CSP issues (Google Fonts, OAuth, analytics) at `bun dev` time
        // instead of after a deploy to staging/prod.
        reportOnly: config.env !== "production",
      },
      // NOTE: GSI's "Continue with Google" button opens a cross-origin popup
      // and relies on window.opener.postMessage to deliver the credential.
      // The helmet default of Cross-Origin-Opener-Policy: same-origin nulls
      // window.opener in that popup, breaking the flow with "Cannot read
      // properties of null (reading 'postMessage')". We relax to
      // same-origin-allow-popups only when GSI is enabled, keeping the
      // stricter default for projects that do not use Google Sign-In.
      // https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
      ...(config.googleOAuthEnabled && {
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      }),
    }),
  )
  .use(localeMiddleware)
  .onAfterResponse(({ request, set }) => {
    logger.info("%s %s [%s]", request.method, request.url, set.status);
  })
  .onAfterHandle(({ request, set }) => {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/" || path.endsWith(".html")) {
      set.headers["cache-control"] = "no-cache";
    } else if (HASHED_ASSET_PATTERN.test(path)) {
      set.headers["cache-control"] = "public, max-age=31536000, immutable";
    } else if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/i.test(path)) {
      set.headers["cache-control"] = "public, max-age=86400";
    }
  })
  .onError(({ path, error, code }) => {
    // NOTE: Handle BigInt parsing errors as 400 Bad Request
    if (error instanceof SyntaxError && error.message.includes("BigInt")) {
      return new Response("Invalid ID format", { status: 400 });
    }

    logger.error("%s\n%s", path, error);
    switch (code) {
      case "NOT_FOUND":
        return Response.redirect("/", 302);
      case "INTERNAL_SERVER_ERROR": {
        const message =
          config.env === "development"
            ? (error.stack ?? error.message)
            : "Something went wrong";
        return new Response(`${message}`, { status: 500 });
      }
      default:
    }
  })
  .use(rateLimitMiddleware())
  .use(staticRateLimitMiddleware())
  .use(
    await staticPlugin({
      assets: config.env === "production" ? "dist" : "public",
      prefix: "/",
      alwaysStatic: true,
      // NOTE: @elysiajs/static 1.4.9 renamed `bundleHTML` to `bunFullstack`
      // and flipped the default to `false`. Without this, dev serves
      // `public/index.html` raw and the `<script src="../src/client/frontend.tsx">`
      // reference cannot be resolved. See elysiajs/elysia-static#63.
      bunFullstack: config.env === "development",
    }),
  )
  .group("/api", (app) => app.use(api));

const parseOrigins = (originsStr: string): (string | RegExp)[] =>
  originsStr.split(",").map((origin) => {
    const trimmed = origin.trim();
    if (trimmed.startsWith("/") && trimmed.endsWith("/")) {
      const pattern = trimmed.slice(1, -1);
      return new RegExp(pattern);
    }
    return trimmed;
  });

app.use(
  cors(
    config.env === "development"
      ? undefined
      : { origin: parseOrigins(config.corsOrigin) },
  ),
);

export type App = typeof app;
export default app;
