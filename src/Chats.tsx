import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, Send } from 'react-native-gifted-chat';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';

const Chats = () => {
    const [messages, setMessages] = useState([]);
    const route = useRoute();

    const currentUserId = auth().currentUser?.uid;
    const chatPartnerUserId = route?.params?.data?.id;
    console.log(currentUserId,">>>>>>>>>");
    
    console.log(chatPartnerUserId,"<<<<<<<");
    

    useEffect(() => {
        if (!currentUserId || !chatPartnerUserId) {
            console.error('User IDs are missing!');
            return;
        }

        const subscribe = firestore()
            .collection('Chat')
            .doc(currentUserId + chatPartnerUserId)
            .collection('messages')
            .orderBy('createdAt', 'desc')
            .onSnapshot(querySnapshot => {
                const allmsg = querySnapshot.docs.map(item => ({
                    ...item.data(),
                    createdAt: new Date(item.data().createdAt.seconds * 1000),
                }));
                setMessages(allmsg);
            });

        return () => subscribe();
    }, [currentUserId, chatPartnerUserId]);

    const onSend = useCallback((messages = []) => {
        const msg = messages[0];
        const finalMsg = {
            ...msg,
            sendBy: currentUserId,
            sendTo: chatPartnerUserId,
            createdAt: new Date(),
        };

        setMessages(previousMessages => GiftedChat.append(previousMessages, finalMsg));

        firestore().collection('Chat')
            .doc(currentUserId + chatPartnerUserId)
            .collection('messages')
            .add(finalMsg);

        firestore().collection('Chat')
            .doc(chatPartnerUserId + currentUserId)
            .collection('messages')
            .add(finalMsg);
    }, [currentUserId, chatPartnerUserId]);

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{ _id: currentUserId }}
                alwaysShowSend
                renderSend={(props) => (
                    <Send {...props}>
                        <View style={{ marginRight: 10, marginBottom: 5 }}>
                            <TouchableOpacity>
                                <Icon name="send" size={24} color="blue" />
                            </TouchableOpacity>
                        </View>
                    </Send>
                )}
                
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    iconButton: {
        padding: 10,
    },
});

export default Chats;
