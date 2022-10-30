import { Router } from "express";
import { Context } from "../../context";
import { buildChartController } from "./chart-controller";

export const buildChartRouter = (context: Context) => {
  const chartController = buildChartController(context);

  return Router().put("/", chartController.putChart);
};
