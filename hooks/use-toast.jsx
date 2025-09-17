import { useContext, useCallback } from "react";
import Toast from "react-native-toast-message";
import { ToastContext } from "../context/ToastContext"; // Tạo context này ở bước 3

export function useToast() {
  const { setToastConfig } = useContext(ToastContext);

  const toast = useCallback(
    (options) => {
      const {
        title,
        description,
        variant = "default",
        ...rest
      } = options || {};

      let config = {
        type: variant === "destructive" ? "error" : "success",
        text1: title,
        text2: description,
        ...rest,
      };

      // Đảm bảo các thuộc tính tùy chỉnh được truyền vào
      if (rest.position) config.position = rest.position;
      if (rest.duration) config.visibilityTime = rest.duration;
      if (rest.onPress) config.onPress = rest.onPress;

      // Hiển thị toast
      Toast.show(config);

      // Lưu cấu hình toast để có thể truy cập sau nếu cần
      if (setToastConfig) {
        setToastConfig(config);
      }
    },
    [setToastConfig]
  );

  return { toast };
}
