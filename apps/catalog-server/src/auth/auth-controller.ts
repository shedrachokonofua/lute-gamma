import { buildControllerFactory } from "@lute/shared";
import { buildAuthInteractor } from "./auth-interactor";
import { AuthRepo } from "./auth-repo";
import { logger } from "../logger";

export const buildAuthController = buildControllerFactory<{
  authRepo: AuthRepo;
}>(({ authRepo }) => {
  const authInteractor = buildAuthInteractor(authRepo);

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
      await authRepo.clearSpotifyCredentials();
      return res.success();
    },
    async getStatus(_, res) {
      const credentials = await authRepo.getSpotifyCredentials();
      const status = await authInteractor.getAuthStatus();

      return res.success({
        status,
        credentials,
      });
    },
  };
});
