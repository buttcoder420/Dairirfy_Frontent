import React, { useContext, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  Dimensions,
  Animated,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import BuyerFooter from "./BuyerFooter";
import MapView, { Marker } from "react-native-maps";

const Order = () => {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [userRatings, setUserRatings] = useState({});
  const intervalRef = useRef(null);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/order/get-order",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const sortedOrders = (response.data.orders || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
      initializeImageCarousels(sortedOrders);
      fetchUserRatings();
    } catch (error) {
      ToastAndroid.show("Failed to fetch orders", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const response = await axios.get(
        "https://finalyear-backend.onrender.com/api/v1/rating/user/rated-products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const ratingsMap = {};
      response.data.ratedProducts.forEach((item) => {
        ratingsMap[item.product._id] = item.rating;
      });
      setUserRatings(ratingsMap);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    }
  };

  const initializeImageCarousels = (ordersList) => {
    const initialIndices = {};
    ordersList.forEach((order, index) => {
      if (order.product?.images?.length > 0) {
        initialIndices[index] = 0;
      }
    });
    setCurrentImageIndices(initialIndices);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

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

  useEffect(() => {
    fetchOrders();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleCancelOrder = async (orderId) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await axios.put(
              `https://finalyear-backend.onrender.com/api/v1/order/cancel-order/${orderId}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            fetchOrders();
            ToastAndroid.show(
              "Order cancelled successfully",
              ToastAndroid.SHORT
            );
          } catch (error) {
            ToastAndroid.show(
              error.response?.data?.message || "Failed to cancel order",
              ToastAndroid.SHORT
            );
          }
        },
      },
    ]);
  };

  const handleRateProduct = (product, order) => {
    setCurrentProduct(product);
    setCurrentOrder(order);
    setRating(userRatings[product._id] || 0);
    setComment("");
    setRatingModalVisible(true);
  };

  const submitRating = async () => {
    if (rating === 0) {
      ToastAndroid.show("Please select a rating", ToastAndroid.SHORT);
      return;
    }

    setSubmittingRating(true);
    try {
      await axios.post(
        "https://finalyear-backend.onrender.com/api/v1/rating/rating",
        {
          product: currentProduct._id,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      ToastAndroid.show("Rating submitted successfully", ToastAndroid.SHORT);
      setRatingModalVisible(false);
      fetchUserRatings(); // Refresh user ratings
      fetchOrders(); // Refresh orders to show the updated rating
    } catch (error) {
      ToastAndroid.show(
        error.response?.data?.message || "Failed to submit rating",
        ToastAndroid.SHORT
      );
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderStars = (
    rating,
    size = 14,
    interactive = false,
    onStarPress = null
  ) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onStarPress && onStarPress(star)}
            activeOpacity={interactive ? 0.6 : 1}
          >
            <Icon
              name={star <= rating ? "star" : "star-border"}
              size={size}
              color={star <= rating ? "#FFD700" : "#E0E0E0"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getStatusDetails = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return { color: "#FFA500", icon: "hourglass-empty", label: "Pending" };
      case "confirmed":
        return { color: "#2196F3", icon: "check-circle", label: "Confirmed" };
      case "shipped":
        return { color: "#673AB7", icon: "local-shipping", label: "Shipped" };
      case "delivered":
        return { color: "#4CAF50", icon: "done-all", label: "Delivered" };
      case "cancelled":
        return { color: "#F44336", icon: "cancel", label: "Cancelled" };
      default:
        return { color: "#9E9E9E", icon: "help", label: "Unknown" };
    }
  };

  const countOrdersByStatus = (status) => {
    return orders.filter((order) => order.status.toLowerCase() === status)
      .length;
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "active") {
      return !["delivered", "cancelled"].includes(order.status.toLowerCase());
    } else {
      return ["delivered", "cancelled"].includes(order.status.toLowerCase());
    }
  });

  const sortedFilteredOrders = [...filteredOrders].sort((a, b) => {
    if (
      a.status.toLowerCase() === "pending" &&
      b.status.toLowerCase() !== "pending"
    ) {
      return -1;
    } else if (
      a.status.toLowerCase() !== "pending" &&
      b.status.toLowerCase() === "pending"
    ) {
      return 1;
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const renderOrderItem = ({ item, index }) => {
    const statusDetails = getStatusDetails(item?.status);
    const deliveryLocation = item?.deliveryLocation?.coordinates
      ? {
          latitude: item.deliveryLocation.coordinates[1],
          longitude: item.deliveryLocation.coordinates[0],
        }
      : null;

    const productImages = item?.product?.images || [];
    const hasMultipleImages = productImages.length > 1;
    const currentImageIndex = currentImageIndices[index] || 0;
    const hasRating = userRatings[item.product?._id];

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTopRow}>
          <Text style={styles.orderId}>
            Order #{item?._id?.substring(0, 8)}
          </Text>
          <View style={styles.statusContainer}>
            <Icon
              name={statusDetails.icon}
              size={16}
              color={statusDetails.color}
              style={styles.statusIcon}
            />
            <Text style={[styles.statusText, { color: statusDetails.color }]}>
              {statusDetails.label}
            </Text>
          </View>
        </View>

        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.shopName}>
              {item?.shop?.shopName || "Unknown Shop"}
            </Text>
            <Text style={styles.orderDate}>
              {item?.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Date not available"}
            </Text>
          </View>
        </View>

        <View style={styles.productContainer}>
          {productImages.length > 0 ? (
            <View style={styles.imageCarouselContainer}>
              <Image
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
              <Icon name="image" size={24} color="#ccc" />
            </View>
          )}
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>
              {item?.product?.name || "Unknown Product"}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>
                Rs {item?.pricePerUnit?.toFixed?.(2) || "0.00"} ×{" "}
                {item?.quantity || 0}
              </Text>
              <Text style={styles.productTotal}>
                Rs {item?.totalPrice?.toFixed?.(2) || "0.00"}
              </Text>
            </View>
          </View>
        </View>

        {deliveryLocation && (
          <View style={styles.deliveryMapContainer}>
            <Text style={styles.sectionTitle}>Delivery Location</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: deliveryLocation.latitude,
                longitude: deliveryLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={deliveryLocation}
                title="Delivery Location"
                description={item?.deliveryLocation?.address}
              >
                <View style={styles.marker}>
                  <Icon name="location-on" size={24} color="#FF5252" />
                </View>
              </Marker>
            </MapView>
            <Text style={styles.addressText} numberOfLines={2}>
              <Icon name="location-on" size={16} color="#FF5252" />
              {item?.deliveryLocation?.address || "Address not available"}
            </Text>
          </View>
        )}

        {item?.status === "pending" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelOrder(item._id)}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}

        {item?.status === "delivered" && (
          <View style={styles.actionButtons}>
            {hasRating ? (
              <View style={styles.ratedContainer}>
                <Text style={styles.ratedText}>You rated:</Text>
                {renderStars(hasRating, 16)}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => handleRateProduct(item.product, item)}
              >
                <Text style={styles.rateButtonText}>Rate Product</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>My Orders</Text>
        <View style={styles.statusCountContainer}>
          <View style={styles.statusCount}>
            <Text style={styles.statusCountText}>
              Pending: {countOrdersByStatus("pending")}
            </Text>
          </View>
          <View style={styles.statusCount}>
            <Text style={styles.statusCountText}>
              Active:{" "}
              {countOrdersByStatus("confirmed") +
                countOrdersByStatus("shipped")}
            </Text>
          </View>
          <View style={styles.statusCount}>
            <Text style={styles.statusCountText}>
              Completed: {countOrdersByStatus("delivered")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Active Orders (
            {countOrdersByStatus("pending") +
              countOrdersByStatus("confirmed") +
              countOrdersByStatus("shipped")}
            )
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "history" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            Order History (
            {countOrdersByStatus("delivered") +
              countOrdersByStatus("cancelled")}
            )
          </Text>
        </TouchableOpacity>
      </View>

      {sortedFilteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon
            name={activeTab === "active" ? "receipt" : "history"}
            size={60}
            color="#9E9E9E"
          />
          <Text style={styles.emptyText}>
            {activeTab === "active"
              ? "No active orders"
              : "No order history yet"}
          </Text>
          <Text style={styles.emptySubText}>
            {activeTab === "active"
              ? "Your active orders will appear here"
              : "Your completed and cancelled orders will appear here"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedFilteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchOrders();
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Rating Modal */}
      <Modal
        visible={ratingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Rate This Product</Text>
            <Text style={styles.productNameModal}>{currentProduct?.name}</Text>

            <View style={styles.orderInfoContainer}>
              <Text style={styles.orderInfoText}>
                Order #: {currentOrder?._id?.substring(0, 8)}
              </Text>
              <Text style={styles.orderInfoText}>
                Delivered on:{" "}
                {currentOrder?.createdAt
                  ? new Date(currentOrder.createdAt).toLocaleDateString(
                      "en-PK",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "N/A"}
              </Text>
            </View>

            <View style={styles.starRatingContainer}>
              <Text style={styles.ratingLabel}>Your Rating:</Text>
              {renderStars(rating, 30, true, (selectedRating) =>
                setRating(selectedRating)
              )}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Write your review (optional)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButtonModal}
                onPress={() => setRatingModalVisible(false)}
                disabled={submittingRating}
              >
                <Text style={styles.cancelButtonTextModal}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitRating}
                disabled={submittingRating}
              >
                {submittingRating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Rating</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BuyerFooter />
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    padding: 16,
    backgroundColor: "#4CAF50",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  statusCountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusCount: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusCountText: {
    color: "white",
    fontWeight: "500",
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
    marginTop: 10,
    fontWeight: "500",
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 80,
  },
  orderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderId: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: 5,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  orderDate: {
    fontSize: 12,
    color: "#777",
  },
  productContainer: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 10,
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
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 14,
    color: "#666",
  },
  productTotal: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  deliveryMapContainer: {
    marginBottom: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  sectionTitle: {
    fontWeight: "600",
    color: "#555",
    fontSize: 14,
    marginBottom: 8,
  },
  map: {
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  marker: {
    backgroundColor: "white",
    padding: 5,
    borderRadius: 20,
  },
  addressText: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ff4444",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  rateButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  rateButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  ratedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    width: "100%",
  },
  ratedText: {
    marginRight: 10,
    color: "#555",
    fontWeight: "500",
  },
  starContainer: {
    flexDirection: "row",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
    color: "#333",
  },
  productNameModal: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: "#555",
  },
  orderInfoContainer: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderInfoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
  starRatingContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  cancelButtonModal: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonTextModal: {
    color: "#555",
    fontWeight: "500",
  },
  submitButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "500",
  },
});

export default Order;
