// bikin file baru
const cron = require("node-cron");
const { ExamSchedule, Exam } = require("../models/index");

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

function examScheduler() {
  const automate = cron.schedule("1 * * * * *", async () => {
    try {
      console.log("---------------------");
      console.log("Exam has been adjusted by Cron Job.");

      const schedules = await ExamSchedule.findAll();

      for (let i = 0; i < schedules.length; i++) {
        let startDate = schedules[i].startingDate
          .toISOString()
          .substring(0, 10);
        let endDate = schedules[i].endDate.toISOString().substring(0, 10);
        let now = new Date().toISOString().substring(0, 10);

        if (startDate === now) {
          const updateVisibility = Exam.update(
            {
              isOpen: true,
            },
            {
              where: {
                id: schedules[i].ExamId,
              },
            }
          );
        }

        if (endDate === now) {
          const updateVisibility = Exam.update(
            {
              isOpen: false,
            },
            {
              where: {
                id: schedules[i].ExamId,
              },
            }
          );
        }
      }

      // logic mau ngapain
    } catch (error) {
      console.log(error);
    }
  });
  automate.start();
}

module.exports = examScheduler;
