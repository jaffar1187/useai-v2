import { homedir } from "node:os";
import { join } from "node:path";

const HOME = homedir();

export const USEAI_DIR = join(HOME, ".useai");
export const DATA_DIR = join(USEAI_DIR, "data");
export const ACTIVE_DIR = join(DATA_DIR, "active");
export const SEALED_DIR = join(DATA_DIR, "sealed");
export const SESSIONS_FILE = join(DATA_DIR, "sessions.json");
export const MILESTONES_FILE = join(DATA_DIR, "milestones.json");
export const CONFIG_FILE = join(USEAI_DIR, "config.json");
export const KEYSTORE_FILE = join(USEAI_DIR, "keystore.json");
export const DAEMON_PID_FILE = join(USEAI_DIR, "daemon.pid");
export const DAEMON_LOG_FILE = join(USEAI_DIR, "daemon.log");

export const DAEMON_PORT = 19200;
export const DAEMON_HOST = "127.0.0.1";
export const DAEMON_URL = `http://${DAEMON_HOST}:${DAEMON_PORT}`;
