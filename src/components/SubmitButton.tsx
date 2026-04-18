"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      {pending ? (loadingLabel ?? "Guardando…") : label}
    </button>
  );
}
