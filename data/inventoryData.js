import { getFirestore, doc, onSnapshot } from "firebase/firestore";

const subscribeToServerInventory = (restaurantId, setData) => {
    if(!restaurantId) return () => {}; //prevent running if restaurant is undefined
    
    const db = getFirestore();
    const docRef = doc(db, `restaurants/${restaurantId}/inventory/server_inventory`);

    return onSnapshot(docRef, (docSnap) => {
        if(docSnap.exists()){
            const fetchedData = docSnap.data();
            const dataMap = new Map();

            Object.entries(fetchedData).forEach(([category, items]) => {
                dataMap.set(category, new Set(items));
            });

            setData(dataMap); //real-time update state in ManageInventoryScreen
        }else{
            console.log("server_inventory doc doesn't exists.");
            setData(new Map()); //reset data if document is deleted
        }
    });
}

export { subscribeToServerInventory };