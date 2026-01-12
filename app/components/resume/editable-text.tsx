import { Check, Pencil, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

interface EditableTextProps {
	value: string;
	onSave: (value: string) => void;
	className?: string;
	inputClassName?: string;
	multiline?: boolean;
	placeholder?: string;
	disabled?: boolean;
}

export function EditableText({
	value,
	onSave,
	className,
	inputClassName,
	multiline = false,
	placeholder = "Click to edit",
	disabled = false,
}: EditableTextProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(value);
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

	useEffect(() => {
		setEditValue(value);
	}, [value]);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	const handleSave = useCallback(() => {
		onSave(editValue);
		setIsEditing(false);
	}, [editValue, onSave]);

	const handleCancel = useCallback(() => {
		setEditValue(value);
		setIsEditing(false);
	}, [value]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && !multiline) {
				e.preventDefault();
				handleSave();
			} else if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				handleSave();
			} else if (e.key === "Escape") {
				handleCancel();
			}
		},
		[handleSave, handleCancel, multiline],
	);

	if (isEditing) {
		return (
			<div className="flex items-start gap-1">
				{multiline ? (
					<Textarea
						ref={inputRef as React.RefObject<HTMLTextAreaElement>}
						value={editValue}
						onChange={(e) => setEditValue(e.target.value)}
						onKeyDown={handleKeyDown}
						className={cn("min-h-[80px] text-sm", inputClassName)}
						placeholder={placeholder}
					/>
				) : (
					<Input
						ref={inputRef as React.RefObject<HTMLInputElement>}
						value={editValue}
						onChange={(e) => setEditValue(e.target.value)}
						onKeyDown={handleKeyDown}
						className={cn("text-sm h-8", inputClassName)}
						placeholder={placeholder}
					/>
				)}
				<div className="flex flex-col gap-1">
					<Button
						size="sm"
						variant="ghost"
						className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
						onClick={handleSave}
						title="Save (Enter)"
					>
						<Check className="h-3.5 w-3.5" />
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
						onClick={handleCancel}
						title="Cancel (Escape)"
					>
						<X className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
		);
	}

	return (
		<span
			className={cn(
				"group inline-flex items-center gap-1 cursor-pointer rounded px-1 -ml-1 transition-colors",
				!disabled && "hover:bg-muted/50",
				disabled && "cursor-default",
				className,
			)}
			onClick={() => !disabled && setIsEditing(true)}
			title={disabled ? undefined : "Click to edit"}
		>
			<span className={value ? undefined : "text-muted-foreground italic"}>
				{value || placeholder}
			</span>
			{!disabled && (
				<Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
			)}
		</span>
	);
}
