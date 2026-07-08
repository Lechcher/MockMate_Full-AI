const { withGradleProperties } = require("expo/config-plugins");

/**
 * Adds android.packagingOptions.pickFirsts to gradle.properties
 * to resolve META-INF duplicate between okhttp3:logging-interceptor and jspecify.
 */
function withAndroidPackaging(config) {
	return withGradleProperties(config, (cfg) => {
		const prop = {
			type: "property",
			key: "android.packagingOptions.pickFirsts",
			value: "META-INF/versions/9/OSGI-INF/MANIFEST.MF",
		};
		// Remove existing entry if present, then add
		cfg.modResults = cfg.modResults.filter((p) => p.key !== prop.key);
		cfg.modResults.push(prop);
		return cfg;
	});
}

module.exports = withAndroidPackaging;
