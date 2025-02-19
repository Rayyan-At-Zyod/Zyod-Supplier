import React from "react";
import { View, Image, TouchableOpacity, Text, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { rmStyles } from "../styles/AddRM.styles";

function MainImageSection({
  mainImage,
  showImageModal,
  setShowImageModal,
  uploadImage,
  removeImage,
  openImageModal
}) {
  return (
    <>
      {/* Image Selection Modal */}
      <Modal
        transparent={true}
        visible={showImageModal}
        animationType="slide"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={rmStyles.modalOverlay}>
          <TouchableOpacity
            style={rmStyles.modalBackground}
            onPress={() => setShowImageModal(false)}
          />
          <View style={rmStyles.modalContainer}>
            <Text style={rmStyles.modalTitle}>Select an image</Text>

            <TouchableOpacity
              style={rmStyles.modalOption}
              onPress={() => uploadImage()}
            >
              <Text style={rmStyles.modalOptionText}>Upload from Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={rmStyles.modalOption}
              onPress={() => uploadImage("gallery")}
            >
              <Text style={rmStyles.modalOptionText}>Upload from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={rmStyles.modalOption}
              onPress={removeImage}
            >
              <Text style={rmStyles.modalOptionText}>Remove image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default MainImageSection;
