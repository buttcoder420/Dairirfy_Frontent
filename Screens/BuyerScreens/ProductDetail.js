import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import axios from "axios";

const { width } = Dimensions.get("window");

const ProductDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { product, shopId } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const scrollX = new Animated.Value(0);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axios.get(
          `https://finalyear-backend.onrender.com/api/v1/rating/product/${product._id}`
        );
        setRatings(response.data);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      } finally {
        setLoadingRatings(false);
      }
    };

    if (product?._id) {
      fetchRatings();
    }
  }, [product?._id]);

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  const handleAddToCart = () => {
    navigation.navigate("buyerorder", {
      product: product,
      shopId: shopId,
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={14}
            color={star <= rating ? "#FFD700" : "#E0E0E0"}
          />
        ))}
      </View>
    );
  };

  // Calculate average rating
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating Header */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleFavorite} style={styles.headerButton}>
          <MaterialIcons
            name={isFavorite ? "favorite" : "favorite-border"}
            size={24}
            color={isFavorite ? "#FF6B6B" : "#FFF"}
          />
        </TouchableOpacity>
      </View>

      {/* Image Carousel with Parallax Effect */}
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(newIndex);
          }}
        >
          {product.images.map((image, index) => (
            <View key={index} style={styles.carouselItem}>
              <Image
                source={{ uri: image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>

        {/* Custom Pagination */}
        <View style={styles.pagination}>
          {product.images.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.5, 1, 0.5],
              extrapolate: "clamp",
            });

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1.2, 0.8],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  { opacity, transform: [{ scale }] },
                  index === currentImageIndex && styles.activeDot,
                ]}
              />
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.brandTag}>
              <Text style={styles.brandText}>PREMIUM</Text>
            </View>
          </View>

          {/* Rating and Price */}
          <View style={styles.metaContainer}>
            <View style={styles.ratingContainer}>
              {renderStars(averageRating)}
              <Text style={styles.ratingText}>
                {averageRating.toFixed(1)} ({ratings.length} reviews)
              </Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>{product.price} Rs</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>
                  ₹{product.originalPrice}
                </Text>
              )}
            </View>
          </View>

          {/* Discount Badge */}
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Specifications */}
          {product.specifications && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.specsGrid}>
                {Object.entries(product.specifications).map(([key, value]) => (
                  <View key={key} style={styles.specItem}>
                    <Feather name="check-circle" size={14} color="#6C5CE7" />
                    <Text style={styles.specKey}>{key}:</Text>
                    <Text style={styles.specValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {loadingRatings ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : ratings.length > 0 ? (
              ratings.map((review) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.userInfo}>
                      <Image
                        source={{
                          uri:
                            review.user?.profilePhoto ||
                            "https://randomuser.me/api/portraits/men/1.jpg",
                        }}
                        style={styles.avatar}
                      />
                      <View>
                        <Text style={styles.reviewerName}>
                          {review.user?.username || "Anonymous"}
                        </Text>
                      </View>
                    </View>
                    {renderStars(review.rating)}
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewText}>{review.comment}</Text>
                  )}
                  {review.image && (
                    <Image
                      source={{ uri: review.image }}
                      style={styles.reviewImage}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviewsText}>No reviews yet</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          activeOpacity={0.9}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.addToCartText}> + ADD TO CART</Text>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{product.price} Rs</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingHeader: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselContainer: {
    height: width * 0.9,
    backgroundColor: "#F8F8F8",
  },
  carouselItem: {
    width: width,
    height: width * 0.9,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FF6B6B",
    width: 20,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  productInfo: {
    padding: 25,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    lineHeight: 30,
  },
  brandTag: {
    backgroundColor: "#6C5CE7",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 10,
  },
  brandText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starContainer: {
    flexDirection: "row",
    marginRight: 5,
  },
  ratingText: {
    fontSize: 13,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FF6B6B",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "#E3F9F5",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 25,
  },
  discountText: {
    color: "#00B894",
    fontSize: 12,
    fontWeight: "800",
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  seeAll: {
    color: "#6C5CE7",
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 12,
  },
  specKey: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
    marginRight: 3,
  },
  specValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  reviewCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  reviewText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 5,
  },
  reviewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  reviewDate: {
    fontSize: 11,
    color: "#999",
  },
  noReviewsText: {
    color: "#999",
    textAlign: "center",
    marginVertical: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  addToCartButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    overflow: "hidden",
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  addToCartText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  priceTag: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  priceText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
});

export default ProductDetail;
