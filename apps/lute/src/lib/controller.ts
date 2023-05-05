import { Request, Response, NextFunction, Router } from "express";
import { Context } from "../context";

export interface LuteExpressResponse extends Response {
  success: (data?: any) => void;
  badRequest: (error: string) => void;
  notFound: () => void;
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

  luteExpressResponse.notFound = () => errorResponse(res, 404, "Not found");

  return luteExpressResponse;
};

export abstract class Controller {
  constructor(protected readonly context: Context) {}
  abstract router: Router;
  mount(
    controllerMethod: (req: Request, res: LuteExpressResponse) => Promise<any>
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await controllerMethod.call(this, req, buildLuteExpressResponse(res));
      } catch (err) {
        next(err);
      }
    };
  }
}
