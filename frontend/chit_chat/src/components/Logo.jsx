import { FaComments } from "react-icons/fa";

function Logo() {
  return (
    <div className="flex flex-col items-center mb-6">
      <FaComments className="text-indigo-500 text-5xl mb-2" />
      <h1 className="text-3xl font-bold text-white">Chit Chat</h1>
      <p className="text-gray-400 text-sm mt-1">
        Connect instantly. Chat seamlessly. 💬
      </p>
    </div>
  );
}

export default Logo;