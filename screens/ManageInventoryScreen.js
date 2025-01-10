import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, Button, Modal,TextInput, Pressable} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Swipable } from 'react-native-gesture-handler';
import inventoryData from '../data/inventoryData';

const ManageInventoryScreen = () => {

    const [data, setData] = useState(inventoryData);
    const [modalVisible, setModalVisible] = useState(false);
    const [newItem, setNewItem] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [newCategory, setNewCategory] = useState("");
    
    //for managing dropdown picker of categories
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState(
        [  
            ...data.map((category)=>({label:category.title, value:category.title,})), 
            {label:"New Category", value:"New Category" }
        ]
    );

    const handleAddItem = () => {
        //check if user has entered an item name
        if(newItem.trim()===""){
            alert("You must provide the item name!");
            return;
        }
        console.log("new item entered: ", newItem);

        //user added item, but does not select category
        if(selectedCategory===""){
            alert("You must assign a category to the item!")
            return;
        }
        //if here, user has selected category (could be existing one or new)
        
        //user select create new category but dont name it
        if(selectedCategory==="New Category"){
            if(newCategory.trim()===""){
                alert("You forgot to name the new category!");
                return;
            }else{ //user selected new category and provided new category name
                //add new category and item
                setData([...data, {title:newCategory, data:[newItem]}]);
                //update categories in the dropdown picker
                setCategories([...categories.slice(0,categories.length-1), {label:newCategory, value:newCategory}, ...categories.slice(categories.length-1)]);
            }
        }else{ //user has selected existing category: loop data array to find matching category index
            const categoryIndex = data.findIndex(
                (category => category.title === selectedCategory)
            );

            if(categoryIndex !== -1){ //index of matching category found
                const updatedData = [ //create new data array
                    ...data.slice(0,categoryIndex), 
                    {...data[categoryIndex],data:[...data[categoryIndex].data, newItem]},
                    ...data.slice(categoryIndex+1),
                ];

                setData(updatedData);
            }
            console.log("new updated array", data);
        }
          
        //reset modal fields
        setSelectedCategory("");
        setNewCategory("");
        setNewItem("");
        setModalVisible(false);
    }


    const handleDeleteItem = () => {

    }
    
    return (
    <View style={styles.container}>
        <Text style={styles.title}>Manage Inventory</Text>
        
        <Button 
            title="Add New"
            onPress={()=> setModalVisible(true)}
        />
        <Modal 
            animationType='fade'
            transparent={true}
            visible={modalVisible}
            onRequestClose={()=> setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalText}>Add new item</Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder='item name'
                        value={newItem}
                        onChangeText={(text)=>setNewItem(text)}
                    />

                    <DropDownPicker
                        open={open}
                        value={selectedCategory}
                        items={categories} 
                        setOpen={setOpen}
                        setValue={setSelectedCategory}
                        setItems={setCategories}
                        placeholder="Select a category"
                        
                    />  

                    {selectedCategory==="New Category" && 
                        <TextInput
                        style={styles.input}
                        placeholder='New Category Name'
                        onChangeText={(text)=>setNewCategory(text)}
                        value={newCategory}
                        />
                    }
                    

                    <Button
                        title="Close"
                        onPress={()=>{
                            setModalVisible(false);
                            setSelectedCategory("");
                            setNewItem("");
                        }} 
                    />

                    <Button
                        title="Add"
                        onPress={()=> handleAddItem()}
                    />
                </View>
            </View>  
        </Modal>

        <SectionList //on click displays delete and update button on an item
            sections={data}
            keyExtractor={(item,index)=>item+index}
            renderItem={({item})=>(
                <Swipable
                    renderRightActions={()=>( //defines what will be displayed when user swipe right-to-left
                       //a red box with a delete button inside
                        <View style={styles.rightAction}>
                            <Pressable onPress={()=>handleDeleteItem(item)}>
                                <Text>Delete</Text>
                            </Pressable>
                        </View>
                    )}
                >

                    <View style={styles.item}>
                        <Text>{item}</Text>
                    </View>

                </Swipable>

            )} 

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
    modalContainer:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgba(0, 0, 0, 0.4)', // Semi-transparent background
    },
    modalContent:{
        width:'75%',
        backgroundColor:'#FCD0E9',
        padding:20,
        borderRadius:10,
        alignItems:'center',
    },
    modalText:{
        marginBottom:20,
        fontSize:18,
    },
    input:{
        width:'100%',
        backgroundColor:"white",
        padding:6,
        borderRadius:4,
        marginVertical:10,
    },
    picker:{
        width:'100%',
        backgroundColor:"white",
        padding:6,
        borderRadius:4,
        marginVertical:10,
    },
    rightAction:{
        backgroundColor:"red",
    },
    
});


export default ManageInventoryScreen;