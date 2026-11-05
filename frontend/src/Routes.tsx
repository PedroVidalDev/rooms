import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { RoomMenu } from "./pages/RoomMenu"
import { ThreeRoom } from "./pages/Room"

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<RoomMenu />} />
                <Route path="/room" element={<Navigate to="/room/new" replace />} />
                <Route path="/room/:roomId" element={<ThreeRoom />} />
            </Routes>
        </BrowserRouter>
    )
}