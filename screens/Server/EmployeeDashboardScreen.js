import React from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@react-navigation/elements';
import { getAuth, signOut } from 'firebase/auth';

const EmployeeDashboardScreen = () => {
    const navigation = useNavigation();
    const auth = getAuth();

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