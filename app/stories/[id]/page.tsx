import Story from "@/components/Story";
import { getAllStories, getStory } from "@/lib/stories";

interface StoryPageProps {
    params: {
        id: string;
    };
}
async function StoryPage({params:{id}}: StoryPageProps) {
    // Note: The id is URL encoded, so we need to decode it before using it to get the story.
    const decodedId = decodeURIComponent(id);
    const story = await getStory(decodedId);
    console.log(story);
    if(!story) {
        return <div>Story not found</div>
    }
    return (
        <Story story={story} />
    )
}

export default StoryPage;

export async function generateStaticParams(){
    const stories = getAllStories();
    {/* Note - We need to return an array of objects with the id property set to story id. 
        This will Generate a static page for each story.
        Example: [{id: "story-1"},{id:"story-2"}] */}
    const paths = stories.map((story) => ({
        id: story.story,
    }));
    return paths; // Add this line to return the paths array
}