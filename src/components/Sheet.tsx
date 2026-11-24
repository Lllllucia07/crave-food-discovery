import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { C, T } from "../theme";
import { Icon } from "./UI";
export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const mobile = useWindowDimensions().width < 780;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#20101BCC",
          justifyContent: mobile ? "flex-end" : "center",
          padding: mobile ? 0 : 32,
        }}
      >
        <Pressable
          accessibilityLabel="Close dialog"
          accessibilityRole="button"
          onPress={onClose}
          style={{ position: "absolute", inset: 0 }}
        />
        <View
          accessibilityViewIsModal
          style={{
            width: "100%",
            maxWidth: 620,
            maxHeight: "94%",
            alignSelf: "center",
            backgroundColor: C.white,
            borderRadius: mobile ? 24 : 26,
            overflow: "hidden",
          }}
        >
          <View
            style={[
              T.row,
              {
                paddingHorizontal: 24,
                paddingVertical: 18,
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderColor: C.line,
              },
            ]}
          >
            <Text style={T.label}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={{ padding: 9, borderRadius: 22, backgroundColor: C.pale }}
            >
              <Icon name="x" size={20} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={{ padding: 24, paddingBottom: 32, gap: 20 }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
