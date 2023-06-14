import { atom } from "jotai";
import type { activeDateFilter } from "../components/siteDiary/DateFilter";
import type { activeSearchFilter } from "../components/siteDiary/SearchFilter";

export const siteDiaryMutationCountAtom = atom(0);
export const siteDiariesMutationCountAtom = atom(0);

export const activeSearchFiltersAtom = atom<activeSearchFilter[]>([]);
export const activeDateFiltersAtom = atom<activeDateFilter[]>([]);
