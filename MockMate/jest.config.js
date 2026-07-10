module.exports = {
	preset: 'jest-expo/universal',
	testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
	// Only run in Node + Web projects — native iOS/Android RN preset variants
	// require expo prebuild and aren't applicable to scaffold-only tests
	projects: undefined,
};
