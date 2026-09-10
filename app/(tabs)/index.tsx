import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";

import { RelayBrand } from "@/components/relay-brand";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatDateLabel, isDueToday, type Cadence, type Person, useRelay } from "@/lib/relay-store";

const CADENCES: { key: Cadence; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
];

function initialsForPreview(person: Person) {
  return person.initials || person.name.slice(0, 2).toUpperCase();
}

export default function HomeScreen() {
  const router = useRouter();
  const { people, completedToday, addPerson, completeFollowUp, snoozeFollowUp } = useRelay();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [note, setNote] = useState("");
  const [cadence, setCadence] = useState<Cadence>("monthly");

  const dueToday = useMemo(() => people.filter((person) => isDueToday(person.nextCheckIn)), [people]);
  const upcoming = useMemo(
    () => people.filter((person) => !isDueToday(person.nextCheckIn)).sort((a, b) => a.nextCheckIn.localeCompare(b.nextCheckIn)).slice(0, 3),
    [people],
  );

  const handleAction = (action: () => void, notification = false) => {
    if (Platform.OS !== "web") {
      if (notification) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    action();
  };

  const savePerson = () => {
    if (!name.trim()) return;
    handleAction(() => {
      addPerson({ name, relationship, note, cadence });
      setName("");
      setRelationship("");
      setNote("");
      setCadence("monthly");
      setIsAddOpen(false);
    }, true);
  };

  const renderPerson = ({ item }: { item: Person }) => (
    <View className="mb-3 rounded-[22px] border border-[#E5DED5] bg-white p-4" style={styles.cardShadow}>
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${item.accent}22` }}>
          <Text className="text-sm font-bold" style={{ color: item.accent }}>{initialsForPreview(item)}</Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-bold text-[#14233D]">{item.name}</Text>
          <Text className="mt-0.5 text-[12px] text-[#8B8B88]">{item.relationship} · {item.note}</Text>
        </View>
        <Text className="text-[11px] font-semibold uppercase tracking-[1px] text-[#B0ABA4]">{formatDateLabel(item.nextCheckIn)}</Text>
      </View>
      <View className="mt-4 flex-row gap-2">
        <Pressable
          onPress={() => handleAction(() => completeFollowUp(item.id), true)}
          style={({ pressed }) => [styles.actionButton, styles.doneButton, pressed && styles.pressed]}
        >
          <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
          <Text className="ml-1.5 text-[13px] font-bold text-white">Done</Text>
        </Pressable>
        <Pressable
          onPress={() => handleAction(() => snoozeFollowUp(item.id), false)}
          style={({ pressed }) => [styles.actionButton, styles.snoozeButton, pressed && styles.pressed]}
        >
          <IconSymbol name="clock.arrow.circlepath" size={16} color="#6E6A64" />
          <Text className="ml-1.5 text-[13px] font-semibold text-[#6E6A64]">Snooze 3d</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="px-5" containerClassName="bg-[#F7F3EE]">
      <FlatList
        data={dueToday}
        keyExtractor={(item) => item.id}
        renderItem={renderPerson}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View className="flex-row items-center justify-between pb-7 pt-2">
              <RelayBrand />
              <View className="flex-row items-center rounded-full bg-[#E9F3EC] px-3 py-2">
                <View className="mr-2 h-2 w-2 rounded-full bg-[#4B9B69]" />
                <Text className="text-[11px] font-bold uppercase tracking-[1px] text-[#4B815A]">On device</Text>
              </View>
            </View>

            <View className="mb-6 flex-row items-end justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-[13px] font-semibold uppercase tracking-[1.5px] text-[#FF765F]">Thursday, September 10</Text>
                <Text className="mt-2 text-[34px] font-bold leading-[39px] tracking-[-1px] text-[#14233D]">Keep the good{`\n`}people close.</Text>
                <Text className="mt-3 text-[15px] leading-[22px] text-[#7A7772]">Small, consistent check-ins make relationships feel effortless.</Text>
              </View>
              <View className="h-[86px] w-[86px] items-center justify-center rounded-[28px] bg-[#11284F]" style={styles.logoShadow}>
                <IconSymbol name="arrow.triangle.2.circlepath" size={36} color="#FF765F" />
              </View>
            </View>

            <View className="mb-7 flex-row gap-3">
              <View className="flex-1 rounded-[22px] bg-[#11284F] p-4">
                <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-[#AFC2E5]">Due today</Text>
                <Text className="mt-2 text-[28px] font-bold text-white">{dueToday.length}</Text>
                <Text className="mt-1 text-[12px] text-[#C5D1E3]">{completedToday} completed this session</Text>
              </View>
              <View className="flex-1 rounded-[22px] border border-[#E5DED5] bg-[#FFFDFC] p-4">
                <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-[#9A948B]">In your circle</Text>
                <Text className="mt-2 text-[28px] font-bold text-[#14233D]">{people.length}</Text>
                <Text className="mt-1 text-[12px] text-[#9A948B]">people worth showing up for</Text>
              </View>
            </View>

            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-[22px] font-bold tracking-[-0.4px] text-[#14233D]">Today’s relay</Text>
                <Text className="mt-1 text-[13px] text-[#97928A]">One thoughtful action at a time.</Text>
              </View>
              <Pressable onPress={() => setIsAddOpen(true)} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
                <IconSymbol name="plus" size={17} color="#FFFFFF" />
                <Text className="ml-1.5 text-[13px] font-bold text-white">Add</Text>
              </Pressable>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="mb-5 rounded-[22px] border border-dashed border-[#D8D0C6] bg-[#FBF9F6] p-5">
            <Text className="text-[16px] font-bold text-[#14233D]">You’re all caught up.</Text>
            <Text className="mt-1 text-[13px] leading-[19px] text-[#8B867F]">Use the quiet space to add someone new or look ahead.</Text>
          </View>
        }
        ListFooterComponent={
          <View className="pb-10">
            <View className="mb-3 mt-2 flex-row items-center justify-between">
              <Text className="text-[18px] font-bold text-[#14233D]">Coming up</Text>
              <Pressable onPress={() => router.push("/(tabs)/people")}>
                <Text className="text-[13px] font-bold text-[#FF765F]">See all</Text>
              </Pressable>
            </View>
            <View className="overflow-hidden rounded-[22px] border border-[#E5DED5] bg-white">
              {upcoming.map((person, index) => (
                <View key={person.id} className="flex-row items-center px-4 py-3.5" style={index < upcoming.length - 1 ? styles.divider : undefined}>
                  <View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${person.accent}1C` }}>
                    <Text className="text-[11px] font-bold" style={{ color: person.accent }}>{person.initials}</Text>
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-[14px] font-bold text-[#14233D]">{person.name}</Text>
                    <Text className="mt-0.5 text-[12px] text-[#99938B]">{person.relationship}</Text>
                  </View>
                  <Text className="text-[12px] font-semibold text-[#77716A]">{formatDateLabel(person.nextCheckIn)}</Text>
                </View>
              ))}
            </View>
            <View className="mt-5 flex-row items-center rounded-2xl bg-[#EFE9E1] px-4 py-3">
              <IconSymbol name="lock.fill" size={15} color="#8B8379" />
              <Text className="ml-2 flex-1 text-[12px] leading-[17px] text-[#7D756B]">Your circle lives on this device. No account, no noise.</Text>
            </View>
          </View>
        }
      />

      <Modal visible={isAddOpen} animationType="slide" transparent onRequestClose={() => setIsAddOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsAddOpen(false)} />
          <View className="rounded-t-[30px] bg-[#FFFDFC] px-5 pb-8 pt-5" style={styles.modalSheet}>
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-[24px] font-bold tracking-[-0.5px] text-[#14233D]">Add to your circle</Text>
                <Text className="mt-1 text-[13px] text-[#908A82]">Relay will keep the reminder close.</Text>
              </View>
              <Pressable onPress={() => setIsAddOpen(false)} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <IconSymbol name="xmark" size={18} color="#77716A" />
              </Pressable>
            </View>
            <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#A9A29A" className="mb-3 rounded-2xl border border-[#E3DBD1] bg-[#FBF8F4] px-4 py-3.5 text-[15px] text-[#14233D]" autoFocus />
            <TextInput value={relationship} onChangeText={setRelationship} placeholder="How do you know them?" placeholderTextColor="#A9A29A" className="mb-3 rounded-2xl border border-[#E3DBD1] bg-[#FBF8F4] px-4 py-3.5 text-[15px] text-[#14233D]" />
            <TextInput value={note} onChangeText={setNote} placeholder="What do you want to remember?" placeholderTextColor="#A9A29A" className="mb-4 rounded-2xl border border-[#E3DBD1] bg-[#FBF8F4] px-4 py-3.5 text-[15px] text-[#14233D]" multiline />
            <Text className="mb-2 text-[12px] font-bold uppercase tracking-[1px] text-[#9B938A]">Check in</Text>
            <View className="mb-5 flex-row gap-2">
              {CADENCES.map((option) => (
                <Pressable key={option.key} onPress={() => setCadence(option.key)} style={({ pressed }) => [styles.cadencePill, cadence === option.key && styles.cadencePillSelected, pressed && styles.pressed]}>
                  <Text className="text-[12px] font-bold" style={{ color: cadence === option.key ? "#FFFFFF" : "#77716A" }}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable disabled={!name.trim()} onPress={savePerson} style={({ pressed }) => [styles.saveButton, !name.trim() && styles.saveButtonDisabled, pressed && styles.pressed]}>
              <Text className="text-[15px] font-bold text-white">Save person</Text>
              <IconSymbol name="arrow.right" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingTop: 8, paddingBottom: 80 },
  cardShadow: { shadowColor: "#AA9A89", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  logoShadow: { shadowColor: "#11284F", shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  actionButton: { height: 38, paddingHorizontal: 13, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  doneButton: { flex: 1, backgroundColor: "#FF765F" },
  snoozeButton: { flex: 1, backgroundColor: "#F2EEE8" },
  addButton: { height: 37, paddingHorizontal: 13, borderRadius: 12, backgroundColor: "#FF765F", flexDirection: "row", alignItems: "center" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  divider: { borderBottomWidth: 1, borderBottomColor: "#EFE9E1" },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20,35,61,0.34)" },
  modalSheet: { minHeight: 460 },
  modalSheetShadow: { shadowColor: "#14233D", shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 12 },
  closeButton: { height: 34, width: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "#F3EEE8" },
  cadencePill: { flex: 1, alignItems: "center", justifyContent: "center", height: 38, borderRadius: 12, borderWidth: 1, borderColor: "#E3DBD1", backgroundColor: "#FBF8F4" },
  cadencePillSelected: { backgroundColor: "#11284F", borderColor: "#11284F" },
  saveButton: { height: 52, borderRadius: 16, backgroundColor: "#FF765F", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  saveButtonDisabled: { opacity: 0.45 },
});
