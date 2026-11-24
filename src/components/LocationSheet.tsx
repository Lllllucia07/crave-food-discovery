import React,{useEffect,useRef,useState} from 'react';
import {Linking,Pressable,Text,TextInput,View} from 'react-native';
import * as Location from 'expo-location';
import {useCrave} from '../store';
import {supabase} from '../backend';
import {searchLocations,suggestedLocations,type SearchLocation} from '../location';
import {C,T} from '../theme';
import {Button,Icon} from './UI';
import {Sheet} from './Sheet';
import LocationMap from './LocationMap';
export function LocationSheet({visible,onClose}:{visible:boolean;onClose:()=>void}) {
 const s=useCrave(),[draft,setDraft]=useState(s.location),[query,setQuery]=useState(''),[results,setResults]=useState<SearchLocation[]>([]),[busy,setBusy]=useState(false),[locating,setLocating]=useState(false),[error,setError]=useState(''),[searched,setSearched]=useState(false),[showMap,setShowMap]=useState(false);
 const controller=useRef<AbortController|null>(null),generation=useRef(0);
 useEffect(()=>{generation.current++;controller.current?.abort();if(visible){setDraft(s.location);setQuery('');setResults([]);setError('');setSearched(false);setShowMap(false);setBusy(false);setLocating(false)}return()=>{generation.current++;controller.current?.abort()}},[visible]);
 async function search(){
  if(query.trim().length<2||busy)return;
  const token=generation.current;controller.current?.abort();const c=new AbortController();controller.current=c;setBusy(true);setError('');setResults([]);setSearched(false);
  const timeout=setTimeout(()=>c.abort(),12000);
  try {const places=await searchLocations(query,c.signal);if(token===generation.current && controller.current===c){setResults(places);setSearched(true)}}
  catch {if(token===generation.current && controller.current===c)setError('Could not search for places. Try again, choose a suggested place, or use the map.');}
  finally {clearTimeout(timeout);if(token===generation.current && controller.current===c)setBusy(false)}
 }
 async function locate(){
  const token=generation.current;setLocating(true);setError('');
  try {
   const permission=await Location.requestForegroundPermissionsAsync();
   if(permission.status!=='granted')throw Error('Location access is off. Search for a place or choose on the map.');
   const p=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
   if(token===generation.current)setDraft({lat:p.coords.latitude,lng:p.coords.longitude,label:'Near me'});
  } catch(e){if(token===generation.current)setError(e instanceof Error?e.message:'Could not find your location. Try searching instead.')}
  finally{if(token===generation.current)setLocating(false)}
 }
 return <Sheet visible={visible} onClose={onClose} title="Your location">
  <Text style={T.title}>Where’s your next bite?</Text>
  <Text style={T.body}>Choose a city, neighborhood, address, or a spot on the map.</Text>
  <Button label="Use my location" icon="navigation" secondary loading={locating} onPress={locate}/>
  <View style={{gap:10}}>
   <Text style={T.label}>Search location</Text>
   <TextInput accessibilityLabel="City, neighborhood or address" placeholder="City, neighborhood or address" value={query} onChangeText={text=>{controller.current?.abort();controller.current=null;setBusy(false);setError('');setQuery(text);setResults([]);setSearched(false)}} onSubmitEditing={search} returnKeyType="search" style={{padding:15,borderWidth:1,borderColor:C.line,borderRadius:14,fontSize:16,color:C.ink}}/>
   <Button label="Search places" icon="search" loading={busy} disabled={query.trim().length<2} onPress={search}/>
   <Text style={{fontSize:12,lineHeight:18,color:C.muted}}>Search text is sent to Photon. Your location is saved only on this device.</Text>
  </View>
  {error?<Text accessibilityRole="alert" style={{color:C.coral,fontSize:14,lineHeight:21}}>{error}</Text>:null}
  <View style={{gap:8}}>{results.map((p,i)=><Pressable key={`${p.lat}-${p.lng}-${i}`} accessibilityRole="button" accessibilityLabel={`Select ${p.label}`} onPress={()=>{setDraft(p);setResults([]);setSearched(false)}} style={{padding:14,borderRadius:14,borderWidth:1,borderColor:C.line,flexDirection:'row',gap:10}}><Icon name="map-pin" size={18}/><Text style={{flex:1,fontSize:15,lineHeight:22,color:C.ink}}>{p.label}</Text></Pressable>)}{searched&&!results.length?<Text style={T.muted}>No places found. Try adding a city or country.</Text>:null}</View>
  <View style={{gap:10}}><Text style={T.label}>Suggested places</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{suggestedLocations.map(p=><Pressable key={p.label} accessibilityRole="button" accessibilityLabel={`Choose ${p.label}`} onPress={()=>setDraft(p)} style={{padding:11,borderRadius:20,backgroundColor:C.pink}}><Text style={{fontSize:14,color:C.ink}}>{p.label}</Text></Pressable>)}</View></View>
  <Button label={showMap?'Hide map':'Choose on map'} secondary icon="map" onPress={()=>setShowMap(v=>!v)}/>
  {showMap?<LocationMap location={draft} onPick={setDraft}/>:null}
  <View style={{gap:7,padding:17,borderRadius:16,backgroundColor:C.pink}}><Text style={{fontSize:12,color:C.muted,fontWeight:'600'}}>SEARCH CENTER</Text><Text style={T.label}>{draft.label}</Text><Text style={T.muted}>{draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}</Text></View>
  {!supabase?<Text style={{fontSize:14,lineHeight:21,color:C.muted}}>Demo restaurants are located around East Village, NYC. Other areas may have no demo results. Live restaurant discovery is not connected yet.</Text>:null}
  <Button label="Use this location" onPress={()=>{s.setLocation(draft);onClose()}}/>
  <Text style={{fontSize:12,color:C.muted}} onPress={()=>Linking.openURL('https://www.openstreetmap.org/copyright')}>Place search: Photon · © OpenStreetMap contributors</Text>
 </Sheet>;
}
