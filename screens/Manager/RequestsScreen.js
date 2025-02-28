import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RequestScreen = () => {

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Supply Requests</Text>
        <Text>Manager can view supply requests made by servers..</Text>
        
    </View>
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:24,
        backgroundColor:'#8BBFFB',
        gap:12,
    },
    title:{
        marginTop:16,
        paddingVertical:8,
        color:'#FFF4E2',
        textAlign:'center',
        fontSize:32,
        fontWeight:'bold',
    },
});


export default RequestScreen;