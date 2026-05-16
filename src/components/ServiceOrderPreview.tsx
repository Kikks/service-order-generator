import { ProgramSegment, ServiceInfo, Theme } from "../types";
import {
	calculateEndTime,
	formatTimeRange,
	formatDate,
	formatTime
} from "../utils/timeUtils";

interface ServiceOrderPreviewProps {
	serviceInfo: ServiceInfo;
	segments: ProgramSegment[];
	theme: Theme;
}

const ServiceOrderPreview: React.FC<ServiceOrderPreviewProps> = ({
	serviceInfo,
	segments,
	theme
}) => {
	return (
		<div
			id='service-order-preview'
			className='relative w-full mx-auto rounded-2xl shadow-2xl overflow-hidden'
			style={{
				aspectRatio: "1080/1350",
				maxHeight: "90vh",
				background: theme.backgroundColour,
				paddingTop: theme.paddingTop
			}}
		>
			{/* Background Image Overlay */}
			{theme.backgroundImage && (
				<div
					className='absolute inset-0 bg-cover bg-center'
					style={{
						backgroundImage: `url(${theme.backgroundImage})`
					}}
				/>
			)}

			{/* Content Container */}
			<div className='relative h-full flex flex-col p-8 space-y-5'>
				{/* Service Date Banner */}
				<h1
					className='text-left text-lg md:text-xl font-bold tracking-wide'
					style={{ color: theme.titleColor }}
				>
					{serviceInfo.serviceDate && formatDate(serviceInfo.serviceDate)} /{" "}
					{serviceInfo.title || "SECOND "} /{" "}
					{serviceInfo.serviceTime && formatTime(serviceInfo.serviceTime)}
				</h1>

				{/* Program Segments - Scrollable */}
				<div className='flex-1 overflow-y-auto space-y-3'>
					{segments.length === 0 ? (
						<div
							className='backdrop-blur-sm rounded-xl p-12 text-center'
							style={{ backgroundColor: `${theme.secondaryBackground}40` }}
						>
							<p
								className='text-xl font-semibold drop-shadow'
								style={{ color: theme.titleColor }}
							>
								Add program segments to see them here
							</p>
						</div>
					) : (
						segments.map(segment => {
							const endTime = calculateEndTime(
								segment.startTime,
								segment.duration
							);

							return (
								<div
									className='grid grid-cols-[auto_1fr] gap-2 items-center'
									key={segment.id}
								>
									{/* Time Display */}
									<div
										className='px-2.5 py-2 rounded-sm text-center min-w-[120px] self-stretch grid place-items-center'
										style={{
											backgroundColor: theme.secondaryBackground,
											color: theme.secondaryForeground
										}}
									>
										<p className='text-xs font-bold'>
											{formatTimeRange(segment.startTime, endTime)}
										</p>
									</div>

									{/* Content */}
									<div
										className='flex items-start rounded-sm py-2 px-2.5 gap-1.5 flex-wrap'
										style={{
											backgroundColor: theme.primaryBackground,
											color: theme.primaryForeground
										}}
									>
										<h3
											className='text-sm leading-4'
											style={{ color: theme.primaryForeground }}
										>
											<span className='uppercase font-bold'>
												{segment.title}
											</span>{" "}
											-{" "}
											<span className='font-semibold'>
												{segment.duration} Min.
											</span>
										</h3>

										{segment.personAssigned && (
											<p
												className='text-xs font-semibold leading-3 px-1 py-0.5 rounded-sm'
												style={{
													color: theme.secondaryForeground,
													backgroundColor: theme.secondaryBackground
												}}
											>
												{segment.personAssigned}
											</p>
										)}
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
};

export default ServiceOrderPreview;
