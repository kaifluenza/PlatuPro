import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";

const SplashScreen = ({onFinish}) => {
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
        </View>
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#FFD0A3",
        alignItems:"center",
        justifyContent:"center",
    },
    logo:{
        width:250,
        height:250,
    },
});


export default SplashScreen;
