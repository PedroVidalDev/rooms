import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Account } from "./pages/Account"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { RoomMenu } from "./pages/RoomMenu"
import { ThreeRoom } from "./pages/Room"
import { AuthGuard } from "./guards/AuthGuard"

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<AuthGuard><RoomMenu /></AuthGuard>} />
                <Route path="/account" element={<AuthGuard><Account /></AuthGuard>} />
                <Route path="/room" element={<AuthGuard><Navigate to="/room/new" replace /></AuthGuard>} />
                <Route path="/room/:roomId" element={<AuthGuard><ThreeRoom /></AuthGuard>} />
                <Route path="*" element={<Navigate  to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
