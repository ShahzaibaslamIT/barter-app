"use client";

import { useState } from 'react';
import { MapPin, Navigation, Layers, ChevronDown, ChevronUp } from 'lucide-react';

interface LocationInfoCardProps {
  gpsLat: number | null;
  gpsLng: number | null;
  profileLat?: number | null;
  profileLng?: number | null;
  listingsCount: number;
  gpsLoading?: boolean;
}

export function LocationInfoCard({
  gpsLat,
  gpsLng,
  profileLat,
  profileLng,
  listingsCount,
  gpsLoading = false
}: LocationInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const usingGPS = gpsLat !== null && gpsLng !== null;

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all cursor-pointer mx-4 my-3"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${usingGPS ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'}`}>
              {usingGPS ? (
                <Navigation className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {gpsLoading ? 'Getting Location...' : usingGPS ? 'Live GPS Location' : 'Profile Location'}
                </h3>
                {!gpsLoading && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    usingGPS 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                  }`}>
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {gpsLat && gpsLng ? `${gpsLat.toFixed(4)}°, ${gpsLng.toFixed(4)}°` : 'Waiting...'}
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 dark:text-gray-400">Found</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{listingsCount}</p>
            </div>
            
            <button className="p-1.5 hover:bg-white/50 dark:hover:bg-black/20 rounded-lg transition-colors">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GPS Location */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <h4 className="font-medium text-sm">GPS Location</h4>
                </div>
                {gpsLat && gpsLng ? (
                  <>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      Lat: {gpsLat.toFixed(6)}°
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      Lng: {gpsLng.toFixed(6)}°
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400">Live & Active</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">Not available</p>
                )}
              </div>

              {/* Profile Location */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <h4 className="font-medium text-sm">Profile Location</h4>
                </div>
                {profileLat && profileLng ? (
                  <>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      Lat: {profileLat.toFixed(6)}°
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      Lng: {profileLng.toFixed(6)}°
                    </p>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Fallback location</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">Not set</p>
                )}
              </div>

              {/* Search Radius */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 sm:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-medium text-sm">Search Radius</h4>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Showing listings within <span className="font-semibold text-blue-600 dark:text-blue-400">10 km</span> of your {usingGPS ? 'current GPS' : 'profile'} location
                  </p>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{listingsCount} items</span>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                🔒 Your exact location is never shared with other users
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}