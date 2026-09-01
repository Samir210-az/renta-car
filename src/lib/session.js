const COMPANY_KEY = "rc_company_id";
const PLATFORM_KEY = "rc_platform_session";
const STAFF_NAME_KEY = "rc_staff_name";
const STAFF_ASKED_KEY = "rc_staff_asked";

// ---- Şirkət (tenant) sessiyası ----

export function getCompanyId() {
  return sessionStorage.getItem(COMPANY_KEY);
}

export function setCompanyId(id) {
  sessionStorage.setItem(COMPANY_KEY, id);
}

export function isCompanyAuthed() {
  return !!getCompanyId();
}

export function logoutCompany() {
  sessionStorage.removeItem(COMPANY_KEY);
  sessionStorage.removeItem(STAFF_NAME_KEY);
  sessionStorage.removeItem(STAFF_ASKED_KEY);
}

// ---- İşçi adı (kim etdi izini saxlamaq üçün, sessiya boyu bir dəfə soruşulur) ----

export function getStaffName() {
  return sessionStorage.getItem(STAFF_NAME_KEY) || "";
}

export function setStaffName(name) {
  sessionStorage.setItem(STAFF_NAME_KEY, name);
  sessionStorage.setItem(STAFF_ASKED_KEY, "1");
}

export function hasAskedStaffName() {
  return sessionStorage.getItem(STAFF_ASKED_KEY) === "1";
}

export function skipStaffName() {
  sessionStorage.setItem(STAFF_ASKED_KEY, "1");
}

// ---- Platform admin (sən — bütün şirkətləri idarə edirsən) ----

export function isPlatformAuthed() {
  return sessionStorage.getItem(PLATFORM_KEY) === "1";
}

export function setPlatformAuthed() {
  sessionStorage.setItem(PLATFORM_KEY, "1");
}

export function logoutPlatform() {
  sessionStorage.removeItem(PLATFORM_KEY);
}
