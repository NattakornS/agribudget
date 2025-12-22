import CategoryFilter from "@/components/CategoryFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const CategoryFilterDemo = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Example categories with colors
  const categories = [
    { id: 'vegetables', name: 'Vegetables', color: 'green' },
    { id: 'fruits', name: 'Fruits', color: 'red' },
    { id: 'grains', name: 'Grains', color: 'yellow' },
    { id: 'legumes', name: 'Legumes', color: 'orange' },
    { id: 'herbs', name: 'Herbs', color: 'purple' },
    { id: 'flowers', name: 'Flowers', color: 'blue' },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Category Filter Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3">Filter Categories:</h3>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Selected Category:</strong> {selectedCategory === 'all' ? 'All Categories' : categories.find(c => c.id === selectedCategory)?.name}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilterDemo;
