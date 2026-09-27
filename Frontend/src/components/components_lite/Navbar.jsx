import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { LogOut, User2, Menu, X, Sparkles, Bot } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios"; // Import axios
import { persistor, RESET_STORE } from "@/redux/store";
import { USER_API_ENDPOINT } from "@/utils/data";
import StudentAIAssistantDrawer from "./StudentAIAssistantDrawer";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const { savedJobs } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      const res = await axios.post(
        `${USER_API_ENDPOINT}/logout`,
        {},
        { withCredentials: true }
      );
      if (res && res.data && res.data.success) {
        // Clearing just the user isn't enough - savedJobs, applied jobs,
        // and other per-user state are all persisted to localStorage, so
        // they'd otherwise still be visible to the next person who logs
        // in on this browser (or to this user after logging back out).
        dispatch({ type: RESET_STORE });
        await persistor.purge();
        navigate("/");
        toast.success(res.data.message);
      } else {
        console.error("Error logging out:", res.data);
      }
    } catch (error) {
      console.error("Axios error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      toast.error("Error logging out. Please try again.");
    }
  };
  return (
    <div className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4 md:px-8">
        <div>
          <Link to="/">
            <h1 className="text-2xl font-bold cursor-pointer">
              <span className="text-[#6B3AC2]"> Job </span>{" "}
              <span className="text-[#FA4F09]">Hunt</span>
            </h1>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-gray-900 focus:outline-none">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          <ul className="flex font-medium items-center gap-6">
            {user && user.role === "Recruiter" ? (
              <>
                <li>
                  <Link to={"/admin/companies"} className="hover:text-[#FA4F09] transition-colors">Companies</Link>
                </li>
                <li>
                  <Link to={"/admin/jobs"} className="hover:text-[#FA4F09] transition-colors">Jobs</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to={"/Home"} className="hover:text-[#FA4F09] transition-colors">Home</Link>
                </li>
                <li>
                  <Link to={"/Browse"} className="hover:text-[#FA4F09] transition-colors">Browse</Link>
                </li>
                <li>
                  <Link to={"/Jobs"} className="hover:text-[#FA4F09] transition-colors">Jobs</Link>
                </li>
                <li>
                  <Link to={"/saved-jobs"} className="hover:text-[#FA4F09] transition-colors flex items-center gap-1">
                    Saved Jobs
                    {savedJobs && savedJobs.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{savedJobs.length}</span>
                    )}
                  </Link>
                </li>

              </>
            )}
          </ul>
          {!user ? (
            <div className=" flex items-center gap-2">
              <Link to={"/login"}>
                {" "}
                <Button variant="outline">Login</Button>
              </Link>
              <Link to={"/register"}>
                {" "}
                <Button className="bg-red-600  hover:bg-red-700">
                  Register
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={user?.profile?.profilePhoto}
                    alt="@shadcn"
                  />
                  <AvatarFallback>
                    {user?.fullname?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="flex items-center gap-4 space-y-2">
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={user?.profile?.profilePhoto}
                      alt="@shadcn"
                    />
                    <AvatarFallback>
                      {user?.fullname?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user?.fullname}</h3>
                    <p className="text-sm text-muted-foreground">
                      {user?.profile?.bio}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col my-2 text-gray-600  ">
                  {user && user.role === "Student" && (
                    <div className="flex w-fit items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 rounded-md transition-colors">
                      <User2></User2>
                      <Button variant="link" className="p-0">
                        {" "}
                        <Link to={"/Profile"}> Profile</Link>{" "}
                      </Button>
                    </div>
                  )}

                  <div className="flex w-fit items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 rounded-md transition-colors">
                    <LogOut></LogOut>
                    <Button onClick={logoutHandler} variant="link" className="p-0">
                      Logout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 absolute w-full shadow-lg left-0">
          <ul className="flex flex-col font-medium gap-4">
            {user && user.role === "Recruiter" ? (
              <>
                <li>
                  <Link to={"/admin/companies"} onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-[#FA4F09]">Companies</Link>
                </li>
                <li>
                  <Link to={"/admin/jobs"} onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-[#FA4F09]">Jobs</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to={"/Home"} onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-[#FA4F09]">Home</Link>
                </li>
                <li>
                  <Link to={"/Browse"} onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-[#FA4F09]">Browse</Link>
                </li>
                <li>
                  <Link to={"/Jobs"} onClick={() => setIsMenuOpen(false)} className="block py-2 hover:text-[#FA4F09]">Jobs</Link>
                </li>
                <li>
                  <Link to={"/saved-jobs"} onClick={() => setIsMenuOpen(false)} className="py-2 hover:text-[#FA4F09] flex items-center gap-2">
                    Saved Jobs
                    {savedJobs && savedJobs.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{savedJobs.length}</span>
                    )}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setIsAICoachOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="py-2 text-purple-700 hover:text-[#FA4F09] flex items-center gap-2 font-semibold w-full text-left"
                  >
                    <Bot className="w-4 h-4 text-yellow-500" />
                    <span>Ask AI Assistant</span>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                  </button>
                </li>
              </>
            )}
            
            <li className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              {!user ? (
                <>
                  <Link to={"/login"} onClick={() => setIsMenuOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full justify-center">Login</Button>
                  </Link>
                  <Link to={"/register"} onClick={() => setIsMenuOpen(false)} className="w-full">
                    <Button className="w-full justify-center bg-red-600 hover:bg-red-700">Register</Button>
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                     <Avatar className="cursor-pointer">
                        <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                        <AvatarFallback>
                          {user?.fullname?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                     </Avatar>
                     <div>
                       <h3 className="font-medium text-sm">{user?.fullname}</h3>
                     </div>
                   </div>
                   
                   {user && user.role === "Student" && (
                    <Link to={"/Profile"} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-gray-600 py-2">
                      <User2 size={20} />
                      <span>Profile</span>
                    </Link>
                   )}
                   <button onClick={() => { logoutHandler(); setIsMenuOpen(false); }} className="flex items-center gap-2 text-red-600 py-2 font-medium text-left">
                     <LogOut size={20} />
                     <span>Logout</span>
                   </button>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}

      {/* Floating Circular AI Bot Button (Student / Candidate) */}
      {user && user.role !== "Recruiter" && (
        <button
          onClick={() => setIsAICoachOpen(true)}
          title="Ask AI Assistant"
          className="fixed bottom-6 right-6 z-40 group"
        >
          {/* Outer glowing ring */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-purple-700 opacity-60 blur-md scale-110 group-hover:opacity-90 group-hover:scale-125 transition-all duration-300" />
          {/* Middle ring */}
          <span className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-700 via-indigo-600 to-purple-900 shadow-xl group-hover:shadow-purple-500/60 group-hover:shadow-2xl transition-all duration-300 ring-4 ring-white/30 group-hover:ring-white/50">
            {/* Inner white circle */}
            <span className="flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-inner">
              <Bot className="h-6 w-6 text-indigo-700 group-hover:text-purple-700 transition-colors duration-200" />
            </span>
          </span>
          {/* Tooltip label */}
          <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
            AI Career Coach
          </span>
        </button>
      )}

      {/* Student AI Assistant Drawer Modal */}
      <StudentAIAssistantDrawer
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
        userName={user?.fullname}
      />
    </div>
  );
};

export default Navbar;
