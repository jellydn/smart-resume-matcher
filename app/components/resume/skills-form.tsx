import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { Skill, SkillProficiency } from "~/lib/types";
import { skillSchema, generateId } from "~/lib/types";

interface SkillsFormProps {
  initialData: Skill[];
  onChange: (data: Skill[], isValid: boolean) => void;
}

function createEmptySkill(): Skill {
  return {
    id: generateId(),
    name: "",
    proficiency: "intermediate",
  };
}

const proficiencyLabels: Record<SkillProficiency, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

interface SkillEntryProps {
  skill: Skill;
  index: number;
  onChange: (index: number, skill: Skill) => void;
  onRemove: (index: number) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  onBlur: (field: string) => void;
}

function SkillEntry({
  skill,
  index,
  onChange,
  onRemove,
  errors,
  touched,
  onBlur,
}: SkillEntryProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, { ...skill, name: e.target.value });
  };

  const handleProficiencyChange = (value: SkillProficiency) => {
    onChange(index, { ...skill, proficiency: value });
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
        <span className="sr-only">Remove skill</span>
      </Button>

      <CardContent className="pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`skill-name-${index}`}>
              Skill Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`skill-name-${index}`}
              value={skill.name}
              onChange={handleNameChange}
              onBlur={() => handleFieldBlur("name")}
              placeholder="e.g., JavaScript, React, Python"
              aria-invalid={!!showError("name")}
            />
            {showError("name") && (
              <p className="text-sm text-destructive">
                {errors[`${index}.name`]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`skill-proficiency-${index}`}>Proficiency</Label>
            <Select
              value={skill.proficiency}
              onValueChange={handleProficiencyChange}
            >
              <SelectTrigger id={`skill-proficiency-${index}`}>
                <SelectValue placeholder="Select proficiency level" />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(proficiencyLabels) as [
                    SkillProficiency,
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

export function SkillsForm({ initialData, onChange }: SkillsFormProps) {
  const [skills, setSkills] = useState<Skill[]>(
    initialData.length > 0 ? initialData : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fieldErrors: Record<string, string> = {};
    let allValid = true;

    skills.forEach((skill, index) => {
      const result = skillSchema.safeParse(skill);
      if (!result.success) {
        allValid = false;
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          fieldErrors[`${index}.${field}`] = issue.message;
        }
      }
    });

    setErrors(fieldErrors);
    onChange(skills, skills.length === 0 || allValid);
  }, [skills, onChange]);

  const handleAddSkill = () => {
    setSkills([...skills, createEmptySkill()]);
  };

  const handleSkillChange = (index: number, skill: Skill) => {
    const updated = [...skills];
    updated[index] = skill;
    setSkills(updated);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
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
      {skills.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No skills added yet</p>
          <Button type="button" onClick={handleAddSkill}>
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <SkillEntry
                key={skill.id}
                skill={skill}
                index={index}
                onChange={handleSkillChange}
                onRemove={handleRemoveSkill}
                errors={errors}
                touched={touched}
                onBlur={handleBlur}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSkill}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Skill
          </Button>
        </>
      )}
    </div>
  );
}
