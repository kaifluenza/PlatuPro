import React from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RestockingScreen = () => {
    const navigation = useNavigation();

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Restocking List</Text>
        <Text>the list will be updated by employees soon!</Text>
       
        
    </View>
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:24,
        backgroundColor:'#F8604F',
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


export default RestockingScreen;