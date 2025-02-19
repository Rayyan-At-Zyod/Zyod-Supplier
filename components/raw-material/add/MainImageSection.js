import React from 'react';
import { View, Image, TouchableOpacity, Text, Modal } from 'react-native';
import { StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

function MainImageSection({ image, onImageSelect, showModal, setShowModal, onCameraSelect, onGallerySelect, onRemoveImage }) {
  return (
    <>
      <TouchableOpacity
        style={styles.imagePlaceholder}
        onPress={() => setShowModal(true)}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.mainImage} />
        ) : (
          <Text style={styles.imagePlaceholderText}>
            Click To Upload Product Image
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setShowModal(false)}
          />
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select an image</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={onCameraSelect}
            >
              <Text style={styles.modalOptionText}>Upload from Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={onGallerySelect}
            >
              <Text style={styles.modalOptionText}>Upload from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={onRemoveImage}
            >
              <Text style={styles.modalOptionText}>Remove image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  imagePlaceholder: {
    height: 200,
    backgroundColor: "#FFFACD",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  imagePlaceholderText: {
    color: "#555",
  },
  mainImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  modalOptionText: {
    fontSize: 16,
  },
});

export default MainImageSection; 