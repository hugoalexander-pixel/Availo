import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { apiClient, NetworkError } from "../../src/services/ApiClient";
import { Facility, FacilityType } from "../../src/types/Models";
import {
  Colors,
  Spacing,
  FontSize,
  BorderRadius,
  getFacilityStatusStyle,
} from "../../src/constants/Theme";
import LoadingView from "../../src/components/LoadingView";
import EmptyView from "../../src/components/EmptyView";
import ErrorView from "../../src/components/ErrorView";

const FACILITY_TYPES: { label: string; value?: FacilityType }[] = [
  { label: "Semua" },
  { label: "Kelas", value: "RUANG_KELAS" },
  { label: "Diskusi", value: "RUANG_DISKUSI" },
  { label: "Laboratorium", value: "LABORATORIUM" },
  { label: "Rapat", value: "RUANG_RAPAT" },
  { label: "Aula", value: "AULA" },
];

export default function FacilitiesListScreen() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<FacilityType | undefined>();

  const loadFacilities = useCallback(async () => {
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append("search", search.trim());
      if (selectedType) queryParams.append("type", selectedType);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const res = await apiClient.get<{ Data: Facility[] }>(`/facilities${qs}`);
      setFacilities(res.Data || []);
    } catch (err: any) {
      if (err instanceof NetworkError) {
        setError(err.message);
      } else {
        setError(err?.message || "Gagal memuat daftar fasilitas kampus.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedType]);

  useFocusEffect(
    useCallback(() => {
      loadFacilities();
    }, [loadFacilities])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadFacilities();
  };

  const renderFacilityCard = ({ item }: { item: Facility }) => {
    const statusStyle = getFacilityStatusStyle(item.Status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/facilities/${item.Id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleArea}>
            <Text style={styles.facilityName} numberOfLines={1}>
              {item.Name}
            </Text>
            <Text style={styles.buildingName}>
              📍 {item.Building?.Name} (Lantai {item.Floor})
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>👥 Kapasitas: {item.Capacity} orang</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaText}>🏷️ {item.Type.replace("_", " ")}</Text>
          </View>
        </View>

        {item.Amenities && item.Amenities.length > 0 && (
          <View style={styles.amenitiesRow}>
            {item.Amenities.map((a) => (
              <View key={a.Id} style={styles.amenityChip}>
                <Text style={styles.amenityText}>
                  {a.Icon ? `${a.Icon} ` : "✓ "}
                  {a.Name}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.cardActionRow}>
          <Text style={styles.viewDetailText}>Lihat Ketersediaan & Detail →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Fasilitas Kampus",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari ruangan atau lab..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={(v) => setSearch(v)}
          returnKeyType="search"
          onSubmitEditing={loadFacilities}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Horizontal Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FACILITY_TYPES.map((t) => {
            const isSelected = selectedType === t.value;
            return (
              <TouchableOpacity
                key={t.label}
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillSelected,
                ]}
                onPress={() => setSelectedType(t.value)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected && styles.filterPillTextSelected,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content State */}
      {loading ? (
        <LoadingView message="Memuat ketersediaan fasilitas..." />
      ) : error ? (
        <ErrorView message={error} onRetry={loadFacilities} />
      ) : (
        <FlatList
          data={facilities}
          keyExtractor={(item) => item.Id.toString()}
          renderItem={renderFacilityCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyView
              icon="🔍"
              title="Ruangan Tidak Ditemukan"
              subtitle="Coba ubah kata kunci pencarian atau kategori filter."
              actionLabel="Reset Pencarian"
              onAction={() => {
                setSearch("");
                setSelectedType(undefined);
              }}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: FontSize.md,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  clearSearch: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    padding: Spacing.xs,
  },
  filterWrapper: {
    marginVertical: Spacing.md,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterPillTextSelected: {
    color: Colors.white,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  titleArea: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  facilityName: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  buildingName: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  cardMeta: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metaBadge: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  amenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  amenityChip: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  amenityText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  cardActionRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
    alignItems: "flex-end",
  },
  viewDetailText: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    color: Colors.primary,
  },
});

