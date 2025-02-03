import React, { useState } from 'react';
import { View, Text, StyleSheet, SectionList, Button, Modal,TextInput, Alert} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import inventoryData from '../data/inventoryData';



const ManageInventoryScreen = () => {

    const [data, setData] = useState(inventoryData);
    const [modalVisible, setModalVisible] = useState(false);
    const [newItem, setNewItem] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [localCheck, setLocalCheck] = useState(false);
    const [deleteBtn, setDeleteBtn] = useState(false);
    let items_to_delete = []; //stores object or object ID?
    let categories_to_delete = [];

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

    const handleDelete = () => {
        //delete items from the data
        const filteredItems = data.map(section => (
            { ...section, data:section.data.filter(item => !items_to_delete.includes(item))}
        ));

        console.log("after fitlering items: ", filteredItems);

        //then delete categories 
        const filteredCtgry = filteredItems.filter(section => !categories_to_delete.includes(section.title));

        //update categories in dropdown list too!
        setCategories([
            ...filteredCtgry.map((section)=>({label:section.title,value:section.title})),
            {label:"New Category", value:"New Category"}
        ]);

        setData(filteredCtgry);
        items_to_delete=[];
        categories_to_delete=[];
    }

    const confirmDelete = () => {
        const categoryText = categories_to_delete.length>0? `Category: ${categories_to_delete.join(", ")}` : "";
        const itemText = items_to_delete.length>0? `Item: ${items_to_delete.join(", ")}` : "";

        const message = `${categoryText}\n${itemText}`.trim();

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
                    handleDelete();
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
        <Text style={styles.title}>Inventory</Text>
        
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
                        if(categories_to_delete.length>0){
                            console.log("deleting checked categories", categories_to_delete);
                        }

                        if(items_to_delete.length>0){
                            console.log("deleting checked items:", items_to_delete);
                        }
                        
                        confirmDelete();
                        
                        setDeleteBtn(false); //to hide back the deleting checkboxes
                    }
                }}
             />

             {console.log("delete button state: ", deleteBtn)}

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

                        <Button
                         title="Add"
                         onPress={()=> handleAddItem()}
                        />
                    </View>
                    
                </View>
            </View>  
        </Modal>

        <SectionList //on click displays delete and update button on an item
            sections={data}
            keyExtractor={(item,index)=>item+index}
            renderItem={({item})=>(
                <View 
                    style={styles.item}
                    flexDirection='row'
                    justifyContent='space-between'
                >
                    <Text style={styles.item}>{item}</Text>
                    
                    {deleteBtn && <BouncyCheckbox
                        isChecked={localCheck}
                        fillColor='red'
                        size={20}
                        onPress={(isChecked)=>{
                            if(isChecked){
                                items_to_delete.push(item);
                            }else{ //user deselect the item
                                items_to_delete = items_to_delete.filter((arrayItem)=>arrayItem!==item);
                            }
                            
                            console.log("items to be deleted", items_to_delete);
                        }}
                        
                    />}

                    
                     
                </View>

            )} 

            renderSectionHeader={({section:{title}})=>(
                <View 
                    style={styles.sectionHeader}
                    flexDirection='row'
                    justifyContent='space-between'
                >
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