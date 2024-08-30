import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Roboto_Mono } from 'next/font/google';

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

interface UserListProps {
    users: Set<string>;
    onDeleteUser: (username: string) => void;
}

export default function UserList({ users, onDeleteUser }: UserListProps) {
    const sortedUsers = Array.from(users).sort((a, b) => a.localeCompare(b));
    return (
        <div className='flex flex-wrap justify-center gap-2'>
            <AnimatePresence initial={false}>
                {sortedUsers.map((user) => (
                    <motion.div
                        key={user}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{
                            opacity: { duration: 0.1 },
                            scale: { duration: 0.1 },
                            layout: { duration: 0.15 }
                        }}
                        className='flex items-center rounded-full bg-gray-100 border-2 border-solid border-gray-100 pl-3 pr-1 py-1 text-sm'
                    >
                        <span className="mr-2">{user}</span>
                        <button
                            onClick={() => onDeleteUser(user)}
                            className="focus:outline-none flex items-center justify-center"
                        >
                            <div
                                className='flex items-center justify-center bg-gray-300 p-1 rounded-full w-5 h-5'>
                                <Image src='/close-button.svg' width={8} height={8} alt='Close Button' />
                            </div>
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}