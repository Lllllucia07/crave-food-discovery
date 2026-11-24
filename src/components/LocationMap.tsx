import React from 'react';
import MapView,{Marker} from 'react-native-maps';
import type {SearchLocation} from '../location';
export default function LocationMap({location,onPick}:{location:SearchLocation;onPick:(p:SearchLocation)=>void}) {
 const pick=(latitude:number,longitude:number)=>onPick({lat:latitude,lng:longitude,label:'Dropped pin'});
 return <MapView accessibilityLabel="Choose your search location on the map" style={{height:280,borderRadius:16}} region={{latitude:location.lat,longitude:location.lng,latitudeDelta:.035,longitudeDelta:.035}} onPress={e=>pick(e.nativeEvent.coordinate.latitude,e.nativeEvent.coordinate.longitude)}><Marker coordinate={{latitude:location.lat,longitude:location.lng}} draggable title="Your search location" pinColor="#F15C45" onDragEnd={e=>pick(e.nativeEvent.coordinate.latitude,e.nativeEvent.coordinate.longitude)}/></MapView>;
}
