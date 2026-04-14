"use client";
import { useChat } from "@/providers/chatContextProvider";
import React from "react";

const Sidebar = () => {
  const { setActiveChat, activeChat } = useChat();
  const dummyChatUsersData = [
    {
      name: "Alex Chen",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB1u_aQCmsD9Vr1O6jomDYT1-Vak0q3-2k_FknsjIPJm5atj3FdT16EJ20spf0LKYgx5ZHQ2g5tLU14AMyQEjuHzWqonfoOEYmxPm6rAHahU69tpRW-WLORcEQMTBFZbW_WZ0bqxHuq8fJ00oD95dGSb_8y3XZSX2ne611xj94AENraZ8GqMMohchAAJq6ffIjM_KYyS63KD1v-gjDzEyHs8Y7l_CV771rkbAeeLNFtn4VdMMu0IOHdGEzOTnvYcgYDf6JdNhkOzJSO",
      lastMsg: "Proposal: Skill Swap...",
      isActive: true,
      lastSeen: "2m ago",
      isOnline: true,
      id: "dm_user1_user2",
    },
    {
      name: "Sarah Miller",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuANIUUKu1bcqgXQDvUPl5jdNBkveHPL85f2yKJZnL1P12WBn5-pyrDlawXcRZDOv3nAuBRfLVplXWk-4JFrcYqrI-c8Ba2fQXBawvx36BZgVeCHZgnml73TRfCttATuNrCy14Bmgfdf-nFNKgnAAsHS3qkAsf8cvSLnqum9NsTwg4DPK33nNUwyg6UdXwK2gYesMlzyLjgE-zQ2G8qOTOrRNrpki2bdnkqEnhnifYYnGikQy9mOUP2CW0bdssZOqJNBHyG7yoHUXIKO",
      lastMsg: "That design system looks amazing!",
      isActive: false,
      lastSeen: "1h ago",
      isOnline: false,
      id: "dm_user1_user3",
      unreadCount: 2,
    },
    {
      name: "Jordan V",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA14KzcwYY9SxNnaxGVth_Pkc718hPCRw1WClN-uVxYOY938kuUsD1bWqhxjyrcYu8GoYWyj4tEkAC6yf8FSq99gWYAh2EGqhI6wV7kHP31ncti-PMA18cKJn3JcAFubyuHbsz-Mj0wNyjFKKY-QwCGQT7UIHQ0jDRsvfbUYDgjd4QZ4HDh5-vDJYKJQLxoZ-nIxFTo4RZrGzBlZ546xw5RisqQMrX9uw8QXcoAQ6rT5yHaNK_RDN1X9yUIvWwhPC7MdvOAmlX1YQ6o",
      lastMsg: "Sent a voice message",
      isActive: false,
      lastSeen: "4h ago",
      isOnline: false,
      id: "dm_user1_user4",
    },
    {
      name: "John Doe",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB1u_aQCmsD9Vr1O6jomDYT1-Vak0q3-2k_FknsjIPJm5atj3FdT16EJ20spf0LKYgx5ZHQ2g5tLU14AMyQEjuHzWqonfoOEYmxPm6rAHahU69tpRW-WLORcEQMTBFZbW_WZ0bqxHuq8fJ00oD95dGSb_8y3XZSX2ne611xj94AENraZ8GqMMohchAAJq6ffIjM_KYyS63KD1v-gjDzEyHs8Y7l_CV771rkbAeeLNFtn4VdMMu0IOHdGEzOTnvYcgYDf6JdNhkOzJSO",
      lastMsg: "New group announcement",
      isActive: false,
      lastSeen: "yesterday",
      isOnline: false,
    },
  ];
  return (
    <div className="w-90 h-full border-r overflow-y-scroll bg-background fixed border-border px-4 py-6 flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-left">Chats</h2>
      <div className="w-full flex flex-col gap-4">
        {dummyChatUsersData.map((chat, i) => (
          <button
            key={i}
            className={`w-full p-3 flex gap-2 rounded-lg cursor-pointer hover:bg-surface transition-all ${chat.isActive ? "bg-surface" : ""}`}
            onClick={() =>
              setActiveChat({
                name: chat.name,
                image: chat.image,
                lastSeen: chat.lastSeen,
                lastMsg: chat.lastMsg,
                isOnline: chat.isOnline,
                id: chat.id,
              })
            }
          >
            <div className=" relative">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <img
                  src={chat.image}
                  alt={chat.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {chat.isOnline && (
                <span className="w-3 h-3 rounded-full bg-green-500 absolute bottom-0 right-0" />
              )}
            </div>
            <div className="flex-1 flex-col w-full">
              <div className="w-full flex justify-between items-center">
                <h2 className="text-lg font-medium">{chat.name}</h2>
                <p className="text-sm text-text-secondary">{chat.lastSeen}</p>
              </div>

              <div className="w-full flex items-start justify-start gap-2">
                <p className="text-sm truncate text-text-secondary text-left flex-1">
                  {chat.lastMsg || ""}
                </p>

                {chat?.unreadCount && chat?.unreadCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center bg-primary text-white text-xs rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
