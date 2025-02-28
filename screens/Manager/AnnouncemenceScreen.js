import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AnnouncemenceScreen = () => {

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Announcemence</Text>
        <Text>Manager can add or remove announcements to employees here..</Text>
        
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
        //borderWidth:4,
        //borderColor:"#F67C12",
        //borderRadius:6,
        //backgroundColor:'#F9E96B',
        color:'#FFF4E2',
        textAlign:'center',
        fontSize:32,
        fontWeight:'bold',
    },
});


export default AnnouncemenceScreen;