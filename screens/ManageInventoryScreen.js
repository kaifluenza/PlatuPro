import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, Button} from 'react-native';
import inventoryData from '../data/inventoryData';

const ManageInventoryScreen = () => {
    //const navigation = useNavigation();

    const [data, setData] = useState(inventoryData);

    const addItem = () => {
        setData([...data,newItem]);
    }
    
    return (
    <View style={styles.container}>
        <Text style={styles.title}>Manage Inventory</Text>
        
        <Button 
            title="Add New"
            color="yellow"
            onPress={addItem}
        />

        <SectionList
            sections={data}
            keyExtractor={(item,index)=>item+index}
            renderItem={({item})=>(
                <View style={styles.item}>
                    <Text>{item}</Text>
                </View>)} 
            renderSectionHeader={({section:{title}})=>(
                <Text style={styles.sectionHeader}>{title}</Text>
            )}          
        />
            
    </View>
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:24,
        backgroundColor:'#FB8E65',
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
    sectionHeader:{
        fontSize: 18,
        fontWeight: "bold",
        backgroundColor: "#FFCB5C",
        borderRadius:8,
        color: "black",
        padding:4,
    },
    item:{
        padding: 10,
        backgroundColor: "#FF937C",
        marginVertical: 4,
        borderRadius: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});


export default ManageInventoryScreen;