import api from "../lib/api";

function OnboardingScreen() {
    const handleCreateGroup = async () => {
        try {
            const response = await api.post('/groups')
        } catch(err) {
            console.log(err)
        };
    };

    const handleJoinGroup = async () => {
        try {
            const response = await api.post('/groups/join')
        } catch(err) {
            console.log(err)
        };
    };

}

export default OnboardingScreen;