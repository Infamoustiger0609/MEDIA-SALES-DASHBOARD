import { create } from "zustand";
import { availableMonths } from "../lib/loadData";
import type { ComparisonMode } from "../types";

interface FilterState {
  /** Defaults to every loaded month -- "select all" is the default state, not opt-in. */
  selectedMonths: string[];
  comparisonMode: ComparisonMode;
  setSelectedMonths: (months: string[]) => void;
  toggleMonth: (month: string) => void;
  selectAllMonths: () => void;
  setComparisonMode: (mode: ComparisonMode) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedMonths: [...availableMonths],
  comparisonMode: "None",
  setSelectedMonths: (selectedMonths) => set({ selectedMonths }),
  toggleMonth: (month) =>
    set((state) => ({
      selectedMonths: state.selectedMonths.includes(month)
        ? state.selectedMonths.filter((m) => m !== month)
        : [...state.selectedMonths, month],
    })),
  selectAllMonths: () => set({ selectedMonths: [...availableMonths] }),
  setComparisonMode: (comparisonMode) => set({ comparisonMode }),
}));

/**
 * The latest of the selected months -- for UI that still needs a single
 * "current" period (a page header, a single-territory lookup) even though
 * the filter itself is multi-select. Falls back to "" when nothing is
 * selected so callers can render their existing empty-state.
 */
export function primaryMonth(selectedMonths: string[]): string {
  if (selectedMonths.length === 0) return "";
  return selectedMonths.reduce((latest, m) => (m > latest ? m : latest));
}
