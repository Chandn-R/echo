import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

interface SocketProviderProps {
    children: ReactNode;
}
const SocketContext = createContext<Socket | null>(null);

export const useSocket = (): Socket | null => {
    return useContext(SocketContext);
};

const ENDPOINT = "http://localhost:8000";

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const newSocket = io(ENDPOINT, {
                query: {
                    userId: user._id,
                },
            });

            setSocket(newSocket);
            newSocket.emit("setup", user);
            newSocket.on("connected", () => {
                console.log("Socket connected successfully:", newSocket.id);
            });

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user?._id]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
