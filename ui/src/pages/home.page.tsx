/* eslint-disable @typescript-eslint/no-explicit-any */
import { AutoSearchForm } from '@/components/auto-search-form/auto-search-form.component';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
// import chrome from 'webextension-polyfill';
export function HomePage() {
    const [isTargetMode, setIsTargetMode] = useState(false);
    // const [target, setTarget] = useState<string>(''); // [target, setTarget
    const toggleTargetMode = async () => {
        setIsTargetMode(!isTargetMode);

        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        // const tabId = tab?.id || -1;

        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'toggleTargetMode', enable: !isTargetMode });
        }
        // Close the popup window after sending the message
        // window.close();
    };
    useEffect(() => {
        const handleMessage = (
            message: string,
            _sender: any,
            sendResponse: (arg0: { response: string }) => void
        ) => {
            console.log('Message received:', message);
            // Handle the message
            sendResponse({ response: 'Target acquired' });
            // setTarget(message);
            return true; // to indicate that you will respond asynchronously (optional)
        };

        // Add message listener when the component mounts
        chrome.runtime.onMessage.addListener(handleMessage);

        // Cleanup function to remove the listener when the component unmounts
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);
    return (
        <Tabs
            defaultValue='auto-search'
            className='w-[400px] flex flex-col items-center justify-center m-auto'
        >
            <TabsList>
                <TabsTrigger value='auto-search'>Automated Search</TabsTrigger>
                <TabsTrigger value='target-search'>Targeted Mode</TabsTrigger>
            </TabsList>

            <TabsContent value='auto-search' className='w-full'>
                <AutoSearchForm />
            </TabsContent>

            <TabsContent value='target-search'>
                <Button variant='default' className='my-5' onClick={toggleTargetMode}>
                    {isTargetMode ? 'Turn OFF Target Mode' : 'Turn ON Target Mode'}
                </Button>
                {/* {target && <p>Target: {target}</p>} */}
            </TabsContent>
        </Tabs>
    );
}
