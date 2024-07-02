export interface Page{
    id: string;
    title: string;
    content: string;
} 

export interface Story {
    story: string;
    pages: Page[];
}