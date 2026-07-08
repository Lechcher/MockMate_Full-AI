/**
 * Text component with typography variants
 */

import type React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { twMerge as cn } from "tailwind-merge";

interface TextProps extends RNTextProps {
	variant?: "heading" | "subheading" | "body" | "caption" | "label";
	weight?: "normal" | "medium" | "semibold" | "bold";
	color?: string;
	className?: string;
	children: React.ReactNode;
}

export function Text({
	variant = "body",
	weight,
	color,
	className,
	children,
	...props
}: TextProps) {
	const variantStyles = {
		heading: "text-3xl",
		subheading: "text-xl",
		body: "text-base",
		caption: "text-sm",
		label: "text-xs",
	};

	const variantWeight = {
		heading: "font-bold",
		subheading: "font-semibold",
		body: "font-normal",
		caption: "font-normal",
		label: "font-medium",
	};

	const weightStyles = weight
		? {
				normal: "font-normal",
				medium: "font-medium",
				semibold: "font-semibold",
				bold: "font-bold",
			}[weight]
		: variantWeight[variant];

	const colorStyle = color || "text-gray-900";

	return (
		<RNText
			className={cn(
				variantStyles[variant],
				weightStyles,
				colorStyle,
				className,
			)}
			{...props}
		>
			{children}
		</RNText>
	);
}
