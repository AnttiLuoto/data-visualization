import React, { useState, Fragment } from 'react';
// import { ChevronDownIcon } from '@heroicons/react/20/solid';  // Ensure you have this dependency

// Simple class joiner function
function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const DropdownMenu = ({ items, onItemSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="relative inline-block text-left">
            <button
                id="dropdownButton"
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={toggleOpen}
            >
                Select Option
            </button>

            {isOpen && (
                <div
                    // className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 max-h-80 overflow-y-auto"

                    role="menu"
                >
                    <ul className="py-1 text-sm text-black">
                        {items.map((item, index) => (
                            <li key={index} className="px-4 py-2 hover:bg-green-200">
                                <button
                                    className="w-full text-left"
                                    onClick={() => {
                                        onItemSelect(item);
                                        setIsOpen(false);
                                    }}
                                >
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
