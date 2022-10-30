import { Router } from "express";
import { Context } from "../../context";
import { buildLookupController } from "./lookup-controller";

export const buildLookupRouter = (context: Context) => {
  const lookupController = buildLookupController(context);

  return Router()
    .get("/", lookupController.getOrCreateLookup)
    .put("/:hash", lookupController.putLookup)
    .get("/:hash", lookupController.getLookupByHash)
    .delete("/:hash", lookupController.deleteLookup);
};
