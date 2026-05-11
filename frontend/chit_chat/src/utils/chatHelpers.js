export const getRoomDisplayName = (room, currentUser) => {
    if (room.room_type === "group"){
        return room.name;
    }

    const otherUser = room.participants?.find(
        (p) => p.id !== currentUser.id
    );

    return otherUser.username || "Private Chat";
};

export const getOtherParticipant = (room, currentUser) => {
    return room.participants?.find(
        (p) => p.id !== currentUser.id
    );
};

