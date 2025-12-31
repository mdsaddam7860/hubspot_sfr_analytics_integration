import cron from "node-cron";
import { logger, sfrcAnalyticsTohubspotSync } from "../index.js";

logger.info("Scheduler job started");

let running = false;
// async function scheduleJob() {
//   try {
cron.schedule("0 0 * * *", async () => {
  try {
    logger.info("Running daily delta sync");

    if (running) return;
    running = true;
    await sfrcAnalyticsTohubspotSync();
  } catch (error) {
    logger.error("Error running sfrcAnalyticsTohubspotSync:", error);
  } finally {
    running = false;
  }
});
//   } catch (error) {
//     logger.error("Error scheduling job:", error);
//   }
// }
