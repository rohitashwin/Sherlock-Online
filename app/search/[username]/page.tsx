'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchResult from '@/components/SearchResult';
import axios from 'axios';

interface SiteData {
    [key: string]: {
        url: string;
        urlMain: string;
        errorType: string;
        errorMsg?: string | string[];
        regexCheck?: string;
        isNSFW?: boolean;
    };
}

interface Result {
    site: string;
    url: string;
    exists: boolean | null;
    isNSFW: boolean;
}

export default function SearchPage({ params, searchParams }: { params: { username: string }, searchParams: { nsfw: string } }) {
    const [siteData, setSiteData] = useState<SiteData>({});
    const [results, setResults] = useState<Result[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const username = params.username;
    const isNsfw = searchParams.nsfw === 'true';

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                const response = await axios.get('https://raw.githubusercontent.com/sherlock-project/sherlock/master/sherlock_project/resources/data.json');
                setSiteData(response.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching site data:', error);
                setIsLoading(false);
            }
        };

        fetchSiteData();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const filteredSites: SiteData = Object.entries(siteData)
                .filter(([_, site]) => isNsfw || !site.isNSFW)
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

            Object.entries(filteredSites).forEach(async ([site, siteInfo]) => {
                const url = siteInfo.url.replace('{}', username);

                try {
                    const response = await axios.get(`/api/proxy?url=${encodeURIComponent(url)}`);
                    let exists = null;

                    if (siteInfo.errorType === 'status_code') {
                        exists = response.data.status === 200;
                    } else if (siteInfo.errorType === 'message') {
                        const errorMsg = Array.isArray(siteInfo.errorMsg) ? siteInfo.errorMsg : [siteInfo.errorMsg];
                        exists = !errorMsg.some(msg => response.data.data.includes(msg));
                    }

                    setResults(prevResults => [
                        ...prevResults,
                        { site, url, exists, isNSFW: siteInfo.isNSFW || false }
                    ]);
                } catch (error) {
                    console.error(`Error checking ${site}:`, error);
                    setResults(prevResults => [
                        ...prevResults,
                        { site, url, exists: null, isNSFW: siteInfo.isNSFW || false }
                    ]);
                }
            });
        }
    }, [isLoading, siteData, username, isNsfw]);

    return (
        <div className='w-full h-full flex flex-col items-center'>
            <header className="w-full flex flex-col items-center justify-center p-5 fixed top-0 left-0 z-10 bg-white bg-opacity-50 backdrop-filter backdrop-blur-[10px]">
                <Link href='/'>
                    <Image src='/hat-logo.svg' width={50} height={50} alt='Logo' className='text-gray-300' />
                </Link>
            </header>
            <div className='w-full max-w-[600px] mt-20 flex flex-col items-center'>
                {results.map(({ site, url, exists, isNSFW }) => (
                    exists &&
                    <SearchResult
                        key={site}
                        siteName={site}
                        url={url}
                        isLoading={false}
                        isNsfw={isNSFW}
                    />
                ))}
                {isLoading && <SearchResult siteName="Loading..." url="" isLoading={true} isNsfw={false} />}
            </div>
        </div>
    );
}