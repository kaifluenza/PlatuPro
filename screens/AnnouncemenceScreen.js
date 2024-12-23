import React from 'react';
import { View, Text, StyleSheet, Button} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AnnouncemenceScreen = () => {
    const navigation = useNavigation();

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Announcemence</Text>
        <Text>Announcment made by manager will be shown here...</Text>
        
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