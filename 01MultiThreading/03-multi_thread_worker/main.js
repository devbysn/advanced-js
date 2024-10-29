const express = require("express");
const { Worker } = require("worker_threads");

const app = express();
const port = process.env.PORT || 3000;
const THREAD_COUNT = 12;

app.get("/non-blocking/", (req, res) => {
  res.status(200).send("This page is non-blocking");
});

function createWorker() {
  return new Promise(function (resolve, reject) {
    const worker = new Worker("./multiple_workers.js", {
      workerData: { thread_count: THREAD_COUNT },
    });
    worker.on("message", (data) => {
      resolve(data);
    });
    worker.on("error", (msg) => {
      reject(`An error occurred: ${msg}`);
    });
  });
}

app.get("/blocking", async (req, res) => {
  console.time("blockingRoute"); // Start the timer

  const workerPromises = [];
  for (let i = 0; i < THREAD_COUNT; i++) {
    workerPromises.push(createWorker());
  }
  const thread_results = await Promise.all(workerPromises);
  const total =
    thread_results[0] +
    thread_results[1] +
    thread_results[2] +
    thread_results[3];

  console.timeEnd("blockingRoute"); // End the timer and log the duration
  res.status(200).send(`Result is ${total}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
