// import React, { useState } from "react";
// import { View, Button, Image, ActivityIndicator, Alert, Text } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { uploadToCloudinary } from "../service/cloudinary";


// export default function ImageUploader({ onUploaded }) {
//   const [imageUri, setImageUri] = useState(null);
//   const [uploading, setUploading] = useState(false);


//   const pickImage = async () => {
//     console.log("\n=== START pickImage ===");
//     try {
     
//       const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
      
//       if (permissionResult.granted === false) {
       
//         Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền truy cập thư viện ảnh");
//         return;
//       }

    
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [1, 1],
//         quality: 0.8,
//       });
      
   

//       if (result.canceled) {
        
//         return;
//       }

//       if (!result.assets || result.assets.length === 0) {
      
//         return;
//       }

//       const selectedUri = result.assets[0].uri;
      
      
//       await handleUpload(selectedUri);
      
//     } catch (error) {
      
//       Alert.alert("Lỗi", "Không thể chọn ảnh: " + error.message);
//     }
//   };

//   const handleUpload = async (uri) => {
 
    
//     try {
//       setUploading(true);
     
      
//       const uploaded = await uploadToCloudinary(uri);
     
      
//       if (uploaded && uploaded.secure_url) {
       
//         setImageUri(uploaded.secure_url);
        
//         if (onUploaded && typeof onUploaded === 'function') {
         
//           onUploaded(uploaded.secure_url);
//         } else {
//           console.log("5. No onUploaded callback provided");
//         }
        
//         Alert.alert("Thành công", "Upload ảnh thành công!");
//       } else {
//         throw new Error("Invalid upload response - no secure_url");
//       }
//     } catch (error) {
      
//       Alert.alert("Lỗi", error.message || "Không thể upload ảnh");
//     } finally {
//       setUploading(false);
     
//     }
//   };

//   return (
//     <View style={{ alignItems: "center", marginTop: 20, marginBottom: 20 }}>
   
      
//       <Button 
//         title={imageUri ? "Upload image" : "Upload image"} 
//         onPress={() => {
         
//           pickImage();
//         }}
//         disabled={uploading}
//         color="#4F46E5"
//       />
      
//       {uploading && (
//         <View style={{ marginTop: 15, alignItems: "center" }}>
//           <ActivityIndicator size="large" color="#4F46E5" />
//           <Text style={{ marginTop: 10, color: "#666" }}>Đang upload...</Text>
//         </View>
//       )}
      
//       {imageUri && !uploading && (
//         <Image
//           source={{ uri: imageUri }}
//           style={{ 
//             width: 120, 
//             height: 120, 
//             borderRadius: 60, 
//             marginTop: 15,
//             borderWidth: 3,
//             borderColor: "#4F46E5"
//           }}
//         />
//       )}
//     </View>
//   );
// }
import React, { useState } from "react";
import { View, Button, Image, ActivityIndicator, Alert, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../service/cloudinary";

export default function ImageUploader({ onUploaded, existingImage }) {
  const [imageUri, setImageUri] = useState(existingImage || null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const selectedUri = result.assets[0].uri;
      await handleUpload(selectedUri);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh: " + error.message);
    }
  };

  const handleUpload = async (uri) => {
    try {
      setUploading(true);
      const uploaded = await uploadToCloudinary(uri);
      if (uploaded?.secure_url) {
        setImageUri(uploaded.secure_url);
        onUploaded?.(uploaded.secure_url);
        Alert.alert("Thành công", "Upload ảnh thành công!");
      } else {
        throw new Error("Invalid upload response");
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ alignItems: "center", marginTop: 20, marginBottom: 20 }}>
      <Button
        title={imageUri ? "Đổi ảnh khác" : "Tải ảnh lên"}
        onPress={pickImage}
        disabled={uploading}
        color="#4F46E5"
      />

      {uploading && (
        <View style={{ marginTop: 15, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={{ marginTop: 10, color: "#666" }}>Đang upload...</Text>
        </View>
      )}

      {imageUri && !uploading && (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginTop: 15,
            borderWidth: 3,
            borderColor: "#4F46E5",
          }}
        />
      )}
    </View>
  );
}
