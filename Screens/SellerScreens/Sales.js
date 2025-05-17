import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Animated,
} from "react-native";
import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";
import MapView, { Marker, Polyline } from "react-native-maps";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const Sales = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useContext(AuthContext);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const scrollXRefs = useRef({});
  const intervalRef = useRef(null);

  // Shop location (should come from your shop data)
  const shopLocation = {
    latitude: 31.585641,
    longitude: 74.4812869,
  };

  useEffect(() => {
    fetchSellerOrders();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token]);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/order/seller/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        }
      );

      if (response.data.success) {
        const sortedOrders = response.data.orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
        initializeImageCarousels(sortedOrders);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const initializeImageCarousels = (ordersList) => {
    const initialIndices = {};
    const initialScrollX = {};

    ordersList.forEach((order, index) => {
      if (order.product?.images?.length > 0) {
        initialIndices[index] = 0;
        initialScrollX[index] = new Animated.Value(0);
      }
    });

    setCurrentImageIndices(initialIndices);
    scrollXRefs.current = initialScrollX;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new auto-sliding interval
    intervalRef.current = setInterval(() => {
      setCurrentImageIndices((prevIndices) => {
        const newIndices = { ...prevIndices };
        Object.keys(newIndices).forEach((key) => {
          const orderIndex = parseInt(key);
          const order = ordersList[orderIndex];
          if (order?.product?.images?.length > 1) {
            newIndices[orderIndex] =
              (newIndices[orderIndex] + 1) % order.product.images.length;
          }
        });
        return newIndices;
      });
    }, 3000);
  };

  // Count orders by status
  const countOrdersByStatus = (status) => {
    return orders.filter((order) => order.status.toLowerCase() === status)
      .length;
  };

  const openDialer = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openMap = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#FFA500"; // Orange
      case "completed":
        return "#4CAF50"; // Green
      case "cancelled":
        return "#F44336"; // Red
      case "shipped":
        return "#2196F3"; // Blue
      case "processing":
        return "#9C27B0"; // Purple
      default:
        return "#9E9E9E"; // Gray
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !selectedStatus) return;

    try {
      const response = await axios.put(
        `https://finalyear-backend.onrender.com/api/v1/order/update-order/${selectedOrder._id}`,
        { status: selectedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const updatedOrders = orders.map((order) =>
          order._id === selectedOrder._id
            ? { ...order, status: selectedStatus }
            : order
        );
        setOrders(updatedOrders);
        setModalVisible(false);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance.toFixed(1);
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const calculateMidpoint = (loc1, loc2) => {
    return {
      latitude: (loc1.latitude + loc2.latitude) / 2,
      longitude: (loc1.longitude + loc2.longitude) / 2,
    };
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status.toLowerCase() === activeTab;
  });

  const renderOrderItem = ({ item, index }) => {
    const deliveryLocation = {
      latitude: item.deliveryLocation.coordinates[1],
      longitude: item.deliveryLocation.coordinates[0],
    };

    const distance = calculateDistance(
      shopLocation.latitude,
      shopLocation.longitude,
      deliveryLocation.latitude,
      deliveryLocation.longitude
    );

    const productImages = item.product?.images || [];
    const hasMultipleImages = productImages.length > 1;
    const currentImageIndex = currentImageIndices[index] || 0;

    return (
      <View style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>
              ORDER #{item._id.substring(0, 8)}
            </Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
            onPress={() => {
              setSelectedOrder(item);
              setSelectedStatus(item.status);
              setModalVisible(true);
            }}
          >
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Product Info with Image Carousel */}
        <View style={styles.productSection}>
          {productImages.length > 0 ? (
            <View style={styles.imageCarouselContainer}>
              <Animated.Image
                source={{ uri: productImages[currentImageIndex] }}
                style={styles.productImage}
                resizeMode="cover"
              />
              {hasMultipleImages && (
                <View style={styles.imageIndicators}>
                  {productImages.map((_, imgIndex) => (
                    <View
                      key={imgIndex}
                      style={[
                        styles.imageIndicator,
                        imgIndex === currentImageIndex &&
                          styles.activeIndicator,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={24} color="#ccc" />
            </View>
          )}

          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.product?.name || "Product Name Not Available"}
            </Text>
            <Text style={styles.productPrice}>
              {item.product?.price?.toLocaleString() || "0"} Rs
            </Text>

            <View style={styles.shopInfo}>
              <Ionicons name="storefront" size={16} color="#666" />
              <Text style={styles.shopName}>
                {item.shop?.shopName || "Shop Name Not Available"}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUSTOMER DETAILS</Text>
          <View style={styles.customerRow}>
            <FontAwesome name="user" size={16} color="#555" />
            <Text style={styles.customerText}>
              {item.user?.firstName || "Unknown"} {item.user?.lastName || ""}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.customerRow}
            onPress={() => openEmail(item.user?.email)}
            disabled={!item.user?.email}
          >
            <MaterialIcons name="email" size={16} color="#555" />
            <Text style={styles.contactText}>
              {item.user?.email || "No email provided"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.customerRow}
            onPress={() => openDialer(item.user?.phoneNumber)}
            disabled={!item.user?.phoneNumber}
          >
            <FontAwesome name="phone" size={16} color="#555" />
            <Text style={styles.contactText}>
              {item.user?.phoneNumber || "No phone provided"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Delivery Map */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DELIVERY LOCATION</Text>
            <View style={styles.distanceBadge}>
              <Feather name="navigation" size={14} color="white" />
              <Text style={styles.distanceText}>{distance} km away</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              openMap(deliveryLocation.latitude, deliveryLocation.longitude)
            }
          >
            <MapView
              style={styles.map}
              initialRegion={{
                ...calculateMidpoint(shopLocation, deliveryLocation),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              loadingEnabled={true}
            >
              {/* Shop Location Marker */}
              <Marker
                coordinate={shopLocation}
                title="Your Shop"
                description="Your business location"
              >
                <View style={styles.shopMarker}>
                  <Ionicons name="storefront" size={20} color="white" />
                </View>
              </Marker>

              {/* Delivery Location Marker */}
              <Marker
                coordinate={deliveryLocation}
                title="Delivery Location"
                description={
                  item.deliveryLocation?.address || "Delivery address"
                }
              >
                <View style={styles.deliveryMarker}>
                  <View style={styles.markerPin} />
                  <View style={styles.markerContent}>
                    <FontAwesome name="home" size={16} color="white" />
                  </View>
                </View>
              </Marker>

              {/* Delivery Route */}
              <Polyline
                coordinates={[shopLocation, deliveryLocation]}
                strokeColor="#FF5252"
                strokeWidth={4}
                lineDashPattern={[10, 5]}
              />
            </MapView>
            <Text style={styles.addressText} numberOfLines={2}>
              <MaterialIcons name="location-on" size={16} color="#FF5252" />
              {item.deliveryLocation?.address || "Address not specified"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantity:</Text>
            <Text style={styles.summaryValue}>{item.quantity}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price per unit:</Text>
            <Text style={styles.summaryValue}>
              {item.pricePerUnit?.toLocaleString() || "0"} Rs
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method:</Text>
            <Text style={styles.summaryValue}>
              {item.paymentMethod || "Not specified"}
            </Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>
              {item.totalPrice?.toLocaleString() || "0"} Rs
            </Text>
          </View>
        </View>

        {/* Status Update Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible && selectedOrder?._id === item._id}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Update Order Status</Text>

              {/* Status Selection */}
              <View style={styles.statusOptions}>
                {[
                  "pending",
                  "confirmed",
                  "shipped",
                  "delivered",
                  "cancelled",
                ].map((status) => (
                  <Pressable
                    key={status}
                    style={[
                      styles.statusOption,
                      selectedStatus === status && {
                        backgroundColor: getStatusColor(status),
                        borderColor: getStatusColor(status),
                      },
                    ]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        selectedStatus === status && { color: "white" },
                      ]}
                    >
                      {status.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.updateButton]}
                  onPress={handleStatusUpdate}
                >
                  <Text style={styles.buttonText}>Update Status</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="error-outline" size={50} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchSellerOrders}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="receipt-outline" size={60} color="#9E9E9E" />
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptyText}>You haven't received any orders</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Order Management</Text>
          <Text style={styles.headerSubtitle}>Track and manage your sales</Text>
        </View>
        <View style={styles.orderCountContainer}>
          <Text style={styles.orderCountText}>{orders.length} orders</Text>
        </View>
      </View>

      {/* Status Filter Tabs with counts */}
      <View style={styles.tabContainer}>
        {["all", "pending", "delivered", "cancelled"].map((tab) => {
          const count = countOrdersByStatus(tab);
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === "all"
                  ? `All (${orders.length})`
                  : `${tab.charAt(0).toUpperCase() + tab.slice(1)}${
                      count > 0 ? ` (${count})` : ""
                    }`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchSellerOrders}
        ListEmptyComponent={
          <View style={styles.emptyFilterContainer}>
            <MaterialIcons name="filter-alt" size={40} color="#9E9E9E" />
            <Text style={styles.emptyFilterText}>
              No {activeTab} orders found
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#4CAF50",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  orderCountContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  orderCountText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
  },
  activeTabButton: {
    backgroundColor: "#4CAF50",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "white",
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    letterSpacing: 0.5,
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  productSection: {
    flexDirection: "row",
    marginBottom: 12,
  },
  imageCarouselContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    overflow: "hidden",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  imageIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: "#4CAF50",
    width: 10,
  },
  productDetails: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 6,
  },
  shopInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  shopName: {
    fontSize: 14,
    color: "#666",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 12,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#666",
    letterSpacing: 0.5,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5252",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  customerText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#2196F3",
    marginLeft: 8,
    textDecorationLine: "underline",
  },
  map: {
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 4,
  },
  shopMarker: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  deliveryMarker: {
    position: "relative",
    alignItems: "center",
  },
  markerPin: {
    width: 3,
    height: 20,
    backgroundColor: "#FF5252",
  },
  markerContent: {
    position: "absolute",
    top: 20,
    backgroundColor: "#FF5252",
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "white",
  },
  summarySection: {
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    marginTop: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  emptyFilterContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyFilterText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: width * 0.9,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statusOption: {
    width: "48%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 10,
    padding: 14,
    width: "48%",
    alignItems: "center",
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: "#f1f1f1",
  },
  updateButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default Sales;
