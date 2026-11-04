import { Question } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
  questionNumber: number;
}

export function QuestionCard({
  question,
  selectedOptionId,
  onSelectOption,
  questionNumber,
}: QuestionCardProps) {
  const letters = ["A", "B", "C", "D", "E"];

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Question Text */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">
            Question {questionNumber}
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground leading-relaxed">
            {question.text}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {question.options.map((option, index) => {
            const isSelected = selectedOptionId === option.id;
            const letter = letters[index] || `${index + 1}`;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectOption(option.id)}
                className={`w-full text-left flex items-center justify-between p-4 rounded-xl border transition-all duration-150 ${
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground ring-2 ring-primary/20 shadow-xs"
                    : "border-border/80 bg-card hover:bg-muted/40 hover:border-primary/40 text-foreground"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 pr-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold border transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/60 text-muted-foreground border-border group-hover:border-foreground"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base font-medium leading-snug">
                    {option.text}
                  </span>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
