import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import JudgeHeader from './JudgeHeader';
import JudgeSidebar from './JudgeSidebar';

interface JudgeLayoutProps {
  children?: ReactNode;
}

const JudgeLayout = ({ children }: JudgeLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
      {/* FIX: The 'sticky' and 'z-index' must be on the outermost 
          container of the header for it to stick to the top of the viewport.
      */}
      <div className="hidden lg:block sticky top-0 z-[100]">
        <JudgeHeader />
      </div>

      <div className="flex flex-1 flex-col lg:flex-row relative">
        <JudgeSidebar />
        
        {/* Note: If the header is sticky, this main area will scroll 
            underneath it. 
        */}
        <main className="flex-1 p-5 lg:p-10 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default JudgeLayout;