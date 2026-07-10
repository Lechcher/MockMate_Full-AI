import '../../polyfills'
import '../../global.css'

import { Slot } from 'expo-router'

export default function RootLayout() {
	return (
		<>
			{/* Providers: AuthProvider → QueryProvider → VIPProvider */}
			<Slot />
		</>
	)
}
