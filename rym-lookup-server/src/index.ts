import { PORT } from "./config";
import { startServer } from "./lookup-server";

(async () => {
  startServer({ port: PORT });
})();
