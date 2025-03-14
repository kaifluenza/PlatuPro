import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@react-navigation/elements';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = () => {
    const { logout } = useAuth();
    const navigation = useNavigation();

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Manager's Dashboard</Text>
        <Button 
        onPress={()=>navigation.navigate('Inventory')}>
            Manage Inventory
        </Button>
        <Button 
        onPress={()=>navigation.navigate('Requests')}>
            View Supply Request
        </Button>
        <Button 
            onPress={()=>navigation.navigate('Employee')}>
            Manage Employee
        </Button>
        <Button 
        onPress={()=>navigation.navigate('Announcemence')}>
            Announcemence
        </Button>
        
        <TouchableOpacity onPress={logout}>
            <Text>Sign Out</Text>
        </TouchableOpacity>
        
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


export default HomeScreen;