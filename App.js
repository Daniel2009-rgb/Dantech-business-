import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD4JhpIGPMcnO5utdJ24JkLfSma_MS1U4",
  authDomain: "dantech-business-a409c.firebaseapp.com",
  projectId: "dantech-business-a409c",
  storageBucket: "dantech-business-a409c.appspot.com",
  messagingSenderId: "436754027107",
  appId: "1:436754027107:web:f40864c0dcc1a0c8905e56"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const BEI = {
  msambazaji: { mdogo: 5000, kati: 10000, kubwa: 15000 },
  muuzaji: 1000,
  benki: { mdogo: 50000, kati: 100000, kubwa: 200000 }
};

const NAMBA_YA_LIPA = "0765 123 456"; // WEKA NAMBA YAKO
const JINA_LA_BIASHARA = "DANTECH TECH LTD";
const ADMIN_PASSWORD = "dantech123"; // BADILI PASSWORD YAKO

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [aina, setAina] = useState('');
  const [ukubwa, setUkubwa] = useState('');
  const [jina, setJina] = useState('');
  const [userId, setUserId] = useState('');
  const [wauzajiList, setWauzajiList] = useState([]);
  const [bidhaaZangu, setBidhaaZangu] = useState([]);
  const [bidhaaJina, setBidhaaJina] = useState('');
  const [bidhaaBei, setBidhaaBei] = useState('');
  const [isListening, setIsListening] = useState(false);

  // 1. TEXT TO SPEECH
  const sema = (maneno) => { try { Speech.speak(maneno, { language: 'sw-TZ', rate: 0.9 }); } catch (e) {} }

  // 2. VOICE TO TEXT
  useEffect(() => {
    Voice.onSpeechResults = (e) => { if(e.value && e.value[0]) { setJina(e.value[0]); setIsListening(false); sema("Nimesikia: " + e.value[0]); } };
    Voice.onSpeechError = () => setIsListening(false);
    return () => Voice.destroy().then(Voice.removeAllListeners);
  }, []);

  const anzaKuzungumza = async () => { try { setIsListening(true); await Voice.start('sw-TZ'); sema("Ninasikiliza"); } catch(e) { Alert.alert("Ruhusu Microphone"); setIsListening(false); } }

  // 3. KUSAJILI NA KULIPA
  const lipa = async () => {
    if(!jina) return Alert.alert("Tafadhali", "Andika jina kwanza");
    if(aina === 'muuzaji' &&!ukubwa) return Alert.alert("Tafadhali", "Chagua ukubwa wa akaunti");
    let kiasi = aina === 'muuzaji'? BEI.muuzaji : BEI[aina][ukubwa];

    Alert.alert(
      `Ada: Tsh ${kiasi.toLocaleString()}`,
      `Tuma kwa:\nNamba: ${NAMBA_YA_LIPA}\nJina: ${JINA_LA_BIASHARA}\nReference: ${jina}\n\nBaada ya kulipa bonyeza NIMELIPA`,
      [{text: "GHARIMIA", style: "cancel"},
       {text: "NIMELIPA", onPress: async () => {
        const docRef = await db.collection("watumiaji").add({
          jina, aina, ukubwa: ukubwa || 'N/A', kiasi, status: 'Imelipwa',
          tarehe: firebase.firestore.FieldValue.serverTimestamp()
        });
        setUserId(docRef.id);
        setScreen(aina === 'muuzaji'? 'muuzajiPanel' : 'dashboard');
        sema(`Karibu ${jina}. Akaunti imefunguliwa`);
       }}]
    );
  }

  // 4. CHUKUA DATA YA MSAMBAZAJI/BENKI
  useEffect(() => {
    if(screen === 'dashboard' && (aina==='msambazaji' || aina==='benki')){
      db.collection("watumiaji").where("aina", "==", "muuzaji").where("status","==","Imelipwa")
    .onSnapshot(snapshot => { setWauzajiList(snapshot.docs.map(doc => ({id: doc.id,...doc.data()}))); })
    }
  }, [screen, aina])

  // 5. CHUKUA DATA YA MUZAJI YEYE TU
  useEffect(() => {
    if(screen === 'muuzajiPanel' && userId){
      db.collection("bidhaa").where("milikia", "==", userId)
    .onSnapshot(snapshot => { setBidhaaZangu(snapshot.docs.map(doc => ({id: doc.id,...doc.data()}))); })
    }
  }, [screen, userId])

  // 6. MUZAJI ANAINGIZA BIDHAA
  const hifadhiBidhaa = async () => {
    if(!bidhaaJina ||!bidhaaBei) return Alert.alert("Jaza zote");
    await db.collection("bidhaa").add({
      milikia: userId, jinaLaMmiliki: jina, jina: bidhaaJina, bei: bidhaaBei,
      tarehe: firebase.firestore.FieldValue.serverTimestamp()
    });
    setBidhaaJina(''); setBidhaaBei(''); Alert.alert("Imehifadhiwa"); sema("Bidhaa imehifadhiwa");
  }

  // 7. ADMIN ANAINGIZA MTEJA MANUAL
  const hifadhiMtejaAdmin = async () => {
    if(!jina ||!aina) return Alert.alert("Jaza jina na aina");
    let kiasi = aina === 'muuzaji'? BEI.muuzaji : BEI[aina][ukubwa || 'mdogo'];
    await db.collection("watumiaji").add({
      jina, aina, ukubwa: ukubwa || 'N/A', kiasi, status: 'Imelipwa - Admin',
      tarehe: firebase.firestore.FieldValue.serverTimestamp()
    });
    Alert.alert("Imefanikiwa", `${jina} ameongezwa`); sema(`${jina} ameongezwa`);
    setJina(''); setAina(''); setUkubwa('');
  }

  // SCREENS
  if(screen === 'welcome') return (
    <View style={styles.container}>
      <Text style={styles.title}>DANTECH DARAJA</Text>
      <TouchableOpacity style={styles.btn} onPress={() => {setAina('msambazaji'); setScreen('login')}}><Text>Jisajili kama Msambazaji</Text></TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => {setAina('muuzaji'); setScreen('login')}}><Text>Jisajili kama Muuzaji</Text></TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => {setAina('benki'); setScreen('login')}}><Text>Jisajili kama Benki</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.btn, {backgroundColor:'black'}]} onPress={() => setScreen('adminLogin')}><Text style={{color:'#fff'}}>INGIA KAMA ADMIN</Text></TouchableOpacity>
    </View>
  );

  if(screen === 'login') return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Jisajili kama {aina.toUpperCase()}</Text>
      <View style={{flexDirection: 'row'}}>
        <TextInput style={[styles.input, {flex:1}]} placeholder="Jina la Kampuni/Duka" value={jina} onChangeText={setJina}/>
        <TouchableOpacity onPress={anzaKuzungumza} style={[styles.micBtn, {backgroundColor: isListening? 'red' : '#4CAF50'}]}><Text>🎤</Text></TouchableOpacity>
      </View>
      {aina!=='muuzaji' && <>
        <Text>Chagua Ukubwa:</Text>
        <TouchableOpacity style={[styles.btn, ukubwa==='mdogo'&&styles.active]} onPress={() => setUkubwa('mdogo')}><Text>Mdogo</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, ukubwa==='kati'&&styles.active]} onPress={() => setUkubwa('kati')}><Text>Kati</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, ukubwa==='kubwa'&&styles.active]} onPress={() => setUkubwa('kubwa')}><Text>Kubwa</Text></TouchableOpacity>
      </>}
      {aina === 'muuzaji' && <Text style={styles.bei}>Ada: Tsh {BEI.muuzaji.toLocaleString()}/mwaka</Text>}
      {aina!=='muuzaji' && ukubwa && <Text style={styles.bei}>Ada: Tsh {BEI[aina][ukubwa].toLocaleString()}/mwaka</Text>}
      <TouchableOpacity style={styles.btnLipa} onPress={lipa}><Text style={{color:'#fff', fontWeight:'bold'}}>LIPA SASA</Text></TouchableOpacity>
    </ScrollView>
  );

  if(screen === 'dashboard') return (
    <View style={styles.container}>
      <Text style={styles.title}>Karibu {jina}</Text>
      <TouchableOpacity onPress={()=>sema(`Karibu ${jina}`)} style={styles.btn}><Text>Sikiliza Salamu 🔊</Text></TouchableOpacity>
      <Text style={{fontWeight:'bold'}}>ORODHA YA WAUZAJI WALIOLIPA</Text>
      <ScrollView>
        {wauzajiList.length===0? <Text>Hakuna wauzaji bado</Text> :
        wauzajiList.map((w) => (
          <View key={w.id} style={styles.card}>
            <Text><Text style={{fontWeight:'bold'}}>Jina:</Text> {w.jina}</Text>
            <Text><Text style={{fontWeight:'bold'}}>Ukubwa:</Text> {w.ukubwa}</Text>
            <TouchableOpacity onPress={()=>Alert.alert("Wasiliana", `Piga ${w.jina}`)} style={styles.btn}><Text>Wasiliana</Text></TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  if(screen === 'muuzajiPanel') return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Karibu {jina}</Text>
      <TouchableOpacity onPress={()=>sema(`Karibu ${jina}`)} style={styles.btn}><Text>Sikiliza Salamu 🔊</Text></TouchableOpacity>
      <Text style={{fontWeight:'bold'}}>Ingiza Bidhaa Yako</Text>
      <TextInput style={styles.input} placeholder="Jina la Bidhaa" value={bidhaaJina} onChangeText={setBidhaaJina}/>
      <TextInput style={styles.input} placeholder="Bei Tsh" keyboardType="numeric" value={bidhaaBei} onChangeText={setBidhaaBei}/>
      <TouchableOpacity style={styles.btnLipa} onPress={hifadhiBidhaa}><Text style={{color:'#fff', fontWeight:'bold'}}>HIFADHI BIDHAA</Text></TouchableOpacity>
      <Text style={{fontWeight:'bold', marginTop:20}}>BIDHAA ZANGU</Text>
      {bidhaaZangu.map((b) => (<View key={b.id} style={styles.card}><Text>{b.jina} - Tsh {b.bei}</Text></View>))}
    </ScrollView>
  );

  if(screen === 'adminLogin') return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>
      <TextInput style={styles.input} placeholder="Weka Password" secureTextEntry onChangeText={(pass)=>{ if(pass===ADMIN_PASSWORD) setScreen('adminPanel') }}/>
      <Text>Password: {ADMIN_PASSWORD}</Text>
    </View>
  );

  if(screen === 'adminPanel') return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>PANEL YA ADMIN</Text>
      <TextInput style={styles.input} placeholder="Jina la Mteja" value={jina} onChangeText={setJina}/>
      <Text>Chagua Aina:</Text>
      <TouchableOpacity style={[styles.btn, aina==='msambazaji'&&styles.active]} onPress={() => setAina('msambazaji')}><Text>Msambazaji</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.btn, aina==='muuzaji'&&styles.active]} onPress={() => setAina('muuzaji')}><Text>Muuzaji</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.btn, aina==='benki'&&styles.active]} onPress={() => setAina('benki')}><Text>Benki</Text></TouchableOpacity>
      {aina!=='muuzaji' && <>
        <Text>Chagua Ukubwa:</Text>
        <TouchableOpacity style={[styles.btn, ukubwa==='mdogo'&&styles.active]} onPress={() => setUkubwa('mdogo')}><Text>Mdogo</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, ukubwa==='kati'&&styles.active]} onPress={() => setUkubwa('kati')}><Text>Kati</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, ukubwa==='kubwa'&&styles.active]} onPress={() => setUkubwa('kubwa')}><Text>Kubwa</Text></TouchableOpacity>
      </>}
      <TouchableOpacity style={styles.btnLipa} onPress={hifadhiMtejaAdmin}><Text style={{color:'#fff', fontWeight:'bold'}}>HIFADHI MTEJA</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, padding:20, paddingTop:60, backgroundColor:'#F5F5F5'},
  title: {fontSize:22, fontWeight:'bold', textAlign:'center', marginBottom:15},
  btn: {backgroundColor:'#E0E0E0', padding:15, marginVertical:8, borderRadius:10, alignItems:'center'},
  active: {backgroundColor:'#4CAF50'},
  btnLipa: {backgroundColor:'#2196F3', padding:18, marginVertical:20, borderRadius:10, alignItems:'center'},
  input: {borderWidth:1, borderColor:'#ccc', padding:12, marginVertical:10, borderRadius:8, backgroundColor:'#fff'},
  micBtn: {padding:12, borderRadius:50, marginLeft:5, justifyContent:'center'},
  bei: {fontSize:18, fontWeight:'bold', textAlign:'center', margin:10, color:'green'},
  card: {backgroundColor:'#fff', padding:15, marginVertical:8, borderRadius:10, elevation:2}
});
