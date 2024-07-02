/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Frame } from "@gptscript-ai/gptscript";
import renderEvent from "@/lib/renderEvent";

const storiesPath = "public/stories"

function StoryWriter() {
  const [story, setStory] = useState<string>(""); 
  const [pages, setPages] = useState<number>(0);
  const [progress, setProgress] = useState<string>("");
  const [runStarted, setRunStarted] = useState<boolean>(false);
  const [runFinished, setRunFinished] = useState<boolean | null>(null);
  const [currentTool, setCurrentTool] = useState<string>("");
  const [events, setEvents] = useState<Frame[]>([]);
  
  async function handleStream(reader:ReadableStreamDefaultReader<Uint8Array>, decoder:TextDecoder) {
    //Manages Stream Data
    while(true){
      const {done, value} = await reader.read();
      if(done) break;
      
      { /* Note: This decoder is used to decode the Uint8Array into a string 
                 which can be read by the user. The stream is read in chunks and then
                 split into lines. This is done to ensure that the stream is read in
                 a way that the user can understand the output.
        */ }

      const chunk = decoder.decode(value,{stream: true});
      const lines = chunk
      .split("\n\n")
      /* Note: The stream is split into lines and then filtered to only include 
        lines that start with "event: ". */
      .filter((line) => line.startsWith("event: "))
      /* Note: The lines are then mapped to remove the "event: " prefix. */
      .map((line) => (line.replace(/^event: /, "")));

      // Note: Parse the JSON Data from the Stream and update the UI
      lines.forEach((line) => {
        try {
          const data = JSON.parse(line);
            if(data.type === "callProgress"){
            // Note: Update the Progress of the Story Generation
            setProgress(
              data.output[data.output.length - 1].content
            )
            setCurrentTool(
              data.tool?.description || ""
            )}
            
            else if(data.type === "callStart"){
              setCurrentTool(
                data.tool?.description || ""
              )
            }
            else if(data.type === "runFinish"){
              setRunFinished(true);
              setRunStarted(false);
            }
            else {
              setEvents((prevEvents) => [...prevEvents, data]);
            }
        } catch (error) {
          console.log("Error: Failed to Parse JSON because ", error);
        }
        
      });
    }
  }

  async function runScript() {
    setRunStarted(true);
    setRunFinished(false);

    const res = await fetch("/api/run-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ story, pages,path:storiesPath }),
    });

    if (res.ok && res.body){
      // Handle streams from the API
      console.log("Generation Started")
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      handleStream(reader, decoder);

    } else {
      setRunFinished(true);
      setRunStarted(false);
      setProgress("An error occurred while generating the story");
    }
  }

  return ( 
    <div className="flex flex-col container ">
      <section className="flex-1 flex flex-col border border-purple-300
      rounded-md p-10 space-y-2">
        <Textarea
        value={story}
        onChange={(e) => setStory(e.target.value)}
        className="flex-1 text-black" 
        placeholder="Write a story about a kid name Pratik playing on the garden..."/>
        <Select onValueChange={value => setPages(parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Provide the number of pages the story should be"></SelectValue>
          </SelectTrigger>
          <SelectContent className="w-full">
            {Array.from({ length: 3 }, (_, i) => (
              <SelectItem key={i} value={String(i+1)}>{i + 1}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
        disabled={!story || !pages || runStarted} 
        className="w-full" 
        size="lg"
        onClick={runScript}
        >
          <span>Generate Story</span>
        </Button>
      </section>
      
      <section className="flex-1 pb-5 mt-5">
        <div className="flex flex-col-reverse w-full space-y-2 bg-gray-800
        rounded-md text-gray-200 font-mono p-10 h-96 overflow-y-auto">
          <div>
            {runFinished === null && (
              <>
                <p className="animate-pulse mr-5">I'm waiting for the Story Generation Prompt above...</p>
                <br />
              </>
            )}

            <span className="mr-5">{">>"}</span>
            {progress}
          </div>

          {/* Current Tool */}
          {currentTool && (
            <div className="py-10">
              <span className="mr-5">{"--- [Current Tool] ---"}</span>
            </div>
          )}

          {/* Render Events ... */}
          <div className="space-y-5">
            {events.map((event,index)=>(
              <div key={index} className="py-10">
                <span className="mr-5">{">>"}</span>
                {renderEvent(event)}
                <br />
              </div>
            ))}
          </div>
          {runStarted && (
            <div className="py-10">
              <span className="mr-5">{"--- [AI Generation has Started] ---"}</span>
              <br />
            </div>
          )}
        </div>
      </section>
    </div>
   );
}
 
export default StoryWriter;