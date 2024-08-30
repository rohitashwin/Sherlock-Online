import React, { useState, ChangeEvent } from 'react';
import Image from 'next/image';

interface UserInputProps {
    onAddUser: (username: string, shouldSubmit?: boolean) => void;
    nsfwStatus: boolean;
    onNsfwToggle: () => void;
}

export default function UserInput({ onAddUser, nsfwStatus, onNsfwToggle }: UserInputProps) {
    const [username, setUsername] = useState('');

    const handleAddUser = () => {
        onAddUser(username);
        setUsername('');
    };

    const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.includes(' ')) {
            handleAddUser();
            return;
        }
        setUsername(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onAddUser(username, true);
        setUsername('');
    }

    const toggleNsfw = () => {
        onNsfwToggle();
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className='block'>
                <div className='flex justify-center items-center w-full border-2 rounded-full px-2 py-1.5'>
                    <div className='w-30-p h-30-p rounded-full p-1.5 mr-4'>
                        <Image src='/mag-glass.svg' width={17} height={17} alt='Search Icon'/>
                    </div>
                    <input
                        type="text"
                        autoComplete='off'
                        placeholder="Enter username(s) separated by space"
                        value={username}
                        onChange={handleUsernameChange}
                        className='focus:outline-none w-full'
                    />
                    <button
                        type="button"
                        onClick={toggleNsfw}
                        className={`
                            ml-2 px-2 py-1 rounded-full text-sm font-medium
                            transition-colors duration-50 ease-in-out
                            ${nsfwStatus
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 line-through'
                            }
                        `}
                    >
                        NSFW
                    </button>
                </div>
            </form>
        </div>
    );
}