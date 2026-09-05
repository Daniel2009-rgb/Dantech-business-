import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import * as Speech from 'expo-speech';

// FIREBASE V10 COMPAT
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD4JHplGPCMmoG5utdJZ4JkLfsma_MSiU4",
  authDomain: "dantech-business-a409c.firebaseapp.com",
  projectId: "dantech-business-a409c",
  storageBucket: "dantech-business-a409c.appspot.com",
  messagingSenderId: "436754027107",
  appId: "1:436754027107:web:f40864c0dcc1a0c8905e56"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// BEI ZA SUBSCRIPTION
const BEI = {
  msambazaji: { mdogo: 5000, kati: 10000, kubwa: 15000 },
  muuzaji: 1000,
  benki: { ndogo: 50000, kati: 100000, kubwa: 200000 }
};

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [aina, setAina] = useState('');
  const [ukubwa, setUkubwa] = useState('');
  const [jina, setJina] = useState('');
  const [data, setData] = useState([]);

  const sema = (maneno) => Speech.speak(maneno, { language: 'sw-TZ' });

  const lipa = async () => {
    if(!jina) return Alert.alert("Tafadhali", "Andika jina kwanza");
    if(aina!== 'muuzaji' &&!ukubwa) return Alert.alert("Tafadhali", "Chagua ukubwa kwanza");

    let kiasi = 0;
    if(aina === 'muuzaji') kiasi = BEI.muuzaji;
    else kiasi = BEI[aina][ukubwa];

    try {
      await db.collection("watumiaji").add({
        jina, aina, ukubwa: ukubwa || 'N/A', kiasi,
        tarehe: firebase.firestore.FieldValue.serverTimestamp()
      });
      Alert.alert("Malipo Yamefanikiwa", `Umelipa Tsh ${kiasi.toLocaleString()}`);
      setScreen('dashboard');
      sema(`Karibu ${jina}. Akaunti yako imefunguliwa`);
    } catch (e) {
      Alert.alert("Error", "Imeshindikana kuhifadhi. Angalia internet")
    }
  }

  useEffect(() => {
    const chukuaData = async () => {
      let ref = db.collection("watumiaji");
      if(aina === 'benki') ref = ref.where("aina", "==", "muuzaji");
      if(aina === 'muuzaji') ref = ref.where("jina", "==", jina);
      const snapshot = await ref.get();
      setData(snapshot.docs.map(doc => doc.data()));
    };
    if(screen === 'dashboard') chukuaData();
  }, [screen, aina, jina])

  if(screen === 'welcome') return (
    <View style={styles.container}>
      <Text style={styles.title}>DANTECH DARAJA</Text>
      <TouchableOpacity style={styles.btn} onPress={() => {setAina('msambazaji'); setScreen('login')}}><Text>Mimi ni Msambazaji</Text></TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => {setAina('muuzaji'); setScreen('login')}}><Text>Mimi ni Muuzaji</Text></TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => {setAina('benki'); setScreen('login')}}><Text>Mimi ni Benki</Text></TouchableOpacity>
    </View>
  )

  if(screen === 'login') return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Jisajili kama {aina.toUpperCase()}</Text>
      <TextInput placeholder="Andika Jina la Kampuni/Duka" style={styles.input} onChangeText={setJina} value={jina}/>
      {aina!== 'muuzaji' && (
        <View>
          <Text>Chagua Ukubwa wa Akaunti:</Text>
          <TouchableOpacity style={styles.btn} onPress={()=>setUkubwa('mdogo')}><Text>Mdogo: Tsh {BEI[aina].mdogo.toLocaleString()}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={()=>setUkubwa('kati')}><Text>Kati: Tsh {BEI[aina].kati.toLocaleString()}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={()=>setUkubwa('kubwa')}><Text>Kubwa: Tsh {BEI[aina].kubwa.toLocaleString()}</Text></TouchableOpacity>
        </View>
      )}
      {aina === 'muuzaji' && <Text>Ada: Tsh {BEI.muuzaji.toLocaleString()} /mwezi</Text>}
      <TouchableOpacity style={styles.btnLipa} onPress={lipa}><Text style={{color:'white'}}>LIPA NA UANZE</Text></TouchableOpacity>
    </ScrollView>
  )

  if(screen === 'dashboard') return (
    <View style={styles.container}>
      <Text style={styles.title}>Karibu {jina}</Text>
      <ScrollView>{data.map((d,i)=> (<View key={i} style={styles.card}><Text>{d.jina} - Tsh {d.kiasi}</Text></View>))}</ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {flex:1, padding:20, paddingTop:60, backgroundColor:'#F5F5F5'},
  title: {fontSize:24, fontWeight:'bold', textAlign:'center', marginBottom:20, color:'#004AAD'},
  btn: {backgroundColor:'#fff', padding:15, margin:10, borderRadius:10, alignItems:'center', borderWidth:1},
  btnLipa: {backgroundColor:'green', padding:18, margin:20, borderRadius:10, alignItems:'center'},
  input: {borderWidth:1, padding:12, margin:10, borderRadius:8, backgroundColor:'#fff'},
  card: {backgroundColor:'#fff', padding:10, margin:5, borderRadius:8}
});