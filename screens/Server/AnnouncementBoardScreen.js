import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AnnouncementBoardScreen = () => {

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Announcements</Text>
        <Text>What's up today folks??</Text>
        
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


export default AnnouncementBoardScreen;