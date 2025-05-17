import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const MAX_IMAGES = 5; // Maximum number of images allowed

const AddProduct = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("Select Stock");
  const [category, setCategory] = useState("Select Category");
  const [images, setImages] = useState([]);

  // Function for Image picking with multiple selection
  const handleImagePick = async () => {
    if (images.length >= MAX_IMAGES) {
      return Toast.show({
        type: "error",
        text1: `Maximum ${MAX_IMAGES} images allowed`,
      });
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      allowsMultipleSelection: true, // Enable multiple selection
      selectionLimit: MAX_IMAGES - images.length, // Limit based on remaining slots
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  // Function to remove an image
  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  // Function to render image item
  const renderImageItem = ({ item, index }) => (
    <View style={styles.imageCard}>
      <Image source={{ uri: item }} style={styles.image} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveImage(index)}
      >
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // Creating Product
  const handleCreateProduct = async () => {
    if (
      !name ||
      !description ||
      !price ||
      quantity === "Select Stock" ||
      category === "Select Category" ||
      images.length === 0
    ) {
      return Toast.show({
        type: "error",
        text1: "Please fill in all fields and add at least one image.",
      });
    }

    try {
      const productData = {
        name,
        description,
        price,
        quantity,
        category,
        images, // Now sending array of images
      };

      const response = await axios.post(
        "https://finalyear-backend.onrender.com/api/v1/product/create",
        productData
      );

      if (response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Product created successfully!",
        });
        navigation.navigate("productmanage");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      Toast.show({
        type: "error",
        text1: "Error creating product",
        text2: error.response?.data?.message || "Please try again",
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Add New Product</Text>
        <Text style={styles.headerSubtitle}>Fill in your product details</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Picker
          selectedValue={quantity}
          onValueChange={(itemValue) => setQuantity(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Stock" value="Select Stock" />
          <Picker.Item label="In Stock" value="in stock" />
          <Picker.Item label="Out of Stock" value="out of stock" />
        </Picker>

        <Picker
          selectedValue={category}
          style={styles.picker}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="Select Category" value="Select Category" />
          <Picker.Item label="Milk" value="Milk" />
          <Picker.Item label="Cheese" value="Cheese" />
          <Picker.Item label="Butter" value="Butter" />
          <Picker.Item label="Yogurt" value="Yogurt" />
          <Picker.Item label="Cream" value="Cream" />
          <Picker.Item label="Other" value="Other" />
        </Picker>

        {/* Image Picker Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>
            Product Images ({images.length}/{MAX_IMAGES})
          </Text>

          <TouchableOpacity
            onPress={handleImagePick}
            style={styles.addImageButton}
            disabled={images.length >= MAX_IMAGES}
          >
            <Ionicons
              name="add"
              size={24}
              color={images.length >= MAX_IMAGES ? "#ccc" : "#4a7c59"}
            />
            <Text
              style={[
                styles.addImageText,
                images.length >= MAX_IMAGES && styles.disabledText,
              ]}
            >
              {images.length >= MAX_IMAGES ? "Maximum reached" : "Add Images"}
            </Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View style={styles.imageGridContainer}>
              <FlatList
                data={images}
                renderItem={renderImageItem}
                keyExtractor={(_, index) => index.toString()}
                numColumns={3}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleCreateProduct}
          style={styles.submitButton}
        >
          <Text style={styles.buttonText}>Create Product</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    paddingBottom: 30,
  },
  headerContainer: {
    backgroundColor: "#4a7c59",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  input: {
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 15,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  picker: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#5e9b8b",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 15,
  },
  addImageText: {
    marginLeft: 10,
    color: "#4a7c59",
    fontSize: 16,
  },
  disabledText: {
    color: "#ccc",
  },
  imageCard: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    margin: 5,
    justifyContent: "center",
    backgroundColor: "#fff",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  imageGridContainer: {
    alignItems: "center",
  },
});

export default AddProduct;
