import React, { useContext } from "react";
import { Context } from "../context/authContext";
import { Navigate } from "react-router-dom";

export default function Protected({ children }) {
	const { user } = useContext(Context);
	if (!user) {
		return <Navigate to="/" replace />;
	} else {
		return children;
	}
}
