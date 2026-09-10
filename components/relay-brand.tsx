import { Image, Text, View } from "react-native";

export function RelayBrand({ compact = false }: { compact?: boolean }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className={compact ? "h-10 w-10 overflow-hidden rounded-2xl bg-[#FFF0EB]" : "h-12 w-12 overflow-hidden rounded-[18px] bg-[#FFF0EB]"}>
        <Image source={require("@/assets/images/relay-mark-optimized.png")} className="h-full w-full" resizeMode="contain" />
      </View>
      {!compact ? <Text className="text-xl font-bold tracking-[-0.5px] text-foreground">relay</Text> : null}
    </View>
  );
}
