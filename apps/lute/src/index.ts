import { buildContext } from "./context";
import { startServer } from "./server";

(async () => {
  const context = await buildContext();
  startServer(context);
})();
