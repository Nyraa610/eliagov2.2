
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { IROFormValues } from "../formSchema";

interface ReviewFooterProps {
  onPrevious: () => void;
  onSubmit: (values: IROFormValues) => void;
  formValues: IROFormValues;
}

export function ReviewFooter({ onPrevious, onSubmit, formValues }: ReviewFooterProps) {
  return (
    <CardFooter className="flex justify-between">
      <Button variant="outline" onClick={onPrevious}>
        Previous
      </Button>
      <Button onClick={() => onSubmit(formValues)}>
        Submit Analysis
      </Button>
    </CardFooter>
  );
}
