import { Request, Router } from "express";
import { Controller, LuteExpressResponse as Response } from "../../lib";

export class FileParserController extends Controller {
  private get htmlParser() {
    return this.context.htmlParser;
  }

  get router() {
    return Router().post("/saved-file", this.mount(this.parseSavedFile));
  }

  async parseSavedFile(req: Request, res: Response) {
    const data = await this.htmlParser.execute(
      req.body.fileName,
      req.body.correlationId
    );
    return res.success(data);
  }
}
