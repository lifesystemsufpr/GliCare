export type HealthRecord = {
  id: string;
  kind: "glucose" | "insulin";
  label: string;
  value: number;
  recordedAt: string;
};

// Static examples only: these records do not represent the user's measurements.
export const demoRecords: HealthRecord[] = [
  {
    id: "g1",
    kind: "glucose",
    label: "Jejum",
    value: 98,
    recordedAt: "2026-10-24T07:30:00-03:00",
  },
  {
    id: "i1",
    kind: "insulin",
    label: "Rápida",
    value: 4,
    recordedAt: "2026-10-24T08:00:00-03:00",
  },
  {
    id: "g2",
    kind: "glucose",
    label: "Pós-prandial",
    value: 184,
    recordedAt: "2026-10-24T10:00:00-03:00",
  },
  {
    id: "g3",
    kind: "glucose",
    label: "Antes do almoço",
    value: 110,
    recordedAt: "2026-10-24T12:00:00-03:00",
  },
  {
    id: "i2",
    kind: "insulin",
    label: "NPH",
    value: 18,
    recordedAt: "2026-10-24T20:00:00-03:00",
  },
  {
    id: "g4",
    kind: "glucose",
    label: "Antes de dormir",
    value: 96,
    recordedAt: "2026-10-24T22:00:00-03:00",
  },
  {
    id: "g5",
    kind: "glucose",
    label: "Jejum",
    value: 78,
    recordedAt: "2026-10-23T07:00:00-03:00",
  },
  {
    id: "g6",
    kind: "glucose",
    label: "Pós-prandial",
    value: 215,
    recordedAt: "2026-10-23T20:30:00-03:00",
  },
  {
    id: "i3",
    kind: "insulin",
    label: "Rápida",
    value: 2,
    recordedAt: "2026-10-23T21:00:00-03:00",
  },
];

export function recordDay(record: HealthRecord) {
  return record.recordedAt.slice(0, 10);
}
export function recordTime(record: HealthRecord) {
  return record.recordedAt.slice(11, 16);
}
export function displayDay(day: string) {
  return day.split("-").reverse().join("/");
}
export function recordTitle(record: HealthRecord) {
  return `${record.kind === "glucose" ? "Glicemia" : "Insulina"} · ${record.label}`;
}
export function recordUnit(record: HealthRecord) {
  return record.kind === "glucose" ? "mg/dL" : "UI";
}
