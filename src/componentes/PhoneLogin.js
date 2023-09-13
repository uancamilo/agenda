import React, { useState } from "react";
import { auth } from "../firebase/firebase.config";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function PhoneLogin() {
	const [showOTP, setShowOTP] = useState(false);
	const [phone, setPhone] = useState("");
	const [otp, setOtp] = useState("");
	const [user, setUser] = useState(null);

	const otpNumber = Number(otp);

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

	function onSignup() {
		try {
			onCaptchVerify();
			const appVerifier = window.recaptchaVerifier;
			const formatPhone = "+57" + phone;

			signInWithPhoneNumber(auth, formatPhone, appVerifier)
				.then((confirmationResult) => {
					window.confirmationResult = confirmationResult;
					setShowOTP(true);
					console.log("OTP enviado exitosamente!");
				})
				.catch((error) => {
					console.error("Error al enviar OTP:", error);
				});
		} catch (error) {
			console.error("Error en onSignup:", error);
		}
	}

	function onOTPVerify() {
		window.confirmationResult
			.confirm(otp)
			.then(async (res) => {
				console.log(res);
				setUser(res.user);
			})
			.catch((err) => {
				console.log(err);
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
						name="otp"
						value={otp}
						placeholder="Código de verificación"
						onChange={(e) => setOtp(e.target.value)}
					/>
					<button onClick={onOTPVerify}>Verificar</button>
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
		</>
	);
}
