import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Modal, FlatList, Alert, Image, 
    KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { subscribeToPosts } from '../../data/postsData';
import { useState, useEffect } from 'react';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AppText from '../../components/AppText';


import { getFirestore, collection, getDoc, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';


const HomeScreen = () => {
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
        const trimmedPostText = newPostText.trim();
        if (trimmedPostText.trim() === "") return; //dont allow empty posts

        console.log('Creating post:', trimmedPostText);

        //get ref to posts collection
        const db = getFirestore();
        const collectionRef = collection(db, `restaurants/${restaurantId}/posts`);

        //save to firestore
        try{
            await addDoc(collectionRef, {
                title:"", //for now we dont use title
                content:trimmedPostText,
                createdBy: name || "Unknown",
                createdAt: serverTimestamp(),
                userId: user.uid,
                restaurantId:restaurantId
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
        
        const db = getFirestore();
        const postRef = doc(db, `restaurants/${restaurantId}/posts`, postId);

        try {
            // Fetch post data before deleting
            const postSnap = await getDoc(postRef);
            if (!postSnap.exists()) {
                console.error("❌ Post not found!");
                return;
            }

            const postData = postSnap.data();
            console.log("Post Data:", postData);
            console.log("Current User:", user.uid);
            console.log("Post Owner:", postData.userId);
            console.log("User Role:", role);
            console.log("User Restaurant ID:", restaurantId);
            console.log("Post Restaurant ID:", postData.restaurantId);

            //attempt deletion
            await deleteDoc(postRef);
            console.log("Post deleted successfully!");
        } catch (error) {
            console.error("Error deleting post: ", error);
        }
    }

    //before delete, confirm
    const confirmDelete = (postId) => {    
            Alert.alert(
            "Confirm Deletion", 
            "Are you sure you want to delete this post?",
            [
                {
                    text: "Cancel", 
                    style: "cancel",
                    onPress: () => {
                        console.log("user cancel deletion");
                        return;
                    },
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        console.log("user confirmed deletion");
                        handleDeletePost(postId);
                    },
                },
            ])
        }

    //function to render a post
    const renderPostCard = ({item}) => {
        const canDelete = role === "assistant_manager" && item.userId === user.uid;

        return (
            <TouchableOpacity onPress={() => setSelectedPostId(selectedPostId === item.id ? null : item.id)}>
                <View style={styles.postCard}>
                    <View style={styles.postCreator}>
                        <Image source={require('../../assets/fish_logo.png')} style={styles.avatar} />
                        <AppText style={styles.userProfileName}>{item.createdBy}</AppText>
                    </View>
                    <View style={{marginLeft:15}}>
                        {item.title!== "" ? (<AppText style={styles.postTitle}>{item.title.length > 40 ? item.title.substring(0, 40) + "..." : item.title}</AppText>) : null }
                        <AppText style={styles.postContent}>{item.content}</AppText>
                    </View>

                    <View style={{flexDirection:"row", justifyContent:'space-between'}}>
                        <AppText style={styles.postDate}>{item.createdAt? item.createdAt.toDate().toLocaleString() : "Unknown Date" }</AppText>

                        {/* show delete Button only if post is clicked AND user is allowed delete */}
                        {selectedPostId === item.id && (role==="manager" || canDelete) && (
                            <TouchableOpacity 
                                onPress={() => confirmDelete(item.id)}
                                style={styles.deleteButtonContainer}
                            >
                                <Ionicons name="trash-outline" size={24} color="red" />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                </View>
            </TouchableOpacity>
        );
    }



    return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>

                    {/* Header Section */}
                    <View style={styles.header}>
                        <AppText style={styles.welcomeText}>
                            Hello{`, ${name}` || ""}
                        </AppText>
                        <TouchableOpacity onPress={()=>navigation.navigate("Account")}>
                            <Ionicons name="person-circle-outline" size={30} color="#FAA462"/>
                        </TouchableOpacity>
                    </View>

                    {/* Posting Box */}
                    <View style={styles.postingBox}>
                        <View style={styles.userProfile}>
                            <Image source={require('../../assets/fish_logo.png')} style={styles.avatar} />
                            <AppText style={styles.userProfileName}>{name || "User"}</AppText>
                        </View>
                        <TouchableOpacity
                            onPress={()=>{
                                setModalVisible(true)
                            }}
                        >
                            <AppText style={styles.postText}>What's new?</AppText>
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
                                                <AppText style={styles.cancelText}>Cancel</AppText>
                                            </TouchableOpacity>
                                            <AppText style={styles.modalTitle}>New Post</AppText>
                                        </View>
                                        {/* User Avatar + Input field */}
                                        <View style={styles.modalBody}>
                                            <FontAwesome5 name="user-circle" size={24} color="#FAA462" />
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
                                            <AppText style={styles.replyText}>Comments Disabled</AppText>
                                            <TouchableOpacity
                                                style={[styles.postButton, !newPostText && styles.disabledButton]}
                                                onPress={handleCreatePost}
                                                disabled={!newPostText}
                                            >
                                                <AppText style={styles.postButtonText}>Post</AppText>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </KeyboardAvoidingView>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    {/* Displaying posts */}
                    { posts.length===0 ? (
                        <View style={styles.noPost}>
                            <AppText style={styles.noPostText}>Nothing posted so far...</AppText>
                            <AppText style={styles.noPostText}>Add your first post to share updates!</AppText>
                        </View>
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
    safeArea: { flex: 1, backgroundColor: '#f5f6f7'},
    container:{ flex:1, backgroundColor:"#f5f6f7"},
    header:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding:14,
        shadowColor: "#000", // Subtle shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android shadow
    },
    welcomeText:{ fontFamily:"Poppins-Bold",fontSize:24, color:"#343332" },
    avatar: {
        width: 30,         // match size you want
        height: 30,
        borderRadius: 15,  // make it a perfect circle (half of width/height)
        resizeMode: 'cover',
    },    
    userProfile:{ flexDirection:"row", alignItems:"center", gap:8 },
    userProfileName:{ fontFamily:"Poppins-Bold",fontSize:18, color:"#343332" },
    postingBox:{
        padding:20,
        marginBottom:20,
        flexDirection:"column",
        gap:10,
        borderColor: "#C2C2C2",
        borderWidth: 1,
        shadowColor: "#000", // Subtle shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android shadow
    },
    noPost:{
        marginVertical:100,
        marginHorizontal:10,
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"center",
        gap:10,
    },
    noPostText:{
        color:"gray",
        fontFamily:"Poppins-Regular",
        fontSize:"18",
    },
    postText:{ marginLeft:30, color:"gray", fontFamily:"Poppins-Regular", fontSize:17 },
    postCard:{
        backgroundColor:"#ffffff",
        paddingHorizontal:20,
        paddingVertical:13,
        marginHorizontal:20,
        marginBottom:20,
        flexDirection:"column",
        gap:15,
        borderRadius:20,
    },
    postTitle:{
        fontFamily:"Poppins-Regular",
        fontWeight:"500",
        fontSize:16,
        marginBottom:15,
    },
    postCreator:{
        flexDirection:"row",
        alignItems:"center",
        gap:8,
    },
    postContent:{
        fontFamily:"Poppins-Regular",
        fontSize:16,
    },
    postDate:{
        fontFamily:"Poppins-Regular",
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
    cancelText: { color: "red", fontFamily:"Poppins-Regular", fontSize: 16 },
    modalTitle: { fontSize: 18, fontFamily:"Poppins-Bold", },
    modalBody: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical:10, },
    textInput: { flex: 1,fontFamily:"Poppins-Regular", fontSize: 16, paddingVertical: 10 },
    modalFooter: { flexDirection: "row", justifyContent: "space-between", alignItems:"center", marginTop: 10 },
    replyText: { fontFamily:"Poppins-Regular", color: "gray" },
    postButton: { backgroundColor: "orange", padding: 10, borderRadius: 10},
    disabledButton: { backgroundColor: "lightgray" },
    postButtonText: { color: "white", fontFamily:"Poppins-Bold", },
    deleteButtonContainer:{
        padding:5,
    }
});


export default HomeScreen;