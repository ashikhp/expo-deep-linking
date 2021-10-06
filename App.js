import React, { useState, useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from "expo-constants";
import * as Linking from 'expo-linking';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './Screens/HomeScreen';
import SettingsScreen from './Screens/SettingsScreen';

const prefix = Linking.makeUrl('/');
const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
export default function App(props) {
  const { navigation } = props;
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [forcerender, setforcerender] = useState(true);

  const [data, setData] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        Home: "home",
        Settings: "settings",

      }
    }
  }

  const handleDeepLink = (event) => {
    let data = Linking.parse(event.url);
    setData(data);

  }

  useEffect(() => {

    async function getInitialURL() {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) setData(Linking.parse(initialURL));
    }
    Linking.addEventListener("url", handleDeepLink);
    if (!data) {
      getInitialURL();
    }
    return () => {
      Linking.removeEventListener("url");

    }

  }, [])


  useEffect(() => {

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {

      setTimeout(() => {
        setforcerender(!forcerender)
      }, 100);

      console.log("notification", notification)
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      setforcerender(!forcerender)
      console.log("+++++++++++", response.notification);
      // console.log("responce", response && response.notification && response.notification.request &&
      //   response.notification.request.content && response.notification.request.content.data);
      if (response.notification) {
        const uri = response && response.notification && response.notification.request &&
          response.notification.request.content && response.notification.request.content.data.uri;
        Linking.openURL(uri)
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [forcerender]);

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

  console.log(expoPushToken);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
