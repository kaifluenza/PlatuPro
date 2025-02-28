import React from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@react-navigation/elements';

const EmployeeDashboardScreen = () => {
    const navigation = useNavigation();

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Platu Pro</Text>
        <Text style={styles.title}>Server Dashboard</Text>

        <Button 
        onPress={()=>navigation.navigate('Restocking')}>
            Restocking Request
        </Button>
       
       <Button
        onPress={()=>navigation.navigate('Announcements')}>
            Announcements
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
        marginTop:16,
        paddingVertical:8,
        color:'#FFF4E2',
        textAlign:'center',
        fontSize:32,
        fontWeight:'bold',
    },
});


export default EmployeeDashboardScreen;