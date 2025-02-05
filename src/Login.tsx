/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-catch-shadow */
import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import styles from './Style/Loginstyle';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
//import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { setIdToken, setUserId } from './authSlice';
import messaging from '@react-native-firebase/messaging';

function Login() {
  const idToken = useSelector((state: any) => state.auth.idToken);
  console.log(idToken);


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1014648879625-kb98tgtth489e1r1n0k4bb3nlirvg95k.apps.googleusercontent.com',
    });
  }, []);
  const getFCMToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      return fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };
  

  const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid Gmail address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      console.log('User Login Successful:', user);

      const userDoc = await firestore().collection('users').doc(user.uid).get();

      if (userDoc.exists) {
        //const userData = userDoc.data();
        //const cart = userData.cart || [];
        navigation.navigate('FeedScreen');
      } else {
        await firestore().collection('users').doc(user.uid).set({
          email: user.email,
          userId: user.uid,
          name: user.name,

        });
        navigation.navigate('FeedScreen');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleButtonPress = async () => {
    console.log('>>>>>>>>..');

    setLoading(true);
    setError('');
    try {
      console.log('<<<<<<<<<<');

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('00000000');

      const userInfo = await GoogleSignin.signIn();
      const userId = userInfo.data?.user.id;
      const idToken = userInfo.data?.idToken;
      console.log(userInfo, '<<<<<<<<<<<<<<<');

      const userDoc = await firestore().collection('users').doc(userId).get();

      if (userDoc.exists) {
        dispatch(setIdToken(idToken));  // Dispatch idToken to Redux
        dispatch(setUserId(userId)); 
        const fcmToken = await getFCMToken(); // Get FCM token
        // Dispatch userId to Redux
        const userDocRef = firestore().collection('users').doc(userId);
        const userDoc = await userDocRef.get();
    
        console.log('navigating to home screen ');
        
        navigation.navigate('FeedScreen', { name:userDoc._data.name });
        
        console.log('navigated');
        
      } else {
        // Creating user document if it doesn't exist
        await firestore().collection('users').doc(userId).set({

          email: userInfo.data?.user.email,
          userId,
          name: userInfo.data?.user.name,
          profilepic:userInfo.data?.user.photo,
          posts:[],
          fcmToken,

        });
        navigation.navigate('FeedScreen', { name: userInfo.user.name });
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Sign-In was cancelled. Please try again.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setError('Sign-In is already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services are not available or outdated.');
      } else {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8e8e8e"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8e8e8e"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? '#A5D6A7' : '#4CAF50' }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      {/* Sign Up or Sign In Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Do you have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.divider}>OR</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? '#90CAF9' : '#4285F4' }]}
        onPress={onGoogleButtonPress}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In with Google</Text>}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default Login;
