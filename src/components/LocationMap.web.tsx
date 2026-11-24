import React,{useEffect,useRef,useState} from 'react';
import {Text,View} from 'react-native';
import type {Map as LeafletMap,Marker} from 'leaflet';
import type {SearchLocation} from '../location';
import {C,T} from '../theme';
import './leaflet.css';
export default function LocationMap({location,onPick}:{location:SearchLocation;onPick:(p:SearchLocation)=>void}) {
 const container=useRef<HTMLDivElement>(null),map=useRef<LeafletMap|null>(null),marker=useRef<Marker|null>(null),callback=useRef(onPick);
 const latest=useRef(location);latest.current=location;
 callback.current=onPick;const [error,setError]=useState('');
 useEffect(()=>{
  let cancelled=false;
  import('leaflet').then(L=>{
   if(cancelled||!container.current)return;
   const instance=L.map(container.current,{scrollWheelZoom:false,zoomControl:false}).setView([latest.current.lat,latest.current.lng],13);map.current=instance;
   L.control.zoom({zoomInTitle:'Zoom in',zoomOutTitle:'Zoom out'}).addTo(instance);
   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'}).on('tileerror',()=>setError('Map tiles are unavailable. Search for a place instead.')).addTo(instance);
   const icon=L.divIcon({className:'crave-location-pin',html:'<span style="display:block;width:22px;height:22px;border:4px solid white;border-radius:50%;background:#F15C45;box-shadow:0 2px 8px #35172866"></span>',iconSize:[30,30],iconAnchor:[15,15]});
   const pin=L.marker([latest.current.lat,latest.current.lng],{icon,draggable:true,title:'Your search location',alt:'Your search location'}).addTo(instance);marker.current=pin;
   const pick=(lat:number,lng:number)=>callback.current({lat,lng,label:'Dropped pin'});
   instance.on('click',e=>pick(e.latlng.lat,e.latlng.lng));pin.on('dragend',()=>{const p=pin.getLatLng();pick(p.lat,p.lng)});
  }).catch(()=>setError('The map could not load. Search for a place instead.'));
  return()=>{cancelled=true;map.current?.remove();map.current=null;marker.current=null};
 },[]);
 useEffect(()=>{marker.current?.setLatLng([location.lat,location.lng]);map.current?.panTo([location.lat,location.lng],{animate:false});},[location.lat,location.lng]);
 return <View style={{gap:8}}><div ref={container} role="region" aria-label="Choose your search location on the map" style={{height:280,width:'100%',borderRadius:16,zIndex:0,background:C.pale}}/><Text style={[T.muted,{fontSize:12}]}>{error||'Tap the map or drag the pin. Search is also available above.'}</Text></View>;
}
