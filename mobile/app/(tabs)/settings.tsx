import { useState } from 'react';
import {
    View, 
    Text, 
    TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useGroupStore } from '../../stores/groupStore';
import { settingsScreenStyles } from '../../styles/settingsScreen';

function SettingsScreen() {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { logout } = useAuthStore();
    const { clearGroup } = useGroupStore();

    const handleLogout = async () => {
        try {
            setIsLoading(true);

            clearGroup();
            await logout();
            
            console.log('Token Cleared and User Logged Out');
            
            router.replace('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={settingsScreenStyles.container}>
            {error ? <Text>{error}</Text> : null}
            <TouchableOpacity 
                onPress={handleLogout}
                disabled={isLoading}
                style={settingsScreenStyles.button}
            >
                <Text style={settingsScreenStyles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

export default SettingsScreen;