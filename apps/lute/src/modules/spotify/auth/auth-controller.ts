import { buildControllerFactory } from "../../../lib";
import { buildAuthInteractor } from "./auth-interactor";
import { logger } from "../../../logger";
import { Context } from "../../../context";

export const buildAuthController = buildControllerFactory<Context>(
  ({ redisClient }) => {
    const authInteractor = buildAuthInteractor(redisClient);

    return {
      async redirectToAuthorizationUrl(_, res) {
        const authUrl = await authInteractor.getAuthUrl();
        logger.info({ authUrl }, "Redirecting to auth url");
        return res.redirect(authUrl);
      },
      async handleAuthorizationCallback(req, res) {
        const { code } = req.query;
        if (!code) {
          return res.badRequest("No code provided");
        }
        const credentials = await authInteractor.grantAndStoreCredentials(
          code as string
        );
        logger.info({ credentials }, "Got spotify credentials");
        return res.success({ credentials });
      },
      async clearCredentials(_, res) {
        await authInteractor.clearSpotifyCredentials();
        return res.success();
      },
      async getStatus(_, res) {
        const credentials = await authInteractor.getSpotifyCredentials();
        const status = await authInteractor.getAuthStatus();

        return res.success({
          status,
          credentials,
        });
      },
    };
  }
);
