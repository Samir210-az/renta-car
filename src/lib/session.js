const COMPANY_KEY = "rc_company_id";
const PLATFORM_KEY = "rc_platform_session";

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
