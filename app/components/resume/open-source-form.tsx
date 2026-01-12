import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import type { OpenSource, OpenSourceRole } from "~/lib/types";
import { openSourceSchema, generateId } from "~/lib/types";

interface OpenSourceFormProps {
  initialData: OpenSource[];
  onChange: (data: OpenSource[], isValid: boolean) => void;
}

function createEmptyOpenSource(): OpenSource {
  return {
    id: generateId(),
    project: "",
    role: "contributor",
    url: "",
    description: "",
    contributions: [],
  };
}

const roleLabels: Record<OpenSourceRole, string> = {
  contributor: "Contributor",
  maintainer: "Maintainer",
  creator: "Creator",
};

interface OpenSourceEntryProps {
  openSource: OpenSource;
  index: number;
  onChange: (index: number, openSource: OpenSource) => void;
  onRemove: (index: number) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  onBlur: (field: string) => void;
}

function OpenSourceEntry({
  openSource,
  index,
  onChange,
  onRemove,
  errors,
  touched,
  onBlur,
}: OpenSourceEntryProps) {
  const [newContribution, setNewContribution] = useState("");

  const handleChange =
    (field: keyof OpenSource) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(index, { ...openSource, [field]: e.target.value });
    };

  const handleRoleChange = (value: OpenSourceRole) => {
    onChange(index, { ...openSource, role: value });
  };

  const showError = (field: string) => {
    const key = `${index}.${field}`;
    return touched[key] && errors[key];
  };

  const handleFieldBlur = (field: string) => {
    onBlur(`${index}.${field}`);
  };

  const handleAddContribution = () => {
    if (newContribution.trim()) {
      onChange(index, {
        ...openSource,
        contributions: [...openSource.contributions, newContribution.trim()],
      });
      setNewContribution("");
    }
  };

  const handleRemoveContribution = (contribIndex: number) => {
    onChange(index, {
      ...openSource,
      contributions: openSource.contributions.filter(
        (_, i) => i !== contribIndex
      ),
    });
  };

  const handleContributionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddContribution();
    }
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
        <span className="sr-only">Remove open source contribution</span>
      </Button>

      <CardContent className="pt-6">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`oss-project-${index}`}>
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`oss-project-${index}`}
                value={openSource.project}
                onChange={handleChange("project")}
                onBlur={() => handleFieldBlur("project")}
                placeholder="e.g., React, TensorFlow"
                aria-invalid={!!showError("project")}
              />
              {showError("project") && (
                <p className="text-sm text-destructive">
                  {errors[`${index}.project`]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`oss-role-${index}`}>Role</Label>
              <Select value={openSource.role} onValueChange={handleRoleChange}>
                <SelectTrigger id={`oss-role-${index}`}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(roleLabels) as [OpenSourceRole, string][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`oss-url-${index}`}>URL</Label>
            <Input
              id={`oss-url-${index}`}
              type="url"
              value={openSource.url}
              onChange={handleChange("url")}
              onBlur={() => handleFieldBlur("url")}
              placeholder="https://github.com/..."
              aria-invalid={!!showError("url")}
            />
            {showError("url") && (
              <p className="text-sm text-destructive">
                {errors[`${index}.url`]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`oss-description-${index}`}>Description</Label>
            <Textarea
              id={`oss-description-${index}`}
              value={openSource.description}
              onChange={handleChange("description")}
              onBlur={() => handleFieldBlur("description")}
              placeholder="Brief description of your involvement..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Contributions</Label>
            {openSource.contributions.length > 0 && (
              <ul className="space-y-1 mb-2">
                {openSource.contributions.map((contribution, contribIndex) => (
                  <li
                    key={contribIndex}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-muted-foreground">•</span>
                    <span className="flex-1">{contribution}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveContribution(contribIndex)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <Input
                value={newContribution}
                onChange={(e) => setNewContribution(e.target.value)}
                onKeyDown={handleContributionKeyDown}
                placeholder="Add contribution (press Enter)"
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddContribution}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OpenSourceForm({
  initialData,
  onChange,
}: OpenSourceFormProps) {
  const [openSourceItems, setOpenSourceItems] = useState<OpenSource[]>(
    initialData.length > 0 ? initialData : []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fieldErrors: Record<string, string> = {};
    let allValid = true;

    openSourceItems.forEach((item, index) => {
      const result = openSourceSchema.safeParse(item);
      if (!result.success) {
        allValid = false;
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string;
          fieldErrors[`${index}.${field}`] = issue.message;
        }
      }
    });

    setErrors(fieldErrors);
    onChange(openSourceItems, openSourceItems.length === 0 || allValid);
  }, [openSourceItems, onChange]);

  const handleAddOpenSource = () => {
    setOpenSourceItems([...openSourceItems, createEmptyOpenSource()]);
  };

  const handleOpenSourceChange = (index: number, item: OpenSource) => {
    const updated = [...openSourceItems];
    updated[index] = item;
    setOpenSourceItems(updated);
  };

  const handleRemoveOpenSource = (index: number) => {
    setOpenSourceItems(openSourceItems.filter((_, i) => i !== index));
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
      {openSourceItems.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            No open source contributions added yet
          </p>
          <Button type="button" onClick={handleAddOpenSource}>
            <Plus className="h-4 w-4 mr-2" />
            Add Open Source Contribution
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {openSourceItems.map((item, index) => (
              <OpenSourceEntry
                key={item.id}
                openSource={item}
                index={index}
                onChange={handleOpenSourceChange}
                onRemove={handleRemoveOpenSource}
                errors={errors}
                touched={touched}
                onBlur={handleBlur}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddOpenSource}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Open Source Contribution
          </Button>
        </>
      )}
    </div>
  );
}
