export interface IWebsiteLogo {
  logo: File;
}

export interface IWebsitePayload {
  websiteName: string;
  timeZone: string;
}

export interface IWebsite {
  logo: any;
  websiteName: string;
  timeZone: string;
  emails: string[];
}
