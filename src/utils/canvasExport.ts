import { ServiceInfo, ProgramSegment, Theme } from "../types";
import {
	formatDate,
	formatTime,
	formatTimeRange,
	calculateEndTime
} from "./timeUtils";

export const exportAsCanvasImage = async (
	serviceInfo: ServiceInfo,
	segments: ProgramSegment[],
	theme: Theme,
	fileName: string = "service-order.png"
): Promise<void> => {
	const canvas = document.createElement("canvas");
	canvas.width = 1080;
	canvas.height = 1350;
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		console.error("Could not get canvas context");
		return;
	}

	try {
		// Fill background color
		ctx.fillStyle = theme.backgroundColour;
		ctx.fillRect(0, 0, 1080, 1350);

		// Load and draw background image if exists
		if (theme.backgroundImage) {
			await loadAndDrawImage(ctx, theme.backgroundImage);
		}

		// Apply padding top
		const paddingTop = theme.paddingTop;
		const headerY = paddingTop + 48;

		// Draw service info banner (date / title / time)
		const bannerY = headerY + 90;
		ctx.fillStyle = theme.titleColor;
		ctx.font =
			"bold 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
		ctx.textAlign = "left";
		const bannerText = `${formatDate(serviceInfo.serviceDate)} / ${
			serviceInfo.title || "SERVICE"
		} / ${formatTime(serviceInfo.serviceTime)}`;
		ctx.fillText(bannerText, 48, bannerY);

		// Draw segments
		let currentY = bannerY + 40;
		const segmentSpacing = 16;

		for (const segment of segments) {
			const endTime = calculateEndTime(segment.startTime, segment.duration);
			const timeRange = formatTimeRange(segment.startTime, endTime);

			// Calculate box heights
			const hasPersonAssigned = !!segment.personAssigned;
			const timeBoxHeight = hasPersonAssigned ? 80 : 60;
			const timeBoxWidth = 195;

			// Time box (left side)
			ctx.fillStyle = theme.secondaryBackground;
			roundRect(ctx, 48, currentY, timeBoxWidth, timeBoxHeight, 6);
			ctx.fill();

			// Time text
			ctx.fillStyle = theme.secondaryForeground;
			ctx.font =
				"bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText(
				timeRange,
				48 + timeBoxWidth / 2,
				currentY + timeBoxHeight / 2 + 6
			);

			// Content box (right side)
			const contentBoxX = 48 + timeBoxWidth + 16;
			const contentBoxWidth = 1080 - contentBoxX - 48;
			ctx.fillStyle = theme.primaryBackground;
			roundRect(ctx, contentBoxX, currentY, contentBoxWidth, timeBoxHeight, 6);
			ctx.fill();

			// Segment title and duration
			ctx.fillStyle = theme.primaryForeground;
			ctx.font =
				"bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
			ctx.textAlign = "left";
			const titleText = `${segment.title.toUpperCase()} - ${
				segment.duration
			} Min.`;

			if (hasPersonAssigned) {
				ctx.fillText(titleText, contentBoxX + 24, currentY + 32);
			} else {
				ctx.fillText(
					titleText,
					contentBoxX + 24,
					currentY + timeBoxHeight / 2 + 8
				);
			}

			// Person assigned (if exists)
			if (segment.personAssigned) {
				ctx.font =
					"600 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
				const personTagWidth =
					ctx.measureText(segment.personAssigned).width + 24;
				const personTagX = contentBoxX + 24;
				const personTagY = currentY + 40;

				ctx.fillStyle = theme.secondaryBackground;
				roundRect(ctx, personTagX, personTagY, personTagWidth, 26, 4);
				ctx.fill();

				ctx.fillStyle = theme.secondaryForeground;
				ctx.fillText(segment.personAssigned, personTagX + 12, personTagY + 18);
			}

			currentY += timeBoxHeight + segmentSpacing;
		}

		// Download the image
		const link = document.createElement("a");
		link.download = fileName;
		link.href = canvas.toDataURL("image/png");
		link.click();
	} catch (error) {
		console.error("Error exporting canvas image:", error);
	}
};

// Helper function to draw rounded rectangles
function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

// Helper function to load and draw background image
async function loadAndDrawImage(
	ctx: CanvasRenderingContext2D,
	imageSrc: string
): Promise<void> {
	return new Promise(resolve => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			ctx.drawImage(img, 0, 0, 1080, 1350);
			resolve();
		};
		img.onerror = () => {
			console.warn("Failed to load background image, continuing without it");
			resolve(); // Resolve anyway to continue export
		};
		img.src = imageSrc;
	});
}
