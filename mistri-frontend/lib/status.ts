import { BadgeTone } from "@/components/ui/Badge";

const STATUS_TONE_MAP: Record<string, BadgeTone> = {
  verified: "verified",
  confirmed: "verified",
  completed: "verified",
  captured: "verified",
  pending: "brass",
  under_review: "brass",
  requested: "brass",
  authorized: "brass",
  rejected: "danger",
  suspended: "danger",
  declined: "danger",
  cancelled: "danger",
  failed: "danger",
  refunded: "neutral",
};

export function toneForStatus(status: string): BadgeTone {
  return STATUS_TONE_MAP[status] ?? "neutral";
}