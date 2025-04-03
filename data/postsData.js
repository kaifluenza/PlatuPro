import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";

const subscribeToPosts = (restaurantId, setData) => {
    if(!restaurantId) return () => {}; //prevent running if restaurant is undefined
    
    const db = getFirestore();
    const collectionRef = collection(db, `restaurants/${restaurantId}/posts`);

    //fetch posts ordered by createdAt in descending order (lastest first)
    const orderedQuery = query(collectionRef, orderBy("createdAt", "desc"));

    return onSnapshot(orderedQuery, (querySnapShot) => {
        if (!querySnapShot.empty) {
            const postsArray = querySnapShot.docs.map(docSnap => ({
                id: docSnap.id, 
                ...docSnap.data(), 
            }));

            setData(postsArray);  //posts are sorted with latest at the top
        } else {
            console.log("No posts found.");
            setData([]); // Reset data if no posts exist
        }
    });
}

export { subscribeToPosts };