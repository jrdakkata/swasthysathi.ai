import React, { useState } from 'react';
import { 
  MapPin, 
  UserCheck, 
  ChevronDown, 
  Building2, 
  Users, 
  X, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AshaProfile } from '../types/health';
import { DEMO_ASHA_PROFILES } from '../data/ashaProfilesData';

interface AshaAreaSelectorProps {
  currentProfile: AshaProfile;
  onSelectProfile: (profile: AshaProfile) => void;
  isModalOpen?: boolean;
  onModalOpenChange?: (open: boolean) => void;
}

export const AshaAreaSelector: React.FC<AshaAreaSelectorProps> = ({
  currentProfile,
  onSelectProfile,
  isModalOpen,
  onModalOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = isModalOpen !== undefined ? isModalOpen : internalOpen;
  const setOpen = (open: boolean) => {
    if (onModalOpenChange) onModalOpenChange(open);
    else setInternalOpen(open);
  };

  const handleSelect = (profile: AshaProfile) => {
    onSelectProfile(profile);
    setOpen(false);
  };

  return (
    <>
      {/* Top Application Area Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Left: Active Location Hierarchy Breadcrumb */}
          <div className="flex flex-wrap items-center gap-1.5 text-slate-300">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] tracking-wider uppercase border border-amber-500/30">
              Demo Data
            </span>

            <span className="text-slate-400 hidden sm:inline">·</span>

            <div className="flex items-center gap-1 font-medium text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-white font-bold">{currentProfile.location.village}</span>
              <span className="text-slate-400 text-[11px]">({currentProfile.location.phcSubCentre})</span>
            </div>

            <span className="text-slate-500 hidden md:inline">→</span>
            <span className="text-slate-400 hidden md:inline text-[11px]">{currentProfile.location.block}</span>
            <span className="text-slate-500 hidden lg:inline">→</span>
            <span className="text-slate-400 hidden lg:inline text-[11px]">{currentProfile.location.district}</span>
            <span className="text-slate-500 hidden lg:inline">→</span>
            <span className="text-slate-300 hidden lg:inline text-[11px] font-semibold">{currentProfile.location.state}</span>
          </div>

          {/* Right: Assigned ASHA Worker & Profile Switcher Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[11px]">
                {currentProfile.name.charAt(0)}
              </div>
              <span className="font-semibold text-white">
                {currentProfile.name}
              </span>
              <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1 py-0.5 rounded">
                {currentProfile.id}
              </span>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <span>Switch Area</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Switch ASHA Profile Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Switch ASHA Profile & Assigned Geographic Area
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Demo Mode
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select an ASHA worker to load her assigned habitation, household registers, children, and drug kits.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
              {/* Scalable Hierarchy Architecture Banner */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Scalable Location Hierarchy:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                  <span>State</span>
                  <span>→</span>
                  <span>District</span>
                  <span>→</span>
                  <span>Block</span>
                  <span>→</span>
                  <span>PHC / Sub-Centre</span>
                  <span>→</span>
                  <span>Village / Habitation</span>
                  <span>→</span>
                  <span>ASHA Worker</span>
                  <span>→</span>
                  <span>Assigned Households</span>
                </div>
              </div>

              {/* Disclaimer Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Fictional Demonstration Prototype:</strong> This application is NOT connected to real Indian government ASHA or RCH databases. All profiles, household counts, patient records, and immunization milestones are fictional demo data created to demonstrate multi-area scalability.
                </div>
              </div>

              {/* 3 Fictional Profiles List */}
              <div className="space-y-3 pt-1">
                {DEMO_ASHA_PROFILES.map((profile) => {
                  const isSelected = profile.id === currentProfile.id;

                  return (
                    <div
                      key={profile.id}
                      onClick={() => handleSelect(profile)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {profile.name}
                          </span>
                          <span className="font-mono text-xs text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                            {profile.id}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              <span>Active Profile</span>
                            </span>
                          )}
                        </div>

                        {/* Location Hierarchy Line */}
                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{profile.location.state}</span>
                          <span className="text-slate-400">→</span>
                          <span>{profile.location.district}</span>
                          <span className="text-slate-400">→</span>
                          <span>{profile.location.block}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-bold text-emerald-700">{profile.location.village}</span>
                          <span className="text-slate-500 text-[11px]">({profile.location.habitation})</span>
                        </div>

                        {/* Sub-Centre and Household Scope */}
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-0.5">
                          <span>Health Facility: <strong>{profile.location.phcSubCentre}</strong></span>
                          <span>·</span>
                          <span>Assigned Households: <strong>{profile.location.assignedHouseholds}</strong></span>
                          <span>·</span>
                          <span>Population: <strong>~{profile.location.populationCovered}</strong></span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(profile);
                        }}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? 'Currently Selected' : 'Switch to this Area'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Safety notice */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Administrative logistics and task management only. No clinical diagnostics or prescription decisions.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
