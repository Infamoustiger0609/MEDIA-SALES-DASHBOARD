import { create } from "zustand";
import { getLatestMonth } from "../lib/loadData";
import type { ComparisonMode } from "../types";

export type TerritoryFilter = "All" | "Gaurav" | "Rajesh" | "Shalini" | "Sharda";

interface FilterState {
  territory: TerritoryFilter;
  month: string;
  comparisonMode: ComparisonMode;
  setTerritory: (territory: TerritoryFilter) => void;
  setMonth: (month: string) => void;
  setComparisonMode: (mode: ComparisonMode) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  territory: "All",
  month: getLatestMonth() ?? "",
  comparisonMode: "None",
  setTerritory: (territory) => set({ territory }),
  setMonth: (month) => set({ month }),
  setComparisonMode: (comparisonMode) => set({ comparisonMode }),
}));
