/**
 * Icon wrapper for Lucide icons
 *
 * Pass the icon component directly (imported from lucide-react-native) when
 * you need compile-time name safety. Pass a string only when you have a
 * runtime lookup table (e.g. industry → icon map); miss renders null + warns.
 */

import * as LucideIcons from "lucide-react-native";

interface IconProps {
	/** Pass a Lucide icon component (typed). */
	component?: React.ComponentType<{
		size?: number;
		color?: string;
		fill?: string;
		strokeWidth?: number;
		className?: string;
	}>;
	/** Or look up by name (resolves to component at runtime). */
	name?: keyof typeof LucideIcons | (string & {});
	size?: number;
	color?: string;
	/** Fill color for solid icons (e.g. filled Heart/Star). */
	fill?: string;
	strokeWidth?: number;
	className?: string;
}

export function Icon({
	component,
	name,
	size = 24,
	color = "currentColor",
	fill = "none",
	strokeWidth = 2,
	className,
}: IconProps) {
	const IconComponent =
		component ??
		(name
			? (
					LucideIcons as unknown as Record<
						string,
						React.ComponentType<{
							size?: number;
							color?: string;
							fill?: string;
							strokeWidth?: number;
							className?: string;
						}>
					>
				)[String(name)]
			: undefined);

	if (!IconComponent) {
		console.warn(
			`Icon "${String(name ?? "<unnamed>")}" not found in lucide-react-native`,
		);
		return null;
	}

	return (
		<IconComponent
			size={size}
			color={color}
			fill={fill}
			strokeWidth={strokeWidth}
			className={className}
		/>
	);
}
