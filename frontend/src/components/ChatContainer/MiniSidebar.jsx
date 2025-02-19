import { useChatStore } from "../../store/useChatStore";
import { X } from "lucide-react";

const MiniSidebar = ({ isOpen, onClose, message }) => {
    const { users, forwardMessage } = useChatStore();

    if (!isOpen) return null;

    const handleForward = (receiverId) => {
        forwardMessage(receiverId, message);
        onClose(); // Close MiniSidebar after forwarding
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-gray-500 opacity-10" onClick={onClose}></div>

            <div className="bg-base-300 shadow-lg w-72 p-4 rounded-l-lg relative z-10">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Forward to</h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-80">
                    {users.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => handleForward(user._id)}
                            className="flex items-center gap-2 p-2 hover:bg-base-100 w-full rounded-md transition"
                        >
                            <img src={user.profilePic || "/avatar.png"} alt={user.name} className="w-10 h-10 rounded-full" />
                            <span className="text-sm font-medium">{user.fullName}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MiniSidebar;