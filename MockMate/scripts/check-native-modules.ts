/**
 * check-native-modules.ts
 *
 * Detects drift between `node_modules` RN packages and the resolved native
 * project. Autolinking for RN follows these conventions:
 *
 *   - Android: handled at runtime by `PackageList(this).packages` in
 *     `MainApplication.kt`. Per-package evidence is NOT in static gradle
 *     files; presence of `android/app/build.gradle` plus a sane
 *     `android/settings.gradle` is the strongest static signal. We check
 *     that `settings.gradle` still references the @react-native/gradle-plugin
 *     (the autolinking bridge).
 *   - iOS: handled by CocoaPods; resolved pods appear in
 *     `ios/Podfile.lock`. Per-package substring match works.
 *
 * Usage: `npm run check:native`
 * No external dependencies; runs with Node 22+ type stripping.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const APP_JSON = join(ROOT, "app.json");
const ANDROID_SETTINGS = join(ROOT, "android", "settings.gradle");
const IOS_PODFILE_LOCK = join(ROOT, "ios", "Podfile.lock");

function readMaybe(p: string): string | null {
	return existsSync(p) ? readFileSync(p, "utf8") : null;
}

function getPluginPackageNames(): string[] {
	const raw = readMaybe(APP_JSON);
	if (!raw) return [];
	try {
		// biome-ignore lint/suspicious/noExplicitAny: dynamic shape; one-off CLI script
		const parsed: any = JSON.parse(raw);
		const plugins = parsed?.expo?.plugins;
		if (!Array.isArray(plugins)) return [];
		return [
			...new Set(
				plugins
					.map((p: unknown) => (Array.isArray(p) ? p[0] : p))
					.filter((s: unknown): s is string => typeof s === "string"),
			),
		];
	} catch {
		return [];
	}
}

const failures: string[] = [];
const checks: string[] = [];

const androidExists = existsSync(ANDROID_SETTINGS);
const iosExists = existsSync(IOS_PODFILE_LOCK);

if (!androidExists && !iosExists) {
	process.stdout.write("no native project detected\n");
	process.exit(0);
}

if (androidExists) {
	const settings = readMaybe(ANDROID_SETTINGS) ?? "";
	if (!settings.includes("@react-native/gradle-plugin")) {
		failures.push(
			`FAIL: ${relative(ROOT, ANDROID_SETTINGS)} is missing the @react-native/gradle-plugin reference — Android autolinking will not work. Re-run: npx expo prebuild --clean`,
		);
	} else {
		checks.push(
			"android: gradle plugin reference OK (per-package autolinking runs at build time)",
		);
	}
}

const pluginNames = getPluginPackageNames();
if (iosExists) {
	const lock = readMaybe(IOS_PODFILE_LOCK) ?? "";
	const lcLock = lock.toLowerCase();
	let matched = 0;
	for (const name of pluginNames) {
		if (lcLock.includes(name.toLowerCase())) matched++;
		else
			failures.push(
				`FAIL: ${name} not referenced in ${relative(ROOT, IOS_PODFILE_LOCK)} — rebuild with: npx expo prebuild --clean && npx expo run:ios`,
			);
	}
	checks.push(
		`ios: ${matched}/${pluginNames.length} plugin packages present in Podfile.lock`,
	);
} else if (pluginNames.length > 0) {
	checks.push(
		"ios: no Podfile.lock detected (prebuild needed before iOS build)",
	);
}

const ok = failures.length === 0;
const total = checks.length + failures.length;
const summary = ok
	? `OK: ${total} native module checks passed`
	: `FAIL: ${failures.length} mismatch(es) across ${total} checks`;

process.stdout.write(`${summary}\n`);
for (const line of checks) process.stdout.write(`  ✓ ${line}\n`);
if (!ok) {
	for (const line of failures) process.stderr.write(`${line}\n`);
	process.exit(1);
}
process.exit(0);
