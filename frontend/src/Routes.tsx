import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { RoomMenu } from "./pages/RoomMenu"
import { ThreeRoom } from "./pages/Room"

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RoomMenu />} />
                <Route path="/room" element={<Navigate to="/room/new" replace />} />
                <Route path="/room/:roomId" element={<ThreeRoom />} />
            </Routes>
        </BrowserRouter>
    )
}