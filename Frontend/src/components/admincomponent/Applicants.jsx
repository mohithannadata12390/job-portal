import React, { useEffect, useState } from "react";
import ApplicantsTable from "./ApplicantsTable";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setJobWithApplicants } from "@/redux/applicationSlice";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import Navbar from "../components_lite/Navbar";
import { Bot } from "lucide-react";
import AIAssistantDrawer from "./AIAssistantDrawer";

const Applicants = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { jobWithApplicants } = useSelector((store) => store.application);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchAllApplicants = async () => {
    try {
      const res = await axios.get(
        `${APPLICATION_API_ENDPOINT}/${params.id}/applicants`,
        { withCredentials: true }
      );
      dispatch(setJobWithApplicants(res.data.job));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllApplicants();
  }, [params.id, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50/40">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 md:px-0 py-6">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h1 className="font-extrabold text-2xl text-gray-900 flex items-center gap-2">
            Applicants
            <span className="text-sm font-semibold bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full">
              {jobWithApplicants?.applications?.length || 0}
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Job: <span className="font-medium text-gray-700">{jobWithApplicants?.title || "Loading..."}</span>
          </p>
        </div>

        {/* Applicants Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <ApplicantsTable onRefresh={fetchAllApplicants} />
        </div>
      </div>

      {/* Floating Circular AI Bot Button (Recruiter) */}
      <button
        onClick={() => setDrawerOpen(true)}
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
        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
          AI Recruiter Assistant
        </span>
      </button>

      {/* Recruiter RAG AI Chat Drawer */}
      <AIAssistantDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        jobId={params.id}
      />
    </div>
  );
};

export default Applicants;
