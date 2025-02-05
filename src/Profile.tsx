import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Profile = () => {
    

    const [imgUrl, setImgUrl] = useState('');

    useEffect(() => {
        const loadImg = async () => {
            const savedimg = await AsyncStorage.getItem('imageurl');
            if (savedimg) {
                setImgUrl(savedimg);
            }
            else {
                setImgUrl('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png');
            }
        };
        loadImg();
    }, []);
    const openCamera = async () => {
        try {
            const result = await launchCamera({
                mediaType: 'photo', // Ensure it's a photo
            });

            if (result.didCancel) {
                console.log('User canceled the camera');
                return;
            }

            if (result.errorCode) {
                console.log('Camera error:', result.errorMessage);
                return;
            }

            const imguri = result?.assets?.[0]?.uri; // Safe access to the uri
            if (imguri) {
                setImgUrl(imguri);
                await AsyncStorage.setItem('imageurl', imguri);
            } else {
                console.log('No image URI returned');
            }

            console.log(result, "<<<<");
        } catch (error) {
            console.error('Camera error:', error);
        }
    };

    const openGalery = async () => {
        const result = await launchImageLibrary();
        const imguri = result?.assets?.[0]?.uri; // Safe access to the uri

        if (imguri) {
            setImgUrl(imguri);
            await AsyncStorage.setItem('imageurl', imguri);
        }

        console.log(result, "<<<<");

    };





    return (
        <View style={styles.container}>
            <Image
                resizeMode='contain'
                style={styles.img}
                source={{ uri: imgUrl }}
            />
            <TouchableOpacity style={styles.btncam} onPress={openCamera}>
                <Text style={styles.txtbtn}>Open Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btncam} onPress={openGalery}>
                <Text style={styles.txtbtn}>Open Gallery</Text>
            </TouchableOpacity>
            {/* Show error message if any */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    img: {
        width: '100%',
        height: 200,
    },
    btncam: {
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: '60%',
        height: 40,
        borderRadius: 6,
        backgroundColor: 'green',
    },
    txtbtn: {
        color: 'white',
    },
    timestamp: {
        marginTop: 10,
        fontSize: 16,
        color: 'gray',
    },
    locationContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        width: '80%',
    },
    locationText: {
        fontSize: 16,
        color: 'black',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
});

export default Profile;
