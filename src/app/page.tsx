'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { collectUserInfo, UserInfoData} from '@/lib/user-info';

export default function Home() {
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    async function getUserInfo() {
      try {
        // Collect user information
        const info = await collectUserInfo();
        setUserInfo(info);

        // Send to server
        await sendUserInfoToServer(info);
      } catch (error) {
        console.error('Error collecting user information:', error);
      } finally {
        setLoading(false);
      }
    }

    getUserInfo();
  }, []);

  // Group info into categories for better display
  const infoCategories = {
    browser: [
      { label: 'Browser', value: userInfo?.browser },
      { label: 'Browser Version', value: userInfo?.browserVersion },
      { label: 'User Agent', value: userInfo?.userAgent },
      { label: 'Cookies Enabled', value: userInfo?.cookiesEnabled?.toString() },
      { label: 'localStorage Available', value: userInfo?.localStorageAvailable?.toString() },
      { label: 'sessionStorage Available', value: userInfo?.sessionStorageAvailable?.toString() },
      { label: 'Language', value: userInfo?.language },
    ],
    device: [
      { label: 'Device Type', value: userInfo?.device },
      { label: 'Platform', value: userInfo?.platform },
      { label: 'OS', value: userInfo?.osName },
      { label: 'OS Version', value: userInfo?.osVersion },
      { label: 'Screen Resolution', value: userInfo?.screenSize },
      { label: 'Orientation', value: userInfo?.orientation },
      { label: 'Touch Screen', value: userInfo?.touchScreen?.toString() },
    ],
    hardware: [
      { label: 'CPU Cores', value: userInfo?.cpuCores?.toString() },
      { label: 'RAM', value: userInfo?.ram },
      { label: 'GPU/Renderer', value: userInfo?.webGLRenderer },
      { label: 'Battery Level', value: userInfo?.batteryLevel !== undefined ? `${Math.round(userInfo.batteryLevel * 100)}%` : undefined },
      { label: 'Battery Charging', value: userInfo?.batteryCharging?.toString() },
    ],
    network: [
      { label: 'Connection Type', value: userInfo?.connectionType },
      { label: 'IP Address', value: userInfo?.ipAddress },
      { label: 'Timezone', value: userInfo?.timezone },
      { label: 'Referrer', value: userInfo?.referrer || 'Direct' },
    ],
  };
  
  // Keep collecting cookies in the background but don't display them
  if (userInfo?.cookies) {
    userInfo.additionalData = {
      ...userInfo.additionalData,
      cookies: userInfo.cookies
    };
  }

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 bg-gray-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="border border-gray-800 shadow-lg bg-gray-900">
          <CardHeader className="bg-gradient-to-r from-blue-950 to-purple-950 text-white">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              User Information Provider
            </CardTitle>
            <CardDescription className="text-blue-100">
              Understand what information you provide to websites
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <Tabs defaultValue="browser">
                  <TabsList className="grid grid-cols-4 mb-8">
                    <TabsTrigger value="browser">Browser</TabsTrigger>
                    <TabsTrigger value="device">Device</TabsTrigger>
                    <TabsTrigger value="hardware">Hardware</TabsTrigger>
                    <TabsTrigger value="network">Network</TabsTrigger>
                  </TabsList>

                  {Object.entries(infoCategories).map(([category, items]) => (
                    <TabsContent key={category} value={category} className="mt-2">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-800">
                            <TableHead className="w-1/3 text-gray-200 font-semibold">Information</TableHead>
                            <TableHead className="text-gray-200 font-semibold">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.label}</TableCell>
                              <TableCell>{item.value || 'Not available'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  ))}
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card className="border border-gray-800 shadow-md bg-gray-900">
            <CardHeader className="p-4">
              <Collapsible open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
                <div className="flex items-center justify-between">
                  <CardTitle>Privacy Policy</CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      {isPrivacyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <CardContent className="pt-4">
                    <p className="text-gray-400">
                      This website collects the following information:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-400">
                      <li>Browser and device information</li>
                      <li>Network and connection details</li>
                      <li>Hardware specifications</li>
                      <li>System preferences and settings</li>
                    </ul>
                    <p className="mt-4 text-gray-400">
                      When you visit this website, we may collect some basic non-personally identifiable information about you. We collect non-personally identifiable information about you in a number of ways, including tracking your activities through your IP address, computer settings, or most-recently visited URL.
                      <br />
                      Non-personally identifiable information is collected in order to provide you with satisfactory service and to improve our website. We may use the information to detect problems with our server and to administer our website. In addition, non-personally identifiable information is compiled by us and analyzed on an aggregate basis. We may sell, trade, rent, or transfer non-personally identifiable information to third-parties.
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
function sendUserInfoToServer(info: UserInfoData) {
  throw new Error('Function not implemented.');
}

