import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SectionList, Button, Modal,TextInput, Alert} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { subscribeToServerInventory } from '../../data/inventoryData';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove, deleteField } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const ManageInventoryScreen = () => {
    const { restaurantId } = useAuth();

    //inventory data
    const [data, setData] = useState(new Map());
    useEffect(() => {
        if(restaurantId){
            const unsubscribe = subscribeToServerInventory(restaurantId, setData);
            return () => unsubscribe(); //clean up when unmounts
        }
    },[restaurantId]); //run only on mount

    useEffect(()=> {
        setCategories([
            ...Array.from(data.keys()).map((category)=>({label:category, value:category})),
            {label:"New Category", value:"New Category"},
        ]);
    }, [data]); //runs whenever 'data'changes

    const [modalVisible, setModalVisible] = useState(false);
    const [newItem, setNewItem] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [localCheck, setLocalCheck] = useState(false);
    const [deleteBtn, setDeleteBtn] = useState(false);
    let items_to_delete = []; 
    let categories_to_delete = [];

    //for managing dropdown picker of categories
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState(
        [  
            ...Array.from(data.keys()).map((category)=>({label:category, value:category})),
            {label:"New Category", value:"New Category"},
        ]
    );

    const handleAddItem = async () => {
        //get reference to the server_inventory document 
        const db = getFirestore();
        const docRef = doc(db, "restaurants", restaurantId, "inventory", "server_inventory");
        //create a copy of current inventory data
        let updatedData = new Map(data);

        //checks
        //if user forgot item name
        if(newItem.trim()===""){
            alert("You must provide the item name!");
            return;
        }
        //if user forgot to provide category name
        if(selectedCategory===""){
            alert("You must assign a category to the item!")
            return;
        }

        let categoryToUse = selectedCategory;

        //if user selectd new category but forgot to give name
        if(selectedCategory==="New Category"){
            if(newCategory.trim()===""){ //forgot to name the new category
                alert("You forgot to name the new category!");
                return;
            }
            //when user provided name for the new category
            categoryToUse = newCategory;
        }

        //check if item already exists in the category
        if(updatedData.has(categoryToUse) && updatedData.get(categoryToUse).has(newItem)){
            Alert.alert(`${newItem} already exists in ${categoryToUse}!`);
            return;
        }
        //otherwise we go ahead and add the new item to the category
        //if new item is for new category
        if(!updatedData.has(categoryToUse)){
            updatedData.set(categoryToUse, new Set()); //create an empty Set first
        }
        //then go ahead and add the item
        updatedData.get(categoryToUse).add(newItem);

        //update local state!
        setData(new Map(updatedData));

        
        //write to Firestore!
        const updatedFireStoreData = {};
        updatedData.forEach((items, category)=>{
            updatedFireStoreData[category] = Array.from(items); //convert Set to Array
        });
        console.log("data being sent to firestore:", updatedFireStoreData);
        try{
            await updateDoc(docRef, updatedFireStoreData);
            console.log("Firestore updated. Item(s) added.");
        }catch(error){
            console.log("Error updating firestore", error.message);
        }
            
          
        //reset modal fields
        setSelectedCategory("");
        setNewCategory("");
        setNewItem("");
        setModalVisible(false);
    }

    const handleDelete = async (items_to_delete, categories_to_delete) => {
        //create a copy of current inventory data
        let updatedData = new Map(data);

        //get reference to the server_inventory document 
        const db = getFirestore();
        const docRef = doc(db, "restaurants", restaurantId, "inventory", "server_inventory");
        
        //check before accessing firestore
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            console.error("❌ Error: server_inventory document does not exist. Create it first.");
            return;
        }
        console.log("Current firstore document:", docSnap.data());


        //delete selected items 
        items_to_delete.forEach(async ({category, item}) => {
            if(updatedData.has(category)){
                updatedData.get(category).delete(item);
                console.log(`UI: Deleted ${item} from ${category}`);
                //update firestore
                try{
                    await updateDoc(docRef, {
                        [`${category}`]:arrayRemove(item)
                    });
                }catch(error){
                    console.log(`Error deleteing ${item} in firestore: `, error.message);
                }
            }
        });

        //delete selected categories 
        categories_to_delete.forEach(async (category) => {
            updatedData.delete(category); //remove category from map
            console.log(`UI: Deleted category ${category} and its items.`);
            try{
                await updateDoc(docRef, {
                    [`${category}`]:deleteField()
                });
            }catch(error){
                console.log(`Error deleting category ${category} in firestore: `, error.message);
            }
        });

        //update the data state, trigger re-render
        setData(new Map(updatedData));  

        //reset deletion lists
        items_to_delete=[];
        categories_to_delete=[];
    }

    const confirmDelete = () => {
        const categoryText = categories_to_delete.length>0? `\nCategory:\n${categories_to_delete.join(", ")}\n**Items in the category will also be deleted**` : "";
        const itemText = items_to_delete.length>0? `Item:\n ${items_to_delete.map(i=>i.item).join(", ")}` : "";

        const message = `${itemText}\n${categoryText}`.trim();

        Alert.alert(
        "Confirm Deletion", 
        message,
        [
            {
                text: "Cancel", 
                style: "cancel",
                onPress: () => {
                    console.log("user cancel deletion");
                     //reset delete list to empty
                     items_to_delete = [];
                     categories_to_delete = [];
                },
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    console.log("user confirmed deletion");
                    handleDelete(items_to_delete,categories_to_delete);
                },
            },
        ])
    }

    const handleEditItem = () => {
    }

    const handleEditCategory = () => {
    }

    
    return (
    <View style={styles.container}>
        <Text style={styles.title}>Manage Inventory</Text>
        
        <View style={styles.horizontalStack}>
            <Button 
                title="Add Item"
                color="white"
                onPress={()=> setModalVisible(true)}
            />

            <Button
                title="Delete"
                color="#FA302D"
                onPress={()=> {
                    if(!deleteBtn){
                        setDeleteBtn(true)
                    }else{  
                        if(items_to_delete.length>0 || categories_to_delete.length>0){
                            confirmDelete();
                        }      
                        setDeleteBtn(false); 
                    }
                }}
             />

             {deleteBtn && <Button
                title="Cancel"
                color="blue"
                onPress={()=> {
                    items_to_delete = [];
                    categories_to_delete = [];
                    setDeleteBtn(!deleteBtn)
                    console.log("cancel deletion.");
                }}
             />}


        </View>
        
        <Modal 
            animationType='fade'
            transparent={true}
            visible={modalVisible}
            onRequestClose={()=> setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalText}>Add New Item</Text>
                    
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

                    <View style={styles.horizontalStack}>
                        <Button
                         title="Close"
                         onPress={()=>{
                            setModalVisible(false);
                            setSelectedCategory("");
                            setNewItem("");
                         }} 
                        />

                        <Button title="Add" onPress={()=> handleAddItem()} />
                    </View>
                </View>
            </View>  
        </Modal>

        <SectionList 
            sections={
                Array.from(data.entries()).map(([category,items])=>({
                    title:category,
                    data:Array.from(items),
                }))
            }
            keyExtractor={(item,index)=>item+index}
            renderItem={({item,section})=>(
                <View style={styles.item} flexDirection='row'justifyContent='space-between'>
                    <Text style={styles.item}>{item}</Text>
                    
                    {deleteBtn && <BouncyCheckbox
                        isChecked={localCheck}
                        fillColor='red'
                        size={20}
                        onPress={(isChecked)=>{
                            if(isChecked){
                                items_to_delete.push({category:section.title, item:item});
                            }else{ //user deselect the item
                                items_to_delete = items_to_delete.filter((i) => i.item !== item || i.category !== section.title);
                            }
                            
                            console.log("items to be deleted", items_to_delete);
                        }}
                        
                    />}
                </View>
            )} 
            renderSectionHeader={({section:{title}})=>(
                <View style={styles.sectionHeader} flexDirection='row'justifyContent='space-between' >
                    <Text style={styles.sectionHeader}>{title}</Text>
                    
                    {deleteBtn && <BouncyCheckbox
                        isChecked={localCheck}
                        fillColor='red'
                        size={20}
                        onPress={(isChecked)=>{
                            if(isChecked){
                                categories_to_delete.push(title);
                            }
                            else{ //user deselect
                                console.log("user deselected ",title);
                                categories_to_delete = categories_to_delete.filter((category)=>category!==title);
                            }

                            console.log("categories to be deleted", categories_to_delete);
                        }}
                    />}
                </View>
            )}          
        />       
    </View>
    );
};

const styles = StyleSheet.create({
    horizontalStack:{
        flexDirection:'row',
        justifyContent:'space-between',
        
    },
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
        padding:5,
    },
    item:{
        fontSize: 14,
        backgroundColor: "#FF937C",
        borderRadius: 8,
        padding:5,
        marginVertical:4,
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
        paddingVertical:20,
        paddingHorizontal:20,
        borderRadius:10,
        alignItems:'center',
        gap:10,
    },
    modalText:{
        marginBottom:20,
        fontSize:18,
        fontWeight:500,
    },
    input:{
        width:'100%',
        backgroundColor:"white",
        padding:8,
        borderRadius:4,
    },
    picker:{
        width:'100%',
        backgroundColor:"white",
        padding:6,
        borderRadius:4,
        marginVertical:10,
    },
    
});


export default ManageInventoryScreen;