import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import styles from './Style/CreatePoststyle';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs'; // Import File System

const CreatePost = () => {
  const [showCard, setShowCard] = useState(true);
  const [text, setText] = useState('');
  const [imageUris, setImageUris] = useState([]);
  const UserId = useSelector((state) => state.auth.userId);

  const navigation = useNavigation();

  // Function to convert image URI to base64
  const convertToBase64 = async (imageUri) => {
    try {
      return await RNFS.readFile(imageUri, 'base64'); // Convert to Base64
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  };

  const handleTakePhoto = async () => {
    launchCamera({ mediaType: 'photo', cameraType: 'back', quality: 0.5 }, async (response) => {
      if (response.assets) {
        const base64Image = await convertToBase64(response.assets[0].uri);
        if (base64Image) {
          setImageUris([...imageUris, base64Image]); // Store base64 instead of file path
          setShowCard(false);
        }
      }
    });
  };

  const handleChooseImage = async () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, async (response) => {
      if (response.assets) {
        const base64Image = await convertToBase64(response.assets[0].uri);
        if (base64Image) {
          setImageUris([...imageUris, base64Image]);
          setShowCard(false);
        }
      }
    });
  };

  const saveToFirestore = async () => {
    if (!text.trim() || imageUris.length === 0) {
      console.log('Text and Image are required!');
      return;
    }
    try {
      const postId = firestore().collection('posts').doc().id;
      const postData = {
        postId,
        userId: UserId,
        text,
        image: imageUris[0], // Save Base64 string instead of file path
        likes: [],
        comments: [],
        timestamp: firestore.FieldValue.serverTimestamp(),
        
      };
      await firestore().collection('posts').doc(postId).set(postData);
      console.log('Post saved successfully!');
      setText('');
      setImageUris([]);
      navigation.navigate('FeedScreen');
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {imageUris.map((base64, index) => (
          <Image key={index} source={{ uri: `data:image/jpeg;base64,${base64}` }} style={styles.image} />
        ))}
      </View>
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="write text.........."
          placeholderTextColor={'grey'}
          value={text}
          onChangeText={setText}
          multiline
        />
      </View>
      {showCard && (
        <View style={styles.card}>
          <TouchableOpacity style={styles.option} onPress={handleTakePhoto}>
            <Icon name="camera" size={20} color="#000" />
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={handleChooseImage}>
            <Icon name="image" size={20} color="#000" />
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}
      {!showCard && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowCard(true)}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.saveButton} onPress={saveToFirestore}>
        <Icon name="send" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default CreatePost;
