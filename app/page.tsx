'use client'
import UserInput from "@/components/UserInput";
import UserList from "@/components/UserList";
import React, { useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [users, setUsers] = useState<Set<string>>(new Set());
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const [isNsfw, setIsNsfw] = useState(false);

  const handleAddUser = (username: string, shouldSubmit: boolean = false) => {
    let newUsers = new Set(users);
    if (username.trim() !== '') {
      newUsers.add(username);
    }
    setUsers(newUsers);
    setShouldSubmit(shouldSubmit);
  };

  const handleNsfwToggle = () => {
    setIsNsfw(!isNsfw);
  };

  const handleDeleteUser = (username: string) => {
    let newUsers = new Set(users);
    newUsers.delete(username);
    setUsers(newUsers);
  };

  useEffect(() => {
    if (shouldSubmit) {
      users.forEach(user => {
        window.open(`/search/${encodeURIComponent(user)}?nsfw=${isNsfw}`, '_blank');
      });
      setShouldSubmit(false);
      setUsers(new Set());
    }
  }, [shouldSubmit, users, isNsfw]);

  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
      <div id='logo-container' className='m-3'>
        <Link href="/">
          <Image src='/hat-logo.svg' width={100} height={100} alt='Logo' className='text-gray-300' />
        </Link>
      </div>
      <h1 className='text-4xl font-medium text-center mb-10'>Sherlock-Online</h1>
      <div id='search-input-container' className='w-[95%] max-w-[584px] m-5'>
        <UserInput onAddUser={handleAddUser} nsfwStatus={isNsfw} onNsfwToggle={handleNsfwToggle}/>
      </div>
      <div id='user-list-container' className='w-[95%] max-w-[700px] mx-5 mb-40'>
        <UserList users={users} onDeleteUser={handleDeleteUser} />
      </div>
    </div>
  );
}