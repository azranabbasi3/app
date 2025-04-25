"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { apiEndPoint } from "../utils/apiEndPoint";
import Image from "next/image";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    headline: "",
    photo: "",
    interests: [],
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const { data } = await axios.get(`${apiEndPoint.getProfile}/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile({
        name: data.data.name || "",
        bio: data.data.bio || "",
        headline: data.data.headline || "",
        photo: data.data.photo
          ? `http://localhost:5000/${data.data.photo.replace(/\\/g, "/")}`
          : "",
        interests: data.data.interests || [],
        email: data.data.email || "",
      });
    } catch (err) {
      setError("Failed to fetch profile.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = async () => {
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("headline", profile.headline);
    formData.append("bio", profile.bio);
    formData.append("interests", profile.interests);
    formData.append("photo", newPhoto);

    try {
      await axios.put(`${apiEndPoint.updateProfile}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      fetchProfile();
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  const handleProfileDelete = async () => {
    try {
      await axios.delete(
        `${apiEndPoint.deleteProfile}/${localStorage.getItem("email")}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      localStorage.removeItem("token");
      router.push("/login");
    } catch (err) {
      setError("Failed to delete profile.");
    }
  };

  const handleFileChange = (e) => {
    setNewPhoto(e.target.files[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditing ? "Edit Profile" : "My Profile"}
                </h1>
                <p className="text-blue-100 mt-1">
                  {!isEditing && profile.headline}
                </p>
              </div>
              {!isEditing && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            {isEditing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleProfileUpdate();
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <div className="flex items-center space-x-6">
                      {profile.photo &&
                        !newPhoto &&
                        profile.photo.length > 0 && (
                          <div className="flex-shrink-0 h-20 w-20 rounded-full overflow-hidden border-2 border-gray-200">
                            <Image
                              src={profile.photo}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Profile Photo
                        </label>
                        <input
                          type="file"
                          id="photo"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="headline"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Headline
                    </label>
                    <input
                      type="text"
                      id="headline"
                      value={profile.headline}
                      onChange={(e) =>
                        setProfile({ ...profile, headline: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="interests"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Interests
                    </label>
                    <input
                      type="text"
                      id="interests"
                      value={
                        Array.isArray(profile.interests)
                          ? profile.interests.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          interests: e.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean),
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  {profile.photo && profile.photo.length > 0 && (
                    <div className="flex-shrink-0 h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={profile.photo}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile.name}
                    </h2>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 inline mr-2">
                        Heading:-
                      </h3>
                      <span className="text-lg text-gray-600 inline">
                        {profile.headline}
                      </span>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 inline mr-2">
                        Email:-
                      </h3>
                      <span className="text-lg text-gray-600 inline">
                        {profile.email}
                      </span>
                    </div>
                  </div>
                </div>

                {profile.bio && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">About</h3>
                    <p className="mt-2 text-gray-600 whitespace-pre-line">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {profile.interests && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Interests
                    </h3>
                    <p className="mt-2 flex flex-wrap gap-2">
                      {profile.interests}
                    </p>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleProfileDelete}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
