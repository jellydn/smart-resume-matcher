import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export interface WizardStep {
	id: string;
	title: string;
	description?: string;
	component: ReactNode;
	isValid: boolean;
	isOptional?: boolean;
}

interface FormWizardProps {
	steps: WizardStep[];
	onComplete: () => void;
	completeButtonLabel?: string;
}

export function FormWizard({
	steps,
	onComplete,
	completeButtonLabel = "Save & Continue",
}: FormWizardProps) {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);

	const currentStep = steps[currentStepIndex];
	const isFirstStep = currentStepIndex === 0;
	const isLastStep = currentStepIndex === steps.length - 1;

	const canProceed = useMemo(() => {
		return currentStep.isValid || currentStep.isOptional;
	}, [currentStep.isValid, currentStep.isOptional]);

	const handleNext = useCallback(() => {
		if (canProceed && !isLastStep) {
			setCurrentStepIndex((prev) => prev + 1);
		} else if (canProceed && isLastStep) {
			onComplete();
		}
	}, [canProceed, isLastStep, onComplete]);

	const handlePrevious = useCallback(() => {
		if (!isFirstStep) {
			setCurrentStepIndex((prev) => prev - 1);
		}
	}, [isFirstStep]);

	const handleStepClick = useCallback(
		(index: number) => {
			// Can only go back or to current step
			// Can only go forward if current step is valid
			if (index < currentStepIndex) {
				setCurrentStepIndex(index);
			} else if (index === currentStepIndex) {
				// Already on this step
			} else if (index === currentStepIndex + 1 && canProceed) {
				setCurrentStepIndex(index);
			}
		},
		[currentStepIndex, canProceed],
	);

	return (
		<div className="space-y-6">
			{/* Progress Indicator */}
			<div className="relative">
				<div className="flex items-center justify-between">
					{steps.map((step, index) => {
						const isCompleted = index < currentStepIndex;
						const isCurrent = index === currentStepIndex;
						const isAccessible =
							index <= currentStepIndex ||
							(index === currentStepIndex + 1 && canProceed);

						return (
							<div key={step.id} className="flex flex-1 items-center">
								{/* Step Circle */}
								<button
									type="button"
									onClick={() => handleStepClick(index)}
									disabled={!isAccessible}
									className={cn(
										"relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
										isCompleted &&
											"border-primary bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90",
										isCurrent && "border-primary bg-background text-primary",
										!isCompleted &&
											!isCurrent &&
											"border-muted-foreground/30 bg-background text-muted-foreground",
										isAccessible &&
											!isCompleted &&
											!isCurrent &&
											"cursor-pointer hover:border-primary/50",
									)}
								>
									{isCompleted ? (
										<Check className="h-5 w-5" />
									) : (
										<span>{index + 1}</span>
									)}
								</button>

								{/* Connector Line */}
								{index < steps.length - 1 && (
									<div
										className={cn(
											"h-0.5 flex-1 mx-2 transition-colors",
											index < currentStepIndex
												? "bg-primary"
												: "bg-muted-foreground/30",
										)}
									/>
								)}
							</div>
						);
					})}
				</div>

				{/* Step Labels */}
				<div className="mt-2 flex justify-between">
					{steps.map((step, index) => {
						const isCurrent = index === currentStepIndex;
						const isCompleted = index < currentStepIndex;

						return (
							<div
								key={`label-${step.id}`}
								className={cn(
									"flex-1 text-center text-xs",
									isCurrent && "text-primary font-medium",
									isCompleted && "text-primary",
									!isCurrent && !isCompleted && "text-muted-foreground",
								)}
								style={{ maxWidth: `${100 / steps.length}%` }}
							>
								<span className="line-clamp-1">{step.title}</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Current Step Content */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span>{currentStep.title}</span>
						{currentStep.isOptional && (
							<span className="text-sm font-normal text-muted-foreground">
								Optional
							</span>
						)}
					</CardTitle>
					{currentStep.description && (
						<p className="text-sm text-muted-foreground">
							{currentStep.description}
						</p>
					)}
				</CardHeader>
				<CardContent>{currentStep.component}</CardContent>
			</Card>

			{/* Navigation Buttons */}
			<div className="flex justify-between">
				<Button
					variant="outline"
					onClick={handlePrevious}
					disabled={isFirstStep}
				>
					<ChevronLeft className="h-4 w-4 mr-1" />
					Previous
				</Button>

				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						Step {currentStepIndex + 1} of {steps.length}
					</span>
				</div>

				<Button onClick={handleNext} disabled={!canProceed}>
					{isLastStep ? (
						completeButtonLabel
					) : (
						<>
							Next
							<ChevronRight className="h-4 w-4 ml-1" />
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
