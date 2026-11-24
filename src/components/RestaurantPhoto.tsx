import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Linking, Platform, Pressable, Text, View, type StyleProp, type ViewStyle} from 'react-native';
import type {Place} from '../model';
import {foodSource} from '../assets';
import {restaurantPhoto} from '../backend';
import {C} from '../theme';
import {FoodImage, Icon} from './UI';

export function RestaurantPhoto({place,style,compact=false,contain=false}: {place:Place;style?:StyleProp<ViewStyle>;compact?:boolean;contain?:boolean}) {
  const ref = useRef<React.ElementRef<typeof View>>(null);
  const [visible,setVisible] = useState(Platform.OS !== 'web');
  const [photo,setPhoto] = useState<{name:string;uri:string}|null>(null);
  const [failure,setFailure] = useState<{name:string;message:string}|null>(null);
  const [loaded,setLoaded] = useState('');
  const [attempt,setAttempt] = useState(0);
  const retryRequested = useRef(false);
  const name = place.photoName || '';
  const live = !place.id.startsWith('demo-');
  useEffect(()=>{
    if (Platform.OS !== 'web' || typeof IntersectionObserver === 'undefined') {setVisible(true);return;}
    const node = ref.current as unknown as Element;
    if (!node) return;
    const observer = new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect();}
    },{rootMargin:'100px'});
    observer.observe(node);
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    let alive=true;
    if(!visible || !name) return;
    setFailure(null);
    setLoaded('');
    const retry = retryRequested.current;
    retryRequested.current = false;
    restaurantPhoto(place,retry).then(uri=>{
      if(alive) setPhoto({name,uri});
    }).catch(error=>{
      if(alive) setFailure({name,message:error instanceof Error ? error.message : 'The photo couldn’t be loaded. Please try again.'});
    });
    return ()=>{alive=false;};
  },[visible,name,attempt]);
  const current = photo?.name === name && photo ? photo : null;
  const error = failure?.name === name ? failure.message : '';
  const uri = current?.uri || foodSource(place);
  const loading = live && visible && !!name && !error && (!current || loaded !== current.uri);
  useEffect(()=>{
    if(!loading) return;
    const timeout = setTimeout(()=>setFailure({name,message:'This photo is taking too long to load. Please try again.'}),20000);
    return ()=>clearTimeout(timeout);
  },[loading,name,current?.uri]);
  return <View ref={ref} style={compact ? {width:88,gap:4}:{gap:5}}>
    <View style={[{overflow:'hidden',backgroundColor:C.pink},style]}>
      <FoodImage key={`${typeof uri==='string'?uri:place.id}-${attempt}`} contain={contain} uri={uri} label={live?`${place.name} restaurant photo`:`${place.name} illustrative photo`} style={{width:'100%',height:'100%'}} onLoad={()=>{if(current)setLoaded(current.uri);}} onError={()=>setFailure({name,message:'The image couldn’t be displayed. Please try again.'})}/>
      {loading ? <View accessibilityLiveRegion="polite" style={{position:'absolute',inset:0,alignItems:'center',justifyContent:'center',backgroundColor:C.pink,gap:12,padding:compact?5:18}}>
        <ActivityIndicator accessibilityLabel="Loading restaurant photo" color={C.coral}/>
        <Text style={{color:C.muted,fontSize:compact?11:14,textAlign:'center'}}>Loading photo…</Text>
      </View>:null}
      {live && error ? <View style={{position:'absolute',inset:0,alignItems:'center',justifyContent:'center',backgroundColor:C.pink,gap:12,padding:compact?4:18}}>
        {!compact?<Text accessibilityLiveRegion="polite" style={{fontSize:14,color:C.muted,textAlign:'center',lineHeight:21}}>{error}</Text>:<Icon name="image" color={C.muted}/>}
        <Pressable accessibilityRole="button" accessibilityLabel={`Retry photo for ${place.name}`} onPress={()=>{retryRequested.current=true;setFailure(null);setPhoto(null);setAttempt(a=>a+1);}} style={{backgroundColor:C.white,padding:compact?6:12,borderRadius:10}}><Text style={{color:C.coral,fontSize:compact?11:14,fontWeight:'600'}}>Retry photo</Text></Pressable>
      </View>:null}
    </View>
    {live && current && !error ? (place.photoAuthors||[]).map((a,i)=><Text key={`${a.name}-${i}`} accessibilityRole={a.url?'link':undefined} onPress={a.url?.startsWith('https://')?()=>Linking.openURL(a.url!):undefined} style={{color:C.muted,fontSize:compact?10:11,paddingHorizontal:compact?0:12}}>Photo: {a.name}</Text>):null}
    {live && !name ? <Text style={{color:C.muted,fontSize:11,paddingHorizontal:compact?0:12}}>No photo supplied by Google Maps</Text>:null}
  </View>;
}
