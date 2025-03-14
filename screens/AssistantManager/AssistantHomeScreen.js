import React from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@react-navigation/elements';
import { getAuth, signOut } from 'firebase/auth';

const AssistantHomeScreen = () => {
    const navigation = useNavigation();
    const auth = getAuth();

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Assistant Manager's Dashboard</Text>
        <Button 
        onPress={()=>navigation.navigate('Inventory')}>
            Manage Inventory
        </Button>
        <Button 
        onPress={()=>navigation.navigate('Requests')}>
            View Supply Request
        </Button>
        
        <Button 
        onPress={()=>navigation.navigate('Announcemence')}>
            Announcemence
        </Button>
        
        <Button
            onPress={()=>{
                signOut(auth).then(()=>{
                    console.log("user signed out");
                }).catch((error)=>{
                    console.log("error", error);
                });
            }}>
            Sign Out
        </Button>
        
    </View>
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:30,
        backgroundColor:'#FDAE81',
        gap:15,
    },
    title:{
        margin:16,
        color:'#FFF4E2',
        textAlign:'center',
        fontSize:30,
        fontWeight:'bold',
    },
});


export default AssistantHomeScreen;