"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { apiEndPoint } from "../utils/apiEndPoint";
const Feed = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState('');
  const [allInterests, setAllInterests] = useState([]);
  const router = useRouter();

  const notify = (type, message) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const fetchProfiles = async (pageNum = 1, isLoadMore = false) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        router.push("/login");
        return;
      }

      const url = new URL(`${apiEndPoint.getAllProfiles}`);
      url.searchParams.append('page', pageNum);
      url.searchParams.append('limit', 10);
      if (selectedInterest) {
        url.searchParams.append('interest', selectedInterest);
      }

      const response = await axios.get(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const newProfiles = response.data.data;
        if (isLoadMore) {
          setProfiles(prev => [...prev, ...newProfiles]);
        } else {
          setProfiles(newProfiles);
        }
        setHasMore(newProfiles.length === 10);

        const interests = new Set();
        newProfiles.forEach(profile => {
          if (profile.interests) {
            if (Array.isArray(profile.interests)) {
              profile.interests.forEach(interest => interests.add(interest));
            } else if (typeof profile.interests === 'string') {
              profile.interests.split(',').forEach(interest => interests.add(interest.trim()));
            }
          }
        });
        setAllInterests(Array.from(interests));
        return newProfiles;
      } else {
        setError("Failed to fetch profiles");
        return [];
      }
    } catch (err) {
      console.error(err);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem("token");
        notify("error", "Your session has expired. Please login again.");
        router.push("/login");
        return [];
      }
      
      setError("Error connecting to the server");
      notify("error", "Failed to load profiles");
      return [];
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProfiles(nextPage, true);
  };

  const handleInterestChange = (e) => {
    setSelectedInterest(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    const fetchAndFilter = async () => {
      try {
        setLoading(true);
        const fetchedProfiles = await fetchProfiles();
        if (selectedInterest && selectedInterest !== "All Interests") {
          const filteredProfiles = fetchedProfiles.filter((profile) => {
            if (!profile.interests) return false;
            const interests = Array.isArray(profile.interests) 
              ? profile.interests 
              : profile.interests.split(',').map(i => i.trim());
            return interests.includes(selectedInterest);
          });
          setProfiles(filteredProfiles);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndFilter();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    fetchProfiles();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, isLoadingMore]);



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Public Feed</h1>
          
          <div className="flex items-center space-x-4">
            <label htmlFor="interest" className="text-sm font-medium text-gray-700">
              Filter by Interest:
            </label>
            <select
              id="interest"
              value={selectedInterest}
              onChange={handleInterestChange}
              className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Interests</option>
              {allInterests.map((interest) => (
                <option key={interest} value={interest}>
                  {interest}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <div 
                key={profile.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200 relative">
                  {profile.photo ? (
                    <Image
                      src={profile.photo}
                      alt={`${profile.name}'s profile`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-300">
                      <span className="text-4xl text-gray-500">{profile.name?.charAt(0) || "?"}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-1">{profile.name || "Unnamed User"}</h2>
                  <p className="text-gray-600 text-sm mb-2">{profile.headline || "No headline"}</p>
                  <p className="text-gray-700 mb-3 line-clamp-3">{profile.bio || "No bio available"}</p>
                  
                  {profile.interests && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(Array.isArray(profile.interests) 
                        ? profile.interests 
                        : profile.interests.split(',')
                      ).map((interest, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {interest.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No profiles found</p>
            </div>
          )}
        </div>

        {isLoadingMore && (
          <div className="flex justify-center items-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;