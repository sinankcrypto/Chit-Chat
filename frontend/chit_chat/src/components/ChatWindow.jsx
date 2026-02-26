function ChatWindow({ selectedChat }) {
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
        <h2 className="text-xl">
          Select a chat to start messaging 💬
        </h2>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 p-6 text-white">
      <h2 className="text-2xl font-semibold mb-4">
        {selectedChat.name}
      </h2>

      <div className="bg-gray-800 p-4 rounded-lg">
        <p>This is where messages will appear.</p>
      </div>
    </div>
  );
}

export default ChatWindow;