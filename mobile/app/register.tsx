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

function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuthStore();

    const handleRegister = async () => {
        setError('');

        if (!name || !email || !password) {
            setError('Please fill in all the fields');
            return;
        }

        try {
            setIsLoading(true);
            
            const response = await api.post('/auth/register', { name, email, password });

            await login(response.data.user, response.data.token);

            router.replace('/(tabs)');

        } catch (error: any) {
            setError(error.response?.data?.error || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <View style={authScreenStyles.container}>
            <Text style={authScreenStyles.title}>Create account</Text>

            {error ? <Text style={authScreenStyles.error}>{error}</Text> : null}

            <TextInput
                style={authScreenStyles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
            />

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
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={authScreenStyles.buttonText}>Register</Text>
                }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={authScreenStyles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>
        </View>
    );
}

export default RegisterScreen;