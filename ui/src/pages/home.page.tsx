import { AutoSearchForm } from '@/components/auto-search-form/auto-search-form.component';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import browser from 'webextension-polyfill';

export function HomePage() {
    const [isTargetMode, setIsTargetMode] = useState(false);

    const toggleTargetMode = async () => {
        setIsTargetMode(!isTargetMode);

        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        // const tabId = tab?.id || -1;

        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'toggleTargetMode', enable: !isTargetMode });
        }
        // Close the popup window after sending the message
        window.close();
    };

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
            </TabsContent>
        </Tabs>
    );
}
