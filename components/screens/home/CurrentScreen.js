import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';

function CurrentScreen() {
  return (
    <View style={styles.tabContent}>
      <Text>Current Screen</Text>
    </View>
  );
}

export default CurrentScreen;

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});