import { ServiceInfo } from "../types";

interface ServiceInfoFormProps {
	serviceInfo: ServiceInfo;
	onUpdate: (info: ServiceInfo) => void;
}

const ServiceInfoForm: React.FC<ServiceInfoFormProps> = ({
	serviceInfo,
	onUpdate
}) => {
	const handleChange = (field: keyof ServiceInfo, value: string) => {
		onUpdate({ ...serviceInfo, [field]: value });
	};

	return (
		<div className='bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-sm border border-purple-100'>
			<h2 className='text-xl font-bold text-gray-800 mb-4'>
				Service Information
			</h2>

			<div className='space-y-4'>
				<div>
					<label
						htmlFor='serviceTitle'
						className='block text-sm font-semibold text-gray-700 mb-2'
					>
						Service Title/Theme
					</label>
					<input
						type='text'
						id='serviceTitle'
						value={serviceInfo.title}
						onChange={e => handleChange("title", e.target.value)}
						className='w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors'
						placeholder='Grace & Radiance'
					/>
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div>
						<label
							htmlFor='serviceDate'
							className='block text-sm font-semibold text-gray-700 mb-2'
						>
							Service Date
						</label>
						<input
							type='date'
							id='serviceDate'
							value={serviceInfo.serviceDate}
							onChange={e => handleChange("serviceDate", e.target.value)}
							className='w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors'
						/>
					</div>

					<div>
						<label
							htmlFor='serviceTime'
							className='block text-sm font-semibold text-gray-700 mb-2'
						>
							Service Time
						</label>
						<input
							type='time'
							id='serviceTime'
							value={serviceInfo.serviceTime}
							onChange={e => handleChange("serviceTime", e.target.value)}
							className='w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors'
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ServiceInfoForm;
