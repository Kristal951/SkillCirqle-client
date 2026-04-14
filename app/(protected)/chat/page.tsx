"use client";

import { useChat } from "@/providers/chatContextProvider";
import React from "react";

const Chat = () => {
  const { activeChat } = useChat();
  const currentUserId = "user_1";

  const messagesDummyData = [
    {
      id: "msg_1",
      conversationId: "dm_user1_user2",
      sender: {
        id: "user_1",
        name: "Kristal Dev",
        avatar: "https://i.pravatar.cc/150?img=12",
      },
      receiver: {
        id: "user_2",
        name: "Amina",
        avatar: "https://i.pravatar.cc/150?img=32",
      },
      message:
        " Hey Alex! I just updated the proposal details. I think the 4-hour mentorship block works perfectly for my team. What do you think about the shoot location?",
      type: "text",
      createdAt: "2026-04-12T09:30:00Z",
      status: "read",
    },
    {
      id: "msg_2",
      conversationId: "dm_user1_user2",
      sender: {
        id: "user_2",
        name: "Amina",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB1u_aQCmsD9Vr1O6jomDYT1-Vak0q3-2k_FknsjIPJm5atj3FdT16EJ20spf0LKYgx5ZHQ2g5tLU14AMyQEjuHzWqonfoOEYmxPm6rAHahU69tpRW-WLORcEQMTBFZbW_WZ0bqxHuq8fJ00oD95dGSb_8y3XZSX2ne611xj94AENraZ8GqMMohchAAJq6ffIjM_KYyS63KD1v-gjDzEyHs8Y7l_CV771rkbAeeLNFtn4VdMMu0IOHdGEzOTnvYcgYDf6JdNhkOzJSO",
      },
      receiver: {
        id: "user_1",
        name: "Kristal Dev",
        avatar: "https://i.pravatar.cc/150?img=12",
      },
      message: "Hey! It’s going well 🔥 I just finished the dashboard UI",
      type: "text",
      createdAt: "2026-04-12T09:31:10Z",
      status: "read",
    },
    {
      id: "msg_3",
      conversationId: "dm_user1_user2",
      sender: {
        id: "user_1",
        name: "Kristal Dev",
        avatar: "https://i.pravatar.cc/150?img=12",
      },
      receiver: {
        id: "user_2",
        name: "Amina",
        avatar: "https://i.pravatar.cc/150?img=32",
      },
      message: "Nice! Send me a preview 👀",
      type: "text",
      createdAt: "2026-04-12T09:32:00Z",
      status: "delivered",
    },
    {
      id: "msg_4",
      conversationId: "dm_user1_user2",
      sender: {
        id: "user_2",
        name: "Amina",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB1u_aQCmsD9Vr1O6jomDYT1-Vak0q3-2k_FknsjIPJm5atj3FdT16EJ20spf0LKYgx5ZHQ2g5tLU14AMyQEjuHzWqonfoOEYmxPm6rAHahU69tpRW-WLORcEQMTBFZbW_WZ0bqxHuq8fJ00oD95dGSb_8y3XZSX2ne611xj94AENraZ8GqMMohchAAJq6ffIjM_KYyS63KD1v-gjDzEyHs8Y7l_CV771rkbAeeLNFtn4VdMMu0IOHdGEzOTnvYcgYDf6JdNhkOzJSO",
      },
      receiver: {
        id: "user_1",
        name: "Kristal Dev",
        avatar: "https://i.pravatar.cc/150?img=12",
      },
      message: "Here it is 🚀",
      type: "image",
      mediaUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBGMFAHSdzx8DpwAH9rD83E7Lavm2MDGMlEbKfZztWHiqyysLGc6rQppTE8Dz2oO7CLua4XUQoGiQIi2MLgtujP0GsvnZFqE-b5VEFa8e7mFcJ2NnRhbFdmhGup3TtuA0HfIO5T4FxOnTDUjaRsutRNrPEdbQYPGQ0fZaqjgp0xeIj-FCu-pS6_JrSNHGKL0v55jFeKyjgUDpiV8oqZ-ayZdsjdcNxvqmk0b7u-JFdLjF5qEH7m5XOJwlLjmY5qib6NPnwsnv0-SrWy",
      createdAt: "2026-04-12T09:33:20Z",
      status: "sent",
    },
    {
      id: "msg_5",
      conversationId: "dm_user1_user2",
      sender: {
        id: "user_1",
        name: "Kristal Dev",
        avatar: "https://i.pravatar.cc/150?img=12",
      },
      receiver: {
        id: "user_2",
        name: "Amina",
        avatar: "https://i.pravatar.cc/150?img=32",
      },
      message: "Looks clean 🔥 I love the spacing",
      type: "text",
      createdAt: "2026-04-12T09:34:10Z",
      status: "sent",
    },
  ];

  if (!activeChat) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <span
            className="material-symbols-outlined text-gray-400"
            style={{ fontSize: "100px" }}
          >
            chat_bubble_off
          </span>

          <h2 className="text-2xl font-medium text-text-secondary mt-2">
            No chat selected
          </h2>

          <p className="text-sm text-text-secondary mt-1">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  const messages = messagesDummyData.filter(
    (msg) => msg.conversationId === activeChat.id,
  );

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isMe && (
                <img
                  src={msg.sender.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}

              <div className="flex flex-col max-w-[40%]">
                <div
                  className={`p-4 text-sm shadow wrap-break-word
                  ${
                    isMe
                      ? "bg-primary text-white rounded-t-3xl rounded-bl-3xl"
                      : "bg-surface text-text-primary rounded-t-3xl rounded-br-3xl"
                  }`}
                >
                  {msg.type === "text" && <p>{msg.message}</p>}

                  {msg.type === "image" && (
                    <div className="space-y-2">
                      <img
                        src={msg.mediaUrl}
                        className="rounded-xl w-full"
                        alt=""
                      />
                      <p>{msg.message}</p>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span
                  className={`text-[10px] mt-1 text-text-secondary ${
                    isMe ? "text-right" : "text-left"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Chat;
