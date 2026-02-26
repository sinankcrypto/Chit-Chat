function ChatList({ onSelectChat }) {
  const chats = [
    { id: 1, name: "John Doe", lastMessage: "Hey, how are you?" },
    { id: 2, name: "Jane Smith", lastMessage: "Let's meet tomorrow." },
    { id: 3, name: "Dev Group", lastMessage: "Project update?" },
  ];

  return (
    <div className="mt-4 space-y-2">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onSelectChat(chat)}
          className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer"
        >
          <h3 className="text-white font-semibold">{chat.name}</h3>
          <p className="text-gray-400 text-sm truncate">
            {chat.lastMessage}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ChatList;