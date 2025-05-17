import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { AuthContext } from "../../Context/AuthContext";

const SellerDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const [shopStatus, setShopStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const handlePress = () => {
    navigation.navigate("createshop");
  };
  const handleLogout = () => {
    logout();
  };
  const handleproduct = () => {
    navigation.navigate("product");
  };
  const navigateToProfile = () => {
    navigation.navigate("profile");
  };

  const fetchShopStatus = async () => {
    if (!token) {
      return;
    }
    try {
      const response = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/shop/shop/status",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        }
      );

      if (!response.data.shopStatus) {
        setShopStatus(null);
      } else {
        setShopStatus(response.data.shopStatus === "on");
      }
    } catch (error) {
      setShopStatus(null);
    } finally {
      setFetching(false);
    }
  };

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/order/seller/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const sortedOrders = response.data.orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);

        // Calculate counts
        const pending = sortedOrders.filter(
          (order) => order.status === "pending"
        ).length;
        const delivered = sortedOrders.filter(
          (order) => order.status === "delivered"
        ).length;

        setPendingCount(pending);
        setDeliveredCount(delivered);
        setTotalOrders(sortedOrders.length);
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch orders",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShop = async (newStatus) => {
    setLoading(true);
    try {
      await axios.put(
        `https://finalyear-backend.onrender.com/api/v1/shop/shop/status`,
        { shopStatus: newStatus ? "on" : "off" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShopStatus(newStatus);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Shop is now ${newStatus ? "On" : "Off"}!`,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopStatus();
    fetchSellerOrders();
  }, []);

  return (
    <View style={styles.container}>
      {/* New Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerSubtitle}>Welcome back</Text>
          <View style={styles.profileContainer}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={navigateToProfile}
            >
              <View style={styles.profileIcon}>
                <Text style={styles.profileEmoji}>👨🏻</Text>
              </View>
              <Text style={styles.headerTitle}>
                {user?.userName || "Seller"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Shop Status Section */}
      {fetching ? (
        <ActivityIndicator
          size="small"
          color="#6C63FF"
          style={styles.shopLoading}
        />
      ) : shopStatus === null ? (
        <TouchableOpacity
          style={styles.addShopContainer}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.addShopContent}>
            <Ionicons name="add-circle-outline" size={28} color="#6C63FF" />
            <Text style={styles.addShopText}>Add Your Shop</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6C63FF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.shopStatusContainer}>
          <View style={styles.shopStatusContent}>
            <View style={styles.shopIconContainer}>
              <Ionicons name="storefront" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.shopStatusTitle}>Shop Status</Text>
              <Text style={styles.shopStatusText}>
                {shopStatus ? "Currently Open" : "Currently Closed"}
              </Text>
            </View>
          </View>
          <Switch
            value={shopStatus}
            onValueChange={handleUpdateShop}
            disabled={loading}
            trackColor={{ false: "#E0E0E0", true: "#8E97FD" }}
            thumbColor={shopStatus ? "#6C63FF" : "#f4f3f4"}
          />
        </View>
      )}

      {/* Stats Cards - Grid Layout */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.pendingCard]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={20} color="#FFA726" />
            </View>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statTitle}>Pending</Text>
          </View>

          <View style={[styles.statCard, styles.ordersCard]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cart-outline" size={20} color="#26C6DA" />
            </View>
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statTitle}>Total Orders</Text>
          </View>

          <View style={[styles.statCard, styles.deliveredCard]}>
            <View style={styles.statIconContainer}>
              <Ionicons
                name="checkmark-done-outline"
                size={20}
                color="#66BB6A"
              />
            </View>
            <Text style={styles.statValue}>{deliveredCount}</Text>
            <Text style={styles.statTitle}>Delivered</Text>
          </View>

          <View style={[styles.statCard, styles.ratingCard]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="star-outline" size={20} color="#AB47BC" />
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.statValue}>4.5</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4].map((i) => (
                  <Ionicons key={i} name="star" size={12} color="#FFD700" />
                ))}
                <Ionicons name="star-half" size={12} color="#FFD700" />
              </View>
            </View>
            <Text style={styles.statTitle}>Rating</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={handleproduct}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="add" size={24} color="#6C63FF" />
            </View>
            <Text style={styles.actionText}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("productmanage")}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="list" size={24} color="#6C63FF" />
            </View>
            <Text style={styles.actionText}>Manage Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            // onPress={() => navigation.navigate("")}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="stats-chart" size={24} color="#6C63FF" />
            </View>
            <Text style={styles.actionText}>Sales Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("sales")}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="cart" size={24} color="#6C63FF" />
            </View>
            <Text style={styles.actionText}>View Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate("sales")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.ordersContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#6C63FF" />
          ) : orders.length > 0 ? (
            orders.slice(0, 3).map((order) => (
              <View key={order._id} style={styles.orderItem}>
                <View style={styles.orderInfo}>
                  <Ionicons name="receipt-outline" size={20} color="#6C63FF" />
                  <Text style={styles.orderId}>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    order.status === "delivered"
                      ? styles.statusDelivered
                      : order.status === "pending"
                      ? styles.statusPending
                      : styles.statusProcessing,
                  ]}
                >
                  <Text style={styles.orderStatus}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noOrdersContainer}>
              <Ionicons name="file-tray-outline" size={40} color="#9E9E9E" />
              <Text style={styles.noOrdersText}>No recent orders</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F9",
  },
  // New Header Styles
  header: {
    backgroundColor: "#6C63FF",
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  profileEmoji: {
    fontSize: 20,
  },
  logoutButton: {
    padding: 8,
    marginLeft: 10,
  },
  // Shop Status Styles
  shopLoading: {
    margin: 20,
  },
  addShopContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  addShopContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  addShopText: {
    color: "#6C63FF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  shopStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  shopStatusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  shopIconContainer: {
    backgroundColor: "#6C63FF",
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  shopStatusTitle: {
    fontSize: 14,
    color: "#9E9E9E",
    marginBottom: 2,
  },
  shopStatusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
  },
  // Main Content
  mainContent: {
    padding: 15,
    paddingBottom: 30,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    alignItems: "center",
  },
  statIconContainer: {
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  pendingCard: {
    borderBottomWidth: 3,
    borderBottomColor: "#FFA726",
  },
  ordersCard: {
    borderBottomWidth: 3,
    borderBottomColor: "#26C6DA",
  },
  deliveredCard: {
    borderBottomWidth: 3,
    borderBottomColor: "#66BB6A",
  },
  ratingCard: {
    borderBottomWidth: 3,
    borderBottomColor: "#AB47BC",
  },
  statTitle: {
    color: "#757575",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 5,
  },
  statValue: {
    color: "#424242",
    fontSize: 24,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  ratingStars: {
    flexDirection: "row",
    marginLeft: 5,
  },
  // Section Titles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
  },
  seeAllText: {
    color: "#6C63FF",
    fontSize: 14,
    fontWeight: "500",
  },
  // Actions Grid
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIconContainer: {
    backgroundColor: "rgba(108, 99, 255, 0.1)",
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    color: "#424242",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  // Orders Container
  ordersContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderId: {
    fontSize: 14,
    color: "#616161",
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusPending: {
    backgroundColor: "#FFF3E0",
  },
  statusDelivered: {
    backgroundColor: "#E8F5E9",
  },
  statusProcessing: {
    backgroundColor: "#E3F2FD",
  },
  noOrdersContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  noOrdersText: {
    textAlign: "center",
    color: "#9E9E9E",
    marginTop: 10,
    fontSize: 14,
  },
});

export default SellerDashboard;
