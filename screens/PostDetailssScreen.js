import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, TextInput, 
    FlatList, KeyboardAvoidingView, Platform, 
    TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

{/*Need to fix:
    [post + comments] doesnt scroll / or does after 15 touches!
    comment box doesn't get pushed up to avoid getting blocked by keyboard
*/}


const PostDetailsScreen = () => {
    const route = useRoute();
    const { post } = route.params;

    const [comments, setComments] = useState([
        { id: '1', text: 'Great post!', createdBy: 'Alice' },
        { id: '2', text: 'Nice update!', createdBy: 'Bob' },
        { id: '3', text: 'I totally agree!', createdBy: 'Charlie' },
        { id: '4', text: 'Thanks for sharing!', createdBy: 'David' },
        { id: '5', text: 'Well written!', createdBy: 'Emma' },
        { id: '6', text: 'Great post!', createdBy: 'Alice' },
        { id: '7', text: 'Nice update!', createdBy: 'Bob' },
        { id: '8', text: 'I totally agree!', createdBy: 'Charlie' },
        { id: '9', text: 'Thanks for sharing!', createdBy: 'David' },
        { id: '10', text: 'Well written!', createdBy: 'Emma' }
    ]);
    
    const [newComment, setNewComment] = useState('');

    const handleAddComment = () => {
        const trimmedComment = newComment.trim();
        if (trimmedComment === '') return;

        const newCommentObj = {
            id: String(Date.now()), 
            text: trimmedComment,
            createdBy: 'You'
        };

        setComments([...comments, newCommentObj]);
        setNewComment('');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}> 

                {/* ✅ FlatList handles all scrolling */}
                <FlatList
                    keyboardShouldPersistTaps="always"
                    showsVerticalScrollIndicator={false}
                    data={comments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.commentCard}>
                            <Text style={styles.commentAuthor}>{item.createdBy}</Text>
                            <Text style={styles.commentText}>{item.text}</Text>
                        </View>
                    )}
                    ListHeaderComponent={
                        <>
                            <View style={styles.postCard}>
                                <View style={styles.postHeader}>
                                    <FontAwesome5 name="user-circle" size={24} color="#343332" />
                                    <Text style={styles.userProfileName}>{post.createdBy}</Text>
                                </View>
                                <Text style={styles.postTitle}>{post.title}</Text>
                                <Text style={styles.postContent}>{post.content}</Text>
                                <Text style={styles.postDate}>
                                    {post.createdAt && typeof post.createdAt.toDate === "function" 
                                        ? post.createdAt.toDate().toLocaleString() 
                                        : "Unknown Date"}
                                </Text>
                            </View>
                            <Text style={styles.commentHeader}>Comments</Text>
                        </>
                    }
                    contentContainerStyle={{ flexGrow: 1, paddingTop: 20, paddingBottom: 80 }} 
                />

                {/* ✅ KeyboardAvoidingView wraps only the Input Box */}
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "position"} 
                    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 50}
                >
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Write a comment..."
                            value={newComment}
                            onChangeText={setNewComment}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.commentButton, !newComment.trim() && styles.disabledButton]} 
                            onPress={handleAddComment}
                            disabled={!newComment.trim()} 
                        >
                            <MaterialCommunityIcons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFDF7' },

    postCard: { 
        backgroundColor: '#F0EFEF', 
        padding: 20, 
        borderRadius: 12, 
        marginBottom: 15,
        marginTop: 10, 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    userProfileName: { fontSize: 16, fontWeight: '500', marginLeft: 10 },
    postTitle: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
    postContent: { fontSize: 16, marginBottom: 10 },
    postDate: { color: 'gray', fontSize: 14, marginTop: 5 },

    commentHeader: { fontSize: 18, fontWeight: '600', marginBottom: 10, marginTop: 10 },
    commentCard: { 
        backgroundColor: '#EFEFEF', 
        padding: 14, 
        borderRadius: 10, 
        marginBottom: 8
    },
    commentAuthor: { fontWeight: '600', marginBottom: 4 },
    commentText: { fontSize: 14 },

    commentInputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 12, 
        borderTopWidth: 1, 
        borderColor: '#908F8D', 
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16, 
        paddingBottom: Platform.OS === 'ios' ? 20 : 10 
    },
    commentInput: { 
        flex: 1, 
        padding: 12, 
        borderWidth: 1, 
        borderColor: '#908F8D', 
        borderRadius: 10, 
        minHeight: 40, 
        maxHeight: 100,
        textAlignVertical: 'top'
    },
    commentButton: { 
        marginLeft: 10, 
        backgroundColor: 'orange', 
        padding: 10, 
        borderRadius: 8, 
        alignItems: 'center',
        justifyContent: 'center'
    },
    disabledButton: { backgroundColor: 'lightgray' }
});

export default PostDetailsScreen;
