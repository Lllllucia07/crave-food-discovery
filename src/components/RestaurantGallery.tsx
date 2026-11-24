import React, {useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import type {Place} from '../model';
import {C, T} from '../theme';
import {RestaurantPhoto} from './RestaurantPhoto';
import {Button, Icon} from './UI';

export function RestaurantGallery({place, open}: {place: Place; open: (url?: string) => void}) {
  const [index, setIndex] = useState(0);
  const photos = place.photos || (place.photoName ? [{name:place.photoName, authors:place.photoAuthors || [], mapsUrl:undefined}] : []);
  const current = Math.min(index, Math.max(0, photos.length - 1));
  const selected = photos[current];
  return <View style={{gap:16}}>
    <View style={{gap:7}}>
      <Text style={T.heading}>A closer look</Text>
      <Text style={T.muted}>Photos shared on Google Maps. Food, spaces, and sometimes menus — availability varies.</Text>
    </View>
    {selected ? <>
      <RestaurantPhoto place={{...place, photoName:selected.name, photoAuthors:selected.authors}} contain style={{height:300,borderRadius:16}}/>
      <View style={[T.row,{justifyContent:'space-between',gap:10}]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous photo" disabled={current === 0} onPress={()=>setIndex(current-1)} style={{padding:12,backgroundColor:C.pale,borderRadius:12,opacity:current===0?.35:1}}><Icon name="chevron-left"/></Pressable>
        <Text accessibilityLiveRegion="polite" style={T.label}>Photo {current+1} of {photos.length}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Next photo" disabled={current === photos.length-1} onPress={()=>setIndex(current+1)} style={{padding:12,backgroundColor:C.pale,borderRadius:12,opacity:current===photos.length-1?.35:1}}><Icon name="chevron-right"/></Pressable>
      </View>
      {selected.mapsUrl ? <Button label="Open this photo on Google Maps" secondary icon="external-link" onPress={()=>open(selected.mapsUrl)}/> : null}
    </> : <Text style={T.body}>Photos are not available inside Crave for this restaurant yet.</Text>}
    {place.photosUrl || place.mapsUrl ? <Button label="See all photos on Google Maps" secondary icon="external-link" onPress={()=>open(place.photosUrl || place.mapsUrl)}/> : null}
    <Text style={T.muted}>Google provides up to 10 photos here. Menu photos may be older; confirm current prices with the restaurant.</Text>
  </View>;
}
