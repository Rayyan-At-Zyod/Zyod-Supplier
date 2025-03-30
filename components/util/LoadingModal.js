import React, { useEffect } from "react";
import { Modal, View, StyleSheet, Animated, Easing, Text } from "react-native";
import { useSelector } from "react-redux";

const LoadingModal = () => {
  const animatedValue = new Animated.Value(0);
  const syncing = useSelector((state) => state.rawMaterials.syncing);
  const loading = useSelector((state) => state.rawMaterials.loading);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [loading, syncing]);

  const size = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 40],
  });

  const borderRadius = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  const rotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-180deg"],
  });

  return (
    <Modal transparent visible={loading}>
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Animated.View
            style={[
              styles.animatedShape,
              {
                width: size,
                height: size,
                borderRadius: borderRadius,
                transform: [{ rotate: rotation }],
              },
            ]}
          />
        </View>
        {syncing && (
          <Text style={styles.syncText}>
            Syncing... {"\n"}Please keep app on the screen. {"\n"}✨ This may
            take a while... ✨
          </Text>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  syncText: {
    color: "black",
    backgroundColor: "white",
    padding: 4,
    marginVertical: 2,
    borderRadius: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  animatedShape: {
    backgroundColor: "black",
  },
});

export default LoadingModal;
