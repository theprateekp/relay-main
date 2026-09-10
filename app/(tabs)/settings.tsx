import { Pressable, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { RelayBrand } from "@/components/relay-brand";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";

const rows = [
  { icon: "lock.fill" as const, title: "Private by default", detail: "Your people and notes stay on this device." },
  { icon: "bell.fill" as const, title: "Gentle reminders", detail: "Set your own cadence. No streaks, no guilt." },
  { icon: "arrow.triangle.2.circlepath" as const, title: "Built for continuity", detail: "Relay helps you return to the relationships that matter." },
];

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <ScreenContainer className="px-5" containerClassName="bg-[#F7F3EE]">
      <View className="flex-1 pt-3">
        <RelayBrand />
        <Text className="mt-9 text-[13px] font-semibold uppercase tracking-[1.5px] text-[#FF765F]">A little more context</Text>
        <Text className="mt-2 text-[32px] font-bold leading-[37px] tracking-[-1px] text-[#14233D]">The good stuff{`\n`}stays close.</Text>
        <Text className="mt-4 text-[15px] leading-[22px] text-[#7A7772]">Relay is intentionally simple: remember the people, choose the rhythm, and show up with something real to say.</Text>

        <View className="mt-8 overflow-hidden rounded-[24px] border border-[#E5DED5] bg-white">
          {rows.map((row, index) => (
            <View key={row.title} className="flex-row items-center px-4 py-4" style={index < rows.length - 1 ? styles.divider : undefined}>
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF0EB]">
                <IconSymbol name={row.icon} size={18} color="#FF765F" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[14px] font-bold text-[#14233D]">{row.title}</Text>
                <Text className="mt-1 text-[12px] leading-[17px] text-[#918A81]">{row.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-5 rounded-[24px] bg-[#11284F] p-5">
          <Text className="text-[12px] font-semibold uppercase tracking-[1px] text-[#AFC2E5]">Relay principle</Text>
          <Text className="mt-3 text-[19px] font-bold leading-[26px] text-white">“Consistency is a form of care.”</Text>
          <Text className="mt-3 text-[12px] leading-[18px] text-[#C5D1E3]">No feed to keep up with. Just the next meaningful moment.</Text>
        </View>

        <Pressable onPress={() => router.push("/(tabs)")} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <IconSymbol name="chevron.left" size={17} color="#77716A" />
          <Text className="ml-2 text-[13px] font-bold text-[#77716A]">Back to today</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  divider: { borderBottomWidth: 1, borderBottomColor: "#EFE9E1" },
  backButton: { alignSelf: "flex-start", marginTop: 28, flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  pressed: { opacity: 0.72 },
});
