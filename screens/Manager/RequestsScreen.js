import React from 'react';
import { useState, useEffect} from 'react';
import { View, Text, StyleSheet, SectionList, Button , TouchableOpacity, SafeAreaView} from 'react-native';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import { subscribeToServerRequests } from '../../data/requestedData';
import { getFirestore, doc, getDoc, updateDoc, arrayRemove, deleteField } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

import { getAuth } from "firebase/auth";


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
        console.log("marked Iems:", markedItems); //return if no items to be delete to save reads
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
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <Text style={styles.title}>Supply Requests</Text>
            <View style={styles.horizontalStack}>
                
                <TouchableOpacity style={styles.markButton} onPress={() => {setMarkComplete(!markComplete)}}>
                    <Text style={styles.markButtonText}>Mark Complete</Text>
                </TouchableOpacity>

        

                {markComplete && <TouchableOpacity 
                    style={styles.button} 
                    onPress={ async() => {
                        await handleCompleteRequest(markedItems);
                        setMarkComplete(false);
                    }}>
                    <Text style={styles.buttonText}>Completed</Text>
                </TouchableOpacity>}

                {markComplete && <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => {setMarkComplete(false);}}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>}
            </View>

            <View style={styles.requestsContainer}>
                <SectionList
                    sections={sectionedRequests}  // Use the transformed data
                    keyExtractor={(item, index) => item + index}
                    renderItem={({ item, section }) => (
                    <View style={styles.itemContainer} flexDirection="row" justifyContent="space-between">
                        <Text style={styles.itemText}>{item}</Text>
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
                <View style={styles.requestSection}>
                  <Text style={styles.requestSectionTitle}>{title}</Text>
                 </View>
                )}
             />
          </View>
        </View>
    </SafeAreaView>
        
    
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFDF7',
    },
    container:{
        flex:1,
        padding:20,
        backgroundColor:'#f5f6f7',
        gap:12,
    },
    title:{
        fontFamily:"Poppins-Bold",
        marginVertical:10,
        color:'#5F584E',
        fontSize:30,
    },
    horizontalStack: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:"center",
    },
    requestsContainer:{
        flex:1,
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal:15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop:7,
    },
    requestSection:{
        marginVertical:3,
    },
    requestSectionTitle:{
        fontFamily:"Poppins-Bold",
        color:"#4E4D4C",
        fontSize:18,
        marginVertical:5,
    },
    Button: {
        maxWidth:"45%",
        backgroundColor: '#F2F7FA',
        borderRadius: 10,
        padding:10,
    },
    itemContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical:12,
        borderRadius: 10,
        marginBottom: 5,
        marginHorizontal:8,
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
    markButtonText: {
        fontFamily:"Poppins-Bold",
        color: 'white',
        fontSize: 16,
        textAlign:"center",
    },
    markButton:{
        backgroundColor:'#D1790F',
        padding:7,
        borderRadius:10,
    },
    button:{
        maxWidth:"35%",
        backgroundColor: '#F2F7FA',
        borderRadius: 10,
        padding:10,
    },
    buttonText:{
        fontFamily:"Poppins-Bold",
        color: '#698A66',
        fontSize: 16,
        textAlign:"center",
    },
    cancelButton:{
        maxWidth:"30%",
        backgroundColor: '#F2F7FA',
        borderRadius: 10,
        padding:10,
    },
    cancelButtonText:{
        fontFamily:"Poppins-Bold",
        color: '#4D5765',
        fontSize: 16,
        textAlign:"center",
    },
   
});


export default RequestScreen;