import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  className 
}: CategoryFilterProps) => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Ensure "All" option is included and is first
  const allCategories = [
    { id: 'all', name: t('all') || 'All', color: 'default' },
    ...categories.filter(cat => cat.id !== 'all')
  ];

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200; // Adjust scroll amount as needed
      const newScrollLeft = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      // Update scrollability after animation
      setTimeout(checkScrollability, 300);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
  };

  const getCategoryColor = (category: Category) => {
    if (category.color) {
      switch (category.color) {
        case 'green':
          return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300';
        case 'blue':
          return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300';
        case 'red':
          return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300';
        case 'yellow':
          return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300';
        case 'purple':
          return 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300';
        case 'orange':
          return 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300';
        default:
          return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300';
      }
    }
    return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300';
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Left scroll button */}
      {canScrollLeft && (
        <Button
          variant="outline"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full h-8 w-8 p-0 shadow-md bg-background/95"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Right scroll button */}
      {canScrollRight && (
        <Button
          variant="outline"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full h-8 w-8 p-0 shadow-md bg-background/95"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Category chips container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth py-2 px-1"
        onScroll={checkScrollability}
      >
        {allCategories.map((category) => {
          const isSelected = selectedCategory === category.name;
          
          return (
            <Badge
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer whitespace-nowrap transition-all duration-200 px-3 py-1.5 text-sm font-medium",
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                  : getCategoryColor(category),
                "hover:scale-105 active:scale-95"
              )}
              onClick={() => handleCategoryClick(category.name)}
            >
              {category.name}
            </Badge>
          );
        })}
      </div>

      {/* Gradient fade effects for better UX */}
      {canScrollLeft && (
        <div className="absolute left-8 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-0" />
      )}
      {canScrollRight && (
        <div className="absolute right-8 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-0" />
      )}
    </div>
  );
};

// Custom scrollbar hide styles
const style = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('category-filter-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'category-filter-styles';
  styleElement.textContent = style;
  document.head.appendChild(styleElement);
}

export default CategoryFilter;
