import { Button } from "@/components/ui/button";
import { LayoutList, Kanban } from "lucide-react";

interface ViewToggleProps {
  view: 'list' | 'kanban';
  onViewChange: (view: 'list' | 'kanban') => void;
}

export const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
      >
        <LayoutList className="h-4 w-4 mr-2" />
        List
      </Button>
      <Button
        variant={view === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('kanban')}
      >
        <Kanban className="h-4 w-4 mr-2" />
        Kanban
      </Button>
    </div>
  );
};
