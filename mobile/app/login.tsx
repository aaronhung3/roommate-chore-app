import { useState } from 'react';
import {
    View, 
    Text, 
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { authScreenStyles } from '../styles/authScreen';

function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuthStore();

    const handleLogin = async () => {
        setError('');

        if (!email || !password) {
            setError('Please enter all fields')
            return
        }

        try {
            setIsLoading(true);

            const response = await api.post('/auth/login', { email, password });

            await login(response.data.user, response.data.token);

            router.replace('/(tabs)');

        } catch (error: any) {
            setError(error.response?.data?.error || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={authScreenStyles.container}>
        <Text style={authScreenStyles.title}>Welcome back</Text>

        {error ? <Text style={authScreenStyles.error}>{error}</Text> : null}

        <TextInput
            style={authScreenStyles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
        />

        <TextInput
            style={authScreenStyles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
        />

        <TouchableOpacity
            style={authScreenStyles.button}
            onPress={handleLogin}
            disabled={isLoading}
        >
            {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={authScreenStyles.buttonText}>Log in</Text>
            }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={authScreenStyles.link}>{"Don't have an account? Register"}</Text>
        </TouchableOpacity>
    </View>
    );

}

export default LoginScreen;