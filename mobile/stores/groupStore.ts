// Hold the current group
// Have a function to set the group
// Have a function to clear it

import { create } from 'zustand';

interface Group {
    id: string;
    name: string;
    invite_code: string;
    role: string;
}

interface GroupStore {
    group: Group | null;
    setGroup: (group: Group) => void;
    clearGroup: () => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
    group: null,

    setGroup: (group) => {
        set({  group })
    },

    clearGroup: () => {
        set({ group: null})
    }
}))