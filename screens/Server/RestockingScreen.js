import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Modal, TextInput, Touchable } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { subscribeToServerInventory } from '../../data/inventoryData'; 
import { subscribeToServerRequests } from '../../data/requestedData';
import { getFirestore, doc, updateDoc} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import AppText from '../../components/AppText';


const RestockingScreen = () => {
  const { restaurantId } = useAuth(); //get restaurantId from auth context

  //inventory data
  const [inventory, setInventory] = useState(new Map());
  useEffect(()=>{
    if(restaurantId){
      const unsubscribe = subscribeToServerInventory(restaurantId, setInventory);
      return () => unsubscribe();
    }
  },[restaurantId]);

  //supply requests data
  const [requests, setRequests] = useState(new Map());
  useEffect(()=>{
    if(restaurantId){
      const unsubscribe = subscribeToServerRequests(restaurantId, setRequests);
      return () => unsubscribe();
    }
  },[restaurantId]);

  // Convert Map to array for inventory SectionList
  const sections = Array.from(inventory, ([title, items]) => ({
    title,
    data: Array.from(items), 
  }));

  //convert map to array for requests SectionLlist
  const sectionedRequests = Array.from(requests,([title, items]) =>({
    title,
    data:Array.from(items),
  }));
  
  const [requestBtn, setRequestBtn] = useState(false);
  let request_list = [];
  const [modalVisible, setModalVisible] = useState(false);
  const [customItem, setCustomItem] = useState("");
  const [customError, setCustomError] = useState("");


  const handleSendRequest = async () => {
    //get reference to doc
    const db = getFirestore();
    const docRef = doc(db, "restaurants", restaurantId, "supply_requests", "server_requests");

    //create a copy of current request
    let currentRequests = new Map(requests);
    let repeatItems = [];
    
    //check if the items to be requested already exist in the current requests
    request_list.forEach(({category,item})=>{
      if(currentRequests.has(category) && currentRequests.get(category).has(item)){
        repeatItems.push(item);
        console.log("repeat item:", repeatItems);
        return; 
      }else{
        if(!currentRequests.has(category)){
          currentRequests.set(category, new Set());
        }
        currentRequests.get(category).add(item);
      }
    });

    if(request_list.length==repeatItems.length){ //if request items are all repeats
      console.log("No new request; no write to firestore!");
      return;
    }

    

    //update local state
    setRequests(new Map(currentRequests));

    //write to firestore
    const updatedFirestoreData = {};
    currentRequests.forEach((items,category)=>{
      updatedFirestoreData[category] = Array.from(items);
    });
    console.log("Data being sent to firestore:", updatedFirestoreData);
    try{
      await updateDoc(docRef, updatedFirestoreData);
      console.log("Request stored in firstore.");
    }catch(error){
      console.log("Error writing supply request to firestore", error.message);
    }


    //reset fields
    request_list=[]; //clear request list 
    repeatItems=[];
    setRequestBtn(false);  // Hide the buttons
    
  }


  const handleCustomRequest = async () => {
    const trimmedItem = customItem.trim();
    if(trimmedItem.length===0){
      setCustomError("Item name cannot be empty.");
      return;
    }
    
    if(trimmedItem.length>20){
      setCustomError("Item name must be 20 characters or less.");
      return;
    }

    const db = getFirestore();
    const docRef  = doc(db, "restaurants", restaurantId, "supply_requests", "server_requests");

    let currentRequests = new Map(requests);

    //check if custom category exists
    if(!currentRequests.has("Custom")){
      currentRequests.set("Custom", new Set());
    }

    //check if item already been requested/exists
    if(currentRequests.get("Custom").has(trimmedItem)){
      setCustomError("This item has already been requested.");
      return;
    }

    //adding the item
    currentRequests.get("Custom").add(trimmedItem);

    //convert map to firestore-compatible object
    const updatedFirestoreData = {};
    currentRequests.forEach((items, category) => {
        updatedFirestoreData[category] = Array.from(items);
    });

    try {
        // Write to Firestore
        await updateDoc(docRef, updatedFirestoreData);
        console.log("Custom request stored in Firestore:", updatedFirestoreData);

        // Update local state to reflect changes in the UI
        setRequests(new Map(currentRequests));

        // Reset modal fields
        setModalVisible(false);
        setCustomItem("");
        setCustomError("");
    } catch (error) {
        console.log("❌ Error writing custom request to Firestore:", error.message);
    }

   
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections} 
        keyExtractor={(item,index)=> item+index}
        ListHeaderComponent={ //request list
          <>
            <Text style={styles.title}>Restocking List</Text>

            <View style={styles.requestsContainer}>
              <SectionList
                sections={sectionedRequests}
                keyExtractor={(item, index)=>item+index}
                renderItem={({item})=>
                  <View style={styles.requestSection}>
                    <Text style={styles.itemText}>{item}</Text>
                  </View>}
                renderSectionHeader={({section:{title}})=>(
                  <View style={styles.requestSectionTitle}>
                    <Text style={styles.requestSectionHeaderText}>{title}</Text>
                  </View>
                )}
                scrollEnabled={false} //prevents nested scrolling
              />
            </View>
          

            <Text style={styles.title}>Inventory</Text>

            <View style={styles.horizontalStack}>
                <TouchableOpacity onPress={()=>setRequestBtn(true)} style={styles.button}>
                  <Text style={styles.buttonText}>Request</Text>
                </TouchableOpacity>

                {!requestBtn ? (<TouchableOpacity onPress={()=>setModalVisible(true)} style={styles.button}>
                  <Text style={styles.buttonText}>Custom</Text>
                </TouchableOpacity>) : null}


                {requestBtn && (
                  <>
                    <TouchableOpacity 
                      style={styles.button}
                      onPress={()=>{
                        handleSendRequest();
                        request_list = [];
                        setRequestBtn(false);
                      }}
                    >
                      <Text style={styles.buttonText}>Send</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>{
                      request_list=[];
                      setRequestBtn(false);
                    }} style={styles.cancelButton}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
            </View>
          </>
        } //inventory list
        renderItem={({ item, section }) => (
          <View style={styles.itemContainer} flexDirection="row" justifyContent="space-between">
            <Text style={styles.itemText}>{item}</Text>

            {requestBtn && (
              <BouncyCheckbox
                size={20}
                fillColor="green"
                onPress={(isChecked) => {
                  if (isChecked) {
                    request_list.push({ category: section.title, item: item });
                  } else {
                    request_list = request_list.filter(
                      (array_item) => array_item.item !== item || array_item.category !== section.title
                    );
                  }
                }}
              />
            )}
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>{title}</Text>
          </View>
        )}
      />


      <Modal
                      animationType='fade'
                      transparent={true}
                      visible={modalVisible}
                      onRequestClose={()=> setModalVisible(false)}
                  >
                      <View style={styles.modalContainer}>
                          <View style={styles.modalContent}>
                              <Text style={styles.modalText}>Add Custom Item</Text>
              
                              <TextInput
                                  style={styles.input}
                                  placeholder='Item name'
                                  value={customItem}
                                  onChangeText={(text)=>{
                                    setCustomItem(text);
                                    setCustomError(""); //clear error when user starts typing again
                                  }}
                              />
                      
                              {customError ? <Text style={styles.errorText}>{customError}</Text> : null}
        

                              <View style={[styles.buttonContainer]}>
                                <TouchableOpacity 
                                  style={styles.modalButton}
                                  onPress={()=>{
                                    setModalVisible(false);
                                    setCustomItem(""); // Clear field when closing
                                    setCustomError(""); // Clear any error
                                  }}
                                >
                                  <AppText style={styles.modalButtonText}>Close</AppText>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                  style={styles.modalButton}
                                  onPress={()=>handleCustomRequest()}
                                >
                                  <AppText style={styles.modalButtonText}>Submit</AppText>
                                </TouchableOpacity>
                                
                              </View>
                          </View>
                      </View>
                  </Modal>

    </View>

    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontFamily:"Poppins-Bold",
    fontSize:28,
    fontWeight:"500",
    color:"#333333",
    marginVertical:15,
  },
  requestsContainer:{
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal:15,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom:10,
  },
  requestSection:{
    marginLeft:20,
    marginVertical:3,
  },
  requestSectionTitle:{
    borderBottomColor:"#B1B5B9",
    borderBottomWidth:1,
    marginVertical:7,
  },
  requestSectionHeaderText:{
    fontFamily:"Poppins-Bold",
    fontSize:18,
    color: '#4D4D4B',
  },
  sectionHeaderContainer: {
    borderRadius: 8,
    marginVertical: 10,
  },
  sectionHeader: {
    fontFamily:"Poppins-Bold",
    fontSize: 20,
    color: '#4D4D4B',
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical:15,
    borderRadius: 10,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemText: {
    fontFamily:"Poppins-Regular",
    fontSize: 16,
    color: '#333333',
  },
  horizontalStack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#FA8072',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    fontFamily:"Poppins-Bold",
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelButton:{
    backgroundColor: '#FC9C51',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonContainer:{
    flexDirection:"row",
    gap:30,
  },
  modalContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'rgba(0, 0, 0, 0.6)', // Semi-transparent background
  },
  modalContent:{
      width:'75%',
      backgroundColor:'#F2B8A1',
      paddingVertical:20,
      paddingHorizontal:20,
      borderRadius:10,
      alignItems:'center',
      gap:10,
  },
  modalText:{
      marginBottom:15,
      fontFamily:"Poppins-Bold",
      fontSize:18,
  },
  input:{
      width:'100%',
      padding:8,
      width: "100%",
      height: 47, // Increase height for better visibility
      borderRadius: 10, // Smooth rounded corners
      borderWidth: 1, // Default border
      paddingHorizontal: 10, // Space inside the input
      fontSize: 15, // Slightly bigger text for readability
      fontFamily:"Poppins-Regular",
      color:"black",
      backgroundColor:"white",
  },
  modalButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    color:"gray",
  },
  modalButtonText: {
    fontFamily:"Poppins-Bold",
    fontSize: 16,
    color: '#333333',
  },
  errorText: {
    color: "red",
    fontSize: 14,
    fontFamily:"Poppins-Regular",
    textAlign: "center",
    marginTop: 5,
  },

});

export default RestockingScreen;
