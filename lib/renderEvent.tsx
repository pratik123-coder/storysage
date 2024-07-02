import { Frame } from "@gptscript-ai/gptscript";

const renderEvent = (event: Frame) => {

  switch(event.type){
    case "runStart":
      return (
        <div>
          <p>Run started at {event.start}</p>
        </div>
      )
    case "callChat":
      return (
        <div>
          Chat in progress with your input {">>"} {String(event.input)}
        </div>
      )
    case "callProgress":
      return (
        null
      )
    case "callStart":
      return (
        <div>
          Tool Starting: {event.tool?.description}
        </div>
      )
    case "runFinish":
      return (
        <div>
          Story Generation Finished at {event.end}
        </div>
      )
    case "callFinish":
      return (
        <div>
          Call Finished:{" "}
          {event.output.map((output) => (
            <div key={output.content}>{output.content}</div>
          ))}
        </div>
      )
    case "callSubCalls":
      return (
        <div>
        Sub-calls in progress:
        {event.output?.map((output,index) => (
          <div key={index}>
          <div>{output.content}</div>
          {output.subCalls && 
            Object.keys(output.subCalls).map((key) => (
              <div key={key}>
                <strong> SubCall {key}:</strong>
                <div>Tool ID: {output.subCalls[key].toolID}</div>
                <div>Input: {output.subCalls[key].input}</div>
              </div>
            ))}
          </div>
        ))}
        </div>
      );
      case "callContinue":
      return (
        <div>
        Call continues:
        {event.output?.map((output,index) => (
          <div key={index}>
          <div>{output.content}</div>
          {output.subCalls && 
            Object.keys(output.subCalls).map((key) => (
              <div key={key}>
                <strong> SubCall {key}:</strong>
                <div>Tool ID: {output.subCalls[key].toolID}</div>
                <div>Input: {output.subCalls[key].input}</div>
              </div>
            ))}
          </div>
        ))}
        </div>
      );
      
      case "callConfirm":
        return (
          <div>
        Call continues:
        {event.output?.map((output,index) => (
          <div key={index}>
          <div>{output.content}</div>
          {output.subCalls && 
            Object.keys(output.subCalls).map((key) => (
              <div key={key}>
                <strong> SubCall {key}:</strong>
                <div>Tool ID: {output.subCalls[key].toolID}</div>
                <div>Input: {output.subCalls[key].input}</div>
              </div>
            ))}
          </div>
        ))}
        </div>
        )
        default:
          return <pre>{JSON.stringify(event,null,2)}</pre>
  }
}
export default renderEvent;