import fetch from 'node-fetch';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

export interface NamecheapDomain {
  id: string;
  name: string;
  user: string;
  created: string;
  expires: string;
  isExpired: boolean;
  isLocked: boolean;
  autoRenew: boolean;
  whoisGuard: string;
  isPremium: boolean;
  isOurDNS: boolean;
}

export interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV';
  hostname: string;
  address: string;
  ttl: number;
  mxpref?: number;
  recordId?: string;
}

export interface DomainAvailability {
  domain: string;
  available: boolean;
  premium: boolean;
  price?: string;
}

export class NamecheapService {
  private apiUser: string;
  private apiKey: string;
  private username: string;
  private baseUrl = 'https://api.namecheap.com/xml.response';
  private clientIp: string;

  constructor() {
    this.apiUser = process.env.NAMECHEAP_API_USER || '';
    this.apiKey = process.env.NAMECHEAP_API_KEY || '';
    this.username = process.env.NAMECHEAP_USERNAME || '';
    this.clientIp = '127.0.0.1';
  }

  private async makeRequest(command: string, params: Record<string, string> = {}): Promise<any> {
    const baseParams = {
      ApiUser: this.apiUser,
      ApiKey: this.apiKey,
      UserName: this.username,
      Command: command,
      ClientIp: this.clientIp
    };

    const allParams = { ...baseParams, ...params };
    const queryString = new URLSearchParams(allParams).toString();
    const url = `${this.baseUrl}?${queryString}`;

    try {
      const response = await fetch(url);
      const xmlText = await response.text();
      const result = await parseXML(xmlText);

      if (result.ApiResponse.$.Status === 'ERROR') {
        const errors = result.ApiResponse.Errors[0].Error;
        const errorMessage = Array.isArray(errors) ? errors[0]._ : errors._;
        throw new Error(`Namecheap API Error: ${errorMessage}`);
      }

      return result.ApiResponse.CommandResponse[0];
    } catch (error: any) {
      throw new Error(`Namecheap API request failed: ${error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('namecheap.domains.getList');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getDomains(): Promise<NamecheapDomain[]> {
    try {
      const response = await this.makeRequest('namecheap.domains.getList');
      const domains = response.DomainGetListResult[0].Domain || [];

      return domains.map((domain: any) => ({
        id: domain.$.ID,
        name: domain.$.Name,
        user: domain.$.User,
        created: domain.$.Created,
        expires: domain.$.Expires,
        isExpired: domain.$.IsExpired === 'true',
        isLocked: domain.$.IsLocked === 'true',
        autoRenew: domain.$.AutoRenew === 'true',
        whoisGuard: domain.$.WhoisGuard,
        isPremium: domain.$.IsPremium === 'true',
        isOurDNS: domain.$.IsOurDNS === 'true'
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch domains: ${error.message}`);
    }
  }

  async checkDomainAvailability(domains: string[]): Promise<DomainAvailability[]> {
    try {
      const domainList = domains.join(',');
      const response = await this.makeRequest('namecheap.domains.check', {
        DomainList: domainList
      });

      const domainResults = response.DomainCheckResult || [];
      return domainResults.map((result: any) => ({
        domain: result.$.Domain,
        available: result.$.Available === 'true',
        premium: result.$.IsPremiumName === 'true',
        price: result.$.PremiumRegistrationPrice
      }));
    } catch (error: any) {
      throw new Error(`Failed to check domain availability: ${error.message}`);
    }
  }

  async getDNSRecords(domain: string): Promise<DNSRecord[]> {
    try {
      const sld = domain.split('.')[0];
      const tld = domain.split('.').slice(1).join('.');

      const response = await this.makeRequest('namecheap.domains.dns.getHosts', {
        SLD: sld,
        TLD: tld
      });

      const hosts = response.DomainDNSGetHostsResult[0].host || [];
      return hosts.map((host: any) => ({
        type: host.$.Type,
        hostname: host.$.Name,
        address: host.$.Address,
        ttl: parseInt(host.$.TTL),
        mxpref: host.$.MXPref ? parseInt(host.$.MXPref) : undefined,
        recordId: host.$.HostId
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch DNS records for ${domain}: ${error.message}`);
    }
  }

  async setDNSRecords(domain: string, records: DNSRecord[]): Promise<boolean> {
    try {
      const sld = domain.split('.')[0];
      const tld = domain.split('.').slice(1).join('.');

      const params: Record<string, string> = {
        SLD: sld,
        TLD: tld
      };

      records.forEach((record, index) => {
        const i = index + 1;
        params[`HostName${i}`] = record.hostname;
        params[`RecordType${i}`] = record.type;
        params[`Address${i}`] = record.address;
        params[`TTL${i}`] = record.ttl.toString();
        if (record.mxpref) {
          params[`MXPref${i}`] = record.mxpref.toString();
        }
      });

      await this.makeRequest('namecheap.domains.dns.setHosts', params);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to set DNS records for ${domain}: ${error.message}`);
    }
  }

  async setupCloudflareIntegration(domain: string): Promise<boolean> {
    try {
      const sld = domain.split('.')[0];
      const tld = domain.split('.').slice(1).join('.');

      await this.makeRequest('namecheap.domains.dns.setCustom', {
        SLD: sld,
        TLD: tld,
        Nameservers: 'ns1.cloudflare.com,ns2.cloudflare.com'
      });

      return true;
    } catch (error: any) {
      throw new Error(`Failed to setup Cloudflare for ${domain}: ${error.message}`);
    }
  }

  async renewDomain(domain: string, years: number = 1): Promise<boolean> {
    try {
      const sld = domain.split('.')[0];
      const tld = domain.split('.').slice(1).join('.');

      await this.makeRequest('namecheap.domains.renew', {
        DomainName: `${sld}.${tld}`,
        Years: years.toString()
      });

      return true;
    } catch (error: any) {
      throw new Error(`Failed to renew domain ${domain}: ${error.message}`);
    }
  }

  async enableAutoRenew(domain: string): Promise<boolean> {
    try {
      const sld = domain.split('.')[0];
      const tld = domain.split('.').slice(1).join('.');

      await this.makeRequest('namecheap.domains.setRenewalMode', {
        DomainName: `${sld}.${tld}`,
        RenewalMode: 'auto'
      });

      return true;
    } catch (error: any) {
      throw new Error(`Failed to enable auto-renew for ${domain}: ${error.message}`);
    }
  }

  async getSSLCertificates(): Promise<any[]> {
    try {
      const response = await this.makeRequest('namecheap.ssl.getList');
      return response.SSLListResult[0].SSL || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch SSL certificates: ${error.message}`);
    }
  }

  async updateClientIP(ip: string): Promise<void> {
    this.clientIp = ip;
  }

  async getExternalIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json() as { ip: string };
      return data.ip;
    } catch (error) {
      return '127.0.0.1';
    }
  }

  async initializeService(): Promise<void> {
    try {
      const externalIP = await this.getExternalIP();
      await this.updateClientIP(externalIP);
    } catch (error) {
      console.warn('Failed to get external IP, using localhost');
    }
  }
}

export const namecheapService = new NamecheapService();