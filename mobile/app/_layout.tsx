import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useGroupStore } from '../stores/groupStore';
import api from '../lib/api';

export default function RootLayout() {
    const { token, isLoading, login, loadToken } = useAuthStore();
    const { group, setGroup } = useGroupStore();
    const [isFetchingUser, setIsFetchingUser] = useState(false);

    // Check if token exists in SecureStorage
    useEffect(() => {
        loadToken();
    }, []);

    // Fetch the user and the user's group if the token exists
    useEffect(() => {
        if (token) {
        const fetchUser = async () => {
            try {
                setIsFetchingUser(true);

                const response = await api.get('/auth/me');

                login(response.data.user, token);

                if (response.data.group) {
                    setGroup(response.data.group);
                }
            } catch (err) {
                console.log(err)
            } finally {
                setIsFetchingUser(false);
            }
        };
        fetchUser();
        }
    }, [token, login, setGroup])

    // Routes the user will be sent to based on whether they have a token and group
    useEffect(() => {
        if (!isLoading && !isFetchingUser) {
            if (token && group) {
                router.replace('/(tabs)');
            } else if (token && !group) {
                router.replace('/onboarding');
            } else {
                router.replace('/login');
            }
        }
    }, [token, isLoading, group, isFetchingUser]);

    return (
        <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}