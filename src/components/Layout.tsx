import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import BottomNav from './BottomNav';
import CropFilter from './CropFilter';

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background w-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <AppSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with crop filter */}
          <div className="p-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile sidebar trigger */}
                <div className="md:hidden">
                  <SidebarTrigger />
                </div>
                <div className="text-md font-semibold md:hidden">AgriBudget</div>
                {/* Desktop title */}
                <div className="hidden md:block">
                  {/* <h1 className="text-lg font-semibold text-foreground">Farm Management</h1> */}
                </div>
              </div>
              {/* Crop Filter */}
              <div className="flex items-center">
                <CropFilter />
              </div>
            </div>
          </div>
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 p-4">
            <Outlet />
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
