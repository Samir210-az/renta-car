const COMPANY_KEY = "rc_company_id";
const TENANT_ADMIN_KEY = "rc_tenant_admin";
const PLATFORM_KEY = "rc_platform_session";

// Sənin (platform sahibi) bütün "security_group" tətbiqlərində istifadə
// etdiyin universal master PIN — istənilən şirkətin admin PIN-i əvəzinə də işləyir.
export const MASTER_PIN = "AL2026EA";

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
  sessionStorage.removeItem(TENANT_ADMIN_KEY);
}

// ---- Şirkətin öz daxili admin paneli (qiymət, hesabat və s.) ----

export function isTenantAdminAuthed() {
  return sessionStorage.getItem(TENANT_ADMIN_KEY) === "1";
}

export function setTenantAdminAuthed() {
  sessionStorage.setItem(TENANT_ADMIN_KEY, "1");
}

export function logoutTenantAdmin() {
  sessionStorage.removeItem(TENANT_ADMIN_KEY);
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
