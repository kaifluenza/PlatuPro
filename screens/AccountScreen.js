import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from "../context/AuthContext";

const AccountScreen = () => {
    const { name, role, user, logout } = useAuth();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Top Content */}
                <View>
                    <Text style={styles.title}>{name || "N/A"}</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Role</Text>
                        <View style={styles.card}>
                            <Text style={styles.cardText}>
                                {role === "manager"
                                    ? "Manager"
                                    : role === "assistant_manager"
                                    ? "Assistant Manager"
                                    : role === "server"
                                    ? "Server"
                                    : "N/A"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Email Address</Text>
                        <View style={styles.card}>
                            <Text style={styles.cardText}>{user?.email || "N/A"}</Text>
                        </View>
                    </View>
                </View>

                {/* Sign Out Button fixed to bottom */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
        backgroundColor: '#F8F8F8',
        paddingBottom: 30,
    },
    title: {
        fontFamily: "Poppins-Bold",
        fontSize: 28,
        color: "#2C2C2B",
        padding: 20,
    },
    section: {
        margin: 10,
    },
    sectionTitle: {
        fontFamily: "Poppins-Bold",
        fontSize: 20,
        color: "#2C2C2B",
        marginLeft: 5,
    },
    card: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 1,
    },
    cardText: {
        fontFamily: "Poppins-Regular",
        fontSize: 18,
    },
    logoutButton: {
        width: "90%",
        alignSelf: "center",
        backgroundColor: '#FEE5C7',
        borderRadius: 10,
        padding: 15,
    },
    logoutText: {
        fontFamily: "Poppins-Bold",
        color: '#D1790F',
        fontSize: 18,
        textAlign: "center",
    },
});

export default AccountScreen;
