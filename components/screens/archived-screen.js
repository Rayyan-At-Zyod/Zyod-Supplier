import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';

function ArchivedScreen() {
  return (
    <View style={styles.tabContent}>
      <Text>Archived Screen</Text>
    </View>
  );
}

export default ArchivedScreen;

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});