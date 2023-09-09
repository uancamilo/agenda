import React, { useState } from "react";
import { auth } from "../firebase/firebase.config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function PhoneLogin() {
	const [showOTP, setShowOTP] = useState(false);
	const [phone, setPhone] = useState(" ");

	function onCaptchVerify() {
		if (!window.recaptchaVerifier) {
			window.recaptchaVerifier = new RecaptchaVerifier(
				auth,
				"recaptcha-container",
				{
					size: "invisible",
					callback: () => {
						onSignup();
					},
					"expired-callback": () => {
						// Captcha expired callback logic, if needed
					},
				},
				auth
			);
		}
	}

	function onSignup() {
		onCaptchVerify();
		const appVerifier = window.recaptchaVerifier;
		const formatPhone = "+57" + phone; // Change this to your desired country code

		signInWithPhoneNumber(auth, formatPhone, appVerifier)
			.then((confirmationResult) => {
				window.confirmationResult = confirmationResult;
				setShowOTP(true);
				console.log("OTP sent successfully!");
			})
			.catch((error) => {
				console.log(error);
			});
	}

	return (
		<>
			<p>Para agendar la cita, ingrese su número de teléfono</p>
			<div id="recaptcha-container"></div>
			{showOTP ? (
				<div>
					<input
						type="number"
						id="verificationCode"
						placeholder="Código de verificación"
					/>
					<button>Verificar</button>
				</div>
			) : (
				<div>
					<input
						type="tel"
						id="PhoneNumber"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder="Número de teléfono"
					/>
					<button onClick={onSignup}>Obtener código</button>
				</div>
			)}
		</>
	);
}
