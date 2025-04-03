import React from "react";
import {Text, StyleSheet} from "react-native";

export default function AppText({children, style, bold = false, ...props}){
    return (
        <Text style={[StyleSheet.text, bold && styles.bold, style]} {...props}>
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    text:{
        fontFamily:"Poppins-Regular",
        fontSize:16,
        color:'#333',
    },
    bold:{
        fontFamily:"Poppins-Bold",
    },
});