import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { Platform, Pressable, Text, TextInput, View, StyleSheet } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatDateLabel, type Person, useRelay } from "@/lib/relay-store";

export default function PeopleScreen() {
  const { people, completeFollowUp } = useRelay();
  const [query, setQuery] = useState("");
  const filteredPeople = useMemo(() => people.filter((person) => `${person.name} ${person.relationship}`.toLowerCase().includes(query.toLowerCase())), [people, query]);

  const complete = (id: string) => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeFollowUp(id);
  };

  const renderPerson = (person: Person) => (
    <View key={person.id} className="mb-3 rounded-[22px] border border-[#E5DED5] bg-white p-4" style={styles.cardShadow}>
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${person.accent}20` }}>
          <Text className="text-sm font-bold" style={{ color: person.accent }}>{person.initials}</Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-bold text-[#14233D]">{person.name}</Text>
          <Text className="mt-1 text-[13px] text-[#8D877F]">{person.relationship}</Text>
        </View>
        <View className="items-end">
          <Text className="text-[11px] font-bold uppercase tracking-[1px] text-[#A19A91]">Next relay</Text>
          <Text className="mt-1 text-[13px] font-semibold text-[#5E5B56]">{formatDateLabel(person.nextCheckIn)}</Text>
        </View>
      </View>
      <View className="mt-4 flex-row items-center rounded-2xl bg-[#FBF8F4] px-3 py-2.5">
        <IconSymbol name="quote.bubble.fill" size={15} color="#A39A90" />
        <Text className="ml-2 flex-1 text-[12px] leading-[17px] text-[#807970]">{person.note}</Text>
      </View>
      <Pressable onPress={() => complete(person.id)} style={({ pressed }) => [styles.touchButton, pressed && styles.pressed]}>
        <IconSymbol name="checkmark.circle.fill" size={16} color="#FF765F" />
        <Text className="ml-2 text-[13px] font-bold text-[#FF765F]">Mark a check-in</Text>
      </Pressable>
    </View>
  );

  return (
    <ScreenContainer className="px-5" containerClassName="bg-[#F7F3EE]">
      <View className="flex-1 pt-3">
        <View className="mb-6 flex-row items-end justify-between">
          <View>
            <Text className="text-[13px] font-semibold uppercase tracking-[1.5px] text-[#FF765F]">Your circle</Text>
            <Text className="mt-2 text-[32px] font-bold tracking-[-1px] text-[#14233D]">People worth{`\n`}the relay.</Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#11284F]">
            <IconSymbol name="person.2.fill" size={22} color="#FF765F" />
          </View>
        </View>
        <View className="mb-5 flex-row items-center rounded-2xl border border-[#E2DAD0] bg-[#FFFDFC] px-3.5">
          <IconSymbol name="magnifyingglass" size={18} color="#A29B92" />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search your circle" placeholderTextColor="#A29B92" className="h-12 flex-1 px-3 text-[14px] text-[#14233D]" />
        </View>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-[18px] font-bold text-[#14233D]">{filteredPeople.length} connections</Text>
          <Text className="text-[12px] text-[#A19A91]">Stored locally</Text>
        </View>
        <View className="flex-1">{filteredPeople.map(renderPerson)}</View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cardShadow: { shadowColor: "#AA9A89", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2 },
  touchButton: { marginTop: 12, height: 36, borderRadius: 12, backgroundColor: "#FFF0EB", flexDirection: "row", alignItems: "center", justifyContent: "center" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});
