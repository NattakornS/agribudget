import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';

export const ThemeTest: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {resolvedTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          Theme Test Component
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Current Theme: <span className="font-bold">{theme}</span></p>
          <p className="text-sm font-medium">Resolved Theme: <span className="font-bold">{resolvedTheme}</span></p>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Test theme colors:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-primary text-primary-foreground p-2 rounded">Primary</div>
            <div className="bg-secondary text-secondary-foreground p-2 rounded">Secondary</div>
            <div className="bg-muted text-muted-foreground p-2 rounded">Muted</div>
            <div className="bg-accent text-accent-foreground p-2 rounded">Accent</div>
            <div className="bg-destructive text-destructive-foreground p-2 rounded">Destructive</div>
            <div className="bg-card text-card-foreground p-2 rounded border">Card</div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Quick theme switch:</p>
          <div className="flex gap-2">
            <Button 
              variant={theme === 'light' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTheme('light')}
              className="flex-1"
            >
              <Sun className="h-4 w-4 mr-1" />
              Light
            </Button>
            <Button 
              variant={theme === 'dark' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTheme('dark')}
              className="flex-1"
            >
              <Moon className="h-4 w-4 mr-1" />
              Dark
            </Button>
            <Button 
              variant={theme === 'system' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTheme('system')}
              className="flex-1"
            >
              <Monitor className="h-4 w-4 mr-1" />
              System
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeTest;
