import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Theme } from "../types";
import { cn } from "@/lib/utils";

interface ThemeCarouselProps {
	themes: Theme[];
	selectedTheme: Theme;
	onSelectTheme: (theme: Theme) => void;
}

const ThemeCarousel: React.FC<ThemeCarouselProps> = ({
	themes,
	selectedTheme,
	onSelectTheme
}) => {
	return (
		<div className='w-full'>
			<div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
				{themes.map(theme => {
					const isSelected = selectedTheme.id === theme.id;

					return (
						<motion.button
							key={theme.id}
							onClick={() => onSelectTheme(theme)}
							className={cn(
								"relative rounded-lg overflow-hidden border-2 transition-all",
								isSelected
									? "border-primary shadow-lg scale-105"
									: "border-border hover:border-primary/50 hover:scale-102"
							)}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							{/* Theme Preview */}
							<div
								className='aspect-[4/5] relative'
								style={{
									background: theme.backgroundImage
										? `url(${theme.backgroundImage}) center/cover no-repeat`
										: `linear-gradient(135deg, ${theme.primaryBackground} 0%, ${theme.secondaryBackground} 100%)`
								}}
							>
								{/* Overlay */}
								<div className='absolute inset-0 bg-gradient-to-br from-black/20 to-transparent' />

								{/* Theme Name */}
								<div className='absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent'>
									<p className='text-white text-xs font-semibold text-center'>
										{theme.name}
									</p>
								</div>

								{/* Selected Indicator */}
								{isSelected && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className='absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1'
									>
										<Check className='h-3 w-3' />
									</motion.div>
								)}
							</div>
						</motion.button>
					);
				})}
			</div>
		</div>
	);
};

export default ThemeCarousel;
