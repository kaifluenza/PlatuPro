import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SectionList, Button, Alert } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { subscribeToServerInventory } from '../../data/inventoryData'; 
import { subscribeToServerRequests } from '../../data/requestedData';
import { getFirestore, doc, updateDoc} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restocking List</Text>

      <View style={styles.requestBoard}>
        <SectionList
          sections={sectionedRequests}
          renderItem={({item})=><Text style={styles.requestBoardItem}>{item}</Text>}
          renderSectionHeader={({section:{title}})=>(
            <View>
              <Text>{title}</Text>
            </View>
          )}
        />
      </View>

      <Text style={styles.title}>Inventory</Text>

      <View style={styles.horizontalStack}>
        
        <Button
          title="Request"
          color="white"
          onPress={() => {
            console.log("user is making request(s)");
            setRequestBtn(true);
          }}
        />

        {requestBtn && (
          <>
            <Button
              title="Send"
              color="blue"
              onPress={() => {
                handleSendRequest(); 
                request_list=[];  //clear request list after requested
                setRequestBtn(false);  // Hide the buttons
              }}
            />

            <Button
              title="Cancel"
              color="blue"
              onPress={() => {
                request_list=[]; //clear request list 
                setRequestBtn(false);  // Hide the buttons
              }}
            />
          </>
        )}
      </View>

      <SectionList
        sections={sections}  // Use the transformed data
        keyExtractor={(item, index) => item + index}
        renderItem={({ item, section }) => (
          <View style={styles.item} flexDirection="row" justifyContent="space-between">
            <Text style={styles.item}>{item}</Text>

            {requestBtn && (
              <BouncyCheckbox
                size={20}
                fillColor="green"
                onPress={(isChecked) => {
                  if (isChecked) {
                    request_list.push({category:section.title, item:item});
                  } else { //user deselect 
                    request_list = request_list.filter(
                      (array_item)=> array_item.item!==item || array_item.category !== section.title
                    );
                  }
                  console.log("request list:" , request_list);
                }}
              />
            )}
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeader}>{title}</Text>
          </View>
        )}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8604F',
  },
  title: {
    marginTop: 16,
    paddingVertical: 8,
    color: '#FFF4E2',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#EDA441',
    borderRadius: 8,
    padding: 5,
  },
  item: {
    fontSize: 14,
    backgroundColor: '#f79881',
    borderRadius: 8,
    padding: 5,
    marginVertical: 4,
  },
  horizontalStack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestBoard: {
    flexGrow: 1,
    minHeight: '10%',
    fontSize: 14,
    backgroundColor: '#DF9D93',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    justifyContent:"center",
    alignItems:"center",
  },
  requestBoardItem:{
    fontWeight:"bold",
    color:"white",
  },
});

export default RestockingScreen;
