import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { PersonalInfo } from "~/lib/types";
import { personalInfoSchema } from "~/lib/types";

interface PersonalInfoFormProps {
  initialData: PersonalInfo;
  onChange: (data: PersonalInfo, isValid: boolean) => void;
}

interface FieldError {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  summary?: string;
}

export function PersonalInfoForm({
  initialData,
  onChange,
}: PersonalInfoFormProps) {
  const [formData, setFormData] = useState<PersonalInfo>(initialData);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const result = personalInfoSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      onChange(formData, true);
    } else {
      const fieldErrors: FieldError = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldError;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      onChange(formData, false);
    }
  }, [formData, onChange]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const showError = (field: keyof FieldError) => {
    return touched[field] && errors[field];
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="John Doe"
            aria-invalid={!!showError("name")}
          />
          {showError("name") && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="john@example.com"
            aria-invalid={!!showError("email")}
          />
          {showError("email") && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="San Francisco, CA"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            name="linkedin"
            type="url"
            value={formData.linkedin ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="https://linkedin.com/in/johndoe"
            aria-invalid={!!showError("linkedin")}
          />
          {showError("linkedin") && (
            <p className="text-sm text-destructive">{errors.linkedin}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Personal Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            value={formData.website ?? ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="https://johndoe.dev"
            aria-invalid={!!showError("website")}
          />
          {showError("website") && (
            <p className="text-sm text-destructive">{errors.website}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          name="summary"
          value={formData.summary ?? ""}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="A brief overview of your professional background and career objectives..."
          rows={4}
        />
      </div>

      {Object.keys(errors).length > 0 &&
        Object.keys(touched).length > 0 &&
        Object.values(errors).some((e) => e) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors above before continuing.
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
}
