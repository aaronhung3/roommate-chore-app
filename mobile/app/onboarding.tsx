import { useState } from 'react';
import {
    View, 
    Text, 
    TextInput,
    TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import api from '../lib/api';
import { useGroupStore } from '../stores/groupStore';
import { onboardingScreenStyles } from '../styles/onboardingScreen';

function OnboardingScreen() {
    const [groupName, setGroupName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { setGroup } = useGroupStore();

    const handleCreateGroup = async () => {
        try {
            setIsLoading(true);

            const response = await api.post('/groups', { name: groupName });

            setGroup(response.data.group);

            router.replace('/(tabs)');

        } catch(error: any) {
            setError(error.response?.data?.error || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinGroup = async () => {
        try {
            setIsLoading(true);

            const response = await api.post('/groups/join', { inviteCode });

            setGroup(response.data.group);

            router.replace('/(tabs)');

        } catch(error: any) {
            setError(error.response?.data?.error || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={onboardingScreenStyles.container}>
            <Text style={onboardingScreenStyles.title}>{"Let's get you set up"}</Text>

            {error ? <Text style={onboardingScreenStyles.error}>{error}</Text> : null}

            <TextInput
                style={onboardingScreenStyles.input}
                placeholder='Invite Code'
                value={inviteCode}
                onChangeText={setInviteCode}
            />
            <TouchableOpacity
                style={onboardingScreenStyles.button}
                onPress={handleJoinGroup}
                disabled={isLoading}
            >
                <Text style={onboardingScreenStyles.buttonText}>Join Group</Text>
            </TouchableOpacity>

            <Text style={onboardingScreenStyles.text}>or</Text>

            <TextInput
                style={onboardingScreenStyles.input}
                placeholder='Group Name'
                value={groupName}
                onChangeText={setGroupName}
            />
            <TouchableOpacity 
                style={onboardingScreenStyles.button}
                onPress={handleCreateGroup}
                disabled={isLoading}
            >
                <Text style={onboardingScreenStyles.buttonText}>Create Group</Text>
            </TouchableOpacity>
        </View>
    );

}

export default OnboardingScreen;