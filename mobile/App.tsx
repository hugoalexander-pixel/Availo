import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  type TextInputInstance,
  View,
} from 'react-native';
import { rooms, Room } from './src/features/rooms/data';
import { usePrototypeStore } from './src/state/PrototypeStore';
import { ScreenContainer } from './src/components/ScreenContainer';
import { AppButton } from './src/components/AppButton';
import { FormField } from './src/components/FormField';
import { Toast } from './src/components/Toast';
import { DropdownModal } from './src/components/DropdownModal';
import { generateDateOptions } from './src/utils/dateHelper';
import { useResponsive } from './src/hooks/useResponsive';

const brandGreen = '#204d35';
const brandAccent = '#386343';
const textPrimary = '#192820';
const textSecondary = '#3d4f40';
const textMuted = '#4a5c4d';

function SmallLabel({ children }: { children: string }) {
  return (
    <Text style={styles.smallLabel} accessibilityRole="text">
      {children}
    </Text>
  );
}

function Choice({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Pilih ${label}, saat ini: ${value}`}
      accessibilityHint={`Tekan untuk membuka menu pilihan ${label.toLowerCase()}`}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={styles.choiceHeaderRow}>
        <Text style={styles.choiceLabel}>{label}</Text>
        <View style={styles.choicePill} accessible={false}>
          <Text style={styles.choicePillText}>PILIH ▾</Text>
        </View>
      </View>
      <View style={styles.choiceValueRow}>
        <Text style={styles.choiceValue} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.down} accessible={false}>▾</Text>
      </View>
    </Pressable>
  );
}

function RoomCard({
  room,
  onBook,
  saved,
  onSave,
}: {
  room: Room;
  onBook: (room: Room) => void;
  saved: boolean;
  onSave: (id: number) => void;
}) {
  return (
    <View
      style={styles.roomCard}
      accessibilityRole="summary"
      accessibilityLabel={`Ruang ${room.name}, ${room.building}, lantai ${room.floor}, kapasitas ${room.capacity} orang, fasilitas: ${room.amenities.join(', ')}. Status saat ini tersedia.`}
    >
      <View
        style={[styles.roomArt, { backgroundColor: room.color }]}
        accessible={false}
      >
        <View style={styles.artSun} />
        <View style={styles.artWindow}>
          <View style={styles.windowLine} />
        </View>
        <View style={styles.artTable} />
        <View style={styles.artLegOne} />
        <View style={styles.artLegTwo} />
        <View style={styles.artPlant}>
          <Text style={styles.artPlantText}>♧</Text>
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeTagText}>
            {room.mark} {room.type}
          </Text>
        </View>
        <Pressable
          style={styles.saveButton}
          onPress={() => onSave(room.id)}
          accessibilityRole="button"
          accessibilityLabel={saved ? `Hapus ${room.name} dari tersimpan` : `Simpan ${room.name} ke favorit`}
          accessibilityState={{ selected: saved }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.saveIcon, saved && styles.savedIcon]} accessible={false}>
            {saved ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.roomDetails}>
        <View style={styles.roomTitleLine}>
          <Text numberOfLines={1} style={styles.roomTitle}>
            {room.name}
          </Text>
          <View
            style={styles.statusBadge}
            accessibilityLabel="Status ruangan: Tersedia"
          >
            <Text style={styles.statusDot}>●</Text>
            <Text style={styles.available}>Tersedia</Text>
          </View>
        </View>

        <Text style={styles.location}>
          ⌖ {room.building} · {room.floor}
        </Text>

        <View style={styles.roomInfoLine}>
          <Text style={styles.roomInfo}>♙ Maks. {room.capacity} orang</Text>
          <Text style={styles.roomInfo}>◷ 10:00 – 12:00</Text>
        </View>

        <View style={styles.amenities}>
          {room.amenities.map((item) => (
            <View key={item} style={styles.amenityBadge}>
              <Text style={styles.amenity}>{item}</Text>
            </View>
          ))}
        </View>

        <AppButton
          label="Pesan Ruang  →"
          onPress={() => onBook(room)}
          style={styles.bookButton}
          accessibilityLabel={`Pesan ruang ${room.name}`}
          accessibilityHint="Membuka formulir pemesanan ruang ini"
        />
      </View>
    </View>
  );
}

export default function App() {
  const dateOptions = useMemo(() => generateDateOptions(), []);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0].value);
  const [people, setPeople] = useState(4);
  const [startHour, setStartHour] = useState(10);
  const [endHour, setEndHour] = useState(12);
  const [activeType, setActiveType] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Dropdown Picker State
  const [activePicker, setActivePicker] = useState<'date' | 'people' | 'start' | 'end' | null>(null);

  const peopleOptions = useMemo(
    () => [
      { value: 2, label: '2 Orang', description: 'Belajar mandiri atau berdua', badge: 'Kecil' },
      { value: 4, label: '4 Orang', description: 'Diskusi kelompok kecil', badge: 'Paling Populer' },
      { value: 6, label: '6 Orang', description: 'Kelompok belajar menengah', badge: 'Standar' },
      { value: 8, label: '8 Orang', description: 'Kelompok besar / tim tugas' },
      { value: 12, label: '12 Orang', description: 'Rapat organisasi / kepanitiaan', badge: 'Rapat' },
      { value: 20, label: '20+ Orang', description: 'Kelas kolaborasi / seminar', badge: 'Besar' },
    ],
    []
  );

  const startHourOptions = useMemo(
    () => [
      { value: 7, label: '07:00 WIB', description: 'Sesi pagi pertama' },
      { value: 8, label: '08:00 WIB', description: 'Sesi pagi perkuliahan' },
      { value: 9, label: '09:00 WIB', description: 'Sesi pagi paling diminati', badge: 'Populer' },
      { value: 10, label: '10:00 WIB', description: 'Sesi pertengahan pagi' },
      { value: 11, label: '11:00 WIB', description: 'Sesi menjelang siang' },
      { value: 12, label: '12:00 WIB', description: 'Sesi istirahat siang' },
      { value: 13, label: '13:00 WIB', description: 'Sesi awal siang' },
      { value: 14, label: '14:00 WIB', description: 'Sesi siang perkuliahan' },
      { value: 15, label: '15:00 WIB', description: 'Sesi sore awal' },
      { value: 16, label: '16:00 WIB', description: 'Sesi sore hari' },
      { value: 17, label: '17:00 WIB', description: 'Sesi menjelang petang' },
      { value: 18, label: '18:00 WIB', description: 'Sesi malam awal' },
      { value: 19, label: '19:00 WIB', description: 'Sesi malam terakhir' },
    ],
    []
  );

  const endHourOptions = useMemo(() => {
    const options = [];
    for (let h = startHour + 1; h <= 21; h++) {
      const duration = h - startHour;
      options.push({
        value: h,
        label: `${String(h).padStart(2, '0')}:00 WIB`,
        description: `Durasi penggunaan ${duration} jam`,
        badge: duration === 2 ? 'Rekomendasi (2 Jam)' : duration === 1 ? '1 Jam' : undefined,
      });
    }
    return options;
  }, [startHour]);

  const { savedRoomIds, toggleSaved, addBooking, user } = usePrototypeStore();
  const { isMediumLarge } = useResponsive();

  // Form Reservasi State inside Modal
  const [bookerName, setBookerName] = useState(user?.name || 'Nadia Aulia');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [purposeError, setPurposeError] = useState('');
  const purposeInputRef = useRef<TextInputInstance>(null);

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Ketersediaan ruang kampus telah diperbarui.', 'info');
    }, 600);
  }, []);

  const visibleRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchCapacity = room.capacity >= people;
      const matchType = activeType === 'Semua' || room.type === activeType;
      const matchSearch =
        searchQuery.trim() === '' ||
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.building.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCapacity && matchType && matchSearch;
    });
  }, [people, activeType, searchQuery]);

  const handleSearch = () => {
    Keyboard.dismiss();
    if (endHour <= startHour) {
      setEndHour(startHour + 1);
      showToast('Waktu selesai disesuaikan otomatis.', 'info');
      return;
    }
    setLoadingSearch(true);
    setTimeout(() => {
      setLoadingSearch(false);
      showToast(`Menampilkan ruang untuk ${people} orang pada ${selectedDate}.`, 'success');
    }, 400);
  };

  const handleOpenBookModal = (room: Room) => {
    setSelectedRoom(room);
    if (user?.name) {
      setBookerName(user.name);
    }
    setBookingPurpose('');
    setPurposeError('');
  };

  const confirmBooking = () => {
    if (!selectedRoom) return;

    if (!bookingPurpose.trim()) {
      setPurposeError('Keperluan reservasi wajib diisi');
      showToast('Mohon lengkapi keperluan penggunaan ruang.', 'error');
      return;
    }

    setPurposeError('');
    setLoadingConfirm(true);
    setTimeout(() => {
      addBooking(selectedRoom.id);
      setLoadingConfirm(false);
      const roomName = selectedRoom.name;
      setSelectedRoom(null);
      showToast(
        `Reservasi berhasil: ${roomName} (${selectedDate}, ${String(startHour).padStart(2, '0')}:00–${String(endHour).padStart(2, '0')}:00 WIB).`,
        'success'
      );
    }, 600);
  };

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={brandGreen}
          colors={[brandGreen]}
        />
      }
    >
      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark} accessible={false}>
            <Text style={styles.brandGlyph}>⌂</Text>
          </View>
          <Text style={styles.brand}>
            Kelas<Text style={styles.brandLight}>Kosong</Text>
          </Text>
        </View>

        <Pressable
          style={styles.notification}
          onPress={() => showToast('Belum ada notifikasi baru hari ini.', 'info')}
          accessibilityRole="button"
          accessibilityLabel="Notifikasi pesan dan jadwal baru"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.bell} accessible={false}>♧</Text>
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <View style={styles.scrollContent}>
        {/* Campus Location Pill */}
        <Pressable
          style={styles.campusPill}
          onPress={() => showToast('Kampus aktif: Universitas Nusantara', 'info')}
          accessibilityRole="button"
          accessibilityLabel="Lokasi Kampus: Universitas Nusantara"
        >
          <Text style={styles.campusIcon} accessible={false}>✳</Text>
          <Text style={styles.campusName}>UNIVERSITAS NUSANTARA</Text>
          <Text style={styles.campusArrow} accessible={false}>⌄</Text>
        </Pressable>

        {/* Hero Banner */}
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>RUANG KAMPUS, JADI LEBIH DEKAT</Text>
          <Text style={styles.heading}>
            Ruang yang pas,{'\n'}
            <Text style={styles.headingAccent}>ada di dekatmu.</Text>
          </Text>
          <Text style={styles.subtitle}>
            Cari tempat nyaman untuk belajar mandiri, diskusi kelompok, atau kegiatan organisasi di kampus.
          </Text>

          <View style={styles.heroDecoration} accessible={false}>
            <View style={styles.heroSun} />
            <Text style={styles.heroBuilding}>▥</Text>
            <Text style={styles.heroPlant}>♧</Text>
          </View>
        </View>

        {/* Search Panel */}
        <View style={styles.searchPanel}>
          <Text style={styles.panelTitle}>Cari ruang untukmu</Text>

          {/* Interactive Search Field */}
          <FormField
            label="KATA KUNCI PENCARIAN"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari nama ruang atau gedung..."
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            accessibilityLabel="Input kata kunci pencarian ruang atau gedung"
            hint="Contoh: Diskusi, Belajar, Gedung A"
            containerStyle={styles.searchFieldContainer}
          />

          <View style={styles.choiceRow}>
            <Choice
              label="TANGGAL"
              value={selectedDate}
              onPress={() => setActivePicker('date')}
            />
            <Choice
              label="JUMLAH ORANG"
              value={`${people} orang`}
              onPress={() => setActivePicker('people')}
            />
          </View>

          <View style={styles.choiceRow}>
            <Choice
              label="MULAI"
              value={`${String(startHour).padStart(2, '0')}:00 WIB`}
              onPress={() => setActivePicker('start')}
            />
            <Choice
              label="SELESAI"
              value={`${String(endHour).padStart(2, '0')}:00 WIB`}
              onPress={() => setActivePicker('end')}
            />
          </View>

          <AppButton
            label="Cari Ruang Tersedia"
            onPress={handleSearch}
            loading={loadingSearch}
            style={styles.searchButtonMain}
            accessibilityLabel="Cari ruang yang tersedia sesuai kriteria"
          />

          <Text style={styles.freeNote}>
            ✓ Reservasi ruang gratis untuk seluruh sivitas akademika
          </Text>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <View>
            <SmallLabel>PILIHAN UNTUKMU</SmallLabel>
            <Text style={styles.sectionTitle}>
              Ruang tersedia{' '}
              <Text style={styles.resultCount}>
                {visibleRooms.length} ruang
              </Text>
            </Text>
          </View>

          <Pressable
            onPress={() => showToast('Pengurutan: Sesuai kecocokan kapasitas', 'info')}
            accessibilityRole="button"
            accessibilityLabel="Urutkan hasil pencarian ruang"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.sortButtonWrapper}
          >
            <Text style={styles.sortButton}>Sesuai ⌄</Text>
          </Pressable>
        </View>

        {/* Filter Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {['Semua', 'Diskusi', 'Belajar', 'Kelas'].map((type) => {
            const isSelected = activeType === type;
            return (
              <Pressable
                key={type}
                onPress={() => setActiveType(type)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                accessibilityRole="button"
                accessibilityLabel={`Kategori ${type === 'Semua' ? 'semua kategori ruang' : `ruang ${type.toLowerCase()}`}`}
                accessibilityState={{ selected: isSelected }}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextActive,
                  ]}
                >
                  {type === 'Semua' ? 'Semua Ruang' : `Ruang ${type}`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Room List (Adaptive 1 col on mobile, 2 col on tablet/desktop) */}
        <View style={isMediumLarge ? styles.gridContainer : styles.listContainer}>
          {visibleRooms.length > 0 ? (
            visibleRooms.map((room) => (
              <View
                key={room.id}
                style={isMediumLarge ? styles.gridItem : styles.listItem}
              >
                <RoomCard
                  room={room}
                  onBook={handleOpenBookModal}
                  saved={savedRoomIds.includes(room.id)}
                  onSave={toggleSaved}
                />
              </View>
            ))
          ) : (
            <View
              style={styles.emptyContainer}
              accessibilityRole="summary"
              accessibilityLabel="Tidak ada ruang yang sesuai dengan filter pencarian"
            >
              <View style={styles.emptyIconCircle} accessible={false}>
                <Text style={styles.emptyIcon}>⌕</Text>
              </View>
              <Text style={styles.emptyTitle}>Tidak ada ruang yang sesuai</Text>
              <Text style={styles.emptyCopy}>
                Coba sesuaikan kata kunci pencarian, kurangi kapasitas, atau pilih rentang waktu lainnya.
              </Text>
              <AppButton
                label="Atur Ulang Filter"
                onPress={() => {
                  setSearchQuery('');
                  setActiveType('Semua');
                  setPeople(4);
                  setStartHour(10);
                  setEndHour(12);
                  setSelectedDate(dateOptions[0].value);
                  showToast('Filter telah diatur ulang.', 'info');
                }}
                variant="secondary"
                style={styles.emptyResetBtn}
                accessibilityLabel="Atur ulang semua filter pencarian"
              />
            </View>
          )}
        </View>

        <Text style={styles.disclaimer}>
          Ketersediaan pada prototype ini disimulasikan menggunakan data contoh kampus.
        </Text>
      </View>

      {/* Booking Form Modal with Keyboard-Safe UI */}
      <Modal
        transparent
        animationType="fade"
        visible={selectedRoom !== null}
        onRequestClose={() => setSelectedRoom(null)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalAvoidView}
          >
            <ScrollView
              contentContainerStyle={styles.modalScrollCard}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Pressable
                style={styles.closeModal}
                onPress={() => setSelectedRoom(null)}
                accessibilityRole="button"
                accessibilityLabel="Tutup dialog formulir reservasi"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.closeText} accessible={false}>✕</Text>
              </Pressable>

              <View style={styles.modalCheckCircle} accessible={false}>
                <Text style={styles.modalCheckGlyph}>✓</Text>
              </View>

              <SmallLabel>FORMULIR RESERVASI</SmallLabel>
              <Text style={styles.modalTitle}>Pesan Ruang Kampus</Text>

              {/* Room Summary Header */}
              <View style={styles.roomSummaryBox}>
                <Text style={styles.modalRoomName}>{selectedRoom?.name}</Text>
                <Text style={styles.modalRoomDetail}>
                  {selectedRoom?.building} · {selectedRoom?.floor} · Kapasitas {selectedRoom?.capacity} orang
                </Text>
                <Text style={styles.modalRoomTime}>
                  ◷ {String(startHour).padStart(2, '0')}:00 – {String(endHour).padStart(2, '0')}:00 WIB · {selectedDate}
                </Text>
              </View>

              {/* Form Input Fields */}
              <FormField
                label="Nama Pemesan"
                value={bookerName}
                onChangeText={setBookerName}
                placeholder="Masukkan nama pemesan"
                returnKeyType="next"
                onSubmitEditing={() => purposeInputRef.current?.focus()}
                required
                accessibilityLabel="Input Nama Pemesan"
              />

              <FormField
                ref={purposeInputRef}
                label="Keperluan Reservasi"
                value={bookingPurpose}
                onChangeText={(val) => {
                  setBookingPurpose(val);
                  if (purposeError) setPurposeError('');
                }}
                placeholder="Contoh: Diskusi tugas kelompok Web"
                returnKeyType="done"
                onSubmitEditing={confirmBooking}
                error={purposeError}
                required
                accessibilityLabel="Input Keperluan Reservasi"
                hint="Jelaskan secara singkat tujuan pemakaian ruang"
              />

              <AppButton
                label="Konfirmasi Reservasi  →"
                onPress={confirmBooking}
                loading={loadingConfirm}
                style={styles.confirmButton}
                accessibilityLabel={`Konfirmasi pemesanan ruang ${selectedRoom?.name}`}
              />

              <Text style={styles.modalFootnote}>
                Reservasi prototype disimpan dalam sesi aplikasi untuk pengujian alur.
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Clean UI Dropdown Pickers */}
      <DropdownModal
        visible={activePicker === 'date'}
        title="Pilih Tanggal Reservasi"
        subtitle="Pilih hari dan tanggal peminjaman ruang di kampus"
        options={dateOptions}
        selectedValue={selectedDate}
        onSelect={(val) => {
          setSelectedDate(String(val));
          setActivePicker(null);
          showToast(`Tanggal diatur: ${val}`, 'info');
        }}
        onClose={() => setActivePicker(null)}
        accessibilityLabel="Menu pilihan tanggal reservasi"
      />

      <DropdownModal
        visible={activePicker === 'people'}
        title="Pilih Jumlah Orang"
        subtitle="Hanya ruang dengan kapasitas mencukupi yang akan ditampilkan"
        options={peopleOptions}
        selectedValue={people}
        onSelect={(val) => {
          setPeople(Number(val));
          setActivePicker(null);
          showToast(`Kapasitas diatur: ${val} orang`, 'info');
        }}
        onClose={() => setActivePicker(null)}
        accessibilityLabel="Menu pilihan jumlah orang"
      />

      <DropdownModal
        visible={activePicker === 'start'}
        title="Pilih Jam Mulai"
        subtitle="Pilih waktu mulai sesi pemakaian ruang (WIB)"
        options={startHourOptions}
        selectedValue={startHour}
        onSelect={(val) => {
          const newStart = Number(val);
          setStartHour(newStart);
          if (newStart >= endHour) {
            const newEnd = Math.min(newStart + 2, 21);
            setEndHour(newEnd);
            showToast(`Mulai ${newStart}:00 WIB. Jam selesai disesuaikan ke ${newEnd}:00 WIB.`, 'info');
          } else {
            showToast(`Jam mulai: ${newStart}:00 WIB`, 'info');
          }
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
        accessibilityLabel="Menu pilihan jam mulai"
      />

      <DropdownModal
        visible={activePicker === 'end'}
        title="Pilih Jam Selesai"
        subtitle={`Waktu mulai saat ini: ${String(startHour).padStart(2, '0')}:00 WIB`}
        options={endHourOptions}
        selectedValue={endHour}
        onSelect={(val) => {
          const newEnd = Number(val);
          setEndHour(newEnd);
          setActivePicker(null);
          showToast(`Jam selesai: ${newEnd}:00 WIB (Durasi ${newEnd - startHour} jam)`, 'info');
        }}
        onClose={() => setActivePicker(null)}
        accessibilityLabel="Menu pilihan jam selesai"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5ebe3',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: brandGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandGlyph: {
    color: '#ffffff',
    fontSize: 20,
  },
  brand: {
    color: textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  brandLight: {
    color: brandAccent,
    fontWeight: '500',
  },
  notification: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf3ec',
  },
  bell: {
    color: brandGreen,
    fontSize: 20,
  },
  notificationDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d97706',
    top: 10,
    right: 10,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  campusPill: {
    marginTop: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e6efe4',
    borderWidth: 1,
    borderColor: '#d2e2cf',
  },
  campusIcon: {
    color: brandGreen,
    fontSize: 14,
    fontWeight: '700',
  },
  campusName: {
    color: '#284d33',
    fontSize: 12,
    letterSpacing: 0.8,
    fontWeight: '800',
  },
  campusArrow: {
    color: '#284d33',
    fontSize: 14,
    marginLeft: 4,
  },
  hero: {
    paddingTop: 24,
    paddingBottom: 22,
    position: 'relative',
  },
  eyebrow: {
    fontSize: 12,
    color: '#34553d',
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  heading: {
    marginTop: 8,
    color: textPrimary,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
    fontWeight: '800',
  },
  headingAccent: {
    color: brandAccent,
  },
  subtitle: {
    marginTop: 8,
    color: textSecondary,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: '85%',
  },
  heroDecoration: {
    position: 'absolute',
    right: -10,
    bottom: 12,
    width: 104,
    height: 98,
    borderTopLeftRadius: 52,
    borderTopRightRadius: 52,
    backgroundColor: '#eaf0e6',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  heroSun: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5d69f',
  },
  heroBuilding: {
    color: '#6e8c70',
    fontSize: 60,
    lineHeight: 74,
    marginBottom: -6,
  },
  heroPlant: {
    position: 'absolute',
    right: 4,
    bottom: 2,
    color: '#426848',
    fontSize: 28,
  },
  searchPanel: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dde4d9',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  panelTitle: {
    color: textPrimary,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 14,
  },
  searchFieldContainer: {
    marginBottom: 12,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  choice: {
    flex: 1,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#dce3d8',
    backgroundColor: '#fbfcfb',
    justifyContent: 'center',
  },
  choicePressed: {
    backgroundColor: '#edf5ee',
    borderColor: '#204d35',
  },
  choiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  choiceLabel: {
    color: '#4a5e4d',
    fontSize: 10.5,
    letterSpacing: 0.7,
    fontWeight: '800',
  },
  choicePill: {
    backgroundColor: '#e7efe5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  choicePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#204d35',
    letterSpacing: 0.3,
  },
  choiceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  choiceValue: {
    color: textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 4,
  },
  down: {
    color: '#2a553c',
    fontSize: 13,
    fontWeight: '800',
  },
  searchButtonMain: {
    marginTop: 6,
    width: '100%',
    minHeight: 46,
  },
  freeNote: {
    marginTop: 10,
    color: '#4a5e4d',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 26,
  },
  smallLabel: {
    color: '#3d5942',
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  sectionTitle: {
    marginTop: 4,
    color: textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  resultCount: {
    color: brandGreen,
    backgroundColor: '#e6efe4',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sortButtonWrapper: {
    minHeight: 44,
    justifyContent: 'center',
  },
  sortButton: {
    color: '#2d4332',
    fontSize: 13,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#d2dad0',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterRow: {
    gap: 8,
    paddingVertical: 14,
  },
  filterChip: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#d4ded2',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: '#e3eee1',
    borderColor: '#bcd2ba',
  },
  filterText: {
    fontSize: 13,
    color: textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: brandGreen,
    fontWeight: '800',
  },
  listContainer: {
    gap: 14,
  },
  listItem: {
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  gridItem: {
    width: '48.5%',
    flexGrow: 1,
  },
  roomCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dde3da',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roomArt: {
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artSun: {
    position: 'absolute',
    top: 14,
    right: 44,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5d69f',
  },
  artWindow: {
    position: 'absolute',
    top: 24,
    width: 100,
    height: 48,
    borderWidth: 5,
    borderColor: '#738b70',
    backgroundColor: '#fbf8ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  windowLine: {
    width: 4,
    height: 48,
    backgroundColor: '#b3c3ae',
  },
  artTable: {
    position: 'absolute',
    bottom: 30,
    width: 130,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#a3754e',
  },
  artLegOne: {
    position: 'absolute',
    bottom: 6,
    left: '37%',
    width: 6,
    height: 28,
    backgroundColor: '#8c603b',
    transform: [{ rotate: '4deg' }],
  },
  artLegTwo: {
    position: 'absolute',
    bottom: 6,
    right: '37%',
    width: 6,
    height: 28,
    backgroundColor: '#8c603b',
    transform: [{ rotate: '-4deg' }],
  },
  artPlant: {
    position: 'absolute',
    right: 20,
    bottom: 16,
  },
  artPlantText: {
    fontSize: 28,
    color: '#496f4e',
  },
  typeTag: {
    position: 'absolute',
    left: 12,
    top: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeTagText: {
    color: '#284d33',
    fontSize: 12,
    fontWeight: '700',
  },
  saveButton: {
    position: 'absolute',
    right: 12,
    top: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  saveIcon: {
    color: '#4a5e4d',
    fontSize: 20,
  },
  savedIcon: {
    color: '#b02a1c',
  },
  roomDetails: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  roomTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  roomTitle: {
    flexShrink: 1,
    color: textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eaf4e8',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#c6e0c4',
  },
  statusDot: {
    color: '#257038',
    fontSize: 9,
  },
  available: {
    color: '#20582f',
    fontSize: 12,
    fontWeight: '700',
  },
  location: {
    color: textSecondary,
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  roomInfoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#edf1ea',
    paddingVertical: 10,
    marginTop: 4,
  },
  roomInfo: {
    color: textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  amenities: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 10,
    flexWrap: 'wrap',
  },
  amenityBadge: {
    backgroundColor: '#edf2ea',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  amenity: {
    color: '#2c4731',
    fontSize: 12,
    fontWeight: '600',
  },
  bookButton: {
    marginTop: 14,
    width: '100%',
    minHeight: 44,
  },
  emptyContainer: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dde3da',
    width: '100%',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#edf4ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyIcon: {
    color: brandGreen,
    fontSize: 28,
  },
  emptyTitle: {
    marginTop: 4,
    color: textPrimary,
    fontWeight: '800',
    fontSize: 17,
  },
  emptyCopy: {
    marginTop: 6,
    color: textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
  },
  emptyResetBtn: {
    marginTop: 16,
    minWidth: 180,
  },
  disclaimer: {
    marginTop: 20,
    marginBottom: 14,
    color: textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(15, 26, 18, 0.65)',
  },
  modalAvoidView: {
    width: '100%',
    maxWidth: 480,
  },
  modalScrollCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  closeModal: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#4a5e4d',
    fontSize: 22,
    fontWeight: '700',
  },
  modalCheckCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e6efe4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalCheckGlyph: {
    color: brandGreen,
    fontSize: 22,
    fontWeight: '800',
  },
  modalTitle: {
    color: textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 14,
  },
  roomSummaryBox: {
    width: '100%',
    backgroundColor: '#f5f8f4',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2eae0',
    gap: 4,
  },
  modalRoomName: {
    color: textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  modalRoomDetail: {
    color: textSecondary,
    fontSize: 13,
  },
  modalRoomTime: {
    color: brandGreen,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  confirmButton: {
    marginTop: 10,
    width: '100%',
    minHeight: 48,
  },
  modalFootnote: {
    color: textMuted,
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
    lineHeight: 16,
  },
});
