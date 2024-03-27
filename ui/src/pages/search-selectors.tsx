import { Error } from '@/components/error';
import FullPageLoading from '@/components/full-page-loading/full-page-loading';
import { Button } from '@/components/ui/button';
import { env } from '@/env';
import { useFetch } from '@/hooks/use-fetch';
import { routes } from '@/routes';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function SearchElementsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [selectors, setSelectors] = useState<string[]>([]);

    const { fetchJSON, isLoading, error } = useFetch(env.API_URL, true);

    const fetchAPI = useCallback(async () => {
        const url = searchParams.get('url');
        const target = searchParams.get('target');

        if (!url || !target) return navigate('/');

        const data = await fetchJSON<string[]>(`ai-selectors?${searchParams.toString()}`);
        setSelectors(data ?? []);
    }, [searchParams, fetchJSON, navigate]);

    useEffect(() => {
        fetchAPI();
    }, [fetchAPI]);

    if (error) {
        return (
            <Error
                error={error}
                onAction={() => {
                    navigate('/');
                }}
            />
        );
    }

    if (isLoading) {
        return <FullPageLoading />;
    }

    return (
        <>
            <h1>Selectors Found:</h1>
            <ul className='mt-4 max-h-[500px] overflow-scroll'>
                {selectors.map((selector, i) => (
                    <li key={i}>
                        <pre>{selector}</pre>
                    </li>
                ))}
            </ul>

            <div>
                <span className='block mb-3 mt-5'>
                    Would you like to retrieve the elements' screenshots related to these selectors?
                </span>
                <div className='space-x-2'>
                    <Button
                        onClick={() => {
                            searchParams.set('selectors', JSON.stringify(selectors));
                            navigate(`/${routes.listElements}?${searchParams.toString()}`);
                        }}
                    >
                        Yes
                    </Button>
                    <Button
                        variant='secondary'
                        onClick={() => {
                            navigate('/');
                        }}
                    >
                        No
                    </Button>
                    <Button
                        variant='secondary'
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        Try again
                    </Button>
                </div>
            </div>
        </>
    );
}
