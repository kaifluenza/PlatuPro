import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@react-navigation/elements';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboardScreen = () => {
    const navigation = useNavigation();
    const { logout } = useAuth();

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Server Dashboard</Text>

        <Button 
        onPress={()=>navigation.navigate('Restocking')}>
            Restocking Request
        </Button>
       
       <Button
        onPress={()=>navigation.navigate('Announcements')}>
            Announcements
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
        padding:24,
        backgroundColor:'#FDAE81',
        gap:12,
    },
    title:{
        margin:20,
        paddingVertical:8,
        color:'#FFF4E2',
        textAlign:'center',
        fontSize:32,
        fontWeight:'bold',
    },
});


export default EmployeeDashboardScreen;