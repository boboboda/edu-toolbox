import type { Project } from "./types";

const KEY = "collect.projects.v1";

export function bufToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export function b64ToBuf(b64: string): ArrayBuffer {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes.buffer;
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as Project[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** 저장 성공 여부를 돌려줌 (저장 공간이 막혀 있으면 false) */
export function saveProjects(list: Project[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function emptyProject(name: string): Project {
  return {
    id: `p${Date.now().toString(36)}`,
    name,
    updatedAt: Date.now(),
    formName: "",
    formB64: "",
    templateName: "",
    templateB64: "",
    items: [],
    outputs: [],
    schools: [],
    targetLevels: ["초등", "중등", "고등", "통합"],
  };
}
