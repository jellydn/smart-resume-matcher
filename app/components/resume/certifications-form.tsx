import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Certification } from "~/lib/types";
import { certificationSchema, generateId } from "~/lib/types";

interface CertificationsFormProps {
	initialData: Certification[];
	onChange: (data: Certification[], isValid: boolean) => void;
}

function createEmptyCertification(): Certification {
	return {
		id: generateId(),
		name: "",
		issuer: "",
		date: "",
		url: "",
	};
}

interface CertificationEntryProps {
	certification: Certification;
	index: number;
	onChange: (index: number, certification: Certification) => void;
	onRemove: (index: number) => void;
	errors: Record<string, string>;
	touched: Record<string, boolean>;
	onBlur: (field: string) => void;
}

function CertificationEntry({
	certification,
	index,
	onChange,
	onRemove,
	errors,
	touched,
	onBlur,
}: CertificationEntryProps) {
	const handleChange =
		(field: keyof Certification) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			onChange(index, { ...certification, [field]: e.target.value });
		};

	const showError = (field: string) => {
		const key = `${index}.${field}`;
		return touched[key] && errors[key];
	};

	const handleFieldBlur = (field: string) => {
		onBlur(`${index}.${field}`);
	};

	return (
		<Card className="relative">
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
				onClick={() => onRemove(index)}
			>
				<Trash2 className="h-4 w-4" />
				<span className="sr-only">Remove certification</span>
			</Button>

			<CardContent className="pt-6">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={`cert-name-${index}`}>
							Certification Name <span className="text-destructive">*</span>
						</Label>
						<Input
							id={`cert-name-${index}`}
							value={certification.name}
							onChange={handleChange("name")}
							onBlur={() => handleFieldBlur("name")}
							placeholder="e.g., AWS Solutions Architect"
							aria-invalid={!!showError("name")}
						/>
						{showError("name") && (
							<p className="text-sm text-destructive">
								{errors[`${index}.name`]}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor={`cert-issuer-${index}`}>
							Issuer <span className="text-destructive">*</span>
						</Label>
						<Input
							id={`cert-issuer-${index}`}
							value={certification.issuer}
							onChange={handleChange("issuer")}
							onBlur={() => handleFieldBlur("issuer")}
							placeholder="e.g., Amazon Web Services"
							aria-invalid={!!showError("issuer")}
						/>
						{showError("issuer") && (
							<p className="text-sm text-destructive">
								{errors[`${index}.issuer`]}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor={`cert-date-${index}`}>Date</Label>
						<Input
							id={`cert-date-${index}`}
							type="month"
							value={certification.date}
							onChange={handleChange("date")}
							onBlur={() => handleFieldBlur("date")}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor={`cert-url-${index}`}>URL</Label>
						<Input
							id={`cert-url-${index}`}
							type="url"
							value={certification.url}
							onChange={handleChange("url")}
							onBlur={() => handleFieldBlur("url")}
							placeholder="https://..."
							aria-invalid={!!showError("url")}
						/>
						{showError("url") && (
							<p className="text-sm text-destructive">
								{errors[`${index}.url`]}
							</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function CertificationsForm({
	initialData,
	onChange,
}: CertificationsFormProps) {
	const [certifications, setCertifications] = useState<Certification[]>(
		initialData.length > 0 ? initialData : [],
	);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	useEffect(() => {
		const fieldErrors: Record<string, string> = {};
		let allValid = true;

		certifications.forEach((certification, index) => {
			const result = certificationSchema.safeParse(certification);
			if (!result.success) {
				allValid = false;
				for (const issue of result.error.issues) {
					const field = issue.path[0] as string;
					fieldErrors[`${index}.${field}`] = issue.message;
				}
			}
		});

		setErrors(fieldErrors);
		onChange(certifications, certifications.length === 0 || allValid);
	}, [certifications, onChange]);

	const handleAddCertification = () => {
		setCertifications([...certifications, createEmptyCertification()]);
	};

	const handleCertificationChange = (
		index: number,
		certification: Certification,
	) => {
		const updated = [...certifications];
		updated[index] = certification;
		setCertifications(updated);
	};

	const handleRemoveCertification = (index: number) => {
		setCertifications(certifications.filter((_, i) => i !== index));
		const updatedTouched: Record<string, boolean> = {};
		const updatedErrors: Record<string, string> = {};
		Object.keys(touched).forEach((key) => {
			const [keyIndex] = key.split(".");
			const numIndex = parseInt(keyIndex, 10);
			if (numIndex < index) {
				updatedTouched[key] = touched[key];
				if (errors[key]) updatedErrors[key] = errors[key];
			} else if (numIndex > index) {
				const newKey = key.replace(`${numIndex}.`, `${numIndex - 1}.`);
				updatedTouched[newKey] = touched[key];
				if (errors[key]) updatedErrors[newKey] = errors[key];
			}
		});
		setTouched(updatedTouched);
		setErrors(updatedErrors);
	};

	const handleBlur = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	return (
		<div className="space-y-4">
			{certifications.length === 0 ? (
				<div className="text-center py-8 border-2 border-dashed rounded-lg">
					<p className="text-muted-foreground mb-4">
						No certifications added yet
					</p>
					<Button type="button" onClick={handleAddCertification}>
						<Plus className="h-4 w-4 mr-2" />
						Add Certification
					</Button>
				</div>
			) : (
				<>
					<div className="space-y-4">
						{certifications.map((certification, index) => (
							<CertificationEntry
								key={certification.id}
								certification={certification}
								index={index}
								onChange={handleCertificationChange}
								onRemove={handleRemoveCertification}
								errors={errors}
								touched={touched}
								onBlur={handleBlur}
							/>
						))}
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={handleAddCertification}
						className="w-full"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Another Certification
					</Button>
				</>
			)}
		</div>
	);
}
