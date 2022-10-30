import { buildControllerFactory } from "@lute/shared";
import { Context } from "../../context";

export const buildChartController = buildControllerFactory(
  ({ chartInteractor }: Context) => {
    return {
      async putChart(req, res) {
        const chart = await chartInteractor.putChart(req.body);
        return res.success(chart);
      },
    };
  }
);
