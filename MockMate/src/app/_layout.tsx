import "../../global.css";
import "../../polyfills";

import { Stack } from "expo-router";
import { AuthProvider } from "../lib/auth/AuthProvider";
import { RequireAuth } from "../lib/auth/RequireAuth";
import { QueryProvider } from "../lib/query/QueryProvider";
import { VIPProvider } from "../lib/revenuecat/VIPContext";

export default function RootLayout() {
	return (
		<AuthProvider>
			<QueryProvider>
				<VIPProvider>
					<RequireAuth>
						<Stack
							screenOptions={{
								headerShown: false,
								animation: "slide_from_right",
								animationDuration: 200,
							}}
						>
							<Stack.Screen
								name="(auth)"
								options={{
									headerShown: false,
									animation: "fade",
								}}
							/>
							<Stack.Screen
								name="(tabs)"
								options={{
									headerShown: false,
									animation: "fade",
								}}
							/>
							<Stack.Screen
								name="interview/[id]"
								options={{
									animation: "slide_from_right",
								}}
							/>
							<Stack.Screen
								name="interview/mode"
								options={{
									animation: "slide_from_right",
								}}
							/>
							<Stack.Screen
								name="interview/text"
								options={{
									animation: "slide_from_bottom",
									presentation: "card",
								}}
							/>
							<Stack.Screen
								name="interview/voice"
								options={{
									animation: "slide_from_bottom",
									presentation: "card",
								}}
							/>
							<Stack.Screen
								name="interview/results"
								options={{
									animation: "fade",
									gestureEnabled: false,
								}}
							/>
						</Stack>
					</RequireAuth>
				</VIPProvider>
			</QueryProvider>
		</AuthProvider>
	);
}
