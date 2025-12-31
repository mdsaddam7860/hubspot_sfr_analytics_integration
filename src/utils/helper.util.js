import fs from "fs";
import path from "path";

const STATE_FILE = path.resolve(process.cwd(), "syncState.json");

/**
 * Read persisted date range
 */
// function getDateRange() {
//   if (!fs.existsSync(STATE_FILE)) {
//     throw new Error("syncState.json not found. Initialize date range first.");
//   }

//   const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
//   return {
//     start_date: state.start_date,
//     end_date: state.end_date,
//   };
// }

const format = (d) => d.toISOString().split("T")[0];

function getDeltaRange() {
  const today = new Date();
  const end_date = format(today);

  let start_date;

  if (fs.existsSync(STATE_FILE)) {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    start_date = state.last_successful_end_date;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    start_date = format(yesterday);
  }

  return { start_date, end_date };
}

function persistSuccessfulRun(end_date) {
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify({ last_successful_end_date: end_date }, null, 2)
  );
}

/**
 * Initialize or overwrite date range
 */
function setDateRange({ start_date, end_date }) {
  if (!start_date || !end_date) {
    throw new Error("Both start_date and end_date are required");
  }

  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify({ start_date, end_date }, null, 2)
  );
}

function getDailyDeltaRange() {
  const today = new Date();

  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 1);
  const format = (d) => d.toISOString().split("T")[0];

  return {
    start_date: format(startDate),
    end_date: format(endDate),
  };
}

function upsertCompanyInHubspotPayload(borrower) {
  // Implementation goes here
  const payload = {
    properties: {
      name: borrower.borrower_name, // REQUIRED
      domain: "acme.com", // optional but recommended
      phone: borrower.first_phone,
      city: borrower.last_city,
    },
  };

  return payload;
}

export {
  upsertCompanyInHubspotPayload,
  // getDateRange,
  setDateRange,
  getDailyDeltaRange,
  persistSuccessfulRun,
  getDeltaRange,
};
