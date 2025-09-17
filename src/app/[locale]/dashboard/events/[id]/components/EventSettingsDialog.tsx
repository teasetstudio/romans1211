"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/buttons/Button";
import { IconClose, IconCopy } from "@/res/icons";
import { toast } from "react-hot-toast";
import type { Event } from "@prisma/client";

type LinkEvent = Pick<Event, "id" | "isAvailableByLink" | "linkSlug">;

interface EventSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  event: LinkEvent;
  onUpdated?: (updated: LinkEvent) => void;
}

export default function EventSettingsDialog({ open, onClose, event, onUpdated }: EventSettingsDialogProps) {
  // We keep using the existing translation namespace for link access for now
  const t = useTranslations("dashboard_events.linkAccessDialog");
  const [working, setWorking] = useState(false);
  const [local, setLocal] = useState<LinkEvent>(event);

  if (!open) return null;

  const toggle = async (checked: boolean) => {
    try {
      setWorking(true);
      const response = await fetch(`/api/events/${event.id}/link-access`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailableByLink: checked }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update link access");
      }
      const updated: LinkEvent = await response.json();
      setLocal(updated);
      onUpdated?.(updated);
      toast.success(checked ? t("enabled") : t("disabled"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error updating");
    } finally {
      setWorking(false);
    }
  };

  const copy = async () => {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const url = local.linkSlug ? `${base}/events/${local.linkSlug}` : "";
      await navigator.clipboard.writeText(url);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copy_failed"));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <DialogTitle className="text-lg font-medium text-gray-900">
              {t("title")}
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={!!local.isAvailableByLink}
                onChange={(e) => toggle(e.target.checked)}
                disabled={working}
              />
              <span>{t("make_available_by_link")}</span>
            </label>

            {local.isAvailableByLink && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="truncate">
                  {local.linkSlug ? `${typeof window !== "undefined" ? window.location.origin : ""}/events/${local.linkSlug}` : ""}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-gray-50"
                  onClick={copy}
                  disabled={!local.linkSlug}
                >
                  <IconCopy className="w-4 h-4" /> {t("copy")}
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button
              onClick={onClose}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              type="button"
            >
              {t("close")}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
