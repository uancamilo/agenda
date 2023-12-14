import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase.config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function PhoneLogin() {
	const navigate = useNavigate();
	const [showOTP, setShowOTP] = useState(false);
	const [phone, setPhone] = useState("");
	const [otp, setOtp] = useState("");
	const [error, setError] = useState(null);

	async function onCaptchVerify() {
		if (!window.recaptchaVerifier) {
			const recaptchaConfig = {
				size: "invisible",
				callback: () => {
					onSignup();
				},
				"expired-callback": () => {
					// Captcha expired callback logic, if needed
				},
			};

			window.recaptchaVerifier = new RecaptchaVerifier(
				auth,
				"recaptcha-container",
				recaptchaConfig
			);

			try {
				await window.recaptchaVerifier.verify();
			} catch (error) {
				// Manejar errores de verificación aquí
				console.error("Error al verificar el reCAPTCHA:", error);
			}
		}
	}

	async function onSignup() {
		onCaptchVerify();
		const appVerifier = window.recaptchaVerifier;
		const formatPhone = "+57" + phone;

		try {
			const confirmationResult = await signInWithPhoneNumber(
				auth,
				formatPhone,
				appVerifier
			);
			window.confirmationResult = confirmationResult;
			setShowOTP(true);
			console.log("OTP enviado exitosamente!");
		} catch (error) {
			console.error("Error al enviar OTP:", error);
		}
	}

	function onVerify() {
		const verificationCode = otp.trim();

		if (verificationCode === "") {
			setError("Ingrese el código de verificación.");
			return;
		}

		// Agrega la lógica para verificar el código OTP
		window.confirmationResult
			.confirm(verificationCode)
			.then(() => {
				console.log("Verification successful!");
				navigate("/calendario");
			})
			.catch((error) => {
				setError(
					"Error al verificar el código. Por favor, inténtelo de nuevo."
				);
				console.error(error);
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
						value={otp}
						onChange={(e) => setOtp(e.target.value)}
						placeholder="Código de verificación"
					/>
					<button onClick={onVerify}>Verificar</button>
				</div>
			) : (
				<div>
					<input
						type="tel"
						name="telefono"
						value={phone}
						placeholder="Número de teléfono"
						onChange={(e) => setPhone(e.target.value)}
					/>
					<button onClick={onSignup}>Obtener código</button>
				</div>
			)}
			{error && <p style={{ color: "red" }}>{error}</p>}
		</>
	);
}
