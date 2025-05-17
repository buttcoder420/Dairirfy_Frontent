import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";

const PrivacyPolicy = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const animValues = useRef(
    new Array(5).fill(0).map(() => new Animated.Value(0))
  ).current;

  const toggleSection = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
      Animated.timing(animValues[index], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      setActiveIndex(index);
      Animated.timing(animValues[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        "• Personal details (name, phone number, location)",
        "• Shop details and product listings",
        "• Payment and transaction information",
        "• Device information and usage data",
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: [
        "• To manage user accounts and shops",
        "• To improve our services and features",
        "• To process payments and transactions",
        "• To communicate important updates",
      ],
    },
    {
      title: "3. Data Sharing",
      content: [
        "We do not sell your personal information. However, we may share data with trusted partners for service improvement and security purposes.",
      ],
    },
    {
      title: "4. Security",
      content: [
        "We take appropriate measures to protect your data. However, no system is 100% secure, so please use the app responsibly.",
      ],
    },
    {
      title: "5. Your Choices",
      content: [
        "You can update or delete your account at any time. For any privacy concerns, contact our support team.",
      ],
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={styles.underline} />
      </View>

      <Text style={styles.intro}>
        Welcome to Dairify. Your privacy is important to us. This Privacy Policy
        explains how we collect, use, and protect your personal information when
        you use our app.
      </Text>

      {sections.map((section, index) => {
        const height = animValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, section.content.length * 30 + 20], // Dynamic height
        });

        return (
          <View key={index} style={styles.section}>
            <TouchableOpacity
              onPress={() => toggleSection(index)}
              style={styles.sectionHeader}
              activeOpacity={0.8}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Animated.Text
                style={[
                  styles.arrow,
                  {
                    transform: [
                      {
                        rotate: animValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "180deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                ▼
              </Animated.Text>
            </TouchableOpacity>

            <Animated.View style={[styles.content, { height }]}>
              {section.content.map((item, i) => (
                <Text key={i} style={styles.item}>
                  {item}
                </Text>
              ))}
            </Animated.View>
          </View>
        );
      })}

      <Text style={styles.footer}>
        By using Dairify, you agree to this Privacy Policy.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: "#fafafa",
  },
  header: {
    marginBottom: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  underline: {
    width: 50,
    height: 3,
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
    marginBottom: 25,
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  arrow: {
    fontSize: 14,
    color: "#666",
  },
  content: {
    paddingHorizontal: 18,
    overflow: "hidden",
  },
  item: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555",
    marginVertical: 8,
  },
  footer: {
    marginTop: 20,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default PrivacyPolicy;
