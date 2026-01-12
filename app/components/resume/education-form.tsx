import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Education } from "~/lib/types";
import { educationSchema, generateId } from "~/lib/types";

interface EducationFormProps {
	initialData: Education[];
	onChange: (data: Education[], isValid: boolean) => void;
}

function createEmptyEducation(): Education {
	return {
		id: generateId(),
		degree: "",
		institution: "",
		location: "",
		graduationDate: "",
		gpa: "",
	};
}

interface EducationEntryProps {
	education: Education;
	index: number;
	onChange: (index: number, education: Education) => void;
	onRemove: (index: number) => void;
	errors: Record<string, string>;
	touched: Record<string, boolean>;
	onBlur: (field: string) => void;
}

function EducationEntry({
	education,
	index,
	onChange,
	onRemove,
	errors,
	touched,
	onBlur,
}: EducationEntryProps) {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		onChange(index, { ...education, [name]: value });
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
				<span className="sr-only">Remove education</span>
			</Button>

			<CardContent className="pt-6 space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={`degree-${index}`}>
							Degree <span className="text-destructive">*</span>
						</Label>
						<Input
							id={`degree-${index}`}
							name="degree"
							value={education.degree}
							onChange={handleChange}
							onBlur={() => handleFieldBlur("degree")}
							placeholder="Bachelor of Science in Computer Science"
							aria-invalid={!!showError("degree")}
						/>
						{showError("degree") && (
							<p className="text-sm text-destructive">
								{errors[`${index}.degree`]}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor={`institution-${index}`}>
							Institution <span className="text-destructive">*</span>
						</Label>
						<Input
							id={`institution-${index}`}
							name="institution"
							value={education.institution}
							onChange={handleChange}
							onBlur={() => handleFieldBlur("institution")}
							placeholder="Stanford University"
							aria-invalid={!!showError("institution")}
						/>
						{showError("institution") && (
							<p className="text-sm text-destructive">
								{errors[`${index}.institution`]}
							</p>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor={`location-${index}`}>Location</Label>
					<Input
						id={`location-${index}`}
						name="location"
						value={education.location ?? ""}
						onChange={handleChange}
						placeholder="Stanford, CA"
					/>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={`graduationDate-${index}`}>Graduation Date</Label>
						<Input
							id={`graduationDate-${index}`}
							name="graduationDate"
							type="month"
							value={education.graduationDate ?? ""}
							onChange={handleChange}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor={`gpa-${index}`}>GPA (Optional)</Label>
						<Input
							id={`gpa-${index}`}
							name="gpa"
							value={education.gpa ?? ""}
							onChange={handleChange}
							placeholder="3.8"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function EducationForm({ initialData, onChange }: EducationFormProps) {
	const [educations, setEducations] = useState<Education[]>(
		initialData.length > 0 ? initialData : [],
	);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	useEffect(() => {
		const fieldErrors: Record<string, string> = {};
		let allValid = true;

		educations.forEach((edu, index) => {
			const result = educationSchema.safeParse(edu);
			if (!result.success) {
				allValid = false;
				for (const issue of result.error.issues) {
					const field = issue.path[0] as string;
					fieldErrors[`${index}.${field}`] = issue.message;
				}
			}
		});

		setErrors(fieldErrors);
		onChange(educations, educations.length === 0 || allValid);
	}, [educations, onChange]);

	const handleAddEducation = () => {
		setEducations([...educations, createEmptyEducation()]);
	};

	const handleEducationChange = (index: number, education: Education) => {
		const updated = [...educations];
		updated[index] = education;
		setEducations(updated);
	};

	const handleRemoveEducation = (index: number) => {
		setEducations(educations.filter((_, i) => i !== index));
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
			{educations.length === 0 ? (
				<div className="text-center py-8 border-2 border-dashed rounded-lg">
					<p className="text-muted-foreground mb-4">No education added yet</p>
					<Button type="button" onClick={handleAddEducation}>
						<Plus className="h-4 w-4 mr-2" />
						Add Education
					</Button>
				</div>
			) : (
				<>
					<div className="space-y-4">
						{educations.map((education, index) => (
							<EducationEntry
								key={education.id}
								education={education}
								index={index}
								onChange={handleEducationChange}
								onRemove={handleRemoveEducation}
								errors={errors}
								touched={touched}
								onBlur={handleBlur}
							/>
						))}
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={handleAddEducation}
						className="w-full"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Another Education
					</Button>
				</>
			)}
		</div>
	);
}
