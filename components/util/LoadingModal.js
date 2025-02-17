import React, { useEffect } from "react";
import { Modal, View, StyleSheet, Animated, Easing } from "react-native";

const LoadingModal = ({ visible }) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          // Circle to Square
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          // Square to Circle
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [visible]);

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
    <Modal transparent visible={visible}>
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
