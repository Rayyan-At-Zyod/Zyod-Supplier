import * as ImagePicker from 'expo-image-picker';

export const useImagePicker = async ({ mode = 'camera' }) => {
  try {
    let result = {};
    
    if (mode === 'gallery') {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    } else {
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    }

    if (!result.canceled) {
      return { uri: result.assets[0].uri, error: null };
    }
    
    return { uri: null, error: null };
  } catch (error) {
    return { uri: null, error: error.message };
  }
}; 