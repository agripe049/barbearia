import { BrowserRouter, Routes, Route } from "react-router-dom";
import Public from "../pages/Public";
import Login from "../pages/Login";
import Admin from "../pages/Admin";
import PrivateRoutes from "./PrivateRoutes";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Public />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/admin"
                    element={
                        <PrivateRoutes>
                            <Admin />
                        </PrivateRoutes>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;