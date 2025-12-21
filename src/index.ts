import logger, { deepSanitizeObject } from "@/api/lib/logger";
import app from "@/app";
import config from "@/config";

app.listen(config.port, () => {
  logger.info(
    "Loaded config %s",
    JSON.stringify(
      deepSanitizeObject(config, {
        omitKeys: ["apiKey", "secret", "jwtSecret", "databaseUrl"],
      }),
      null,
      2,
    ),
  );
  logger.info(
    `${config.packageInfo.name}@${config.packageInfo.version} running on http://${app.server?.hostname}:${app.server?.port}`,
  );
});
