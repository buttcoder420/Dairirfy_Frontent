import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

const AdminDashboard = () => {
  const { token, user, logout } = useContext(AuthContext);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [totalShops, setTotalShops] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, shopsRes] = await Promise.all([
          axios.get("https://finalyear-backend.onrender.com/api/v1/users/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            "https://finalyear-backend.onrender.com/api/v1/shop/all-shop",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        if (usersRes.data?.success) setTotalUsers(usersRes.data.TotalUser);
        if (shopsRes.data?.TotalShop >= 0)
          setTotalShops(shopsRes.data.TotalShop);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleCardPress = (screenName) => navigation.navigate(screenName);
  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerSubtitle}>Welcome back</Text>
            <Text style={styles.headerTitle}>
              {user?.firstName || "Admin"} {user?.lastName || ""}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={[styles.card, styles.cardPrimary]}
            onPress={() => handleCardPress("alluser")}
          >
            <View style={styles.cardIcon}>
              <Icon name="people" size={28} color="#4ECDC4" />
            </View>
            <Text style={styles.cardTitle}>Total Users</Text>
            <Text style={styles.cardValue}>{loading ? "..." : totalUsers}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardSecondary]}
            onPress={() => handleCardPress("allshop")}
          >
            <View style={styles.cardIcon}>
              <Icon name="store" size={28} color="#FF9E7D" />
            </View>
            <Text style={styles.cardTitle}>Total Shops</Text>
            <Text style={styles.cardValue}>{loading ? "..." : totalShops}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          <View style={styles.activityCard}>
            <View
              style={[styles.activityBadge, { backgroundColor: "#4ECDC4" }]}
            />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>New user registered</Text>
              <Text style={styles.activityTime}>2 minutes ago</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#555" />
          </View>

          <View style={styles.activityCard}>
            <View
              style={[styles.activityBadge, { backgroundColor: "#FF9E7D" }]}
            />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Order #1234 completed</Text>
              <Text style={styles.activityTime}>10 minutes ago</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#555" />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: "#4ECDC4" }]}>
                <Icon name="add" size={20} color="#111" />
              </View>
              <Text style={styles.actionText}>Add User</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: "#FF9E7D" }]}>
                <Icon name="settings" size={20} color="#111" />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F1A",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#252538",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSubtitle: {
    color: "#8C8CA1",
    fontSize: 14,
    marginBottom: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#252538",
  },
  content: {
    padding: 20,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  card: {
    width: width * 0.43,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardPrimary: {
    backgroundColor: "#1A1A2E",
    borderLeftWidth: 4,
    borderLeftColor: "#4ECDC4",
  },
  cardSecondary: {
    backgroundColor: "#1A1A2E",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9E7D",
  },
  cardIcon: {
    marginBottom: 15,
  },
  cardTitle: {
    color: "#8C8CA1",
    fontSize: 14,
    marginBottom: 5,
  },
  cardValue: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#1A1A2E",
    borderRadius: 10,
    marginBottom: 10,
  },
  activityBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: "white",
    fontSize: 16,
    marginBottom: 3,
  },
  activityTime: {
    color: "#8C8CA1",
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    width: width * 0.43,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#1A1A2E",
    borderRadius: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default AdminDashboard;
