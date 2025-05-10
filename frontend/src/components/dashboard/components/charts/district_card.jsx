import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

const DistrictDropdownView = ({ districtData, formatBudget }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [filteredDistricts, setFilteredDistricts] = useState([]);

    // Set the first district as default selected when component mounts
    useEffect(() => {
        if (districtData && districtData.length > 0 && !selectedDistrict) {
            setSelectedDistrict(districtData[0]);
        }
        setFilteredDistricts(districtData);
    }, [districtData]);

    // Filter districts based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredDistricts(districtData);
        } else {
            const filtered = districtData.filter(district =>
                district.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredDistricts(filtered);
        }
    }, [searchTerm, districtData]);

    // Handle district selection
    const selectDistrict = (district) => {
        setSelectedDistrict(district);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    // Get status color based on project completion percentage
    const getStatusColor = (percentage) => {
        if (percentage > 75) return "var(--color-success)";
        if (percentage > 40) return "var(--color-warning)";
        return "var(--color-error)";
    };

    return (
        <div className="h-full overflow-y-auto mt-3 bg-[var(--color-surface-secondary)] rounded-br-xl rounded-bl-xl">
            {/* Sticky Dropdown and Search */}
            <div className="sticky top-0 z-10 bg-[var(--color-surface-secondary)] p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    {/* District Selector Dropdown */}
                    <div className="relative flex-1">
                        <button
                            className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span className="truncate text-gray-700 dark:text-gray-200 font-medium">
                                {selectedDistrict ? selectedDistrict.name : 'Select District'}
                            </span>
                            {isDropdownOpen ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-56 rounded-md overflow-auto focus:outline-none">
                                {/* Search input */}
                                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            className="pl-8 pr-4 py-1 w-full text-sm rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Search districts..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* District options */}
                                <ul className="py-1">
                                    {filteredDistricts.length > 0 ? (
                                        filteredDistricts.map((district, index) => (
                                            <li
                                                key={index}
                                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200"
                                                onClick={() => selectDistrict(district)}
                                            >
                                                {district.name}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                                            No districts found
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* District Data Content - No Card Wrapper */}
            {selectedDistrict && (
                <div className="p-4 w-full">
                    {/* Basic Info Row */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            {selectedDistrict.name}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className=" p-3 rounded-lg">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Budget Allocation</div>
                                <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                                    ₹{formatBudget(selectedDistrict.budget)}
                                </div>
                            </div>

                            <div className="bg-[var(--color-surface-hover)] justify-center flex flex-col p-3 rounded-lg">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Project Status</div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="text-xl font-bold"
                                        style={{ color: getStatusColor(selectedDistrict.projectStatus) }}
                                    >
                                        {selectedDistrict.projectStatus}%
                                    </div>
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: getStatusColor(selectedDistrict.projectStatus) }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* School Implementation Row */}
                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <span className="inline-block w-3 h-3 rounded-full bg-[var(--color-success)] mr-2"></span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">School Implementation</span>
                        </div>

                        <div className="bg-[var(--color-surface-hover)] p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                        {selectedDistrict.schoolsCompleted}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Schools Completed</div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                        {selectedDistrict.schoolsTotal}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Schools</div>
                                </div>
                            </div>

                            <div className="mt-3">
                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                                    <div
                                        className="h-2 rounded-full bg-[var(--color-success)]"
                                        style={{
                                            width: `${(selectedDistrict.schoolsCompleted / selectedDistrict.schoolsTotal) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                                    {Math.round((selectedDistrict.schoolsCompleted / selectedDistrict.schoolsTotal) * 100)}% Complete
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500 dark:text-gray-400">Overall Project Status</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {selectedDistrict.projectStatus}%
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-600">
                            <div
                                className="h-2 rounded-full"
                                style={{
                                    width: `${selectedDistrict.projectStatus}%`,
                                    backgroundColor: getStatusColor(selectedDistrict.projectStatus)
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DistrictDropdownView;