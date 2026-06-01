import { StyleSheet } from 'react-native';

export const onboardingScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 32,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    text: {
        marginHorizontal: 10,
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
        fontSize: 16,
    },
    error: {
        color: 'red',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});