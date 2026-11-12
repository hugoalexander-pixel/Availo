import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Room } from './src/features/rooms/data';
import { RoomSearchCriteria } from './src/features/room-search/data/roomSearchRepository';
import { RoomSearchStateView } from './src/features/room-search/components/RoomSearchStateView';
import { useRoomSearch } from './src/features/room-search/state/RoomSearchProvider';
import { BookingForm } from './src/features/bookings/components/BookingForm';
import { useBooking } from './src/features/bookings/state/BookingProvider';
import { usePrototypeStore } from './src/state/PrototypeStore';
import { getThemeColors } from './src/theme';

const green = '#28583f';
const muted = '#7a867c';

function SmallLabel({ children }: { children: string }) {
  const { isDark } = usePrototypeStore();
  const theme = getThemeColors(isDark);
  return <Text style={[styles.smallLabel, { color: theme.subtle }]}>{children}</Text>;
}

function Choice({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const { isDark } = usePrototypeStore();
  const theme = getThemeColors(isDark);
  return (
    <Pressable style={[styles.choice, { backgroundColor: theme.input, borderColor: theme.border }]} onPress={onPress}>
      <Text style={[styles.choiceLabel, { color: theme.subtle }]}>{label}</Text>
      <Text style={[styles.choiceValue, { color: theme.text }]}>{value}  <Text style={[styles.down, { color: theme.muted }]}>⌄</Text></Text>
    </Pressable>
  );
}

function RoomCard({ room, onBook, saved, onSave, timeRange }: {
  room: Room; onBook: (room: Room) => void; saved: boolean; onSave: (id: number) => void; timeRange: string;
}) {
  const { isDark } = usePrototypeStore();
  const theme = getThemeColors(isDark);
  return (
    <View style={[styles.roomCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.roomArt, { backgroundColor: room.color }]}>
        <View style={styles.artBackdropCircle} />
        <View style={styles.roomTypeBadge}>
          <Text style={styles.roomTypeIcon}>{room.mark}</Text>
          <Text style={styles.roomTypeText}>{room.type}</Text>
        </View>
        <Pressable
          style={styles.saveButton}
          onPress={() => onSave(room.id)}
          accessibilityLabel="Simpan ruang"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.saveIcon, saved && styles.savedIcon]}>{saved ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
      <View style={styles.roomDetails}>
        <View style={styles.roomTitleLine}>
          <Text numberOfLines={1} style={[styles.roomTitle, { color: theme.text }]}>{room.name}</Text>
          <View style={[styles.statusPill, { backgroundColor: theme.primarySoft }]}>
            <View style={[styles.statusDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.available, { color: theme.primary }]}>Tersedia</Text>
          </View>
        </View>
        <Text style={[styles.location, { color: theme.muted }]}>⌖  {room.building} · {room.floor}</Text>
        <View style={styles.roomInfoLine}>
          <Text style={[styles.roomInfo, { color: theme.muted }]}>♙  Maks. {room.capacity} orang</Text>
          <Text style={[styles.roomInfo, { color: theme.muted }]}>◷  {timeRange}</Text>
        </View>
        <View style={styles.amenities}>
          {room.amenities.map((item) => (
            <Text key={item} style={[styles.amenity, { color: theme.muted, backgroundColor: theme.surfaceSecondary }]}>
              {item}
            </Text>
          ))}
        </View>
        <Pressable style={styles.bookButton} onPress={() => onBook(room)}>
          <Text style={styles.bookButtonText}>Pesan ruang  →</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function App() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const { savedRoomIds, toggleSaved, isDark, userProfile } = usePrototypeStore();
  const { state: searchState, search, retry } = useRoomSearch();
  const { reset: resetBooking } = useBooking();
  const theme = getThemeColors(isDark);
  const criteria = searchState.criteria;
  const people = criteria.people;
  const startHour = Number(criteria.startTime.slice(0, 2));
  const endHour = Number(criteria.endTime.slice(0, 2));

  const choosePeople = () => {
    const nextPeople = people === 4 ? 6 : people === 6 ? 8 : 4;
    void search({ ...criteria, people: nextPeople });
  };
  const chooseStart = () => {
    const nextStart = startHour >= 15 ? 9 : startHour + 2;
    const nextEnd = endHour <= nextStart ? nextStart + 1 : endHour;
    void search({ ...criteria, startTime: `${String(nextStart).padStart(2, '0')}:00`, endTime: `${String(nextEnd).padStart(2, '0')}:00` });
  };
  const chooseEnd = () => {
    const nextEnd = endHour >= 18 ? startHour + 1 : Math.max(startHour + 1, endHour + 2);
    void search({ ...criteria, endTime: `${String(nextEnd).padStart(2, '0')}:00` });
  };
  const openBooking = (room: Room) => {
    resetBooking();
    setSelectedRoom(room);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}><Text style={styles.brandGlyph}>⌂</Text></View>
          <Text style={[styles.brand, { color: theme.text }]}>Kelas<Text style={styles.brandLight}>Kosong</Text></Text>
        </View>
        <Pressable style={[styles.notification, { backgroundColor: theme.surfaceSecondary }]} onPress={() => Alert.alert('Notifikasi', 'Belum ada notifikasi baru.')}>
          <Text style={styles.bell}>♧</Text><View style={styles.notificationDot} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.campusPill, { backgroundColor: theme.primarySoft }]}><Text style={[styles.campusIcon, { color: theme.primary }]}>✳</Text><Text style={[styles.campusName, { color: theme.primary }]}>PRADITA UNIVERSITY</Text><Text style={[styles.campusArrow, { color: theme.primary }]}>⌄</Text></View>
        <View style={styles.hero}>
          <Text style={[styles.eyebrow, { color: theme.subtle }]}>RUANG KAMPUS, JADI LEBIH DEKAT</Text>
          <Text style={[styles.heading, { color: theme.text }]}>Ruang yang pas,{ '\n' }<Text style={{ color: theme.primary }}>ada di dekatmu.</Text></Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Cari tempat nyaman untuk belajar, berdiskusi,{ '\n' }dan berkolaborasi di kampus.</Text>
          <View style={styles.heroDecoration}><View style={styles.heroSun} /><Text style={styles.heroBuilding}>▥</Text><Text style={styles.heroPlant}>♧</Text></View>
        </View>

        <View style={[styles.searchPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.panelTitle, { color: theme.text }]}>Cari ruang untukmu</Text>
          <View style={styles.choiceRow}>
            <Choice label="TANGGAL" value={criteria.date} onPress={() => Alert.alert('Tanggal reservasi', 'Tanggal dapat disesuaikan pada formulir booking.')} />
            <Choice label="JUMLAH ORANG" value={`${people} orang`} onPress={choosePeople} />
          </View>
          <View style={styles.choiceRow}>
            <Choice label="MULAI" value={`${String(startHour).padStart(2, '0')}:00`} onPress={chooseStart} />
            <Choice label="SELESAI" value={`${String(endHour).padStart(2, '0')}:00`} onPress={chooseEnd} />
          </View>
          <Pressable style={styles.searchButton} onPress={() => {
            if (endHour <= startHour) return;
            void search();
          }}><Text style={styles.searchIcon}>⌕</Text><Text style={styles.searchButtonText}>Cari ruang tersedia</Text></Pressable>
          <Text style={[styles.freeNote, { color: theme.muted }]}>✓  Reservasi gratis untuk mahasiswa</Text>
        </View>

        <View style={styles.resultsHeader}>
          <View><SmallLabel>PILIHAN UNTUKMU</SmallLabel><Text style={[styles.sectionTitle, { color: theme.text }]}>Ruang tersedia <Text style={styles.resultCount}>{searchState.status === 'success' ? searchState.rooms.length : '–'}</Text></Text></View>
          <Pressable onPress={() => Alert.alert('Urutkan', 'Ruang ditampilkan berdasarkan kecocokan.')}><Text style={[styles.sortButton, { color: theme.muted, backgroundColor: theme.surface, borderColor: theme.border }]}>Sesuai  ⌄</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['Semua', 'Diskusi', 'Belajar', 'Kelas'] as RoomSearchCriteria['type'][]).map((type) => <Pressable key={type} onPress={() => void search({ ...criteria, type })} style={[styles.filterChip, { backgroundColor: theme.surface, borderColor: theme.border }, criteria.type === type && { backgroundColor: theme.primarySoft, borderColor: theme.primarySoft }]}><Text style={[styles.filterText, { color: theme.muted }, criteria.type === type && { color: theme.primary, fontWeight: '700' }]}>{type === 'Semua' ? 'Semua ruang' : `Ruang ${type.toLowerCase()}`}</Text></Pressable>)}
        </ScrollView>

        <RoomSearchStateView status={searchState.status} error={searchState.error} onRetry={() => void retry()} isDark={isDark}>
          {searchState.rooms.map((room) => (
            <RoomCard key={room.id} room={room} onBook={openBooking} saved={savedRoomIds.includes(room.id)} onSave={toggleSaved} timeRange={`${criteria.startTime}–${criteria.endTime}`} />
          ))}
        </RoomSearchStateView>
        <Text style={[styles.disclaimer, { color: theme.subtle }]}>Ketersediaan pada prototype ini menggunakan data contoh.</Text>
      </ScrollView>

      <Modal transparent animationType="fade" visible={selectedRoom !== null} onRequestClose={() => setSelectedRoom(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <Pressable
              style={[styles.closeModal, { backgroundColor: isDark ? '#263328' : '#edf2ea' }]}
              onPress={() => setSelectedRoom(null)}
              accessibilityLabel="Tutup dialog"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.closeText, { color: theme.muted }]}>✕</Text>
            </Pressable>
            {selectedRoom && <BookingForm
              room={selectedRoom}
              userId={userProfile?.email ?? ''}
              initialValues={{ date: criteria.date, startTime: criteria.startTime, endTime: criteria.endTime, people: String(criteria.people) }}
              onSuccess={() => {
                Alert.alert('Reservasi berhasil', `${selectedRoom.name} sudah masuk ke Reservasi saya.`);
                setSelectedRoom(null);
                void search();
              }}
            />}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f8f4' },
  topBar: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0e9',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 32, height: 32, borderRadius: 10, backgroundColor: green, alignItems: 'center', justifyContent: 'center' },
  brandGlyph: { color: '#fff', fontSize: 20 },
  brand: { color: '#192820', fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  brandLight: { color: '#789178', fontWeight: '500' },
  notification: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f8f4' },
  bell: { color: green, fontSize: 18 },
  notificationDot: { position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: '#e5a35d', top: 8, right: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 28 },
  campusPill: {
    marginTop: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#edf3e9',
  },
  campusIcon: { color: green, fontSize: 13 },
  campusName: { color: '#647b61', fontSize: 11, letterSpacing: 0.6, fontWeight: '700' },
  campusArrow: { color: '#647b61', fontSize: 13, marginLeft: 4 },
  hero: { paddingTop: 20, paddingBottom: 20, position: 'relative' },
  eyebrow: { fontSize: 11, color: '#758a72', letterSpacing: 1, fontWeight: '700' },
  heading: { marginTop: 8, color: '#192820', fontSize: 28, lineHeight: 34, letterSpacing: -0.8, fontWeight: '800' },
  headingAccent: { color: '#648263' },
  subtitle: { marginTop: 8, color: '#7f897f', fontSize: 13, lineHeight: 19 },
  heroDecoration: {
    position: 'absolute',
    right: -10,
    bottom: 12,
    width: 96,
    height: 90,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    backgroundColor: '#eef2e7',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  heroSun: { position: 'absolute', right: 12, top: 12, width: 26, height: 26, borderRadius: 13, backgroundColor: '#f1d6a9' },
  heroBuilding: { color: '#839b7e', fontSize: 52, lineHeight: 68, marginBottom: -6 },
  heroPlant: { position: 'absolute', right: 4, bottom: 2, color: '#567a5a', fontSize: 24 },
  searchPanel: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#e8ece5', backgroundColor: '#fff', gap: 10 },
  panelTitle: { color: '#243529', fontWeight: '700', fontSize: 14, marginBottom: 2 },
  choiceRow: { flexDirection: 'row', gap: 10 },
  choice: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#e9ede6',
    justifyContent: 'center',
  },
  choiceLabel: { color: '#9aa29a', fontSize: 10, letterSpacing: 0.7, fontWeight: '700' },
  choiceValue: { marginTop: 4, color: '#354237', fontSize: 13, fontWeight: '600' },
  down: { color: '#809181' },
  searchButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    backgroundColor: green,
    marginTop: 4,
  },
  searchIcon: { color: '#fff', fontSize: 18 },
  searchButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  freeNote: { marginTop: 4, color: '#8b958b', fontSize: 11, textAlign: 'center' },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24 },
  smallLabel: { color: '#91a087', fontSize: 10, letterSpacing: 1, fontWeight: '700' },
  sectionTitle: { marginTop: 4, color: '#202d23', fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
  resultCount: {
    color: '#5b7859',
    backgroundColor: '#eaf1e7',
    overflow: 'hidden',
    borderRadius: 10,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontWeight: '700',
  },
  sortButton: {
    color: '#687569',
    fontSize: 11,
    borderWidth: 1,
    borderColor: '#e6eae2',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontWeight: '600',
  },
  filterRow: { gap: 8, paddingVertical: 12 },
  filterChip: {
    borderWidth: 1,
    borderColor: '#e5e9e2',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: { backgroundColor: '#eaf2e8', borderColor: '#eaf2e8' },
  filterText: { fontSize: 12, color: '#788278', fontWeight: '500' },
  filterTextActive: { color: '#31593a', fontWeight: '700' },
  roomCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8ebe5',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  roomArt: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  artBackdropCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    right: -20,
    top: -30,
  },
  roomTypeBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roomTypeIcon: { fontSize: 13, color: '#37593c' },
  roomTypeText: { color: '#37593c', fontSize: 11, fontWeight: '700' },
  saveButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  saveIcon: { color: '#667563', fontSize: 17, lineHeight: 20 },
  savedIcon: { color: '#cf6d61' },
  roomDetails: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 },
  roomTitleLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  roomTitle: { flexShrink: 1, color: '#253329', fontWeight: '700', fontSize: 15 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  available: { fontWeight: '700', fontSize: 10 },
  location: { color: '#8a9389', marginTop: 4, fontSize: 12 },
  roomInfoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2ee',
    paddingVertical: 8,
    marginTop: 2,
  },
  roomInfo: { color: '#778177', fontSize: 12 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 10 },
  amenity: {
    color: '#737f72',
    backgroundColor: '#f5f6f3',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  bookButton: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: green,
    marginTop: 12,
  },
  bookButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  empty: { paddingVertical: 32, alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e8ebe5' },
  emptyIcon: { color: '#83a080', fontSize: 32 },
  emptyTitle: { marginTop: 8, color: '#354239', fontWeight: '700', fontSize: 14 },
  emptyCopy: { marginTop: 4, color: muted, fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },
  disclaimer: { marginTop: 8, marginBottom: 14, color: '#9aa198', fontSize: 11, textAlign: 'center' },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 25, 18, 0.65)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    padding: 22,
    borderRadius: 18,
    backgroundColor: '#fff',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  closeModal: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  modalCheck: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eaf3e8', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  modalCheckText: { color: '#3c7047', fontSize: 20 },
  modalTitle: { color: '#253329', fontSize: 20, fontWeight: '700', marginTop: 8 },
  modalRoom: { color: '#354237', fontWeight: '700', fontSize: 13, marginTop: 12 },
  modalDetails: { color: muted, fontSize: 11, marginTop: 4 },
  modalFootnote: { color: '#9ba39a', fontSize: 9, marginTop: 12, textAlign: 'center' },
});
