import React from "react";
import { Image, View } from "react-native";
/** Official, unmodified Google Maps attribution asset, displayed at 18dp high. */
export function GoogleAttribution() {
 return <View style={{paddingTop:10,paddingHorizontal:10,paddingBottom:5,alignSelf:"flex-start"}}><Image source={require("../../assets/google-maps.png")} accessibilityLabel="Google Maps" style={{width:98,height:18}} resizeMode="contain"/></View>;
}
