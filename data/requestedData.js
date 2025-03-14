import { getFirestore, doc, onSnapshot } from "firebase/firestore";

const subscribeToServerRequests = (restaurantId, setData) => {
    if(!restaurantId) return () => {}; //prevent running if restaurant is undefined
    
    const db = getFirestore();
    const docRef = doc(db, `restaurants/${restaurantId}/supply_requests/server_requests`);

    return onSnapshot(docRef, (docSnap) => {
        if(docSnap.exists()){
            const fetchedData = docSnap.data();
            const dataMap = new Map();

            Object.entries(fetchedData).forEach(([category, items])=>{
                dataMap.set(category, new Set(items));
            });
            setData(dataMap);
        }else{
            console.log("server_requests doc doesn't exist.");
            setData(new Map());
        }
    });
}

export { subscribeToServerRequests };