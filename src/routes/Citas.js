import { Routes, Route } from "react-router-dom";
import PhoneLogin from "../views/PhoneLogin";
import Calendario from "../views/Calendario";

export default function Citas() {
	return (
		<Routes>
			<Route path="/" element={<PhoneLogin />} />
			<Route path="/calendario" element={<Calendario/>}/>
		</Routes>
	);
}
