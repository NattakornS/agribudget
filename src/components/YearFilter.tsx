import { useYearFilter } from '@/contexts/YearFilterContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export function YearFilter() {
  const { selectedYear, setSelectedYear, availableYears } = useYearFilter();

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedYear.toString()}
        onValueChange={(value) => setSelectedYear(parseInt(value))}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year === 0 ? 'All Years' : year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
