import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: null,
    isLoading: true,

    login: async (user, token) => {
        await SecureStore.setItemAsync('token', token);
        set({ user, token });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('token');
        set({ user: null, token: null });
    },

    loadToken: async () => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            set({ token, isLoading: false });
        } else {
            set({ isLoading: false });
        }
    },
}))