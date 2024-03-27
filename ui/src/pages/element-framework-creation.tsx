import { env } from '@/env';
import { useFetch } from '@/hooks/use-fetch';
import { useCallback, useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sass } from '@codemirror/lang-sass';
import { RenderDangerously } from '../components/render-dangerously';
import FullPageLoading from '@/components/full-page-loading/full-page-loading';

interface AIFrameworkFilesFile {
    file: string;
    description: string;
    content: string;
}

interface AIFrameworkFilesDTO {
    library: string;
    files: AIFrameworkFilesFile[];
    additionalInformation: string;
}

export function ElementFrameworkCreation() {
    const { fetchJSONWithBody, isLoading } = useFetch(env.API_URL, true);
    const [data, setData] = useState<AIFrameworkFilesDTO | null>(null);
    const [dataToFetch] = useState(() => {
        const dataToFetch = localStorage.getItem('data');
        if (!dataToFetch) {
            return;
        }
        return JSON.parse(dataToFetch);
    });

    const fetchAPI = useCallback(async () => {
        const data = await fetchJSONWithBody<
            AIFrameworkFilesDTO,
            { html: string; css: string; framework: string; elementName: string }
        >({
            endpoint: 'ai-framework-files',
            body: {
                css: dataToFetch.css,
                html: dataToFetch.html,
                framework: dataToFetch.type,
                elementName: dataToFetch.name,
            },
        });

        setData(data ?? null);
    }, [dataToFetch, fetchJSONWithBody]);

    useEffect(() => {
        fetchAPI();
    }, [fetchAPI]);

    if (isLoading) {
        return <FullPageLoading />;
    }

    return (
        <div className='space-y-20'>
            <RenderDangerously html={dataToFetch.html} css={dataToFetch.css} />
            {data?.files.map((file) => {
                const isSass = file.file.endsWith('.scss');
                const extensions = isSass
                    ? [sass()]
                    : [javascript({ typescript: true, jsx: true })];

                return (
                    <div key={file.file}>
                        <h1 className='font-bold text-lg'>{file.file}</h1>
                        <p>{file.description}</p>
                        <CodeMirror value={file.content} extensions={extensions} editable={false} />
                    </div>
                );
            })}
        </div>
    );
}
