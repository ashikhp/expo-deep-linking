import React, { useState, useEffect } from 'react'
import { View, Text } from 'react-native'
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import Constants from "expo-constants";

const HomeScreen = () => {
    const [expoPushToken, setExpoPushToken] = useState('');
    useEffect(() => {
        registerForPushNotificationsAsync().then((token) => {
            setExpoPushToken(token);
        });
    }, []);

    async function registerForPushNotificationsAsync() {
        let token;
        if (Constants.isDevice) {
            const {
                status: existingStatus,
            } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync()).data;
        }
        return token;
    }


    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text onPress={() => { }}>HomeScreen</Text>
            <Text selectable>{expoPushToken}</Text>
        </View>
    )
}
export default HomeScreen;
