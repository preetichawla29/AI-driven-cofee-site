import { readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DATA_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
);

const dataPath = (name) => path.join(DATA_DIR, `${name}.json`);

export async function readData(name) {
  return JSON.parse(await readFile(dataPath(name), "utf8"));
}

// Write to a temp file then rename, so a crash mid-write can't corrupt the data.
async function writeData(name, data) {
  const file = dataPath(name);
  const tmp = `${file}.tmp`;
  await writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`);
  await rename(tmp, file);
}

// Bookings are appended one at a time so concurrent requests can't overwrite each other.
let queue = Promise.resolve();

export function addBooking(booking) {
  const task = queue.then(async () => {
    const bookings = await readData("bookings");
    bookings.push(booking);
    await writeData("bookings", bookings);
    return booking;
  });
  queue = task.catch(() => {});
  return task;
}
