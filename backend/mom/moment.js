const moment = require("moment");

function formatDate(dateString) {
  let date = moment(dateString, ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"], true);
  return date.isValid() ? date.toDate() : null;
}

module.exports = formatDate;
