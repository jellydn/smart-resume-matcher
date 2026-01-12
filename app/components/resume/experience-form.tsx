import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { Experience } from "~/lib/types";
import { experienceSchema, generateId } from "~/lib/types";

interface ExperienceFormProps {
	initialData: Experience[];
	onChange: (data: Experience[], isValid: boolean) => void;
}

function createEmptyExperience(): Experience {
	return {
		id: generateId(),
		title: "",
		company: "",
		location: "",
		startDate: "",
		endDate: "",
		current: false,
		description: "",
		highlights: [],
	};
}

interface ExperienceEntryProps {
	experience: Experience;
	index: number;
	onChange: (index: number, experience: Experience) => void;
	onRemove: (index: number) => void;
	errors: Record<string, string>;
	touched: Record<string, boolean>;
	onBlur: (field: string) => void;
}

function ExperienceEntry({
	experience,
	index,
	onChange,
	onRemove,
	errors,
	touched,
	onBlur,
}: ExperienceEntryProps) {
	const [newHighlight, setNewHighlight] = useState("");

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		onChange(index, { ...experience, [name]: value });
	};

	const handleCurrentChange = (checked: boolean) => {
		onChange(index, {
			...experience,
			current: checked,
			endDate: checked ? "" : experience.endDate,
		});
	};

	const handleAddHighlight = () => {
		if (newHighlight.trim()) {
			onChange(index, {
				...experience,
				highlights: [...experience.highlights, newHighlight.trim()],
			});
			setNewHighlight("");
		}
	};

	const handleRemoveHighlight = (highlightIndex: number) => {
		onChange(index, {
			...experience,
			highlights: experience.highlights.filter((_, i) => i !== highlightIndex),
		});
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddHighlight();
		}
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
				<span className="sr-only">Remove experience</span>
			</Button>

			<CardContent className="pt-6 space-y-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={`title-${index}`}>
							Job Title <span className="text-destructive">*</span>
						</Label>
						<Input
							id={`title-${index}`}
							name="title"
							value={experience.title}
							onChange={handleChange}
							onBlur={() => handleFieldBlur("title")}
							placeholder="Senior Software Engineer"
							aria-invalid={!!showError("title")}
						/>
						{showError("title") && (
							<p className="text-sm text-destructive">
								{errors[`${index}.title`]}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor={`company-${index}`}>
							Company <span className="text-destructive">*</span>
						</Label>
						<Input
							id={`company-${index}`}
							name="company"
							value={experience.company}
							onChange={handleChange}
							onBlur={() => handleFieldBlur("company")}
							placeholder="Acme Corporation"
							aria-invalid={!!showError("company")}
						/>
						{showError("company") && (
							<p className="text-sm text-destructive">
								{errors[`${index}.company`]}
							</p>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor={`location-${index}`}>Location</Label>
					<Input
						id={`location-${index}`}
						name="location"
						value={experience.location ?? ""}
						onChange={handleChange}
						placeholder="San Francisco, CA"
					/>
				</div>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={`startDate-${index}`}>
							Start Date <span className="text-destructive">*</span>
						</Label>
						<Input
							id={`startDate-${index}`}
							name="startDate"
							type="month"
							value={experience.startDate}
							onChange={handleChange}
							onBlur={() => handleFieldBlur("startDate")}
							aria-invalid={!!showError("startDate")}
						/>
						{showError("startDate") && (
							<p className="text-sm text-destructive">
								{errors[`${index}.startDate`]}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor={`endDate-${index}`}>End Date</Label>
						<Input
							id={`endDate-${index}`}
							name="endDate"
							type="month"
							value={experience.endDate ?? ""}
							onChange={handleChange}
							disabled={experience.current}
							className={
								experience.current ? "bg-muted cursor-not-allowed" : ""
							}
						/>
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<Checkbox
						id={`current-${index}`}
						checked={experience.current}
						onCheckedChange={handleCurrentChange}
					/>
					<Label
						htmlFor={`current-${index}`}
						className="cursor-pointer font-normal"
					>
						I currently work here
					</Label>
				</div>

				<div className="space-y-2">
					<Label htmlFor={`description-${index}`}>Description</Label>
					<Textarea
						id={`description-${index}`}
						name="description"
						value={experience.description ?? ""}
						onChange={handleChange}
						placeholder="Brief description of your role and responsibilities..."
						rows={3}
					/>
				</div>

				<div className="space-y-2">
					<Label>Highlights / Achievements</Label>
					<div className="space-y-2">
						{experience.highlights.map((highlight, hIndex) => (
							<div
								key={hIndex}
								className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2"
							>
								<span className="flex-1 text-sm">{highlight}</span>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-6 w-6 text-muted-foreground hover:text-destructive"
									onClick={() => handleRemoveHighlight(hIndex)}
								>
									<X className="h-3 w-3" />
									<span className="sr-only">Remove highlight</span>
								</Button>
							</div>
						))}
						<div className="flex gap-2">
							<Input
								value={newHighlight}
								onChange={(e) => setNewHighlight(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Add a highlight (press Enter)"
							/>
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={handleAddHighlight}
								disabled={!newHighlight.trim()}
							>
								<Plus className="h-4 w-4" />
								<span className="sr-only">Add highlight</span>
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function ExperienceForm({ initialData, onChange }: ExperienceFormProps) {
	const [experiences, setExperiences] = useState<Experience[]>(
		initialData.length > 0 ? initialData : [],
	);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	useEffect(() => {
		const fieldErrors: Record<string, string> = {};
		let allValid = true;

		experiences.forEach((exp, index) => {
			const result = experienceSchema.safeParse(exp);
			if (!result.success) {
				allValid = false;
				for (const issue of result.error.issues) {
					const field = issue.path[0] as string;
					fieldErrors[`${index}.${field}`] = issue.message;
				}
			}
		});

		setErrors(fieldErrors);
		onChange(experiences, experiences.length === 0 || allValid);
	}, [experiences, onChange]);

	const handleAddExperience = () => {
		setExperiences([...experiences, createEmptyExperience()]);
	};

	const handleExperienceChange = (index: number, experience: Experience) => {
		const updated = [...experiences];
		updated[index] = experience;
		setExperiences(updated);
	};

	const handleRemoveExperience = (index: number) => {
		setExperiences(experiences.filter((_, i) => i !== index));
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
			{experiences.length === 0 ? (
				<div className="text-center py-8 border-2 border-dashed rounded-lg">
					<p className="text-muted-foreground mb-4">
						No work experience added yet
					</p>
					<Button type="button" onClick={handleAddExperience}>
						<Plus className="h-4 w-4 mr-2" />
						Add Experience
					</Button>
				</div>
			) : (
				<>
					<div className="space-y-4">
						{experiences.map((experience, index) => (
							<ExperienceEntry
								key={experience.id}
								experience={experience}
								index={index}
								onChange={handleExperienceChange}
								onRemove={handleRemoveExperience}
								errors={errors}
								touched={touched}
								onBlur={handleBlur}
							/>
						))}
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={handleAddExperience}
						className="w-full"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Another Experience
					</Button>
				</>
			)}
		</div>
	);
}
