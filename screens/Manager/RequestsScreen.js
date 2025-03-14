import React from 'react';
import { useState, useEffect} from 'react';
import { View, Text, StyleSheet, SectionList, Button } from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { subscribeToServerRequests } from '../../data/requestedData';
import { getFirestore, doc, updateDoc, arrayRemove, deleteField } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

import { getAuth } from "firebase/auth";
import { getDoc } from "firebase/firestore";


const RequestScreen = () => {
    const { restaurantId } = useAuth();

    //supply requests data
    const [requests, setRequests] = useState(new Map());
    useEffect(()=>{
      if(restaurantId){
        const unsubscribe = subscribeToServerRequests(restaurantId, setRequests);
        return () => unsubscribe();
      }
    },[restaurantId]);

    //convert map to array for requests SectionLlist
    const sectionedRequests = Array.from(requests,([title, items]) =>({
        title,
        data:Array.from(items),
    }));

    const [markComplete, setMarkComplete] = useState(false);
    let markedItems = [];

    const handleCompleteRequest = async (markedItems) => {
        console.log("in method, marked Iems:", markedItems); //return if no items to be delete to save reads
        if(markedItems.length===0) return;
        
        //get a copy of current requests 
        let updatedRequests = new Map(requests);
        console.log("current requests:", updatedRequests);

        //get ref to doc in firestore
        const db = getFirestore();
        const docRef = doc(db, "restaurants", restaurantId, "supply_requests", "server_requests");

        //checks before accessing firestore
        console.log("Firestore Path:", `restaurants/${restaurantId}/supply_requests/server_requests`);
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const tokenResult = await user.getIdTokenResult();  // Fetch custom claims
            console.log("🔥 User Role (from token claims):", tokenResult.claims.role);
            console.log("🔥 User Restaurant ID (from token claims):", tokenResult.claims.restaurantId);
        } else {
            console.log("❌ No user signed in");
        }
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            console.error("❌ Error: server_request document does not exist. Create it first.");
            return;
        }
        console.log("Current firstore document:", docSnap.data());


        //delete logic : remove marked items from 'requests'
        markedItems.forEach(async ({category, item})=>{
            if(updatedRequests.has(category)){
                updatedRequests.get(category).delete(item);
                console.log(`UI: Deleted ${item} from ${category}`);
                try{
                    await updateDoc(docRef,{
                        [`${category}`]: arrayRemove(item)
                    });
                }catch(error){
                    console.log(`Error deleting ${item} in firestore:`, error.message);
                }

                if(updatedRequests.get(category).size===0){
                    updatedRequests.delete(category); 
                    console.log(`UI: Deleted category ${category} because it was empty`);
                    try{
                        await updateDoc(docRef, {
                            [`${category}`]: deleteField()
                        });
                    }catch(error){
                        console.log("Error deleting empty category in firestore:", error.message);
                    }
                }
            }

        });
        
        //update local state to reflect UI changes
        setRequests(new Map(updatedRequests));
        markedItems=[];
        console.log("Marked Items after deletion:", markedItems);

    }

    return (
    <View style={styles.container}>
        <Text style={styles.title}>Supply Requests</Text>

        <View style={styles.horizontalStack}>
            <Button
                title="Mark Complete"
                color="white"
                onPress={ () => {
                    setMarkComplete(true);
                }}
            />

            {markComplete && <Button
                title='Completed'
                onPress={ async() => {
                    await handleCompleteRequest(markedItems);
                    setMarkComplete(false);
                }}
            />}

            {markComplete && <Button
                title='Cancel'
                color='blue'
                onPress={()=>setMarkComplete(false)}
            />}
        </View>

        <View style={styles.requestBoard}>
            <SectionList
                sections={sectionedRequests}  // Use the transformed data
                keyExtractor={(item, index) => item + index}
                renderItem={({ item, section }) => (
                <View style={styles.sectionListItem} flexDirection="row" justifyContent="space-between">
                    <Text style={styles.sectionListItemText}>{item}</Text>
                    {markComplete && (
                        <BouncyCheckbox
                            size={20}
                            fillColor="green"
                            onPress={(isChecked)=>{
                                if(isChecked){
                                    markedItems.push({category:section.title,item:item});
                                }else{ //user deselect
                                    markedItems = markedItems.filter(i => i.item!==item || i.category!==section.title);
                                }
                                console.log("marked items: ", markedItems);
                            }}
                     />
                 )}
                </View>
         )}
            renderSectionHeader={({ section: { title } }) => (
            <View>
              <Text style={styles.sectionListHeader}>{title}</Text>
             </View>
            )}
         />

      </View>

    </View>
        
    
    );
};

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:24,
        backgroundColor:'#8BBFFB',
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
    horizontalStack: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    requestBoard:{
        minHeight:"50%",
        backgroundColor: "#FAF3E0", // Light paper-like background
        padding: 10,
        borderRadius:10,  
    },
    sectionListHeader:{
        fontSize:16,
        fontWeight:"600",
        paddingVertical:4,
        borderBottomWidth: 1,
        borderBottomColor: "#C2A878",
    },
    sectionListItem:{
        borderRadius:1,
        paddingVertical:4,
        borderBottomWidth: 1,
        borderBottomColor: "#C2A878",
        backgroundColor: "#FAF3E0",
    },
    sectionListItemText:{
        fontSize:17,
        marginLeft:20,
    }
   
});


export default RequestScreen;