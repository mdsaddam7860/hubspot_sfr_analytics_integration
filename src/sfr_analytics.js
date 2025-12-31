import "dotenv/config";

// import "./jobs/scheduler.job.js"; // This will automatically start the scheduler
import { app, logger, sfrcAnalyticsTohubspotSync } from "./index.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // sfrcAnalyticsTohubspotSync();
  logger.info(`Server is running on port ${PORT}`);
});
