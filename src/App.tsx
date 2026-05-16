import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	Calendar,
	Clock,
	Plus,
	Eye,
	Download,
	Trash2,
	Palette,
	Edit,
	X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgramSegment, ServiceInfo } from "./types";
import { calculateEndTime, formatTimeRange } from "./utils/timeUtils";
import ServiceOrderPreview from "./components/ServiceOrderPreview";
import ThemeCarousel from "./components/ThemeCarousel";
import AutoGenerateForm from "./components/AutoGenerateForm";
import { exportAsCanvasImage } from "./utils/canvasExport";
import { useSegmentSuggestions } from "./hooks/useLocalStorage";
import { THEMES, DEFAULT_THEME } from "./config/themes";

function App() {
	const [serviceInfo, setServiceInfo] = useState<ServiceInfo>({
		title: "First Service",
		serviceDate: new Date().toISOString().split("T")[0],
		serviceTime: "10:10"
	});

	const [segments, setSegments] = useState<ProgramSegment[]>([]);
	const [showPreview, setShowPreview] = useState(false);
	const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);
	const { titles, persons, addTitle, addPerson } = useSegmentSuggestions();

	const [formData, setFormData] = useState({
		title: "",
		startTime: "",
		duration: "",
		personAssigned: ""
	});

	const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);

	// Auto-fill start time based on last segment's end time
	useEffect(() => {
		if (segments.length > 0 && !formData.startTime && !editingSegmentId) {
			const lastSegment = segments[segments.length - 1];
			const nextStartTime = calculateEndTime(
				lastSegment.startTime,
				lastSegment.duration
			);
			setFormData(prev => ({ ...prev, startTime: nextStartTime }));
		}
	}, [segments, editingSegmentId]);

	const addSegment = () => {
		if (!formData.title || !formData.startTime || !formData.duration) {
			alert("Please fill in all required fields");
			return;
		}

		// Save to local storage suggestions
		addTitle(formData.title);
		if (formData.personAssigned) {
			addPerson(formData.personAssigned);
		}

		if (editingSegmentId) {
			// Update existing segment
			setSegments(
				segments.map(seg =>
					seg.id === editingSegmentId
						? {
							...seg,
							title: formData.title,
							startTime: formData.startTime,
							duration: parseInt(formData.duration),
							personAssigned: formData.personAssigned || undefined
						}
						: seg
				)
			);
			setEditingSegmentId(null);
		} else {
			// Add new segment
			const newSegment: ProgramSegment = {
				id: Date.now().toString(),
				title: formData.title,
				startTime: formData.startTime,
				duration: parseInt(formData.duration),
				personAssigned: formData.personAssigned || undefined
			};
			setSegments([...segments, newSegment]);
		}

		// Calculate next start time
		const nextStartTime = calculateEndTime(
			formData.startTime,
			parseInt(formData.duration)
		);
		setFormData({
			title: "",
			startTime: nextStartTime,
			duration: "",
			personAssigned: ""
		});
	};

	const editSegment = (segment: ProgramSegment) => {
		setFormData({
			title: segment.title,
			startTime: segment.startTime,
			duration: segment.duration.toString(),
			personAssigned: segment.personAssigned || ""
		});
		setEditingSegmentId(segment.id);
		// Scroll to form
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const cancelEdit = () => {
		setEditingSegmentId(null);
		setFormData({
			title: "",
			startTime: "",
			duration: "",
			personAssigned: ""
		});
	};

	const deleteSegment = (id: string) => {
		setSegments(segments.filter(seg => seg.id !== id));
		if (editingSegmentId === id) {
			cancelEdit();
		}
	};

	const clearAll = () => {
		if (confirm("Are you sure you want to clear all segments?")) {
			setSegments([]);
		}
	};

	const handleExport = async () => {
		const date = serviceInfo.serviceDate
			? serviceInfo.serviceDate.replace(/-/g, "")
			: "service-order";
		await exportAsCanvasImage(
			serviceInfo,
			segments,
			selectedTheme,
			`service-order-${date}.png`
		);
	};

	// Handle applying generated segments from auto-generate
	const handleApplyGeneratedSegments = (
		newSegments: ProgramSegment[],
		newServiceInfo?: ServiceInfo,
		mode: "replace" | "append" = "replace"
	) => {
		if (mode === "replace") {
			setSegments(newSegments);
		} else {
			setSegments([...segments, ...newSegments]);
		}

		if (newServiceInfo) {
			setServiceInfo(newServiceInfo);
		}
	};

	return (
		<div className='h-dvh bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col'>
			{/* Header */}
			<header className='border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40'>
				<div className='container mx-auto px-4 py-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<div className='flex items-center gap-2 divide-x divide-muted-foreground'>
								<img
									src='/assets/images/logo.png'
									alt='Church Logo'
									className='h-6 w-36 object-contain'
								/>
								<p className='hidden md:block text-sm text-muted-foreground px-3'>
									Service Order Generator
								</p>
							</div>
						</div>

						<div className='flex items-center gap-2'>
							<Button
								variant='outline'
								onClick={() => setShowPreview(true)}
								disabled={segments.length === 0}
							>
								<Eye className='h-4 w-4' />
								<span className='hidden md:block'>Preview</span>
							</Button>
							<Button
								onClick={() => setShowPreview(true)}
								disabled={segments.length === 0}
							>
								<Download className='h-4 w-4' />
								<span className='hidden md:block'>Export</span>
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className='container mx-auto px-4 py-8 flex-1 overflow-y-hidden'>
				<div className='h-full grid grid-cols-1 lg:grid-cols-3 gap-3 overflow-y-hidden'>
					{/* Left Column - Tabbed Interface */}
					<div className='lg:col-span-1 h-full overflow-y-auto md:pr-3'>
						<Tabs defaultValue="manual" className="h-full flex flex-col">
							<TabsList className="grid w-full grid-cols-2 mb-4 flex-shrink-0">
								<TabsTrigger value="manual">Manual</TabsTrigger>
								<TabsTrigger value="auto">Auto Generate</TabsTrigger>
							</TabsList>

							{/* Manual Tab Content */}
							<TabsContent value="manual" className="flex-1 space-y-6 mt-0">
								{/* Service Information */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}
									className='w-full'
								>
									<Card className='w-full'>
										<CardHeader>
											<CardTitle className='text-lg'>Service Information</CardTitle>
											<CardDescription>
												Set the date and time for your service
											</CardDescription>
										</CardHeader>
										<CardContent className='w-full'>
											<div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>
												<div className='space-y-2 col-span-1 md:col-span-2'>
													<Label htmlFor='serviceTitle'>Title</Label>
													<Input
														id='serviceTitle'
														type='text'
														placeholder='e.g., SECOND SERVICE'
														value={serviceInfo.title}
														onChange={e =>
															setServiceInfo({
																...serviceInfo,
																title: e.target.value
															})
														}
													/>
												</div>

												<div className='space-y-2'>
													<Label htmlFor='serviceDate'>
														<Calendar className='h-4 w-4 inline mr-2' />
														Date
													</Label>
													<Input
														id='serviceDate'
														type='date'
														value={serviceInfo.serviceDate}
														onChange={e =>
															setServiceInfo({
																...serviceInfo,
																serviceDate: e.target.value
															})
														}
													/>
												</div>

												<div className='space-y-2'>
													<Label htmlFor='serviceTime'>
														<Clock className='h-4 w-4 inline mr-2' />
														Time
													</Label>
													<Input
														id='serviceTime'
														type='time'
														value={serviceInfo.serviceTime}
														onChange={e =>
															setServiceInfo({
																...serviceInfo,
																serviceTime: e.target.value
															})
														}
													/>
												</div>
											</div>
										</CardContent>
									</Card>
								</motion.div>

								{/* Add Segment Form */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.1 }}
								>
									<Card>
										<CardHeader>
											<CardTitle className='text-lg'>
												{editingSegmentId
													? "Edit Program Segment"
													: "Add Program Segment"}
											</CardTitle>
											<CardDescription>
												{editingSegmentId
													? "Update the segment details"
													: "Add items to your service order"}
											</CardDescription>
										</CardHeader>
										<CardContent className='space-y-4'>
											<div className='space-y-2'>
												<Label htmlFor='title'>
													Segment Title <span className='text-destructive'>*</span>
												</Label>
												<Combobox
													id='title'
													placeholder='e.g., Call to Worship'
													value={formData.title}
													onChange={value =>
														setFormData({ ...formData, title: value })
													}
													suggestions={titles}
												/>
											</div>

											<div className='grid grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label htmlFor='startTime'>
														Start Time <span className='text-destructive'>*</span>
													</Label>
													<Input
														id='startTime'
														type='time'
														value={formData.startTime}
														onChange={e =>
															setFormData({
																...formData,
																startTime: e.target.value
															})
														}
													/>
												</div>

												<div className='space-y-2'>
													<Label htmlFor='duration'>
														Duration (mins){" "}
														<span className='text-destructive'>*</span>
													</Label>
													<Input
														id='duration'
														type='number'
														placeholder='5'
														min='1'
														value={formData.duration}
														onChange={e =>
															setFormData({ ...formData, duration: e.target.value })
														}
													/>
												</div>
											</div>

											<div className='space-y-2'>
												<Label htmlFor='personAssigned'>
													Person Assigned (Optional)
												</Label>
												<Combobox
													id='personAssigned'
													placeholder='e.g., Min Dele'
													value={formData.personAssigned}
													onChange={value =>
														setFormData({
															...formData,
															personAssigned: value
														})
													}
													suggestions={persons}
												/>
											</div>

											{editingSegmentId ? (
												<div className='flex gap-2'>
													<Button
														onClick={cancelEdit}
														variant='outline'
														className='flex-1'
													>
														<X className='h-4 w-4' />
														Cancel
													</Button>
													<Button onClick={addSegment} className='flex-1'>
														<Edit className='h-4 w-4' />
														Update
													</Button>
												</div>
											) : (
												<Button onClick={addSegment} className='w-full'>
													<Plus className='h-4 w-4' />
													Add Segment
												</Button>
											)}
										</CardContent>
									</Card>
								</motion.div>

								{/* Theme Selection */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.2 }}
								>
									<Card>
										<CardHeader>
											<CardTitle className='text-lg flex items-center gap-2'>
												<Palette className='h-5 w-5' />
												Select Theme
											</CardTitle>
											<CardDescription>
												Choose a theme for your service order
											</CardDescription>
										</CardHeader>
										<CardContent>
											<ThemeCarousel
												themes={THEMES}
												selectedTheme={selectedTheme}
												onSelectTheme={setSelectedTheme}
											/>
										</CardContent>
									</Card>
								</motion.div>
							</TabsContent>

							{/* Auto Generate Tab Content */}
							<TabsContent value="auto" className="flex-1 mt-0">
								<AutoGenerateForm
									onApplySegments={handleApplyGeneratedSegments}
									existingSegmentsCount={segments.length}
								/>

								{/* Theme Selection - also show in auto tab */}
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.2 }}
									className="mt-6"
								>
									<Card>
										<CardHeader>
											<CardTitle className='text-lg flex items-center gap-2'>
												<Palette className='h-5 w-5' />
												Select Theme
											</CardTitle>
											<CardDescription>
												Choose a theme for your service order
											</CardDescription>
										</CardHeader>
										<CardContent>
											<ThemeCarousel
												themes={THEMES}
												selectedTheme={selectedTheme}
												onSelectTheme={setSelectedTheme}
											/>
										</CardContent>
									</Card>
								</motion.div>
							</TabsContent>
						</Tabs>
					</div>

					{/* Right Column - Segments List */}
					<div className='lg:col-span-2 h-full overflow-y-auto'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.3 }}
						>
							<Card className='h-full flex flex-col'>
								<CardHeader className='flex-shrink-0'>
									<div className='flex items-center justify-between'>
										<div>
											<CardTitle className='text-lg'>
												Program Segments
											</CardTitle>
											<CardDescription>
												{segments.length === 0
													? "No segments added yet"
													: `${segments.length} segment${segments.length > 1 ? "s" : ""
													} added`}
											</CardDescription>
										</div>
										{segments.length > 0 && (
											<Button
												variant='destructive'
												size='sm'
												onClick={clearAll}
											>
												<Trash2 className='h-4 w-4' />
												Clear All
											</Button>
										)}
									</div>
								</CardHeader>
								<CardContent className='flex-1 overflow-y-auto'>
									{segments.length === 0 ? (
										<div className='text-center py-12'>
											<div className='bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
												<Plus className='h-8 w-8 text-muted-foreground' />
											</div>
											<p className='text-muted-foreground'>
												Add your first program segment to get started
											</p>
										</div>
									) : (
										<div className='space-y-3'>
											{segments.map((segment, index) => {
												const endTime = calculateEndTime(
													segment.startTime,
													segment.duration
												);

												return (
													<motion.div
														key={segment.id}
														initial={{ opacity: 0, x: -20 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ duration: 0.2 }}
														className='border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors'
													>
														<div className='flex items-start justify-between gap-4'>
															<div className='flex gap-3 flex-1 items-center'>
																<div className='bg-primary text-primary-foreground rounded-md w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0'>
																	{index + 1}
																</div>
																<div className='flex-1'>
																	<h4 className='font-semibold text-foreground mb-1'>
																		{segment.title}
																	</h4>
																	<div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground'>
																		<span className='flex items-center gap-1'>
																			<Clock className='h-3 w-3' />
																			{formatTimeRange(
																				segment.startTime,
																				endTime
																			)}
																		</span>
																		<span className='font-medium'>
																			({segment.duration} mins)
																		</span>
																		{segment.personAssigned && (
																			<span className='text-foreground font-medium'>
																				{segment.personAssigned}
																			</span>
																		)}
																	</div>
																</div>
															</div>
															<div className='flex gap-2'>
																<Button
																	variant='ghost'
																	size='icon'
																	onClick={() => editSegment(segment)}
																	className='text-primary hover:text-primary flex-shrink-0'
																>
																	<Edit className='h-4 w-4' />
																</Button>
																<Button
																	variant='ghost'
																	size='icon'
																	onClick={() => deleteSegment(segment.id)}
																	className='text-destructive hover:text-destructive flex-shrink-0'
																>
																	<Trash2 className='h-4 w-4' />
																</Button>
															</div>
														</div>
													</motion.div>
												);
											})}
										</div>
									)}
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</div>
			</main>

			{/* Preview Dialog */}
			<Dialog open={showPreview} onOpenChange={setShowPreview}>
				<DialogContent className='max-w-2xl max-h-[95vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Service Order Preview</DialogTitle>
					</DialogHeader>
					<div className='mt-4'>
						<ServiceOrderPreview
							serviceInfo={serviceInfo}
							segments={segments}
							theme={selectedTheme}
						/>
					</div>
					<div className='flex justify-end gap-2 mt-4'>
						<Button variant='outline' onClick={() => setShowPreview(false)}>
							Close
						</Button>
						<Button onClick={handleExport}>
							<Download className='h-4 w-4' />
							Export as Image
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default App;
