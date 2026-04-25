"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Daily from "@daily-co/daily-js";
import { VideoTile } from "@/components/sessions/VideoTile";

const CallPage = () => {
  const { room_name } = useParams();
  const router = useRouter();

  const callRef = useRef<any>(null);

  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState<any>({});
  const call = Daily.getCallInstance() || Daily.createCallObject();

  useEffect(() => {
      const call =
    Daily.getCallInstance() || Daily.createCallObject();
    callRef.current = call;

    call.on("joined-meeting", () => setJoined(true));
    call.on("participant-updated", updateParticipants);
    call.on("participant-joined", updateParticipants);
    call.on("participant-left", updateParticipants);

    async function join() {
      await call.join({
        url: `https://your-domain.daily.co/${room_name}`,
      });
    }

    join();

    return () => {
     call.leave();
    };
  }, [room_name]);

  const updateParticipants = () => {
    if (!callRef.current) return;
    setParticipants(callRef.current.participants());
  };

  // 3. LEAVE CALL
  const leaveCall = () => {
    callRef.current?.leave();
    router.push(`/video/${room_name}/preview`);
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* HEADER */}
      <div className="p-4 flex justify-between items-center border-b border-white/10">
        <h1>Live Session</h1>

        <button
          onClick={leaveCall}
          className="px-4 py-2 bg-red-500 rounded"
        >
          Leave
        </button>
      </div>

      {/* MAIN VIDEO GRID */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
        {Object.values(participants).map((p: any) => (
          <VideoTile key={p.session_id} participant={p} />
        ))}
      </div>
    </div>
  );
};

export default CallPage;