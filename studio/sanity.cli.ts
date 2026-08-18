import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./env";

/*
  Read by the `sanity` CLI only: dev server, build, deploy, dataset exports and
  CORS entries. The running Studio uses sanity.config.ts instead.
*/
export default defineCliConfig({
  api: { projectId, dataset },
});
