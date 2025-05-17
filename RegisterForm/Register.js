import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Easing,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    phoneNumber: "",
    whatsappNumber: "",
    address: "",
    city: "",
    userField: "",
    password: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationModalVisible, setIsVerificationModalVisible] =
    useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();

  const cities = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Peshawar",
    "Quetta",
    "Multan",
  ];

  const formSteps = [
    {
      fields: [
        {
          name: "userField",
          label: "Are You ?",
          radio: true,
          options: [
            { label: "Buyer", value: "buyer" },
            { label: "Seller", value: "seller" },
          ],
        },
      ],
      title: "What brings you here?",
      subtitle: "Select your primary role",
    },
    {
      fields: [
        { name: "firstName", label: "First Name", placeholder: "John" },
        { name: "lastName", label: "Last Name", placeholder: "Doe" },
      ],
      title: "What's your name?",
      subtitle: "Let's start with the basics",
    },
    {
      fields: [
        { name: "userName", label: "Username", placeholder: "dairypro123" },
      ],
      title: "Choose a username",
      subtitle: "This will be your unique identity",
    },
    {
      fields: [
        {
          name: "email",
          label: "Email",
          placeholder: "example@dairy.com",
          keyboardType: "email-address",
        },
      ],
      title: "Your email address",
      subtitle: "We'll send a verification code",
    },
    {
      fields: [
        {
          name: "phoneNumber",
          label: "Phone",
          placeholder: "+92 300 1234567",
          keyboardType: "phone-pad",
        },
        {
          name: "whatsappNumber",
          label: "WhatsApp",
          placeholder: "+92 300 1234567",
          keyboardType: "phone-pad",
        },
      ],
      title: "Contact information",
      subtitle: "So we can reach you",
    },
    {
      fields: [
        { name: "address", label: "Address", placeholder: "123 Dairy Street" },
        {
          name: "city",
          label: "City",
          placeholder: "Select your city",
          picker: true,
        },
      ],
      title: "Where are you located?",
      subtitle: "Helps us connect you locally",
    },
    {
      fields: [
        {
          name: "password",
          label: "Password",
          placeholder: "••••••••",
          secure: true,
        },
      ],
      title: "Create a password",
      subtitle: "At least 8 characters",
    },
  ];

  useEffect(() => {
    animateIn();
  }, [currentStep]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: ((currentStep + 1) / formSteps.length) * 100,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    const currentFields = formSteps[currentStep].fields;
    for (const field of currentFields) {
      if (!formData[field.name] && !field.picker && !field.radio) {
        Toast.show({ type: "error", text1: `${field.label} is required` });
        return;
      }
    }

    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleRegister();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        userName: formData.userName.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.replace(/\D/g, ""),
        whatsappNumber: formData.whatsappNumber.replace(/\D/g, ""),
        address: formData.address.trim(),
        city: formData.city,
        userField: formData.userField,
        password: formData.password,
      };

      if (!registrationData.email.includes("@")) {
        Toast.show({ type: "error", text1: "Please enter a valid email" });
        setIsLoading(false);
        return;
      }

      if (registrationData.password.length < 8) {
        Toast.show({
          type: "error",
          text1: "Password must be at least 8 characters",
        });
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        "https://finalyear-backend.onrender.com/api/v1/users/register",
        registrationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data.message === "Verification code sent! Check your email."
      ) {
        Toast.show({ type: "success", text1: "Verification code sent!" });
        setIsVerificationModalVisible(true);
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      if (error.response) {
        const serverMessage =
          error.response.data.message || error.response.data.error;
        Toast.show({
          type: "error",
          text1: "Registration failed",
          text2: serverMessage || "Please check your information",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Network error",
          text2: "Please check your internet connection",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    try {
      const response = await axios.post(
        "https://finalyear-backend.onrender.com/api/v1/users/verify-email",
        { email: formData.email, code: verificationCode }
      );

      if (response.data.message === "Email successfully verified!") {
        Toast.show({
          type: "success",
          text1: "Email verified!",
          text2: "Redirecting to login...",
          visibilityTime: 1500,
          onHide: () => {
            setIsVerificationModalVisible(false);
            navigation.replace("login");
          },
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Invalid verification code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field) => {
    if (field.picker) {
      return (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData[field.name]}
            onValueChange={(itemValue) => handleChange(field.name, itemValue)}
            style={styles.picker}
            dropdownIconColor="#666"
          >
            <Picker.Item label={field.placeholder} value="" />
            {cities.map((city, index) => (
              <Picker.Item key={index} label={city} value={city} />
            ))}
          </Picker>
        </View>
      );
    }

    if (field.radio) {
      return (
        <View style={styles.radioContainer}>
          {field.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.radioButton,
                formData[field.name] === option.value &&
                  styles.radioButtonActive,
              ]}
              onPress={() => handleChange(field.name, option.value)}
            >
              <Text style={styles.radioButtonText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <TextInput
        style={styles.input}
        placeholder={field.placeholder}
        placeholderTextColor="#999"
        value={formData[field.name]}
        onChangeText={(text) => handleChange(field.name, text)}
        keyboardType={field.keyboardType || "default"}
        secureTextEntry={field.secure || false}
      />
    );
  };

  const getNextButtonWidth = () => {
    return currentStep === 0 ? { width: "100%" } : { width: "65%" };
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Logo at the top */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {formSteps.length}
        </Text>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{formSteps[currentStep].title}</Text>
          <Text style={styles.subtitle}>{formSteps[currentStep].subtitle}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {formSteps[currentStep].fields.map((field, index) => (
            <View key={index} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              {renderField(field)}
            </View>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, getNextButtonWidth()]}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === formSteps.length - 1 ? "Register" : "Next"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Verification Modal */}
      <Modal
        visible={isVerificationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVerificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Verify Your Email</Text>
            <Text style={styles.modalHint}>
              Check your email spam/inbox for code
            </Text>
            <Text style={styles.modalSubtitle}>
              We sent a 6-digit code to {formData.email}
            </Text>

            <View style={styles.codeContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="• • • • • •"
                placeholderTextColor="#999"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="numeric"
                maxLength={6}
                textAlign="center"
                autoFocus={true}
              />
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleVerification}
              disabled={isLoading || verificationCode.length < 6}
            >
              <Text style={styles.modalButtonText}>Verify & Continue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsVerificationModalVisible(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Darker background
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  progressBarContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  progressBarBackground: {
    height: 6,
    width: "100%",
    backgroundColor: "#333",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  progressText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  pickerContainer: {
    height: 50,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: "100%",
    color: "#fff",
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  radioButton: {
    width: "48%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333",
  },
  radioButtonActive: {
    backgroundColor: "#1B5E20",
    borderColor: "#4CAF50",
  },
  radioButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  backButton: {
    width: "30%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    height: 50,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 5,
    textAlign: "center",
  },
  modalHint: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 5,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 25,
    textAlign: "center",
    lineHeight: 20,
  },
  codeContainer: {
    width: "100%",
    marginBottom: 25,
  },
  codeInput: {
    width: "100%",
    height: 60,
    backgroundColor: "#121212",
    borderRadius: 10,
    color: "#fff",
    fontSize: 24,
    borderWidth: 1,
    borderColor: "#333",
    letterSpacing: 10,
    fontWeight: "bold",
  },
  modalButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    opacity: 1,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalCancelButton: {
    padding: 10,
  },
  modalCancelButtonText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Register;
