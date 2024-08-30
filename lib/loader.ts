import { SherlockData, SiteData, QueryResult, QueryStatus } from '@/types';

export async function checkUsername(username: string, siteData: SherlockData): Promise<QueryResult[]> {
  const results: QueryResult[] = [];

  for (const [siteName, site] of Object.entries(siteData)) {
    if (!isValidUsername(username, site)) {
      continue;
    }

    const url = site.url.replace('{}', username);
    let status = QueryStatus.UNKNOWN;

    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const proxyResponse = await response.json();

      if (site.errorType === 'status_code') {
        if (site.errorCode) {
          const errorCodes = Array.isArray(site.errorCode) ? site.errorCode : [site.errorCode];
          status = errorCodes.includes(proxyResponse.status) ? QueryStatus.AVAILABLE : QueryStatus.CLAIMED;
        } else {
          status = (proxyResponse.status >= 200 && proxyResponse.status < 300) ? QueryStatus.CLAIMED : QueryStatus.AVAILABLE;
        }
      } else if (site.errorType === 'message') {
        if (site.errorMsg) {
          const errorMessages = Array.isArray(site.errorMsg) ? site.errorMsg : [site.errorMsg];
          status = errorMessages.some(msg => proxyResponse.data.includes(msg)) ? QueryStatus.AVAILABLE : QueryStatus.CLAIMED;
        }
      } else if (site.errorType === 'response_url') {
        status = (proxyResponse.headers['x-final-url'] === url) ? QueryStatus.CLAIMED : QueryStatus.AVAILABLE;
      }

      results.push({
        siteName,
        siteUrl: site.urlMain,
        username,
        url,
        status,
        responseTime: proxyResponse.headers['x-response-time'],
      });
    } catch (error) {
      console.error(`Error checking ${siteName}: ${error}`);
      results.push({
        siteName,
        siteUrl: site.urlMain,
        username,
        url,
        status: QueryStatus.UNKNOWN,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

function isValidUsername(username: string, site: SiteData): boolean {
  if (site.regexCheck) {
    const regex = new RegExp(site.regexCheck);
    return regex.test(username);
  }
  return true;
}

export async function loadSherlockData(): Promise<SherlockData> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/sherlock-project/sherlock/master/sherlock_project/resources/data.json');
    if (!response.ok) {
      throw new Error('Failed to fetch Sherlock data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading Sherlock data:', error);
    throw error;
  }
}