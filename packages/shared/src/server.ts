import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import * as rTracer from "cls-rtracer";
import { Logger } from "pino";
import pinoHttp from "pino-http";

export const buildServer = <Context extends {}>({
  name,
  buildRouter,
  logger,
}: {
  name: string;
  buildRouter: (context: Context) => express.Router | Promise<express.Router>;
  logger: Logger;
}) => {
  const server = express();

  return async (context: Context) => {
    const router = await buildRouter(context);
    server.use(express.json());
    server.use(cors());
    server.use(
      rTracer.expressMiddleware({
        echoHeader: true,
        useHeader: true,
      })
    );
    server.use(
      pinoHttp({
        logger,
      })
    );
    server.get("/health", (_, res) =>
      res.json({ ok: true, data: { serverName: name } })
    );
    server.use(router);
    server.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error(err, "Request failed");
        res.status(500).json({
          ok: false,
          error: "Internal server error",
          traceId: rTracer.id(),
        });
      }
    );
    new Promise((resolve) => {
      server.listen(80, () => {
        logger.debug({ serverName: name }, "Server listening");
        resolve(undefined);
      });
    });
  };
};

interface LuteExpressResponse extends Response {
  success: (data?: any) => void;
  badRequest: (error: string) => void;
}

const errorResponse = (res: Response, code: number, error: string) => {
  res.status(code).json({
    ok: false,
    error,
  });
};

const buildLuteExpressResponse = (res: Response): LuteExpressResponse => {
  const luteExpressResponse = res as LuteExpressResponse;

  luteExpressResponse.success = (data?: any) =>
    res.json({
      ok: true,
      data,
    });

  luteExpressResponse.badRequest = (error) => errorResponse(res, 400, error);

  return luteExpressResponse;
};

type ControllerGroup = Record<
  string,
  (req: Request, res: LuteExpressResponse, next: NextFunction) => void
>;

export const buildControllerFactory = <ContextType = {}>(
  builder: (context: ContextType) => ControllerGroup
): typeof builder => {
  return (context: ContextType) => {
    const controllers = builder(context);
    return Object.fromEntries(
      Object.entries(controllers).map(([name, controller]) => [
        name,
        async (req: Request, res: Response, next: NextFunction) => {
          try {
            await controller(req, buildLuteExpressResponse(res), next);
          } catch (err) {
            next(err);
          }
        },
      ])
    ) as ReturnType<typeof builder>;
  };
};
