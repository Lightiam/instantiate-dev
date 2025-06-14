import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Globe, 
  Plus, 
  Search, 
  Settings, 
  Shield, 
  RefreshCw,
  Calendar,
  Lock,
  Unlock,
  Zap,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface Domain {
  id: string;
  name: string;
  created: string;
  expires: string;
  isExpired: boolean;
  isLocked: boolean;
  autoRenew: boolean;
  whoisGuard: string;
  isPremium: boolean;
  isOurDNS: boolean;
}

interface DNSRecord {
  type: string;
  hostname: string;
  address: string;
  ttl: number;
  recordId?: string;
}

export function DomainManager() {
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newRecord, setNewRecord] = useState({
    type: 'A',
    hostname: '',
    address: '',
    ttl: 300
  });

  const queryClient = useQueryClient();

  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ['/api/namecheap/domains'],
    staleTime: 1000 * 60 * 5,
  });

  const { data: dnsRecords, isLoading: dnsLoading } = useQuery({
    queryKey: ['/api/namecheap/dns', selectedDomain],
    enabled: !!selectedDomain,
    staleTime: 1000 * 60 * 2,
  });

  const { data: availability } = useQuery({
    queryKey: ['/api/namecheap/check', searchQuery],
    enabled: searchQuery.length > 3 && searchQuery.includes('.'),
    staleTime: 1000 * 60 * 5,
  });

  const getDomainStatus = (domain: Domain) => {
    if (domain.isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    const expiryDate = new Date(domain.expires);
    const daysToExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry <= 30) {
      return <Badge className="bg-orange-500">Expires in {daysToExpiry} days</Badge>;
    }
    
    return <Badge className="bg-green-500">Active</Badge>;
  };

  if (domainsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">Domain Manager</h2>
          <p className="text-cyan-300">Manage your Namecheap domains and DNS settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
            Namecheap Connected
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="domains" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="domains">My Domains ({(domains as any)?.length || 0})</TabsTrigger>
          <TabsTrigger value="dns">DNS Management</TabsTrigger>
          <TabsTrigger value="search">Domain Search</TabsTrigger>
          <TabsTrigger value="ssl">SSL Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="space-y-4">
          <Card className="bg-blue-950 border-blue-800">
            <CardHeader>
              <CardTitle className="text-cyan-400">Your Domains</CardTitle>
              <CardDescription className="text-cyan-300">
                Manage your registered domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {((domains as any) || []).map((domain: Domain) => (
                  <div key={domain.id} className="flex items-center justify-between p-4 bg-blue-900 rounded-lg border border-blue-700">
                    <div className="flex items-center space-x-4">
                      <Globe className="w-8 h-8 text-cyan-400" />
                      <div>
                        <h3 className="font-medium text-white">{domain.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-cyan-300">
                          <Calendar className="w-4 h-4" />
                          <span>Expires: {new Date(domain.expires).toLocaleDateString()}</span>
                          {domain.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          {domain.autoRenew && <RefreshCw className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getDomainStatus(domain)}
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedDomain(domain.name)}
                          className="border-cyan-500 text-cyan-400"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Manage DNS
                        </Button>
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Setup Cloudflare
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!domains || (domains as any).length === 0) && (
                  <div className="text-center py-8 text-cyan-300">
                    <Globe className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                    <p>No domains found in your Namecheap account.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-blue-950 border-blue-800">
              <CardHeader>
                <CardTitle className="text-cyan-400">Select Domain</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {((domains as any) || []).map((domain: Domain) => (
                      <SelectItem key={domain.id} value={domain.name}>
                        {domain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedDomain && (
                  <div className="mt-4 space-y-4">
                    <h4 className="font-medium text-white">Add DNS Record</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="record-type" className="text-white">Type</Label>
                        <Select value={newRecord.type} onValueChange={(value) => setNewRecord(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="AAAA">AAAA</SelectItem>
                            <SelectItem value="CNAME">CNAME</SelectItem>
                            <SelectItem value="MX">MX</SelectItem>
                            <SelectItem value="TXT">TXT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="hostname" className="text-white">Hostname</Label>
                        <Input
                          id="hostname"
                          value={newRecord.hostname}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, hostname: e.target.value }))}
                          placeholder="@ or subdomain"
                          className="bg-blue-900 border-blue-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address" className="text-white">Address</Label>
                        <Input
                          id="address"
                          value={newRecord.address}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="IP address or value"
                          className="bg-blue-900 border-blue-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ttl" className="text-white">TTL</Label>
                        <Input
                          id="ttl"
                          type="number"
                          value={newRecord.ttl}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, ttl: parseInt(e.target.value) }))}
                          className="bg-blue-900 border-blue-700 text-white"
                        />
                      </div>
                      <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Record
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Card className="bg-blue-950 border-blue-800">
                <CardHeader>
                  <CardTitle className="text-cyan-400">DNS Records</CardTitle>
                  <CardDescription className="text-cyan-300">
                    {selectedDomain ? `DNS records for ${selectedDomain}` : 'Select a domain to view DNS records'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDomain ? (
                    dnsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-cyan-400">Type</TableHead>
                            <TableHead className="text-cyan-400">Hostname</TableHead>
                            <TableHead className="text-cyan-400">Value</TableHead>
                            <TableHead className="text-cyan-400">TTL</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {((dnsRecords as any) || []).map((record: DNSRecord, index: number) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Badge variant="outline">{record.type}</Badge>
                              </TableCell>
                              <TableCell className="text-white">{record.hostname}</TableCell>
                              <TableCell className="text-cyan-300">{record.address}</TableCell>
                              <TableCell className="text-cyan-300">{record.ttl}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )
                  ) : (
                    <div className="text-center py-8 text-cyan-300">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                      <p>Select a domain to manage DNS records</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card className="bg-blue-950 border-blue-800">
            <CardHeader>
              <CardTitle className="text-cyan-400">Domain Search</CardTitle>
              <CardDescription className="text-cyan-300">
                Search for available domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter domain name (e.g., mysite.com)"
                    className="bg-blue-900 border-blue-700 text-white"
                  />
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {availability && (
                  <div className="space-y-3">
                    {(availability as any).map((domain: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-900 rounded-lg border border-blue-700">
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-cyan-400" />
                          <span className="text-white font-medium">{domain.domain}</span>
                          {domain.premium && <Badge className="bg-purple-600">Premium</Badge>}
                        </div>
                        <div className="flex items-center space-x-3">
                          {domain.available ? (
                            <>
                              <Badge className="bg-green-600">Available</Badge>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Register
                              </Button>
                            </>
                          ) : (
                            <Badge variant="destructive">Taken</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ssl" className="space-y-4">
          <Card className="bg-blue-950 border-blue-800">
            <CardHeader>
              <CardTitle className="text-cyan-400">SSL Certificates</CardTitle>
              <CardDescription className="text-cyan-300">
                Manage SSL certificates for your domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-cyan-300">
                <Shield className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                <p>SSL certificate management</p>
                <p className="text-sm text-cyan-400">Automatically provision SSL certificates for your domains</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}