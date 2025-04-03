import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, SafeAreaView,  FlatList, Alert, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { subscribeToPosts } from '../../data/postsData';
import { useState, useEffect } from 'react';

import AppText from '../../components/AppText';



const HomeScreen = () => {
    const navigation = useNavigation();

    const { name, restaurantId } = useAuth();
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [posts, setPosts] = useState([]);


    //fetch posts data
    useEffect(()=>{
        if(restaurantId){
            const unsubscribe = subscribeToPosts(restaurantId, setPosts);
            return () => unsubscribe(); //cleanup listener 
        }
    }, [restaurantId]);


    //function to render a post
    const renderPostCard = ({item}) => {

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


                    {/* Displaying posts */}
                    { posts.length===0 ? (
                        <View style={styles.noPost}>
                            <AppText style={styles.noPostText}>Nothing posted so far...</AppText>
                            <AppText style={styles.noPostText}>You're up to date!</AppText>
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
        padding:18,
        marginBottom: 20,
        borderBottomColor: "#C2C2C2",
        borderBottomWidth: 1,
        shadowColor: "#000", // Subtle shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android shadow
    },
    welcomeText:{ fontFamily:"Poppins-Bold",fontSize:25, color:"#343332" },
    avatar: {
        width: 30,         // match size you want
        height: 30,
        borderRadius: 15,  // make it a perfect circle (half of width/height)
        resizeMode: 'cover',
    },    
    userProfile:{ flexDirection:"row", alignItems:"center", gap:8 },
    userProfileName:{ fontFamily:"Poppins-Bold",fontSize:18, color:"#343332" },
    
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
    
});


export default HomeScreen;