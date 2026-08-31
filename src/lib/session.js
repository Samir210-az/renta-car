const STAFF_KEY = "rc_staff_session";
const ADMIN_KEY = "rc_admin_session";

// Bütün "security_group" tətbiqlərində istifadə olunan universal master PIN.
export const MASTER_ADMIN_PIN = "AL2026EA";

export function isStaffAuthed() {
  return sessionStorage.getItem(STAFF_KEY) === "1";
}

export function setStaffAuthed() {
  sessionStorage.setItem(STAFF_KEY, "1");
}

export function isAdminAuthed() {
  return sessionStorage.getItem(ADMIN_KEY) === "1";
}

export function setAdminAuthed() {
  sessionStorage.setItem(ADMIN_KEY, "1");
}

export function logoutStaff() {
  sessionStorage.removeItem(STAFF_KEY);
  sessionStorage.removeItem(ADMIN_KEY);
}

export function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_KEY);
}
