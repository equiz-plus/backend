// bikin file baru
const cron = require("node-cron");

/*
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *
*/

function sendNotification() {
  const automate = cron.schedule("5 * * * * *", async () => {
    try {
      console.log("---------------------");
      console.log("Running Cron Job");

      // logic mau ngapain
    } catch (error) {
      console.log(error);
    }
  });
  automate.start();
}

module.exports = sendNotification;

// nanti dipanggil di app.js ketika jalanain servernya
