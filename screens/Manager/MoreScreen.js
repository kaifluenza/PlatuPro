import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { MaterialIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import * as Clipboard from 'expo-clipboard';  

const MoreScreen = () => {
    const navigation = useNavigation();

    const [modalVisible, setModalVisible] = useState(false);


    //copy email to clipboard
    const handleCopyEmail = async () => {
        await Clipboard.setStringAsync('onerueni@gmail.com'); 
        Alert.alert("Copied!", "Email copied to clipboard.");
    };
    

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>More Options</Text>
                {/* Manage Inventory */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Inventory</Text>
                    <TouchableOpacity style={styles.card} onPress={()=>navigation.navigate("Inventory")}>
                        <View style={styles.cardLeft}>
                            <MaterialIcons name="inventory-2" size={24} color="#FAA462" />
                            <Text style={styles.cardText}>Server Inventory</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#FAA462" />
                    </TouchableOpacity>
                </View>
                {/* Manage Employees */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Employee</Text>
                    <TouchableOpacity style={styles.card} onPress={()=>navigation.navigate("Employee")}>
                        <View style={styles.cardLeft}>
                            <FontAwesome6 name="users" size={22} color="#FAA462" />
                            <Text style={styles.cardText}>Manage Employees</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#FAA462" />
                    </TouchableOpacity>
                </View>
                {/* Supoort */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    {/* <TouchableOpacity style={styles.card} onPress={handleCall}>
                        <View style={styles.cardLeft}>
                            <Ionicons name="call-outline" size={24} color="gray" />
                            <Text style={styles.cardText}>Call</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="gray" />
                    </TouchableOpacity> */}
                    <TouchableOpacity style={styles.card} onPress={() => setModalVisible(true)}>
                        <View style={styles.cardLeft}>
                            <MaterialCommunityIcons name="email-outline" size={24} color="#FAA462" />
                            <Text style={styles.cardText}>Email</Text>
                        </View>
                        {/* <Ionicons name="chevron-forward" size={24} color="gray" /> */}
                    </TouchableOpacity>
                </View>
                {/* Modal for Email */}
                <Modal visible={modalVisible} transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Support Email</Text>
                            <Text style={styles.emailText}>Contact the developer at</Text>
                            <Text style={styles.emailText}>onerueni@gmail.com</Text>
                            <TouchableOpacity style={styles.copyButton} onPress={handleCopyEmail}>
                                <Text style={styles.copyButtonText}>Copy Email</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFDF7',
    },
    title:{
        fontFamily:"Poppins-Bold",
        fontSize:28,
        color:"#3E4040",
        textAlign:"left",
        padding:20,
    },
    container:{
        flex:1,
        backgroundColor:"#f5f6f7"
    },
    section:{
        marginHorizontal:20,
        marginVertical:10,
    },
    sectionTitle:{
        fontFamily:"Poppins-Regular",
        fontSize:21,
        fontWeight:"800",
        color:"#3E4040",
        marginBottom:10,
        textAlign:"left",
    },
    card:{
        backgroundColor:"white",
        padding:20,
        borderRadius:10,
        marginBottom:10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:"space-between",
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap:10,
    },
    cardText:{
        fontFamily:"Poppins-Regular",
        fontSize:18,
        color:"#3E4040",
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: 300,
        alignItems: 'center',
    },
    modalTitle: {
        fontFamily:"Poppins-Bold",
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emailText: {
        fontFamily:"Poppins-Regular",
        fontSize: 16,
        marginBottom: 5,
    },
    copyButton: {
        backgroundColor: '#3E3C3B',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginVertical: 10,
    },
    copyButtonText: {
        fontFamily:"Poppins-Bold",
        color: 'white',
        fontSize: 16,
    },
    closeButton: {
        marginTop: 10,
    },
    closeButtonText: {
        fontFamily:"Poppins-Bold",
        color: '#3E3C3B',
        fontSize: 16,
    },
});

export default MoreScreen;