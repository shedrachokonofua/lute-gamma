import { buildControllerFactory } from "@lute/shared";
import { buildAuthInteractor } from "./auth-interactor";
import { logger } from "../logger";
import { CatalogRepo } from "../catalog-repo";


export const buildAuthController = buildControllerFactory<{
  catalogRepo: CatalogRepo;
}>(({ catalogRepo }) => {
  const authInteractor = buildAuthInteractor(catalogRepo);

  return {
    async redirectToAuthorizationUrl(_, res) {
      const authUrl = await authInteractor.getAuthUrl();
      logger.info({ authUrl }, "Redirecting to auth url");
      return res.redirect(authUrl);
    },
    async handleAuthorizationCallback(req, res) {
      const { code } = req.query;
      if (!code) {
        return res.status(400).send({
          ok: false,
          error: "Missing code query parameter",
        });
      }
      const credentials = await authInteractor.grantAndStoreCredentials(
        code as string
      );
      logger.info({ credentials }, "Got spotify credentials");
      return res.send({
        ok: true,
        data: { credentials },
      });
    },
    async clearCredentials(_, res) {
      await catalogRepo.clearSpotifyCredentials();
      return res.send({
        ok: true,
      });
    },
    async getStatus(_, res) {
      const credentials = await catalogRepo.getSpotifyCredentials();
      const status = await authInteractor.getAuthStatus();

      return res.send({
        ok: true,
        data: { status, credentials },
      });
    },
  };
});
