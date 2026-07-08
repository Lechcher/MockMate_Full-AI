import { Text, View } from "react-native";

export default function Index() {
	return (
		<View className="flex-1 items-center justify-center bg-white p-4">
			<Text className="text-lg font-bold text-gray-900">
				Uniwind is working! 🎉
			</Text>
			<Text className="mt-2 text-sm text-gray-600">
				Edit src/app/index.tsx to edit this screen.
			</Text>
		</View>
	);
}
