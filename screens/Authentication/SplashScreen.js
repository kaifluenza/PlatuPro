import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import { View, Image, StyleSheet, Text, ActivityIndicator} from "react-native";

const SplashScreen = ({onFinish, message}) => {
    useEffect(()=>{
        setTimeout(()=>{
            if(onFinish){
                onFinish(); 
            }
        },2000);
    },[]);

    return (
        <View style={styles.container}>
            <Image
                source={require("../../assets/fish_logo.png")}
                style={styles.logo}
                resizeMode="contain"
            />

            {/*Show loadind message and spinner if message is provided*/}
            { message && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3E3C3B" />
                    <Text style={styles.message}>{message}</Text>
                </View>
            )}
        </View>
    );
};


const { width, height } = Dimensions.get("window");

const logoSize = Math.min(width * 0.5, 480);

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#FFD0A3",
        alignItems:"center",
        justifyContent:"center",
    },
    logo:{
        width:logoSize,
        height:logoSize,
    },
    loadingContainer:{
        flexDirection:"row",
        alignItems:"center",
        position:"absolute",
        bottom:50, //keep near the bottom
    },
    message:{
        fontSize:16,
        color: "#3E3C3B",
        marginLeft: 10, // Space between spinner and text
    },
});


export default SplashScreen;
