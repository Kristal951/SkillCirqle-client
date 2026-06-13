import { Tldraw } from "tldraw";
import 'tldraw/tldraw.css'

export default function Whiteboard({ sessionId }: { sessionId?: string }) {
  return (
    <div className="h-full w-full">
      <Tldraw />
    </div>
  );
}
