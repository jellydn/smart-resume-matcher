import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { Language, LanguageProficiency } from "~/lib/types";
import { generateId, languageSchema } from "~/lib/types";

interface LanguagesFormProps {
	initialData: Language[];
	onChange: (data: Language[], isValid: boolean) => void;
}

function createEmptyLanguage(): Language {
	return {
		id: generateId(),
		name: "",
		proficiency: "professional",
	};
}

const proficiencyLabels: Record<LanguageProficiency, string> = {
	basic: "Basic",
	conversational: "Conversational",
	professional: "Professional",
	native: "Native",
};

interface LanguageEntryProps {
	language: Language;
	index: number;
	onChange: (index: number, language: Language) => void;
	onRemove: (index: number) => void;
	errors: Record<string, string>;
	touched: Record<string, boolean>;
	onBlur: (field: string) => void;
}

function LanguageEntry({
	language,
	index,
	onChange,
	onRemove,
	errors,
	touched,
	onBlur,
}: LanguageEntryProps) {
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(index, { ...language, name: e.target.value });
	};

	const handleProficiencyChange = (value: LanguageProficiency) => {
		onChange(index, { ...language, proficiency: value });
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
				<span className="sr-only">Remove language</span>
			</Button>

			<CardContent className="pt-6">
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={`language-name-${index}`}>
							Language <span className="text-destructive">*</span>
						</Label>
						<Input
							id={`language-name-${index}`}
							value={language.name}
							onChange={handleNameChange}
							onBlur={() => handleFieldBlur("name")}
							placeholder="e.g., English, Spanish, Mandarin"
							aria-invalid={!!showError("name")}
						/>
						{showError("name") && (
							<p className="text-sm text-destructive">
								{errors[`${index}.name`]}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor={`language-proficiency-${index}`}>Proficiency</Label>
						<Select
							value={language.proficiency}
							onValueChange={handleProficiencyChange}
						>
							<SelectTrigger id={`language-proficiency-${index}`}>
								<SelectValue placeholder="Select proficiency level" />
							</SelectTrigger>
							<SelectContent>
								{(
									Object.entries(proficiencyLabels) as [
										LanguageProficiency,
										string,
									][]
								).map(([value, label]) => (
									<SelectItem key={value} value={value}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function LanguagesForm({ initialData, onChange }: LanguagesFormProps) {
	const [languages, setLanguages] = useState<Language[]>(
		initialData.length > 0 ? initialData : [],
	);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	useEffect(() => {
		const fieldErrors: Record<string, string> = {};
		let allValid = true;

		languages.forEach((language, index) => {
			const result = languageSchema.safeParse(language);
			if (!result.success) {
				allValid = false;
				for (const issue of result.error.issues) {
					const field = issue.path[0] as string;
					fieldErrors[`${index}.${field}`] = issue.message;
				}
			}
		});

		setErrors(fieldErrors);
		onChange(languages, languages.length === 0 || allValid);
	}, [languages, onChange]);

	const handleAddLanguage = () => {
		setLanguages([...languages, createEmptyLanguage()]);
	};

	const handleLanguageChange = (index: number, language: Language) => {
		const updated = [...languages];
		updated[index] = language;
		setLanguages(updated);
	};

	const handleRemoveLanguage = (index: number) => {
		setLanguages(languages.filter((_, i) => i !== index));
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
			{languages.length === 0 ? (
				<div className="text-center py-8 border-2 border-dashed rounded-lg">
					<p className="text-muted-foreground mb-4">No languages added yet</p>
					<Button type="button" onClick={handleAddLanguage}>
						<Plus className="h-4 w-4 mr-2" />
						Add Language
					</Button>
				</div>
			) : (
				<>
					<div className="space-y-4">
						{languages.map((language, index) => (
							<LanguageEntry
								key={language.id}
								language={language}
								index={index}
								onChange={handleLanguageChange}
								onRemove={handleRemoveLanguage}
								errors={errors}
								touched={touched}
								onBlur={handleBlur}
							/>
						))}
					</div>
					<Button
						type="button"
						variant="outline"
						onClick={handleAddLanguage}
						className="w-full"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Another Language
					</Button>
				</>
			)}
		</div>
	);
}
