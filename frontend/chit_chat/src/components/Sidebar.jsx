import Logo from "./Logo";
import ChatList from "./ChatList";
import ProfileDropdown from "./ProfileDropdown";

function Sidebar({ onSelectChat }) {
  return (
    <div className="w-1/3 bg-gray-800 h-screen p-4 border-r border-gray-700 flex flex-col">
      
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Chats</h2>
        <ProfileDropdown />
      </div>

      {/* Chat List */}
      <ChatList onSelectChat={onSelectChat} />
    </div>
  );
}

export default Sidebar;