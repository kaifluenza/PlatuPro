import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Modal, FlatList,
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { subscribeToPosts } from '../../data/postsData';
import { useState, useEffect } from 'react';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';


import { getFirestore, collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';


const MAX_TITLE_LENGTH = 80;

const AssistantHomeScreen = () => {
    const navigation = useNavigation();

    const { user, name, restaurantId, role } = useAuth();
    const [selectedPostId, setSelectedPostId] = useState(null);

    const [newPostTitle, setNewPostTitle] = useState("");
    const [newPostText, setNewPostText] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [posts, setPosts] = useState([]);


    //fetch posts data
    useEffect(()=>{
        if(restaurantId){
            const unsubscribe = subscribeToPosts(restaurantId, setPosts);
            return () => unsubscribe(); //cleanup listener 
        }
    }, [restaurantId]);


    //function to create a post
    const handleCreatePost = async () => {
        if (newPostText.trim() === "") return; //dont allow empty posts

        console.log('Creating post:', newPostText);

        //get ref to posts collection
        const db = getFirestore();
        const collectionRef = collection(db, `restaurants/${restaurantId}/posts`);

        //save to firestore
        try{
            await addDoc(collectionRef, {
                title:"", //for now we dont use title
                content:newPostText,
                createdBy: name || "Unknown",
                createdAt: serverTimestamp(),
                userId: user.uid
            });

             //reset fields
             setNewPostTitle("");
             setNewPostText("");
             setModalVisible(false);
             
        }catch(error){
            console.error("Error creating post: ", error);
        }
    }
       

    //function to delete post
    const handleDeletePost = async (postId) => {
        console.log("Deleting Post:", postId);
        console.log("User Role:", role, "User Restaurant ID:", restaurantId);
        const db = getFirestore();
        const postRef = doc(db, `restaurants/${restaurantId}/posts`, postId);

        try {
            await deleteDoc(postRef);
        } catch (error) {
            console.error("Error deleting post: ", error);
        }
    }

    //function to render a post
    const renderPostCard = ({item}) => {
        const canDelete = role === "assistant_manager" && item.userId === user.uid;

        return (
            <TouchableOpacity onPress={() => setSelectedPostId(selectedPostId === item.id ? null : item.id)}>
                <View style={styles.postCard}>
                    <View style={styles.postCreator}>
                        <FontAwesome5 name="user-circle" size={24} color="#343332" />
                        <Text style={styles.userProfileName}>{item.createdBy}</Text>
                    </View>
                    <View style={{marginLeft:15}}>
                        {item.title!== "" ? (<Text style={styles.postTitle}>{item.title.length > 40 ? item.title.substring(0, 40) + "..." : item.title}</Text>) : null }
                        <Text style={styles.postContent}>{item.content}</Text>
                    </View>
                    <Text style={styles.postDate}>{item.createdAt? item.createdAt.toDate().toLocaleString() : "Unknown Date" }</Text>


                    {/* show delete Button only if post is clicked AND user is allowed delete */}
                    {selectedPostId === item.id && canDelete && (
                        <TouchableOpacity onPress={() => handleDeletePost(item.id)} >
                            <Ionicons name="trash-outline" size={24} color="red" />
                        </TouchableOpacity>
                    )}


                    {/* Comment icon - open Post Screen */}
                    {/* <TouchableOpacity
                        style={styles.postComment}
                        onPress={()=>navigation.navigate("PostDetails", {post:item})}
                    >
                        <MaterialCommunityIcons name="comment-outline" size={24} color="gray" />
                    </TouchableOpacity> */}
                </View>
            </TouchableOpacity>
        );
    }



    return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>

                    {/* Header Section */}
                    <View style={styles.header}>
                        <Text style={styles.welcomeText}>
                            Welcome to Platu Pro{`, ${name}` || ""}
                        </Text>
                        <TouchableOpacity onPress={()=>navigation.navigate("Account")}>
                            <Ionicons name="person-circle-outline" size={30} color="#3E3C3B"/>
                        </TouchableOpacity>
                    </View>

                    {/* Posting Box */}
                    <View style={styles.postingBox}>
                        <View style={styles.userProfile}>
                            <FontAwesome5 name="user-circle" size={24} color="#343332" />
                            <Text style={styles.userProfileName}>{name || "User"}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={()=>{
                                setModalVisible(true)
                            }}
                        >
                            <Text style={styles.postText}>What's new?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Modal for creating a post */}
                    <Modal
                        animationType='slide'
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={()=>setModalVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View style={styles.modalContainer}>
                                <KeyboardAvoidingView
                                     behavior={Platform.OS === "ios" ? "padding" : "height"} 
                                     style={styles.modalAvoidingView}
                                >
                                    <View style={styles.modalContent}>
                                        {/* Header */}
                                        <View style={styles.modalHeader}>
                                            <TouchableOpacity onPress={()=>setModalVisible(false)}>
                                                <Text style={styles.cancelText}>Cancel</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.modalTitle}>New Post</Text>
                                        </View>
                                        {/* User Avatar + Input field */}
                                        <View style={styles.modalBody}>
                                            <FontAwesome5 name="user-circle" size={24} color="#343332" />
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder="What's new?"
                                                value={newPostText}
                                                onChangeText={setNewPostText}
                                                multiline
                                            />
                                        </View>
                                        {/* Footer */}
                                        <View style={styles.modalFooter}>
                                            <Text style={styles.replyText}>Comments Disabled</Text>
                                            <TouchableOpacity
                                                style={[styles.postButton, !newPostText && styles.disabledButton]}
                                                onPress={handleCreatePost}
                                                disabled={!newPostText}
                                            >
                                                <Text style={styles.postButtonText}>Post</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </KeyboardAvoidingView>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                    {/* Displaying posts */}
                    {console.log("posts array: ", posts)}
                    { posts.length===0 ? (
                        <Text>Nothing posted so far...Add your first post to share some updates!</Text>
                    ) : (
                        <FlatList
                            data={posts}
                            keyExtractor={(item) => item.id}
                            renderItem={renderPostCard}
                            keyboardShouldPersistTaps="handled" // Allows taps while dismissing keyboard
                            contentContainerStyle={{ flexGrow: 1 }} // Makes FlatList take full space
                        />
                    )}
                </View>
            </SafeAreaView>
        
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFDF7'},
    container:{ flex:1, backgroundColor:"#FCFBFB"},
    header:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding:12,
        borderBottomColor: "#908F8D",
        borderBottomWidth: 1,
        shadowColor: "#000", // Subtle shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android shadow
    },
    welcomeText:{ fontSize:20, fontWeight:"600", color:"#343332" },
    userProfile:{ flexDirection:"row", alignItems:"center", gap:8 },
    userProfileName:{ fontSize:18, fontWeight:"500", color:"#343332" },
    postingBox:{
        padding:20,
        flexDirection:"column",
        gap:10,
        borderBottomColor: "#908F8D",
        borderBottomWidth: 1,
        shadowColor: "#000", // Subtle shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android shadow
    },
    postText:{ marginLeft:30, color:"gray", fontSize:17 },
    postCard:{
        backgroundColor:"#F0EFEF",
        padding:20,
        margin:20,
        flexDirection:"column",
        gap:15,
        borderRadius:20,
    },
    postTitle:{
        fontWeight:"500",
        fontSize:18,
    },
    postCreator:{
        flexDirection:"row",
        alignItems:"center",
        gap:8,
    },
    postContent:{
        fontSize:16,
    },
    postDate:{
        paddingVertical:10,
    },
    postComment:{
        marginLeft:10,
    },
    /* Modal Styling */
    modalContainer: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "rgba(0,0,0,0.5)" 
    },
    modalAvoidingView: { 
        flex: 1, 
        justifyContent: "center", // Centers the modal when keyboard is closed
        alignItems:"center",
        width: "100%" 
    },
    modalContent: { 
        backgroundColor: "white", 
        width: "90%", 
        borderRadius: 10, 
        padding: 20 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    cancelText: { color: "red", fontSize: 16 },
    modalTitle: { fontSize: 18, fontWeight: "600" },
    modalBody: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical:10, },
    textInput: { flex: 1, fontSize: 16, paddingVertical: 10 },
    modalFooter: { flexDirection: "row", justifyContent: "space-between", alignItems:"center", marginTop: 10 },
    replyText: { color: "gray" },
    postButton: { backgroundColor: "orange", padding: 10, borderRadius: 10},
    disabledButton: { backgroundColor: "lightgray" },
    postButtonText: { color: "white", fontWeight: "bold" },
    
});


export default AssistantHomeScreen;