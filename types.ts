export interface SiteData {
    errorMsg?: string | string[];
    errorType: 'message' | 'status_code' | 'response_url';
    url: string;
    urlMain: string;
    username_claimed: string;
    regexCheck?: string;
    errorCode?: number | number[];
    isNSFW?: boolean;
  }
  
  export interface SherlockData {
    [siteName: string]: SiteData;
  }
  
  export enum QueryStatus {
    CLAIMED = 'CLAIMED',
    AVAILABLE = 'AVAILABLE',
    UNKNOWN = 'UNKNOWN',
  }
  
  export interface QueryResult {
    siteName: string;
    siteUrl: string;
    username: string;
    url: string;
    status: QueryStatus;
    responseTime?: string | null;
    error?: string;
  }