import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // For icons

const { width } = Dimensions.get("window");

const SellerHeader = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnimation = useRef(new Animated.Value(-width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // Toggle drawer with smooth animations
  const toggleDrawer = () => {
    if (isDrawerOpen) {
      Animated.parallel([
        Animated.spring(drawerAnimation, {
          toValue: -width,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsDrawerOpen(false));
    } else {
      Animated.parallel([
        Animated.spring(drawerAnimation, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsDrawerOpen(true));
    }
  };

  // Handle menu item clicks
  const handleMenuClick = (page) => {
    switch (page) {
      case "Dashboard":
        navigation.navigate("Dashboard");
        break;
      case "CreateShop":
        navigation.navigate("createshop");
        break;
      case "Add Product":
        navigation.navigate("product");
        break;
      case "View Orders":
        navigation.navigate("ViewOrders");
        break;
      case "Transactions":
        navigation.navigate("Transactions");
        break;
      case "Settings":
        navigation.navigate("Settings");
        break;
      default:
        break;
    }
    toggleDrawer(); // Close drawer after selection
  };

  return (
    <View style={styles.container}>
      {/* Overlay */}
      {isDrawerOpen && (
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={toggleDrawer}
          activeOpacity={1}
        >
          <Animated.View
            style={[styles.overlay, { opacity: overlayOpacity }]}
          />
        </TouchableOpacity>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Seller Dashboard 👨🏻</Text>
        <TouchableOpacity onPress={toggleDrawer} style={styles.drawerButton}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Drawer Menu */}
      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX: drawerAnimation }] },
        ]}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerHeaderText}>Menu</Text>
        </View>
        {[
          { name: "Dashboard", icon: "home" },
          { name: "CreateShop", icon: "add-circle" },
          { name: "Add Product", icon: "cart" },
          { name: "View Orders", icon: "list" },
          { name: "Transactions", icon: "cash" },
          { name: "Settings", icon: "settings" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.drawerItem}
            onPress={() => handleMenuClick(tab.name)}
          >
            <Ionicons name={tab.icon} size={24} color="#007bff" />
            <Text style={styles.drawerItemText}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#007bff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerText: { color: "white", fontSize: 20, fontWeight: "bold" },
  drawerButton: { padding: 10 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 9,
  },
  drawer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width * 0.7,
    height: "100%",
    backgroundColor: "#fff",
    paddingTop: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    zIndex: 10,
  },
  drawerHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  drawerHeaderText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007bff",
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  drawerItemText: { fontSize: 18, color: "#333", marginLeft: 15 },
});

export default SellerHeader;
