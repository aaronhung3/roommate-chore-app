import {
    View,
    Text,
} from 'react-native';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { useGroupStore } from '../../stores/groupStore';
import { homeScreenStyles } from '../../styles/homeScreen';
import { useEffect, useState } from 'react';

function HomeScreen() {
    const [chores, setChores] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { group } = useGroupStore();
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchChores = async () => {
            try {
                setIsLoading(true);
                
                if (group) {
                    const response = await api.get(`/chores/${group.id}`);
                    const allChores = response.data.chores;
                    
                    const myChores = allChores.filter(chore => chore.assigned_to_id === user.id);
                    setChores(myChores);
                };
            } catch (err: any) {
                console.log(err.response?.data?.error || 'Something went wrong')
            } finally {
                setIsLoading(false);
            }
        }
        fetchChores();
    }, []);

    return (
        <View style={homeScreenStyles.container}>
            <Text>Hello World!</Text>
        </View>
    );
}

export default HomeScreen;