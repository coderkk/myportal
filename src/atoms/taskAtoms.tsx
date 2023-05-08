import type { TaskStatus } from "@prisma/client";
import { atom } from "jotai";

export const statusAtom = atom<TaskStatus[] | undefined>([]);
