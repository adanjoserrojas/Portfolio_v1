{/*
    return shape for the search portfolio function
    {
        query: string;
        totalMatches: number;
        results: Array<{
            id: string;
            kind: string;
            title: string;
            url: string;
            projectSlug?: string;
            score: number;
            matchedFields: string[];
            excerpts: string[];
        }>;
    }

    return shape for the getPublicProject function:
    {
        slug: string;
        name: string;
        summary: string;
        date: string;
        url: string;
        stack?: string[];
        repositoryUrl?: string;
        accomplishments: string[];
    }
*/}

export function searchPortfolio(query: string, limit: number){
    throw new Error("Not implemented yet");

};

export function getPublicProject(slug: string) {
    throw new Error("Not immplemented yet");

};
