// src/pages/SearchResultsPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchManga } from "../Api/mangaApi";
import Select from "react-select";

// MangaDex tag UUIDs — these are stable
const genreOptions = [
  { value: "391b0423-d847-456f-aff0-8b0cfc03066b", label: "Action" },
  { value: "87cc87cd-a395-47af-b27a-93258283bbc6", label: "Adventure" },
  { value: "4d32cc48-9f00-4cca-9b5a-a839f0764984", label: "Comedy" },
  { value: "cdc58593-87dd-415e-bbc0-2ec27bf404cc", label: "Drama" },
  { value: "f4122d1c-3b44-44d2-adc6-4d2e5e60f05d", label: "Fantasy" },
  { value: "aafb99c1-7f60-43fa-b75f-fc9502ce29c7", label: "Horror" },
  { value: "e5301a23-ebd9-49dd-a0cb-2add944c7fe9", label: "Slice of Life" },
  { value: "ee968100-4191-4968-93d3-f82d72be7e46", label: "Mystery" },
  { value: "b9af3a63-f058-46de-a9a0-e0c13906197a", label: "Drama" },
  { value: "caaa44eb-cd40-4177-b930-79d3ef2afe87", label: "School Life" },
  { value: "5ca48985-9a9d-4bd8-be29-80dc0303db72", label: "Sports" },
  { value: "eabc5b4c-6aff-42f3-b657-3e90cbd00b75", label: "Supernatural" },
  { value: "256c8bd9-4904-4360-bf4f-508a76d67183", label: "Sci-Fi" },
  { value: "a1f53773-c69a-4ce5-8cab-fffcd90b1565", label: "Psychological" },
  { value: "ace04997-f6bd-436e-b261-779182193d3d", label: "Isekai" },
  { value: "81c836c9-914a-4eca-981a-560dad663e73", label: "Martial Arts" },
  { value: "799c202e-7daa-44eb-9cf7-8a3c0441531e", label: "Mecha" },
  { value: "87cc87cd-a395-47af-b27a-93258283bbc6", label: "Romance" },
];

const demographicOptions = [
  { value: "shounen", label: "Shounen (Boys)" },
  { value: "shoujo", label: "Shoujo (Girls)" },
  { value: "seinen", label: "Seinen (Young Men)" },
  { value: "josei", label: "Josei (Young Women)" },
];

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(location.state || {});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch results whenever filters update
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = {};

        if (filters.title) params.title = filters.title;
        if (filters.status) params.status = filters.status;
        if (filters.type) params["originalLanguage[]"] = filters.type === "manga" ? "ja" : filters.type === "manhwa" ? "ko" : "zh";
        if (filters.genres?.length) params.genres = filters.genres;
        if (filters.demographic) params.demographic = filters.demographic;
        params["order[relevance]"] = "desc";

        const data = await fetchManga(params);
        setResults(data);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters]);

  const handleInput = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleSearch = () => {
    setFilters({ ...filters }); // Trigger refresh
  };

  const clearFilters = () => {
    setFilters({});
    navigate("/search", { state: {} });
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white p-6 flex flex-col md:flex-row gap-6">
      {/* Sidebar Filters */}
      <div className="w-full md:w-1/4 bg-[#111827] p-6 rounded-lg h-fit">
        <h2 className="text-lg font-bold mb-4">Filters</h2>

        <input
          type="text"
          placeholder="Search by title..."
          value={filters.title || ""}
          onChange={(e) => handleInput("title", e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 text-white focus:outline-none"
        />

        <select
          value={filters.type || ""}
          onChange={(e) => handleInput("type", e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 text-white"
        >
          <option value="">All Types</option>
          <option value="manga">Manga (Japanese)</option>
          <option value="manhwa">Manhwa (Korean)</option>
          <option value="manhua">Manhua (Chinese)</option>
        </select>

        <select
          value={filters.status || ""}
          onChange={(e) => handleInput("status", e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 text-white"
        >
          <option value="">Any Status</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="hiatus">Hiatus</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <Select
          options={genreOptions}
          isMulti
          value={genreOptions.filter((g) =>
            (filters.genres || []).includes(g.value)
          )}
          onChange={(selected) =>
            handleInput("genres", selected ? selected.map((s) => s.value) : [])
          }
          placeholder="Select genres..."
          className="mb-4 text-black"
        />

        <Select
          options={demographicOptions}
          value={demographicOptions.find(
            (d) => d.value === filters.demographic
          )}
          onChange={(opt) => handleInput("demographic", opt?.value || "")}
          placeholder="Select demographic..."
          className="mb-4 text-black"
        />

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSearch}
            className="w-full px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-500"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="w-full px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Search Results</h1>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
          >
            Close
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Loading results...</p>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {results.map((manga) => (
              <div
                key={manga.id}
                onClick={() => navigate(`/manga/${manga.id}`)}
                className="bg-gray-900 p-2 rounded-lg hover:scale-105 transition cursor-pointer"
              >
                <img
                  src={manga.cover}
                  alt={manga.title}
                  className="rounded-md mb-2 w-full aspect-[2/3] object-cover"
                />
                <h3 className="text-sm font-medium truncate">{manga.title}</h3>
                <p className="text-xs text-gray-400 capitalize">{manga.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No results found.</p>
        )}
      </div>
    </div>
  );
}