import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Sheet } from "./Sheet";
import { Button } from "./UI";
import { C, T } from "../theme";
export function PreferencePicker<T extends string>({visible,onClose,title,options,selected,onToggle}: {
  visible:boolean;onClose:()=>void;title:string;options:readonly {id:T;label:string;emoji:string}[];selected:readonly T[];onToggle:(id:T)=>void;
}) {
 const [query,setQuery]=useState("");
 const matches=options.filter(c=>c.label.toLowerCase().includes(query.trim().toLowerCase()));
 return <Sheet visible={visible} onClose={onClose} title={title}>
  <Text style={T.muted}>Choose as many as you like, or leave all unselected.</Text>
  <TextInput accessibilityLabel={`Search ${title.toLowerCase()}`} placeholder={`Search ${title.toLowerCase()}…`} value={query} onChangeText={setQuery} style={{borderWidth:1,borderColor:C.line,borderRadius:14,padding:15,fontSize:16,color:C.ink}} />
  <View style={[T.row,{justifyContent:"space-between"}]}><Text style={T.label}>{selected.length} selected</Text><Pressable accessibilityRole="button" onPress={()=>selected.forEach(onToggle)}><Text style={{color:C.coral}}>Clear all</Text></Pressable></View>
  <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>{matches.map(c=>{const active=selected.includes(c.id);return <Pressable key={c.id} accessibilityRole="checkbox" accessibilityLabel={c.label} accessibilityState={{checked:active}} aria-checked={active} onPress={()=>onToggle(c.id)} style={{borderWidth:1,borderColor:active?C.ink:C.line,backgroundColor:active?C.ink:C.white,padding:13,borderRadius:22}}><Text style={{fontSize:15,color:active?C.white:C.ink}}>{c.emoji} {c.label}{active?" ✓":""}</Text></Pressable>})}</View>
  {!matches.length?<Text style={T.muted}>No matches. Try another search.</Text>:null}
  <Button label="Done" onPress={onClose}/>
 </Sheet>;
}
