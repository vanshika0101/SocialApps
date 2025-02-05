import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import styles from './Style/Signupstyle';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // Import Firestore

function Signup() {
  const [name, setName] = useState('');  // Add state for name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const handleSignup = async () => {
    if (!name || !email || !password) {
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
      // Firebase Auth: Create User
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('User Created Successfully:', userCredential);

      // Add User Data to Firestore, including name
      const userData = {
        id: userCredential.user.uid,
        name,  // Save the name
        email,
        password,
        cart: [], // Optional, add cart if needed
      };
      console.log(userData);
      
      await firestore().collection('users').doc(userCredential.user.uid).set(userData);

      // Success Alert
      Alert.alert('Signup Successful', 'Your account has been created.');
      navigation.navigate('Login');
    } catch (err) {
      console.error('Signup Error:', err);
      setError(err?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>

      {/* Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#8e8e8e"
        value={name}
        onChangeText={setName}
      />

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

      {/* Signup Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? '#A5D6A7' : '#4CAF50' }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>

      {/* Navigate to Login */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{ color: 'blue' }}>Log in</Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}


export default Signup;
