import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useRoute, useNavigation } from '@react-navigation/native';
import { toggleTheme } from '../App';  // Import the toggleTheme function

const FeedScreen = () => {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [commentText, setCommentText] = useState('');
    const userId = useSelector(state => state.auth.userId); // Get logged-in user ID
    const bottomSheetRef = useRef(null);
    const route = useRoute();
    const { name } = route.params || {};
    const navigation = useNavigation();
    const [isDarkTheme, setIsDarkTheme] = useState(false); // Theme state for FeedScreen

    console.log(name);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('posts')
            .orderBy('timestamp', 'desc')
            .onSnapshot(snapshot => {
                const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPosts(fetchedPosts);
            });

        return () => unsubscribe();
    }, []);

    const sendNotification = async (receiverId, title, body) => {
        const userDoc = await firestore().collection('users').doc(receiverId).get();
        if (!userDoc.exists) return;

        const fcmToken = userDoc.data().fcmToken;
        if (!fcmToken) return;

        const message = {
            
            
            to: fcmToken,
            notification: {
                title,
                body,
                sound: 'default',
            },
            data: {
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                screen: 'FeedScreen',
            },
        };

        try {
            console.log("<<<<<<<<<<");
            
            await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'key=bf79f7db6ca2be8bbcceec8f637455c27319a1fc',
                },
                body: JSON.stringify(message),
                
            });
            console.log(">>>>>>>>>>>>>",body);
            
        } catch (error) {
            console.error('Error sending FCM notification:', error);
        }
    };


    // Toggle like functionality
    const handleLike = async (postId, likes, postCreatorId) => {
        const postRef = firestore().collection('posts').doc(postId);
        const isLiked = likes.includes(userId);

        await postRef.update({
            likes: isLiked ? likes.filter(id => id !== userId) : [...likes, userId]
        });

        if (!isLiked) {
            sendNotification(selectedPost.userId, 'New Like!', `${name} commented on your post.`);
            console.log(sendNotification,"<<<<<<<<<<");
            
        }
    };

    // Open Bottom Sheet with Comments
    const openComments = (post) => {
        setSelectedPost(post);
        bottomSheetRef.current.open(); // Open the bottom sheet
    };

    const addComment = async () => {
        if (!commentText.trim()) return;

        const postRef = firestore().collection('posts').doc(selectedPost.id);
        const newComment = {
            userId,
            text: commentText,
            timestamp: new Date(),
            userName: name,
        };

        await postRef.update({
            comments: [...selectedPost.comments, newComment]
        });

        setSelectedPost(prev => ({
            ...prev,
            comments: [...prev.comments, newComment]
        }));

        setCommentText('');
        sendNotification(selectedPost.userId, 'New Comment!', `${name} commented on your post.`);
    };

    // Add a comment

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: isDarkTheme ? '#333' : '#fff' }]}>
            {item.image ? (
                <Image source={{ uri: `data:image/jpeg;base64,${item.image}` }} style={styles.image} />
            ) : null}
            <Text style={[styles.text, { color: isDarkTheme ? '#fff' : '#333' }]}>{item.userName}</Text>
            <Text style={[styles.text, { color: isDarkTheme ? '#fff' : '#333' }]}>{item.text}</Text>
            <Text style={[styles.timestamp, { color: isDarkTheme ? '#ccc' : 'gray' }]}>
                {item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleString() : 'No timestamp'}
            </Text>

            {/* Like & Comment Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity onPress={() => handleLike(item.id, item.likes)} style={styles.actionButton}>
                    <Icon name={item.likes.includes(userId) ? "heart" : "heart-outline"} size={20} color={item.likes.includes(userId) ? "red" : "gray"} />
                    <Text style={[styles.actionText, { color: isDarkTheme ? '#fff' : 'gray' }]}>{item.likes.length}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => openComments(item)} style={styles.actionButton}>
                    <Icon name="chatbubble-outline" size={20} color={isDarkTheme ? '#fff' : 'gray'} />
                    <Text style={[styles.actionText, { color: isDarkTheme ? '#fff' : 'gray' }]}>{item.comments.length}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: isDarkTheme ? '#222' : '#f8f8f8' }]}>
            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                removeClippedSubviews={false}
            />

            {/* Floating Button for Creating a Post */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreatePost')}>
                <Icon name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Bottom Sheet for Comments */}
            <RBSheet
                ref={bottomSheetRef}
                height={400}
                openDuration={250}
                closeOnDragDown={true}
                customStyles={{
                    container: styles.bottomSheet
                }}
            >
                <View style={styles.commentContainer}>
                    <Text style={[styles.commentTitle, { color: isDarkTheme ? '#fff' : '#000' }]}>Comments</Text>
                    <FlatList
                        data={selectedPost?.comments || []}
                        keyExtractor={(item, index) => index.toString()}
                        removeClippedSubviews={false} // <- Add This

                        renderItem={({ item }) => (
                            <View style={[styles.comment, { backgroundColor: isDarkTheme ? '#333' : '#fff' }]}>
                                <Text style={[styles.commentText, { color: isDarkTheme ? '#fff' : '#333' }]}>{item.userName}</Text>
                                <Text style={[styles.commentText, { color: isDarkTheme ? '#fff' : '#333' }]}>{item.text}</Text>
                                <Text style={[styles.timestamp, { color: isDarkTheme ? '#ccc' : 'gray' }]}>
                                    {item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleString() : 'No timestamp'}
                                </Text>
                            </View>
                        )}
                    />
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Write a comment..."
                            value={commentText}
                            onChangeText={setCommentText}
                        />
                        <TouchableOpacity onPress={addComment} style={styles.sendButton}>
                            <Icon name="send" size={20} color="#007AFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </RBSheet>

            {/* Toggle Theme Button */}
            <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => {
                    toggleTheme(setIsDarkTheme);  // Toggle theme
                }}
            >
                <Text style={styles.toggleButtonText}>{isDarkTheme ? 'Switch to Light' : 'Switch to Dark'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        padding: 15,
        margin: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
    },
    actionText: {
        fontSize: 14,
        marginLeft: 5,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#007AFF',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    bottomSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 15,
        backgroundColor: '#fff',
    },
    commentContainer: {
        flex: 1,
    },
    commentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    comment: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    commentText: {
        fontSize: 14,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 40,
    },
    sendButton: {
        marginLeft: 10,
    },
    toggleButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        zIndex: 10,
    },
    toggleButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default FeedScreen;
