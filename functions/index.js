//for irebase custom claims
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore(); //firestore referrence

// Helper function : validate user data
const validateUserData = (data, requiredFields) => {
    //check if `data` is missing
    if (!data || typeof data !== "object") {
        console.error("No data received in setUserRole.");
        throw new functions.https.HttpsError("invalid-argument", "No request data received.");
    }

     //check if `data.data` exists
     if (!data.data || typeof data.data !== "object") {
        console.error("Invalid request format. Expected { data: { ... } } but got:", data);
        throw new functions.https.HttpsError("invalid-argument", "Invalid request format.");
    }

    //extract the actual payload
    const requestData = data.data;

    //ensure required fields exist
    for(const field of requiredFields){
        if(!requestData[field]){
            throw new functions.https.HttpsError("invalid-argument", `Missing parameter: ${field}`);
        }
    }

    return requestData;  //return extracted data for direct use
};


// Function to set user role (custom claims)
exports.setUserRole = functions.https.onCall(async (data, context) => {
    console.log("Recieved request in setUserRole", data);

    //validate required fields (except token since new user wont have one)
    const { userId, name, email, role, restaurantId, token } = validateUserData(data, [
        "userId", 
        "name", 
        "email", 
        "role", 
        "restaurantId"
    ]);

    const db = admin.firestore();
   
    //check if a manager already exists for this restaurant
    const existingManager = await db.collection("users")
    .where("restaurantId","==",restaurantId)
    .where("role","==","manager")
    .get();

    //case 1 : if no manager exists >> allow first user to be the manager
    if(existingManager.empty){
        console.log(`No manager found for restaurant ${restaurantId}. Setting first user to be the manager.`);
    }else{ //case 2 : a manager exists >> require token verification
        if(!token){
            console.error("❌ No authentication token provided for role assignment.");
            throw new functions.https.HttpsError("unauthenticated", "Authentication token is required.");
        }

        //if we have token, verify token is valid
        let decodedToken;
        try{
            decodedToken = await admin.auth().verifyIdToken(token);
            console.log("✅ Token verified:", decodedToken);
        }catch(error){
            console.error("❌ Error verifying token:", error);
            throw new functions.https.HttpsError("unauthenticated", "Invalid authentication token.");
        }

        //ensure the caller is really a manager
        if(decodedToken.role !== "manager"){
            console.error("❌ Unauthorized: Only managers can assign roles.");
            throw new functions.https.HttpsError("permission-denied", "Only managers can assign roles."); 
        }
    }


    //Assign custom claims and store role in firestore!!
    try {
        await admin.auth().setCustomUserClaims(userId, {
            role: role,
            restaurantId: restaurantId
        });
        console.log(`✅ Custom claims set for ${userId}: role=${role}, restaurantId=${restaurantId}`);

        //Store user details in firestore
        await db.collection("users").doc(userId).set({
            name,
            email,
            role,
            restaurantId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        return { success: true, message:`User ${userId} set as ${role}`};
    } catch (error) {
        console.error("Error setting custom claims:", error);
        throw new functions.https.HttpsError("internal", "Error setting custom claims", error);
    }
});



//Function to create a new employee
exports.createEmployee = functions.https.onCall(async (data) => {
    console.log("📩 Received request in createEmployee:", data);
   
    //validate input data
    const { name, email, role, restaurantId } = validateUserData(data, ["name", "email", "role", "restaurantId"]);
    
    try{
        //create employee in firebase authentication
        console.log(`Creating user with email: ${email}`);
        const userRecord = await admin.auth().createUser({
            email,
            password:"changeme",
        });

        const userId = userRecord.uid;
        console.log(`✅ User created: ${userId}`);

        //store user data in firestore database
        await db.collection("users").doc(userId).set({
            name,
            email,
            role,
            restaurantId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ User ${userId} stored in Firestore.`);

        //send password reset email
        const resetLink = await admin.auth().generatePasswordResetLink(email);
        console.log(`📩 Password reset email sent to ${email}`);

        return { success: true, userId, message: `${name} added as a ${role}.`, resetLink};
    }catch(error){
        console.error("❌ Error creating employee:", error);
        throw new functions.https.HttpsError("internal", "Error creating employee.", error);
    }

});
