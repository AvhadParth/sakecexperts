import { promises as fs } from "fs";
import path from "path";

// Use a writable folder in prod (Railway) or ./data locally
const dataDir = process.env.DATA_DIR
  ? process.env.DATA_DIR
  : path.join(process.cwd(), "data");

const files = {
  users: path.join(dataDir, "users.json"),
  projects: path.join(dataDir, "projects.json"),
  ideas: path.join(dataDir, "ideas.json"),
  mentors: path.join(dataDir, "mentors.json"),
  bookings: path.join(dataDir, "bookings.json"),
};

let prepared = false;
async function prepare() {
  if (prepared) return;
  await fs.mkdir(dataDir, { recursive: true });
  // Ensure all json files exist with "[]"
  for (const file of Object.values(files)) {
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, "[]", "utf-8");
    }
  }
  prepared = true;
}

async function readJSON(file) {
  await prepare();
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

async function writeJSON(file, data) {
  await prepare();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

/* Users */
export async function getUsers() { return readJSON(files.users); }
export async function saveUsers(users) { return writeJSON(files.users, users); }

/* Projects */
export async function getProjects() { return readJSON(files.projects); }
export async function saveProjects(projects) { return writeJSON(files.projects, projects); }

/* Ideas */
export async function getIdeas() { return readJSON(files.ideas); }
export async function saveIdeas(ideas) { return writeJSON(files.ideas, ideas); }

/* Mentors */
export async function getMentors() { return readJSON(files.mentors); }
export async function saveMentors(mentors) { return writeJSON(files.mentors, mentors); }

/* Bookings */
export async function getBookings() { return readJSON(files.bookings); }
export async function saveBookings(bookings) { return writeJSON(files.bookings, bookings); }
