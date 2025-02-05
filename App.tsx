import React, { useEffect, useState } from 'react';
import { StatusBar, Alert, SafeAreaView } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useSelector } from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import Icon from "react-native-vector-icons/Entypo";
import { store, persistor } from './src/Store'; // Added persistor
import Login from './src/Login';
import Home from './src/Home';
import FeedScreen from './src/FeedScreen';
import CreatePost from './src/CreatePost';
import Signup from './src/Signup';
import Users from './src/Users';
import Chats from './src/Chats';
import Profile from './src/Profile';
import { Provider as PaperProvider, DarkTheme as PaperDarkTheme, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import SplashScreen from 'react-native-splash-screen';
import { PersistGate } from "redux-persist/integration/react";

const HomeStack = createNativeStackNavigator();
const HomeTab = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Request user permission for notifications
const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission granted.');
  }
};

// Get FCM Token
const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
  } catch (error) {
    console.log('Error fetching FCM Token:', error);
  }
};

// Handle foreground messages
const handleForegroundMessages = () => {
  messaging().onMessage(async remoteMessage => {
    Alert.alert(
      remoteMessage.notification?.title || 'New Notification',
      remoteMessage.notification?.body || 'You have received a new message.'
    );
  });
};

// AuthStack Navigator
const AuthStackNavigator = () => (
  <AuthStack.Navigator initialRouteName="Login">
    <AuthStack.Screen name="Login" component={Login} options={{ headerShown: false }} />
    <AuthStack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
  </AuthStack.Navigator>
);

const HomeStackNavigator = () => (
  <HomeStack.Navigator>

    <HomeStack.Screen name="FeedScreen" component={FeedScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name="CreatePost" component={CreatePost} options={{ headerShown: false }} />
  </HomeStack.Navigator>
);

const ChatNavigator = () => (
  <ChatStack.Navigator initialRouteName="Users">
    <ChatStack.Screen name="Users" component={Users} options={{ headerShown: false }} />
    <ChatStack.Screen name="Chats" component={Chats} options={{ headerShown: false }} />
  </ChatStack.Navigator>
);

const HomeTabNavigator = () => (
  <HomeTab.Navigator
    screenOptions={{
      tabBarActiveTintColor: 'blue',
      tabBarInactiveTintColor: 'grey',
      tabBarLabelPosition: 'below-icon',
      tabBarShowLabel: true,
    }}
  >
    <HomeTab.Screen
      name="Homes"
      component={HomeStackNavigator}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
      }}
    />
    <HomeTab.Screen
      name="Chat"
      component={ChatNavigator}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => <Icon name="chat" size={size} color={color} />,
      }}
    />
    <HomeTab.Screen
      name="Profile"
      component={Profile}
      options={{
        headerShown: false,
        tabBarIcon: ({ color, size }) => <Icon name="user" size={size} color={color} />,
      }}
    />
  </HomeTab.Navigator>
);
export const toggleTheme = (setIsDarkTheme: { (value: React.SetStateAction<boolean>): void; (arg0: (prevTheme: any) => boolean): void; }) => {
  setIsDarkTheme(prevTheme => !prevTheme);
};
const AppContainer = () => {
  const idToken = useSelector((state) => state.auth.idToken);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    requestUserPermission();
    getFCMToken();
    handleForegroundMessages();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
      </SafeAreaView>
    );
  }

  return (
    <PaperProvider theme={isDarkTheme ? PaperDarkTheme : PaperDefaultTheme}>
      <NavigationContainer theme={isDarkTheme ? DarkTheme : DefaultTheme}>
        <StatusBar barStyle="light-content" />
        {idToken ? <HomeTabNavigator /> : <AuthStackNavigator />}
      </NavigationContainer>
    </PaperProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContainer />
      </PersistGate>
    </Provider>
  );
};

export default App;
