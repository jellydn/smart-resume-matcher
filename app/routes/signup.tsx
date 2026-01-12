import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { signUp } from "~/lib/auth-client";
import type { Route } from "./+types/signup";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Sign Up - Resume Matcher" },
		{ name: "description", content: "Create your Resume Matcher account" },
	];
}

const signupSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<SignupForm>({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<
		Partial<Record<keyof SignupForm, string>>
	>({});
	const [touched, setTouched] = useState<
		Partial<Record<keyof SignupForm, boolean>>
	>({});
	const [isLoading, setIsLoading] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const validateField = (field: keyof SignupForm, value: string) => {
		if (field === "confirmPassword") {
			if (value !== formData.password) {
				return "Passwords do not match";
			}
			return null;
		}

		const fieldSchema =
			signupSchema.shape[field as keyof typeof signupSchema.shape];
		if (fieldSchema) {
			const result = fieldSchema.safeParse(value);
			if (!result.success) {
				return result.error.issues[0]?.message || "Invalid value";
			}
		}
		return null;
	};

	const handleChange = (field: keyof SignupForm, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (touched[field]) {
			const error = validateField(field, value);
			setErrors((prev) => ({ ...prev, [field]: error || undefined }));
		}
		if (
			field === "password" &&
			touched.confirmPassword &&
			formData.confirmPassword
		) {
			const confirmError =
				value !== formData.confirmPassword
					? "Passwords do not match"
					: undefined;
			setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
		}
		setServerError(null);
	};

	const handleBlur = (field: keyof SignupForm) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
		const error = validateField(field, formData[field]);
		setErrors((prev) => ({ ...prev, [field]: error || undefined }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const result = signupSchema.safeParse(formData);
		if (!result.success) {
			const fieldErrors: Partial<Record<keyof SignupForm, string>> = {};
			result.error.issues.forEach((issue) => {
				const field = issue.path[0] as keyof SignupForm;
				if (!fieldErrors[field]) {
					fieldErrors[field] = issue.message;
				}
			});
			setErrors(fieldErrors);
			setTouched({
				name: true,
				email: true,
				password: true,
				confirmPassword: true,
			});
			return;
		}

		setIsLoading(true);
		setServerError(null);

		try {
			const response = await signUp.email({
				email: formData.email,
				password: formData.password,
				name: formData.name,
			});

			if (response.error) {
				setServerError(
					response.error.message || "Sign up failed. Please try again.",
				);
			} else {
				navigate("/resume");
			}
		} catch {
			setServerError("An unexpected error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const isFormValid =
		!errors.name &&
		!errors.email &&
		!errors.password &&
		!errors.confirmPassword &&
		formData.name &&
		formData.email &&
		formData.password &&
		formData.confirmPassword;

	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Create an account</CardTitle>
					<CardDescription>
						Sign up to save your resume data across devices
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						{serverError && (
							<Alert variant="destructive">
								<AlertDescription>{serverError}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label htmlFor="name">
								Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="name"
								type="text"
								placeholder="Your name"
								value={formData.name}
								onChange={(e) => handleChange("name", e.target.value)}
								onBlur={() => handleBlur("name")}
								aria-invalid={!!errors.name}
								disabled={isLoading}
							/>
							{touched.name && errors.name && (
								<p className="text-sm text-destructive">{errors.name}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">
								Email <span className="text-destructive">*</span>
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={formData.email}
								onChange={(e) => handleChange("email", e.target.value)}
								onBlur={() => handleBlur("email")}
								aria-invalid={!!errors.email}
								disabled={isLoading}
							/>
							{touched.email && errors.email && (
								<p className="text-sm text-destructive">{errors.email}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">
								Password <span className="text-destructive">*</span>
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="At least 8 characters"
								value={formData.password}
								onChange={(e) => handleChange("password", e.target.value)}
								onBlur={() => handleBlur("password")}
								aria-invalid={!!errors.password}
								disabled={isLoading}
							/>
							{touched.password && errors.password && (
								<p className="text-sm text-destructive">{errors.password}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">
								Confirm Password <span className="text-destructive">*</span>
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Confirm your password"
								value={formData.confirmPassword}
								onChange={(e) =>
									handleChange("confirmPassword", e.target.value)
								}
								onBlur={() => handleBlur("confirmPassword")}
								aria-invalid={!!errors.confirmPassword}
								disabled={isLoading}
							/>
							{touched.confirmPassword && errors.confirmPassword && (
								<p className="text-sm text-destructive">
									{errors.confirmPassword}
								</p>
							)}
						</div>
					</CardContent>
					<CardFooter className="flex flex-col gap-4">
						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || !isFormValid}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating account...
								</>
							) : (
								<>
									<UserPlus className="mr-2 h-4 w-4" />
									Sign up
								</>
							)}
						</Button>
						<p className="text-center text-sm text-muted-foreground">
							Already have an account?{" "}
							<Link to="/login" className="text-primary hover:underline">
								Log in
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
