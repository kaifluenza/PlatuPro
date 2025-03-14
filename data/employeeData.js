import { getFirestore, onSnapshot, collection, query, where } from "firebase/firestore";

const subscribeToEmployeeData = (restaurantId, setData) => {
    if(!restaurantId){ 
        console.warn("No restaurant provided, skipping firestore subscription.");
        return () => {}; //prevent running if restaurant is undefined
    } 

    console.log("Subscribing to employee data for restaurantId: ", restaurantId);

    const db = getFirestore();
    const usersRef = collection(db, "users");

    //query for employees except The manager
    const q = query(usersRef, 
        where("restaurantId", "==",restaurantId), 
        where("role","in", ["server", "assistant_manager"])
    );

    return onSnapshot(q, (querySnapShot) => {
        if(querySnapShot.empty){
            console.warn("No employees found in firestore for this restaurant.");
        }
        
        const employees = new Map(); //map to store employees grouped by role

        querySnapShot.forEach((doc)=>{ //loop to get each employee
            const data = doc.data();
            const role = data.role;

            if(!employees.has(role)){ //if role dont exist in map, add an empty array
                employees.set(role, []);
            }
            
            //push employee data into corresponding role
            employees.get(role).push({id: doc.id, ...data}); //store user id along with detail
        });

        console.log("✅ Processed employees data:", employees);
        setData(new Map(employees));
    }, (error) =>{
        console.error("Firestore subscription error: ", error.message);
    });
}

export { subscribeToEmployeeData };