import { Outlet } from "react-router-dom";
import GuestHeader from "./GuestHeader";
import GuestSidebar from "./GuestSidebar";

const GuestLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">

      <GuestHeader />

      <div className="flex">

        <GuestSidebar />

        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default GuestLayout;