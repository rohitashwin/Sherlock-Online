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
        errorCode?: number | number[];
        regexCheck?: string;
        isNSFW?: boolean;
    };
}

interface Result {
    site: string;
    url: string;
    status: {
        status: 'CLAIMED' | 'AVAILABLE' | 'UNKNOWN' | 'ILLEGAL' | 'WAF';
        query_time?: number;
        context?: string;
    };
    urlMain: string;
    http_status?: number;
    response_text?: string;
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
                    const startTime = performance.now();
                    const response = await axios.get(`/api/proxy?url=${encodeURIComponent(url)}`);
                    const endTime = performance.now();
                    const query_time = endTime - startTime;

                    let status: Result['status'] = { status: 'UNKNOWN', query_time };

                    // WAF detection
                    const WAFHitMsgs = [
                        '.loading-spinner{visibility:hidden}body.no-js .challenge-running{display:none}body.dark{background-color:#222;color:#d9d9d9}body.dark a{color:#fff}body.dark a:hover{color:#ee730a;text-decoration:underline}body.dark .lds-ring div{border-color:#999 transparent transparent}body.dark .font-red{color:#b20f03}body.dark',
                        '{return l.onPageView}}),Object.defineProperty(r,"perimeterxIdentifiers",{enumerable:'
                    ];

                    if (WAFHitMsgs.some(msg => response.data.data.includes(msg))) {
                        status.status = 'WAF';
                    } else if (siteInfo.errorType === 'message') {
                        const errors = siteInfo.errorMsg;
                        let error_flag = true;

                        if (typeof errors === 'string') {
                            if (response.data.data.includes(errors)) {
                                error_flag = false;
                            }
                        } else if (Array.isArray(errors)) {
                            for (const error of errors) {
                                if (response.data.data.includes(error)) {
                                    error_flag = false;
                                    break;
                                }
                            }
                        }

                        status.status = error_flag ? 'CLAIMED' : 'AVAILABLE';
                    } else if (siteInfo.errorType === 'status_code') {
                        const errorCodes = Array.isArray(siteInfo.errorCode) ? siteInfo.errorCode : [siteInfo.errorCode];
                        status.status = 'CLAIMED';

                        if (errorCodes && errorCodes.includes(response.data.status)) {
                            status.status = 'AVAILABLE';
                        } else if (response.data.status >= 300 || response.data.status < 200) {
                            status.status = 'AVAILABLE';
                        }
                    } else if (siteInfo.errorType === 'response_url') {
                        status.status = (200 <= response.data.status && response.data.status < 300) ? 'CLAIMED' : 'AVAILABLE';
                    }

                    setResults(prevResults => [
                        ...prevResults,
                        {
                            site,
                            url,
                            status,
                            urlMain: siteInfo.urlMain,
                            http_status: response.data.status,
                            response_text: response.data.data
                        }
                    ]);
                } catch (error) {
                    console.error(`Error checking ${site}:`, error);
                    setResults(prevResults => [
                        ...prevResults,
                        {
                            site,
                            url,
                            status: { status: 'UNKNOWN', context: 'Error occurred during check' },
                            urlMain: siteInfo.urlMain
                        }
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
            <div className='w-full max-w-[600px] mt-20 px-[15px] flex flex-col items-center'>
                {results.map(({ site, url, status }) => (
                    status.status === 'CLAIMED' &&
                    <SearchResult
                        key={site}
                        siteName={site}
                        url={url}
                        isLoading={false}
                        isNsfw={siteData[site]?.isNSFW || false}
                    />
                ))}
                {isLoading && <SearchResult siteName="Loading..." url="" isLoading={true} isNsfw={false} />}
            </div>
        </div>
    );
}