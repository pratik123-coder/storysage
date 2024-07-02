export const cleanTitle = (title: string) => {
    return title
        .replace(/[-/\\[\]]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
