import React from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@react-navigation/elements';

const HomeScreen = () => {
    const navigation = useNavigation();

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Platu Pro</Text>
        <Button 
        onPress={()=>navigation.navigate('Inventory')}>
            Manage Inventory
        </Button>
        <Button 
        onPress={()=>navigation.navigate('Restocking')}>
            Restocking List
        </Button>
        <Button 
        onPress={()=>navigation.navigate('Announcemence')}>
            Announcemence
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


export default HomeScreen;