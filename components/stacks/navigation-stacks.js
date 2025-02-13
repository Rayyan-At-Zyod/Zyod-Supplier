import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const NavigationStacks = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen} options={{
                    // headerShown: false,
                }} />
                <Stack.Screen name="Lists" component={ListsScreen} options={({ route }) => ({
                    title: route.params.boardName || 'Lists',
                    headerTitle: `Lists-${route.params.boardName}`,
                    headerRight: () => (
                        <View style={styles.flexRow}>
                            {/* filter */}
                            <Pressable onPress={() => MyGluestackAlert('Filter pressed!')}>
                                <Text style={{ color: '#fff', fontSize: 20 }}>🧹</Text>
                            </Pressable>
                            {/* notif */}
                            <Pressable onPress={() => MyGluestackAlert('Notifications pressed!')} style={{ marginLeft: 16 }}>
                                <Text style={{ color: '#fff', fontSize: 20 }}>🔔</Text>
                            </Pressable>
                            {/* Menu 3 dots */}
                            <Pressable onPress={() => MyGluestackAlert('Board Menu pressed!')} style={{ marginLeft: 16 }}>
                                <Text style={{ color: '#fff', fontSize: 20 }}>⋯</Text>
                            </Pressable>
                        </View>
                    ),
                })} />
                <Stack.Screen name="Card" component={CardScreen} options={({ route }) => ({
                    title: route.params.cardName || 'Card',
                    headerTitle: `Card-${route.params.cardName}`,
                    headerRight: () => (
                        <View style={styles.flexRow}>
                            {/* Options icon 3 dots horizontal */}
                            <Pressable onPress={() => MyGluestackAlert('Options pressed!')}>
                                <Text style={{ color: '#fff', fontSize: 20 }}>⋯</Text>
                            </Pressable>
                        </View>
                    ),
                })} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default NavigationStacks
